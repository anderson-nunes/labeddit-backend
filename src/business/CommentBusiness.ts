import { CommentDatabase } from "../database/CommentDatabase";
import { PostDatabase } from "../database/PostDatabase";
import {
  CreateCommentInputDTO,
  CreateCommentOutputDTO,
} from "../dtos/comments/createComments.dto";
import {
  GetCommentsInputDTO,
  GetCommentsOutputDTO,
} from "../dtos/comments/getComments.dtos";
import {
  LikeOrDislikeCommentInputDTO,
  LikeOrDislikeCommentOutputDTO,
} from "../dtos/comments/likeOrDislikeComments.dto";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import {
  COMMENT_LIKES,
  Comment,
  LikeDislikeCommentDB,
} from "../models/Comments";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class CommentBusiness {
  constructor(
    private commentsDatabase: CommentDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private postDataBase: PostDatabase
  ) {}

  public getComments = async (
    input: GetCommentsInputDTO
  ): Promise<GetCommentsOutputDTO> => {
    const { token, postId } = input;

    const payload = this.tokenManager.getPayload(token);

    if (!payload) {
      throw new BadRequestError("Token inválido");
    }

    const commentsDB = await this.commentsDatabase.findCommentByPostId(postId);

    const commentsModel = commentsDB.map((commentDB: any) => {
      const comment = new Comment(
        commentDB.id,
        commentDB.post_id,
        commentDB.content,
        commentDB.likes,
        commentDB.dislikes,
        commentDB.created_at,
        commentDB.updated_at,
        commentDB.creator_id,
        commentDB.creator_name
      );

      return comment.toBusinessModel();
    });

    const response: GetCommentsOutputDTO = commentsModel;

    return response;
  };

  public createComment = async (
    input: CreateCommentInputDTO
  ): Promise<CreateCommentOutputDTO> => {
    const { content, token, postId } = input;

    const payload = this.tokenManager.getPayload(token);

    if (!payload) {
      throw new UnauthorizedError("Token inválido!");
    }

    const id = this.idGenerator.generate();

    const comment = new Comment(
      id,
      postId,
      content,
      0,
      0,
      new Date().toISOString(),
      new Date().toISOString(),
      payload.id
    );

    const commentDB = comment.toDBModel();
    await this.commentsDatabase.insertComment(commentDB);

    await this.postDataBase.updateCommentNumber(postId);

    return {
      ...commentDB,
      creator: {
        id: commentDB.created_at,
        name: payload.name,
      },
    };
  };

  public likeOrDislikeComment = async (
    input: LikeOrDislikeCommentInputDTO
  ): Promise<LikeOrDislikeCommentOutputDTO> => {
    const { token, like, commentId } = input;

    const payload = this.tokenManager.getPayload(token);

    if (!payload) {
      throw new BadRequestError("token não existe");
    }

    const commentDBWithCreatorName =
      await this.commentsDatabase.findCommentWithCreatorNameById(commentId);

    if (!commentDBWithCreatorName) {
      throw new NotFoundError("comment com essa id não existe");
    }

    const post = new Comment(
      commentDBWithCreatorName.id,
      commentDBWithCreatorName.post_id,
      commentDBWithCreatorName.content,
      commentDBWithCreatorName.likes,
      commentDBWithCreatorName.dislikes,
      commentDBWithCreatorName.created_at,
      commentDBWithCreatorName.updated_at,
      commentDBWithCreatorName.creator_id,
      commentDBWithCreatorName.creator_name
    );

    const likeSQlite = like ? 1 : 0;

    const likeDislikeDB: LikeDislikeCommentDB = {
      user_id: payload.id,
      comment_id: commentId,
      like: likeSQlite,
    };

    const likeDislikeExists = await this.commentsDatabase.findLikeDislike(
      likeDislikeDB
    );

    if (likeDislikeExists === COMMENT_LIKES.ALREADY_LIKED) {
      if (like) {
        await this.commentsDatabase.removeLikeDislike(likeDislikeDB);
        post.removeLike();
      } else {
        await this.commentsDatabase.updateLikeDislike(likeDislikeDB);
        post.removeLike();
        post.addDislike();
      }
    } else if (likeDislikeExists === COMMENT_LIKES.ALREADY_DISLIKED) {
      if (like === false) {
        await this.commentsDatabase.removeLikeDislike(likeDislikeDB);
        post.removeDislike();
      } else {
        await this.commentsDatabase.updateLikeDislike(likeDislikeDB);
        post.removeDislike();
        post.addLike();
      }
    } else {
      await this.commentsDatabase.insertLikeDislike(likeDislikeDB);
      like ? post.addLike() : post.addDislike();
    }

    const updatedCommentDB = post.toDBModel();
    await this.commentsDatabase.updateComment(updatedCommentDB);

    const output: LikeOrDislikeCommentOutputDTO = undefined;

    return output;
  };
}
