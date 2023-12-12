import z from "zod";

export interface LoginUserInputDTO {
  email: string;
  password: string;
}

export interface LoginUserOutputDTO {
  message: string;
  token: string;
}

export const LoginUserSchema = z
  .object({
    email: z
      .string({
        required_error: " 'email' é obrigatório ",
        invalid_type_error: " 'email' deve ser do tipo string",
      })
      .email({
        message: " 'email' está incompleto, exemplo: 'usuario@email.com' .",
      }),
    password: z
      .string({
        required_error: " 'password' é obrigatório ",
        invalid_type_error: " 'password' deve ser do tipo string",
      })
      .min(4),
  })
  .transform((data) => data as LoginUserInputDTO);
