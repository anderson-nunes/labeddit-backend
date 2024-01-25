import { BaseDatabase } from "../../src/database/BaseDatabase";
import { commentDBMock, commentLikeOrDislikeDB } from "./CommentDatabaseMock";
import { LikeDislikeDB, POST_LIKE } from "../../src/models/Posts";
import { COMMENT_LIKES, LikeDislikeCommentDB } from "../../src/models/Comments";

export interface PostDB {
  id: string;
  creator_id: string;
  content: string;
  likes: number;
  dislikes: number;
  comments: number;
  created_at: string;
  updated_at: string;
}

export interface postLikeOrDislikeDB {
  post_id: string;
  user_id: string;
  like: number;
}

export const postDBMock: PostDB[] = [
  {
    id: "id-mock",
    creator_id: "id-mock-fulano",
    content: "post-mock",
    likes: 10,
    dislikes: 10,
    comments: 10,
    created_at: "2023-01-01",
    updated_at: "2023-02-01",
  },
];

const postUpvoteDownvoteDBMock: postLikeOrDislikeDB[] = [
  {
    post_id: "id-mock",
    user_id: "id-mock-fulano",
    like: 1,
  },
  {
    post_id: "id-mock-2",
    user_id: "id-mock-fulano",
    like: 0,
  },
];

const commentUpvoteDownvoteDBMock: commentLikeOrDislikeDB[] = [
  {
    comment_id: "id-mock-1",
    user_id: "id-mock-fulano",
    like: 1,
  },
  {
    comment_id: "id-mock-2",
    user_id: "id-mock-fulano",
    like: 0,
  },
];

export class PostDatabaseMock extends BaseDatabase {
  public static TABLE_POST = "posts";
  public static TABLE_LIKES_DISLIKES = "post_like_dislike";
  public static TABLE_COMMENTS = "comments";
  public static TABLE_USERS = "users";

  public async findPosts(): Promise<PostDB[]> {
    return postDBMock;
  }

  public async findPostById(id: string): Promise<PostDB | undefined> {
    const result: PostDB[] = postDBMock.filter((post) => post.id === id);

    return result[0];
  }

  public async findCommentByPostId(id: string): Promise<any> {
    const result: any = commentDBMock.filter(
      (comment) => comment.post_id === id
    );

    return result;
  }

  public async insertPost(post: PostDB): Promise<void> {
    postDBMock.push(post);
  }

  public async updateCommentNumber(postId: string): Promise<void> {
    const index = postDBMock.findIndex((post) => post.id === postId);

    if (index !== -1) {
      postDBMock[index].comments = +1;
      const updatedPost = postDBMock.splice(index, 1)[0];
      postDBMock.splice(index, 0, updatedPost);
    }
  }

  public async updatePost(postDB: PostDB): Promise<void> {
    const index = postDBMock.findIndex((post) => post.id === postDB.id);

    if (index !== -1) {
      const updatedPost = postDBMock.splice(index, 1)[0];
      postDBMock.splice(index, 0, updatedPost);
    }
  }

  public async deletePost(id: string): Promise<void> {
    const index = postDBMock.findIndex((post) => post.id === id);

    if (index !== -1) {
      postDBMock.splice(index, 1);
    }
  }

  public findLikeDislike = async (
    likeDislikeDB: LikeDislikeDB
  ): Promise<POST_LIKE | undefined> => {
    const [result]: Array<LikeDislikeDB | undefined> =
      postUpvoteDownvoteDBMock.filter(
        (post) =>
          post.post_id === likeDislikeDB.post_id &&
          post.user_id === likeDislikeDB.user_id
      );

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
      commentUpvoteDownvoteDBMock.filter(
        (comment) =>
          comment.comment_id === likeDislikeDB.comment_id &&
          comment.user_id === likeDislikeDB.user_id
      );

    if (result === undefined) {
      return undefined;
    } else if (result.like === 1) {
      return COMMENT_LIKES.ALREADY_LIKED;
    } else {
      return COMMENT_LIKES.ALREADY_DISLIKED;
    }
  };

  public async removeLikeDislike(item: postLikeOrDislikeDB): Promise<void> {
    const index = postDBMock.findIndex((post) => post.id === item.post_id);

    if (index !== -1) {
      postDBMock.splice(index, 1);
    }
  }

  public async updateLikeDislike(item: postLikeOrDislikeDB): Promise<void> {
    const index = postDBMock.findIndex(
      (post) => post.id === item.post_id && item.user_id
    );

    if (index !== -1) {
      const updatedPost = postDBMock.splice(index, 1)[0];
      postDBMock.splice(index, 0, updatedPost);
    }
  }

  public async insertLikeDislike(likeDislikeDB: LikeDislikeDB): Promise<void> {
    postUpvoteDownvoteDBMock.push(likeDislikeDB);
  }
}
