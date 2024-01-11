import { BaseDatabase } from "./BaseDatabase";
import { UserDatabase } from "./UserDatabase";
import { PostDB } from "../models/Posts";
import {
  LikeDislikeDB,
  POST_LIKE,
  PostDBWithCreatorName,
} from "../models/Posts";

export class PostDatabase extends BaseDatabase {
  public static TABLE_POST = "posts";
  public static TABLE_LIKES_DISLIKES = "post_like_dislike";

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
      );

    return postsDB;
  }

  public async findPostsWithCreatorName(): Promise<PostDBWithCreatorName[]> {
    const postsDB: PostDBWithCreatorName[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POST
    )
      .select(
        `${PostDatabase.TABLE_POST}.id`,
        `${PostDatabase.TABLE_POST}.creator_id`,
        `${PostDatabase.TABLE_POST}.content`,
        `${PostDatabase.TABLE_POST}.likes`,
        `${PostDatabase.TABLE_POST}.dislikes`,
        `${PostDatabase.TABLE_POST}.created_at`,
        `${PostDatabase.TABLE_POST}.updated_at`,
        `${UserDatabase.TABLE_USERS}.name as creator_name`
      )
      .join(
        `${UserDatabase.TABLE_USERS}`,
        `${PostDatabase.TABLE_POST}.creator_id`,
        "=",
        `${UserDatabase.TABLE_USERS}.id`
      );
    return postsDB;
  }

  public async findPostById(id: string): Promise<PostDB | undefined> {
    const [postsDB]: PostDB[] | undefined[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POST
    )
      .select()
      .where({ id });

    return postsDB;
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

  public findPostWithCreatorNameById = async (
    id: string
  ): Promise<PostDBWithCreatorName | undefined> => {
    const [result] = await BaseDatabase.connection(PostDatabase.TABLE_POST)
      .select(
        `${PostDatabase.TABLE_POST}.id`,
        `${PostDatabase.TABLE_POST}.creator_id`,
        `${PostDatabase.TABLE_POST}.content`,
        `${PostDatabase.TABLE_POST}.likes`,
        `${PostDatabase.TABLE_POST}.dislikes`,
        `${PostDatabase.TABLE_POST}.created_at`,
        `${PostDatabase.TABLE_POST}.updated_at`
      )

      .where({ [`${PostDatabase.TABLE_POST}.id`]: id });

    return result as PostDBWithCreatorName | undefined;
  };

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
