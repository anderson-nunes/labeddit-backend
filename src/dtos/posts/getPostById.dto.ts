import z from "zod";
import { PostModel } from "../../models/Posts";
export interface GetPostByIdInputDTO {
  token: string;
  id: string;
}

export type GetPostByIdOutputDTO = PostModel | null;

export const GetPostByIdSchema = z
  .object({
    token: z.string().min(2),
    id: z.string().min(2),
  })
  .transform((data) => data as GetPostByIdInputDTO);
