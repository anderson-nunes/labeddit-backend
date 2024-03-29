import z from "zod";
import { CommentModel } from "../../models/Comments";
export interface GetCommentsInputDTO {
  token: string;
  postId: string;
}

export type GetCommentsOutputDTO = CommentModel[];

export const GetCommentsSchema = z
  .object({
    token: z.string().min(2),
    postId: z.string().min(1),
  })
  .transform((data) => data as GetCommentsInputDTO);
