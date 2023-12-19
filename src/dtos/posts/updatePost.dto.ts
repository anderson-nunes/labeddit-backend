import z from "zod";

export interface UpdatePostInputDTO {
  content: string;
  token: string;
  idToEdit: string;
}

export type UpdatePostOutputDTO = undefined;

export const UpdatePostSchema = z
  .object({
    content: z.string().min(2),
    token: z.string().min(2),
    idToEdit: z.string().min(1),
  })
  .transform((data) => data as UpdatePostInputDTO);
