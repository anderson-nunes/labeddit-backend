import z from "zod";
import { PostModel } from "../../models/Posts";

export interface GetCommentsInputDTO {
  token: string;
}

export type GetCommentsOutputDTO = PostModel[];

export const GetCommentsSchema = z
  .object({
    token: z.string().min(2),
  })
  .transform((data) => data as GetCommentsInputDTO);
