import { CommentDB } from "../models/Comments";
import { BaseDatabase } from "./BaseDatabase";

export class CommentDatabase extends BaseDatabase {
  public static TABLE_COMMENTS = "comments";
  public static TABLE_LIKES_DISLIKES_COMMENTS = "likes_dislikes_comments";

  public insertComment = async (commentDB: CommentDB): Promise<void> => {
    await BaseDatabase.connection(CommentDatabase.TABLE_COMMENTS).insert(
      commentDB
    );
  };

  public async findCommentByPostId(id: string): Promise<any> {
    const commentsDB: any = await BaseDatabase.connection(
      CommentDatabase.TABLE_COMMENTS
    )
      .select()
      .where(`${CommentDatabase.TABLE_COMMENTS}.post_id`, "=", `${id}`);

    return commentsDB;
  }

  public async findComments(): Promise<CommentDB[]> {
    const CommentsDB: CommentDB[] = await BaseDatabase.connection(
      CommentDatabase.TABLE_COMMENTS
    ).select();

    return CommentsDB;
  }
}
