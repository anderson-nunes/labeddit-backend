import { LikeDislikeDB, POST_LIKE, PostDB } from "../models/Posts";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { PostDatabase } from "../database/PostDatabase";
import { TokenManager } from "../services/TokenManager";
import { IdGenerator } from "../services/IdGenerator";
import { USER_ROLES } from "../models/User";
import { Post } from "../models/Posts";
import {
  CreatePostInputDTO,
  CreatePostOutputDTO,
} from "../dtos/posts/createPost.dto";
import {
  GetPostsInputDTO,
  GetPostsOutputDTO,
} from "../dtos/posts/getPosts.dto";
import {
  UpdatePostInputDTO,
  UpdatePostOutputDTO,
} from "../dtos/posts/updatePost.dto";
import {
  DeletePostInputDTO,
  DeletePostOutputDTO,
} from "../dtos/posts/deletePost.dto";

import {
  LikeOrDislikePostInputDTO,
  LikeOrDislikePostOutputDTO,
} from "../dtos/posts/likeOrDislikePost.dto";
import {
  GetPostByIdInputDTO,
  GetPostByIdOutputDTO,
} from "../dtos/posts/getPostById.dto";
import { COMMENT_LIKES, CommentDB } from "../models/Comments";

function checkRating(rating?: POST_LIKE | COMMENT_LIKES | null) {
  if (rating === POST_LIKE.ALREADY_LIKED) return true;
  if (rating === POST_LIKE.ALREADY_DISLIKED) return false;

  return null;
}

export class PostBusiness {
  constructor(
    private postDataBase: PostDatabase,
    private IdGenerator: IdGenerator,
    private tokenManager: TokenManager
  ) {}

  public getPosts = async (
    input: GetPostsInputDTO
  ): Promise<GetPostsOutputDTO> => {
    const { token } = input;

    const payload = this.tokenManager.getPayload(token);

    if (!payload) {
      throw new BadRequestError("Token inválido");
    }

    let posts = [];

    const postsDB = await this.postDataBase.findPosts();

    for (const post of postsDB) {
      const likeDislikeByPost = await this.postDataBase.findLikeDislike({
        post_id: post.id,
        user_id: payload.id,
        like: 0,
      });

      const parsedPost: PostDB = {
        ...post,
        rating: checkRating(likeDislikeByPost),
      };

      const postDB = new Post(
        parsedPost.id,
        parsedPost.content,
        parsedPost.likes,
        parsedPost.dislikes,
        parsedPost.comments,
        parsedPost.created_at,
        parsedPost.updated_at,
        parsedPost.creator_id,
        parsedPost.creator_name,
        parsedPost.rating
      );

      const postModel = postDB.toBusinissModel();
      posts.push(postModel);
    }

    return posts;
  };

  public getPostById = async (
    input: GetPostByIdInputDTO
  ): Promise<GetPostByIdOutputDTO> => {
    const { token, id } = input;

    const payload = this.tokenManager.getPayload(token);

    if (!payload) {
      throw new BadRequestError("Token inválido");
    }

    const post = await this.postDataBase.findPostById(id);

    if (post) {
      const likeDislikeByPost = await this.postDataBase.findLikeDislike({
        post_id: id,
        user_id: payload.id,
        like: 0,
      });

      const commentsDB = await this.postDataBase.findCommentByPostId(id);
      let commentList = [];

      for (const comment of commentsDB) {
        const likeDislikeByPost =
          await this.postDataBase.findLikeDislikeComment({
            user_id: payload.id,
            comment_id: comment.id,
            like: 0,
          });

        const parsedComment: CommentDB = {
          ...comment,
          rating: checkRating(likeDislikeByPost),
          creator: {
            name: comment.creator_name,
            id: comment.creator_id,
          },
        };

        commentList.push(parsedComment);
      }

      const parsedPost: any = {
        ...post,
        commentList,
        rating: checkRating(likeDislikeByPost),
      };

      const postDB = new Post(
        parsedPost.id,
        parsedPost.content,
        parsedPost.likes,
        parsedPost.dislikes,
        parsedPost.comments,
        parsedPost.created_at,
        parsedPost.updated_at,
        parsedPost.creator_id,
        parsedPost.creator_name,
        parsedPost.rating,
        parsedPost.commentList
      );

      const postModel = postDB.toBusinissModel();

      return postModel;
    }

    return null;
  };

