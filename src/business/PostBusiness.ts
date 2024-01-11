import { LikeDislikeDB, POST_LIKE } from "../models/Posts";
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

    const postsDB = await this.postDataBase.findPosts();

    const postModel = postsDB.map((postDB) => {
      const post = new Post(
        postDB.id,
        postDB.content,
        postDB.likes,
        postDB.dislikes,
        postDB.comments,
        postDB.created_at,
        postDB.updated_at,
        postDB.creator_id,
        postDB.creator_name
      );

      return post.toBusinissModel();
    });

    const response: GetPostsOutputDTO = postModel;

    return response;
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

    console.log("@post", {
      id,
      content,
      likes: 0,
      dislikes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creatorId: payload.id,
    });

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

    const response = await this.postDataBase.insertPost(postDB);

    return response;
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
