import z from "zod";

export interface CreateCommentInputDTO {
  content: string;
  token: string;
  postId: string;
}

export type CreateCommentOutputDTO = undefined;

export const CreateCommentSchema = z
  .object({
    content: z.string().min(2),
    token: z.string().min(2),
    postId: z.string().min(1),
  })
  .transform((data) => data as CreateCommentInputDTO);
