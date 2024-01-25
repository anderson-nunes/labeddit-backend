import { PostBusiness } from "../../../src/business/PostBusiness";
import { PostDatabaseMock } from "../../mocks/PostDatabaseMock";
import { IdGeneratorMock } from "../../mocks/IdGeneratorMock";
import { TokenManagerMock } from "../../mocks/TokenManagerMock";
import { BadRequestError } from "../../../src/errors/BadRequestError";
import { CreatePostSchema } from "../../../src/dtos/posts/createPost.dto";

describe("createPost", () => {
  const postBusiness = new PostBusiness(
    new PostDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock()
  );

  test("success", async () => {
    const input = CreatePostSchema.parse({
      content: "content-test",
      token: "token-mock-fulano",
    });

    await postBusiness.createPost(input);
  });

  test("error test: login failed", async () => {
    expect.assertions(2);
    try {
      const input = CreatePostSchema.parse({
        content: "content-error",
        token: "xxx",
      });

      await postBusiness.createPost(input);
    } catch (error) {
      if (error instanceof BadRequestError) {
        expect(error.message).toBe("Token inválido");
        expect(error.statusCode).toBe(400);
      }
    }
  });
});
