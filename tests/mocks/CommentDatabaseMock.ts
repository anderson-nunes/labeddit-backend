import { BaseDatabase } from "../../src/database/BaseDatabase";
import { COMMENT_LIKES } from "../../src/models/Comments";
import { PostDB, postDBMock } from "./PostDatabaseMock";

export interface CommentDB {
  id: string;
  creator_id: string;
  post_id: string;
  content: string;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
  comments?: any[];
}

export interface CommentDBWithCreatorName {
  id: string;
  post_id: string;
  creator_id: string;
  content: string;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
  creator_name: string;
}

export const commentDBMock: CommentDB[] = [
  {
    id: "id-mock",
    creator_id: "id-mock",
    post_id: "id-mock",
    content: "comment-mock",
    likes: 10,
    dislikes: 10,
    created_at: "2023-01-01",
    updated_at: "2023-02-01",
  },
];

export interface commentLikeOrDislikeDB {
  comment_id: string;
  user_id: string;
  like: number;
}

const commentUpvoteDownvoteDBMock: commentLikeOrDislikeDB[] = [
  {
    comment_id: "id-mock-1",
    user_id: "id-mock",
    like: 1,
  },
  {
    comment_id: "id-mock-2",
    user_id: "id-mock",
    like: 0,
  },
];

export class CommentDatabaseMock extends BaseDatabase {
  public static TABLE_POSTS = "posts";
  public static TABLE_COMMENTS = "comments";
  public static TABLE_LIKES_DISLIKES_COMMENTS = "comment_like_dislike";

  public async insertComment(commentDB: CommentDB): Promise<void> {}

  public async findCommentByPostId(id: string): Promise<any> {
    const result: any = commentDBMock.filter(
      (comment) => comment.post_id === id
    );

    return result;
  }

  public async findCommentWithCreatorNameById(id: string): Promise<any> {}

  public async findComments(): Promise<CommentDB[]> {
    return commentDBMock;
  }

  public async findLikeDislike(
    item: commentLikeOrDislikeDB
  ): Promise<COMMENT_LIKES | undefined> {
    const [result]: commentLikeOrDislikeDB[] =
      commentUpvoteDownvoteDBMock.filter((comment) => {
        comment.comment_id === item.comment_id &&
          comment.user_id === item.user_id;
      });

    if (result) {
      result.like === 1 ? "ALREADY LIKED" : "ALREADY DISLIKED";
    } else {
      return undefined;
    }
  }

  public async removeLikeDislike(item: commentLikeOrDislikeDB): Promise<void> {}

  public async updateLikeDislike(item: commentLikeOrDislikeDB): Promise<void> {}

  public async insertLikeDislike(
    LikeOrDislikeDB: commentLikeOrDislikeDB
  ): Promise<void> {}

  public async updateComment(commentDB: CommentDB): Promise<void> {}
}
