import { PostBusiness } from "../../../src/business/PostBusiness";
import { PostDatabaseMock } from "../../mocks/PostDatabaseMock";
import { IdGeneratorMock } from "../../mocks/IdGeneratorMock";
import { TokenManagerMock } from "../../mocks/TokenManagerMock";
import { BadRequestError } from "../../../src/errors/BadRequestError";
import { NotFoundError } from "../../../src/errors/NotFoundError";
import { LikeOrDislikePostSchema } from "../../../src/dtos/posts/likeOrDislikePost.dto";

describe("upvoteOrDownvotePost", () => {
  const postBusiness = new PostBusiness(
    new PostDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock()
  );

  test("success", async () => {
    const input = LikeOrDislikePostSchema.parse({
      postId: "id-mock",
      token: "token-mock-fulano",
      like: true,
    });

    const output = await postBusiness.likeOrDislikePost(input);

    expect(output).toEqual(undefined);
  });

  test("error test: id not found", async () => {
    expect.assertions(2);
    try {
      const input = LikeOrDislikePostSchema.parse({
        postId: "id-mock-falha",
        token: "token-mock-fulano",
        like: true,
      });

      await postBusiness.likeOrDislikePost(input);
    } catch (error) {
      if (error instanceof NotFoundError) {
        expect(error.message).toBe("post com essa id não existe");
        expect(error.statusCode).toBe(404);
      }
    }
  });

  test("error test: login failed", async () => {
    expect.assertions(2);
    try {
      const input = LikeOrDislikePostSchema.parse({
        postId: "id-mock",
        token: "token-mock-falho",
        like: true,
      });

      await postBusiness.likeOrDislikePost(input);
    } catch (error) {
      if (error instanceof BadRequestError) {
        expect(error.message).toBe("token não existe");
        expect(error.statusCode).toBe(400);
      }
    }
  });
});
