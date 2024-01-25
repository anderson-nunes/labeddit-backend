import { PostBusiness } from "../../../src/business/PostBusiness";
import { PostDatabaseMock } from "../../mocks/PostDatabaseMock";
import { IdGeneratorMock } from "../../mocks/IdGeneratorMock";
import { TokenManagerMock } from "../../mocks/TokenManagerMock";
import { BadRequestError } from "../../../src/errors/BadRequestError";
import { GetPostByIdSchema } from "../../../src/dtos/posts/getPostById.dto";

describe("getPostById", () => {
  const postBusiness = new PostBusiness(
    new PostDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock()
  );

  test("success", async () => {
    const input = GetPostByIdSchema.parse({
      token: "token-mock-fulano",
      id: "id-mock",
    });

    const output = await postBusiness.getPostById(input);

    expect(output).toEqual({
      id: "id-mock",
      content: "post-mock",
      likes: 10,
      dislikes: 10,
      createdAt: "2023-01-01",
      updatedAt: "2023-02-01",
      comments: 10,
      commentList: [
        {
          id: "id-mock",
          creator_id: "id-mock",
          post_id: "id-mock",
          content: "comment-mock",
          likes: 10,
          dislikes: 10,
          created_at: "2023-01-01",
          updated_at: "2023-02-01",
          rating: null,
        },
      ],
      rating: true,
      creator: { id: "id-mock-fulano", name: "" },
    });
  });

  test("error test: login failed", async () => {
    expect.assertions(2);
    try {
      const input = GetPostByIdSchema.parse({
        token: "xxx",
        id: "id-mock",
      });

      await postBusiness.getPostById(input);
    } catch (error) {
      if (error instanceof BadRequestError) {
        expect(error.message).toBe("Token inválido");
        expect(error.statusCode).toBe(400);
      }
    }
  });
});
