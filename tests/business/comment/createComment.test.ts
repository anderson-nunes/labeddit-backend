import { CommentBusiness } from "../../../src/business/CommentBusiness";
import { CommentDatabaseMock } from "../../mocks/CommentDatabaseMock";
import { IdGeneratorMock } from "../../mocks/IdGeneratorMock";
import { TokenManagerMock } from "../../mocks/TokenManagerMock";
import { PostDatabaseMock } from "../../mocks/PostDatabaseMock";
import { CreateCommentSchema } from "../../../src/dtos/comments/createComments.dto";

describe("createComment", () => {
  const commentBusiness = new CommentBusiness(
    new CommentDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new PostDatabaseMock()
  );

  test("success", async () => {
    const input = CreateCommentSchema.parse({
      postId: "id-mock",
      token: "token-mock-fulano",
      content: "comment-content",
    });

    await commentBusiness.createComment(input);
  });
});
