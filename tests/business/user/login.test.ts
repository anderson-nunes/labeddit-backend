import { UserBusiness } from "../../../src/business/UserBusiness";
import { LoginUserSchema } from "../../../src/dtos/users/login.dto";
import { BadRequestError } from "../../../src/errors/BadRequestError";
import { NotFoundError } from "../../../src/errors/NotFoundError";
import { HashManagerMock } from "../../mocks/HashManagerMock";
import { IdGeneratorMock } from "../../mocks/IdGeneratorMock";
import { TokenManagerMock } from "../../mocks/TokenManagerMock";
import { UserDatabaseMock } from "../../mocks/UserDatabaseMock";

describe("Testando login", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  );

  test("deve gerar token ao logar", async () => {
    const input = LoginUserSchema.parse({
      email: "fulano@email.com",
      password: "fulano123",
    });

    const output = await userBusiness.login(input);
    console.log(output);

    expect(output).toEqual({
      message: "Login realizado com sucesso",
      id: "id-mock-fulano",
      name: "Fulano",
      email: "fulano@email.com",
      token: "token-mock-fulano",
    });
  });

  test("deve retornar erro se email não for encontrado", async () => {
    expect.assertions(1);
    try {
      const input = LoginUserSchema.parse({
        email: "email-nao-existente@email.com",
        password: "fulano123",
      });

      await userBusiness.login(input);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
  });

  test("deve retornar erro se a senha estiver incorreta", async () => {
    expect.assertions(2);
    try {
      const input = LoginUserSchema.parse({
        email: "fulano@email.com",
        password: "senha-incorreta",
      });

      await userBusiness.login(input);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      if (error instanceof BadRequestError) {
        expect(error.message).toBe("'email' ou 'password' incorretos");
      }
    }
  });
});
