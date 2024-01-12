import { TokenManager, TokenPayload } from "../services/TokenManager";
import { USER_ROLES, User } from "../models/User";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { UserDatabase } from "../database/UserDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { HashManager } from "../services/HashManager";
import {
  GetUsersInputDTO,
  GetUsersOutputDTO,
} from "../dtos/users/getUsers.dto";
import {
  SignupUserInputDTO,
  SignupUserOutputDTO,
} from "../dtos/users/signup.dto";
import { LoginUserInputDTO, LoginUserOutputDTO } from "../dtos/users/login.dto";

export class UserBusiness {
  constructor(
    private userDatabase: UserDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private hashManager: HashManager
  ) {}

  public getUsers = async (
    input: GetUsersInputDTO
  ): Promise<GetUsersOutputDTO> => {
    const { nameToSearch, token } = input;

    const payload = this.tokenManager.getPayload(token);

    if (payload === null) {
      throw new BadRequestError("token inválido");
    }

    // if (payload.role !== USER_ROLES.ADMIN) {
    //   throw new BadRequestError("Somente admins podem acessar esse recurso");
    // }

    const usersDB = await this.userDatabase.findUsers(nameToSearch);

    const users = usersDB.map((userDB) => {
      const user = new User(
        userDB.id,
        userDB.name,
        userDB.email,
        userDB.password,
        userDB.role as USER_ROLES,
        userDB.created_at
      );

      return user.toBusinessModel();
    });

    const response: GetUsersOutputDTO = users;

    return response;
  };

  public signup = async (
    input: SignupUserInputDTO
  ): Promise<SignupUserOutputDTO> => {
    const { name, email, password } = input;

    const id = this.idGenerator.generate();

    const userDBExists = await this.userDatabase.findUserById(id);

    if (userDBExists) {
      throw new BadRequestError("'id' já existente");
    }

    const hashedPassword = await this.hashManager.hash(password);

    const newUser = new User(
      id,
      name,
      email,
      hashedPassword,
      USER_ROLES.NORMAL,
      new Date().toISOString()
    );

    const newUserDB = newUser.toDBModel();
    await this.userDatabase.insertUser(newUserDB);

    const payload: TokenPayload = {
      id: newUser.getId(),
      name: newUser.getName(),
      role: newUser.getRole(),
    };

    const token = this.tokenManager.createToken(payload);

    const response: SignupUserOutputDTO = {
      message: "Cadastro realizado com sucesso",
      token,
    };

    return response;
  };

  public login = async (
    input: LoginUserInputDTO
  ): Promise<LoginUserOutputDTO> => {
    const { email, password } = input;

    const userDB = await this.userDatabase.findUserByEmail(email);

    if (!userDB) {
      throw new NotFoundError("'email' não encontrado");
    }
    // o password hasheado está no banco de dados
    const hashedPassword = userDB.password;

    // o serviço hashManager analisa o password do body (plaintext) e o hash
    const isPasswordCorrect = await this.hashManager.compare(
      password,
      hashedPassword
    );

    // validamos o resultado
    if (!isPasswordCorrect) {
      throw new BadRequestError("'email' ou 'password' incorretos");
    }

    const user = new User(
      userDB.id,
      userDB.name,
      userDB.email,
      userDB.password,
      userDB.role as USER_ROLES,
      new Date().toISOString()
    );

    const payload: TokenPayload = {
      id: user.getId(),
      name: user.getName(),
      role: user.getRole(),
    };

    const token = this.tokenManager.createToken(payload);

    const response: LoginUserOutputDTO = {
      message: "Login realizado com sucesso",
      id: userDB.id,
      name: userDB.name,
      email: userDB.email,
      token,
    };

    return response;
  };
}
