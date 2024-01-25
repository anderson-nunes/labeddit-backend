import { PostBusiness } from "../../../src/business/PostBusiness";
import { GetPostsSchema } from "../../../src/dtos/posts/getPosts.dto";
import { BadRequestError } from "../../../src/errors/BadRequestError";
import { IdGeneratorMock } from "../../mocks/IdGeneratorMock";
import { PostDatabaseMock } from "../../mocks/PostDatabaseMock";
import { TokenManagerMock } from "../../mocks/TokenManagerMock";

describe("getPosts", () => {
  const postBusiness = new PostBusiness(
    new PostDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock()
  );

  test("success", async () => {
    const input = GetPostsSchema.parse({
      token: "token-mock-fulano",
    });

    const output = await postBusiness.getPosts(input);
    expect(output).toEqual([
      {
        id: "id-mock",
        content: "post-mock",
        likes: 10,
        dislikes: 10,
        createdAt: "2023-01-01",
        updatedAt: "2023-02-01",
        comments: 10,
        commentList: undefined,
        rating: true,
        creator: { id: "id-mock-fulano", name: "" },
      },
    ]);
  });

  test("error test: login failed", async () => {
    expect.assertions(2);
    try {
      const input = GetPostsSchema.parse({
        token: "token-falso",
      });

      await postBusiness.getPosts(input);
    } catch (error) {
      if (error instanceof BadRequestError) {
        expect(error.message).toBe("Token inválido");
        expect(error.statusCode).toBe(400);
      }
    }
  });
});
