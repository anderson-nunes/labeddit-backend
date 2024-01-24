import { PostBusiness } from "../../../src/business/PostBusiness";
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

  it("success", async () => {
    const token = "token-mock-normal";

    const output = await postBusiness.getPosts(token);
    expect(output).toEqual([
      {
        id: "id-mock",
        creatorNickname: "normal.mock",
        content: "post-mock",
        likes: 10,
        dislikes: 10,
        createdAt: "2023-01-01",
        updatedAt: "2023-02-01",
        comments: [
          {
            id: "id-mock",
            creatorNickname: "normal.mock",
            content: "comment-mock",
            likes: 10,
            dislikes: 10,
            createdAt: "2023-01-01",
            updatedAt: "2023-02-01",
          },
        ],
      },
    ]);
  });

  it("error test: login failed", async () => {
    expect.assertions(2);
    try {
      const token = "xxx";

      await postBusiness.getPosts(token);
    } catch (error) {
      if (error instanceof BadRequestError) {
        expect(error.message).toBe("ERROR: Login failed.");
        expect(error.statusCode).toBe(400);
      }
    }
  });

  it("success", async () => {});
});
