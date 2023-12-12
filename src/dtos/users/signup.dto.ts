import z from "zod";

export interface SignupUserInputDTO {
  name: string;
  email: string;
  password: string;
}

export interface SignupUserOutputDTO {
  message: string;
  token: string;
}

export const SignupUserSchema = z
  .object({
    name: z
      .string({
        required_error: " 'name' é obrigatório ",
        invalid_type_error: " 'name' deve ser do tipo string",
      })
      // .min(3, { message: " 'name' precisa de no mínimo 3 caracteres " })
      .regex(/^[A-Za-zÀ-ú]+([-']?[A-Za-zÀ-ú]+)*$/, {
        message:
          "Essa expressão regular permite nomes com múltiplas palavras, hífens e apóstrofos ",
      }),
    email: z
      .string({
        required_error: " 'email' é obrigatório ",
        invalid_type_error: " 'email' deve ser do tipo string",
      })
      // .email({
      //   message: " 'email' está incompleto, exemplo: 'usuario@email.com' .",
      // })
      .regex(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, {
        message:
          "O email deve começar com um nome de usuário contendo letras, números ou certos caracteres especiais, seguido por um @ e um domínio válido, como por exemplo usuario@email.com",
      }),
    password: z
      .string({
        required_error: " 'password' é obrigatório ",
        invalid_type_error: " 'password' deve ser do tipo string",
      })
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
        message:
          "O password deve ter no mínimo 8 caractere, contendo pelo menos uma letra maiúscula, uma letra minúscula, um número e pelo menos um caractere especial.",
      }),
  })
  .transform((data) => data as SignupUserInputDTO);