  public createPost = async (
    input: CreatePostInputDTO
  ): Promise<CreatePostOutputDTO> => {
    const { content, token } = input;

    const payload = this.tokenManager.getPayload(token);

    if (!payload) {
      throw new BadRequestError("Token inválido");
    }

    const id = this.IdGenerator.generate();

    const post = new Post(
      id,
      content,
      0,
      0,
      0,
      new Date().toISOString(),
      new Date().toISOString(),
      payload.id
    );

    const postDB = post.toDBModel();

    await this.postDataBase.insertPost(postDB);

    return {
      ...postDB,
      creator: {
        id: payload.id,
        name: payload.name,
      },
    };
  };

  public updatePost = async (
    input: UpdatePostInputDTO
  ): Promise<UpdatePostOutputDTO> => {
    const { content, token, idToEdit } = input;

    const payload = this.tokenManager.getPayload(token);

    if (!payload) {
      throw new BadRequestError("Token inválido");
    }

    const postBR = await this.postDataBase.findPostById(idToEdit);

    if (!postBR) {
      throw new NotFoundError("post com esse id não existe");
    }

    if (payload.id !== postBR.creator_id) {
      throw new BadRequestError("somente quem criou o post pode edita-lo");
    }

    const post = new Post(
      postBR.id,
      postBR.content,
      postBR.likes,
      postBR.dislikes,
      postBR.comments,
      postBR.created_at,
      postBR.updated_at,
      postBR.creator_id
    );

    post.setContent(content);

    const updatePostDB = post.toDBModel();
    await this.postDataBase.updatePost(updatePostDB);

    const response: UpdatePostOutputDTO = undefined;

    return response;
  };

  public deletePost = async (
    input: DeletePostInputDTO
  ): Promise<DeletePostOutputDTO> => {
    const { token, idToDelete } = input;

    const payload = this.tokenManager.getPayload(token);

    if (!payload) {
      throw new BadRequestError("post com esse id não existe");
    }

    const playlistDB = await this.postDataBase.findPostById(idToDelete);

    if (!playlistDB) {
      throw new NotFoundError("playlist com essa id não existe");
    }

    if (payload.role !== USER_ROLES.ADMIN) {
      if (payload.id !== playlistDB.creator_id) {
        throw new BadRequestError("somente quem criou a post pode apagar");
      }
    }

    await this.postDataBase.deletePost(idToDelete);

    const output: DeletePostOutputDTO = undefined;

    return output;
  };

  public likeOrDislikePost = async (
    input: LikeOrDislikePostInputDTO
  ): Promise<LikeOrDislikePostOutputDTO> => {
    const { token, like, postId } = input;

    const payload = this.tokenManager.getPayload(token);

    if (!payload) {
      throw new BadRequestError("token não existe");
    }

    const postDB = await this.postDataBase.findPostById(postId);

    if (!postDB) {
      throw new NotFoundError("post com essa id não existe");
    }

    const post = new Post(
      postDB.id,
      postDB.content,
      postDB.likes,
      postDB.dislikes,
      postDB.comments,
      postDB.created_at,
      postDB.updated_at,
      postDB.creator_id
    );

    const likeSQlite = like ? 1 : 0;

    const likeDislikeDB: LikeDislikeDB = {
      user_id: payload.id,
      post_id: postId,
      like: likeSQlite,
    };

    const likeDislikeExists = await this.postDataBase.findLikeDislike(
      likeDislikeDB
    );

    if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
      if (like) {
        await this.postDataBase.removeLikeDislike(likeDislikeDB);
        post.removeLike();
      } else {
        await this.postDataBase.updateLikeDislike(likeDislikeDB);
        post.removeLike();
        post.addDislike();
      }
    } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
      if (like === false) {
        await this.postDataBase.removeLikeDislike(likeDislikeDB);
        post.removeDislike();
      } else {
        await this.postDataBase.updateLikeDislike(likeDislikeDB);
        post.removeDislike();
        post.addLike();
      }
    } else {
      await this.postDataBase.insertLikeDislike(likeDislikeDB);
      like ? post.addLike() : post.addDislike();
    }

    const updatedPostDB = post.toDBModel();
    await this.postDataBase.updatePost(updatedPostDB);

    const output: LikeOrDislikePostOutputDTO = undefined;

    return output;
  };
}
