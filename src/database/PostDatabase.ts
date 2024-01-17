import { PostDB } from "../models/Posts";
import { BaseDatabase } from "./BaseDatabase";
import { UserDatabase } from "./UserDatabase";
import { LikeDislikeDB, POST_LIKE } from "../models/Posts";
import { COMMENT_LIKES, LikeDislikeCommentDB } from "../models/Comments";
import { CommentDatabase } from "./CommentDatabase";

export class PostDatabase extends BaseDatabase {
  public static TABLE_POST = "posts";
  public static TABLE_LIKES_DISLIKES = "post_like_dislike";
  public static TABLE_COMMENTS = "comments";

  public async findPosts(): Promise<PostDB[]> {
    const postsDB: PostDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POST
    )
      .select(
        `${PostDatabase.TABLE_POST}.*`,
        `${UserDatabase.TABLE_USERS}.name as creator_name`
      )
      .join(
        `${UserDatabase.TABLE_USERS}`,
        `${PostDatabase.TABLE_POST}.creator_id`,
        "=",
        `${UserDatabase.TABLE_USERS}.id`
      )

      .orderBy("created_at", "desc");
    return postsDB;
  }

  public async findPostById(id: string): Promise<PostDB | undefined> {
    const [postsDB]: PostDB[] | undefined[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POST
    )
      .select(
        `${PostDatabase.TABLE_POST}.*`,
        `${UserDatabase.TABLE_USERS}.name as creator_name`
      )
      .where(`${PostDatabase.TABLE_POST}.id`, "=", `${id}`)
      .join(
        `${UserDatabase.TABLE_USERS}`,
        `${PostDatabase.TABLE_POST}.creator_id`,
        "=",
        `${UserDatabase.TABLE_USERS}.id`
      );

    return postsDB;
  }

  public async findCommentByPostId(id: string): Promise<any> {
    const commentsDB: any = await BaseDatabase.connection(
      PostDatabase.TABLE_COMMENTS
    )
      .select(
        `${PostDatabase.TABLE_COMMENTS}.*`,
        `${UserDatabase.TABLE_USERS}.name as creator_name`
      )
      .where(`${PostDatabase.TABLE_COMMENTS}.post_id`, "=", `${id}`)
      .join(
        `${UserDatabase.TABLE_USERS}`,
        `${PostDatabase.TABLE_COMMENTS}.creator_id`,
        "=",
        `${UserDatabase.TABLE_USERS}.id`
      )
      .orderBy("created_at", "desc");
    return commentsDB;
  }

  public insertPost = async (postDB: PostDB): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_POST).insert(postDB);
  };

  public updateCommentNumber = async (postId: string) => {
    const [postDB]: PostDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POST
    ).where({ id: postId });

    await BaseDatabase.connection(PostDatabase.TABLE_POST)
      .update({
        comments: postDB.comments + 1,
      })
      .where({ id: postId });
  };

  public updatePost = async (postDB: PostDB): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_POST)
      .update(postDB)
      .where({ id: postDB.id });
  };

  public async deletePost(id: string): Promise<void> {
    await BaseDatabase.connection(PostDatabase.TABLE_POST)
      .where({ id })
      .delete();
  }

  public findLikeDislike = async (
    likeDislikeDB: LikeDislikeDB
  ): Promise<POST_LIKE | undefined> => {
    const [result]: Array<LikeDislikeDB | undefined> =
      await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
        .select()
        .where({
          user_id: likeDislikeDB.user_id,
          post_id: likeDislikeDB.post_id,
        });

    if (result === undefined) {
      return undefined;
    } else if (result.like === 1) {
      return POST_LIKE.ALREADY_LIKED;
    } else {
      return POST_LIKE.ALREADY_DISLIKED;
    }
  };

  public findLikeDislikeComment = async (
    likeDislikeDB: LikeDislikeCommentDB
  ): Promise<COMMENT_LIKES | undefined> => {
    const [result]: Array<LikeDislikeCommentDB | undefined> =
      await BaseDatabase.connection(
        CommentDatabase.TABLE_LIKES_DISLIKES_COMMENTS
      )
        .select()
        .where({
          user_id: likeDislikeDB.user_id,
          comment_id: likeDislikeDB.comment_id,
        });

    if (result === undefined) {
      return undefined;
    } else if (result.like === 1) {
      return COMMENT_LIKES.ALREADY_LIKED;
    } else {
      return COMMENT_LIKES.ALREADY_DISLIKED;
    }
  };

  public removeLikeDislike = async (
    likeDislikeDB: LikeDislikeDB
  ): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
      .delete()
      .where({
        user_id: likeDislikeDB.user_id,
        post_id: likeDislikeDB.post_id,
      });
  };

  public updateLikeDislike = async (
    likeDislikeDB: LikeDislikeDB
  ): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
      .update(likeDislikeDB)
      .where({
        user_id: likeDislikeDB.user_id,
        post_id: likeDislikeDB.post_id,
      });
  };

  public insertLikeDislike = async (
    likeDislikeDB: LikeDislikeDB
  ): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES).insert(
      likeDislikeDB
    );
  };
}
