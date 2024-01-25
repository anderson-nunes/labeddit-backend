import { BaseDatabase } from "../../src/database/BaseDatabase";
import { COMMENT_LIKES } from "../../src/models/Comments";

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

  public async insertComment(comment: CommentDB): Promise<void> {
    commentDBMock.push(comment);
  }

  public async findCommentByPostId(id: string): Promise<any> {
    const result: any = commentDBMock.filter(
      (comment) => comment.post_id === id
    );

    return result;
  }

  public async findCommentWithCreatorNameById(id: string): Promise<any> {
    const result: any = commentDBMock.filter(
      (comment) => comment.post_id === id
    );

    return result;
  }

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

  public async removeLikeDislike(item: commentLikeOrDislikeDB): Promise<void> {
    const index = commentDBMock.findIndex(
      (comment) => comment.id === item.comment_id
    );

    if (index !== -1) {
      commentDBMock.splice(index, 1);
    }
  }

  public async updateLikeDislike(item: commentLikeOrDislikeDB): Promise<void> {
    const index = commentDBMock.findIndex(
      (comment) => comment.id === item.comment_id && item.user_id
    );

    if (index !== -1) {
      const updatedComment = commentDBMock.splice(index, 1)[0];
      commentDBMock.splice(index, 0, updatedComment);
    }
  }

  public async insertLikeDislike(
    LikeOrDislikeDB: commentLikeOrDislikeDB
  ): Promise<void> {
    commentUpvoteDownvoteDBMock.push(LikeOrDislikeDB);
  }

  public async updateComment(commentDB: CommentDB): Promise<void> {
    const index = commentDBMock.findIndex(
      (comment) => comment.id === commentDB.id
    );

    if (index !== -1) {
      const updatedPost = commentDBMock.splice(index, 1)[0];
      commentDBMock.splice(index, 0, updatedPost);
    }
  }
}
