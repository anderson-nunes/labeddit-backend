import { CommentBusiness } from "../../../src/business/CommentBusiness";
import { CommentDatabaseMock } from "../../mocks/CommentDatabaseMock";
import { PostDatabaseMock } from "../../mocks/PostDatabaseMock";
import { IdGeneratorMock } from "../../mocks/IdGeneratorMock";
import { TokenManagerMock } from "../../mocks/TokenManagerMock";
import { BadRequestError } from "../../../src/errors/BadRequestError";
import { LikeOrDislikeCommentSchema } from "../../../src/dtos/comments/likeOrDislikeComments.dto";

describe("upvoteOrDownvoteComment", () => {
  const commentBusiness = new CommentBusiness(
    new CommentDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new PostDatabaseMock()
  );

  test("success", async () => {
    const input = LikeOrDislikeCommentSchema.parse({
      commentId: "id-mock",
      token: "token-mock-fulano",
      like: true,
    });

    await commentBusiness.likeOrDislikeComment(input);
  });

  test("error test: login failed", async () => {
    expect.assertions(2);
    try {
      const input = LikeOrDislikeCommentSchema.parse({
        commentId: "id-mock",
        token: "xxx",
        like: true,
      });

      await commentBusiness.likeOrDislikeComment(input);
    } catch (error) {
      if (error instanceof BadRequestError) {
        expect(error.message).toBe("token não existe");
        expect(error.statusCode).toBe(400);
      }
    }
  });
});
