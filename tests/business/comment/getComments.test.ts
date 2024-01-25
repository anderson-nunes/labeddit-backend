import { CommentBusiness } from "../../../src/business/CommentBusiness";
import { CommentDatabaseMock } from "../../mocks/CommentDatabaseMock";
import { IdGeneratorMock } from "../../mocks/IdGeneratorMock";
import { TokenManagerMock } from "../../mocks/TokenManagerMock";
import { BadRequestError } from "../../../src/errors/BadRequestError";
import { PostDatabaseMock } from "../../mocks/PostDatabaseMock";
import { GetCommentsSchema } from "../../../src/dtos/comments/getComments.dtos";

describe("getComments", () => {
  const commentBusiness = new CommentBusiness(
    new CommentDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new PostDatabaseMock()
  );

  test("success", async () => {
    const input = GetCommentsSchema.parse({
      token: "token-mock-fulano",
      postId: "id-mock",
    });

    await commentBusiness.getComments(input);
  });

  test("error test: login failed", async () => {
    expect.assertions(2);
    try {
      const input = GetCommentsSchema.parse({
        token: "xxx",
        postId: "xxxx",
      });

      await commentBusiness.getComments(input);
    } catch (error) {
      if (error instanceof BadRequestError) {
        expect(error.message).toBe("Token inválido");
        expect(error.statusCode).toBe(400);
      }
    }
  });
});
