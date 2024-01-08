import { ZodError } from "zod";
import { CreateCommentSchema } from "../dtos/comments/createComments.dto";
import { BaseError } from "../errors/BaseError";
import { Request, Response } from "express";
import { CommentBusiness } from "../business/CommentBusiness";
import {
  GetCommentsInputDTO,
  GetCommentsSchema,
} from "../dtos/comments/getComments.dtos";

export class CommentController {
  constructor(private commentBusiness: CommentBusiness) {}

  //endpoints requisiçao
  public createComment = async (req: Request, res: Response) => {
    try {
      const input = CreateCommentSchema.parse({
        content: req.body.content,
        token: req.headers.authorization,
        postId: req.params.id,
      });

      const output = await this.commentBusiness.createComment(input);
      res.status(201).send(output);
    } catch (error) {
      console.log(error);

      if (error instanceof ZodError) {
        res.status(400).send(error.issues);
      } else if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado!");
      }
    }
  };

  public getComments = async (req: Request, res: Response) => {
    try {
      const input = GetCommentsSchema.parse({
        token: req.headers.authorization,
        postId: req.params.id,
      });

      const response = await this.commentBusiness.getComments(input);

      res.status(200).send(response);
    } catch (error) {
      console.log(error);

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };
}
