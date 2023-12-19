import { UserBusiness } from "../../../src/business/UserBusiness";
import { SignupUserSchema } from "../../../src/dtos/users/signup.dto";
import { HashManagerMock } from "../../mocks/HashManagerMock";
import { IdGeneratorMock } from "../../mocks/IdGeneratorMock";
import { TokenManagerMock } from "../../mocks/TokenManagerMock";
import { UserDatabaseMock } from "../../mocks/UserDatabaseMock";

describe("Testando signup", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  );

  test("deve gerar token ao cadastrar", async () => {
    const input = SignupUserSchema.parse({
      name: "Ciclana",
      email: "ciclana@email.com",
      password: "Ciclana@321",
    });

    const output = await userBusiness.signup(input);

    expect(output).toEqual({
      message: "Cadastro realizado com sucesso",
      token: "token-mock",
    });
  });
});
