import { GetUsersInputDTO, GetUsersSchema } from "../dtos/users/getUsers.dto";
import { Request, Response } from "express";
import { UserBusiness } from "../business/UserBusiness";

import { BaseError } from "../errors/BaseError";
import { ZodError } from "zod";
import { SignupUserSchema } from "../dtos/users/signup.dto";
import { LoginUserSchema } from "../dtos/users/login.dto";

export class UserController {
  constructor(private userBusiness: UserBusiness) {}

  public getUsers = async (req: Request, res: Response) => {
    try {
      const input: GetUsersInputDTO = GetUsersSchema.parse({
        nameToSearch: req.query.name as string | undefined,
        token: req.headers.authorization,
      });

      const response = await this.userBusiness.getUsers(input);

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

  public signup = async (req: Request, res: Response) => {
    try {
      const input = SignupUserSchema.parse({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      });

      const response = await this.userBusiness.signup(input);

      res.status(201).send(response);
    } catch (error) {
      console.log(error);

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };

  public login = async (req: Request, res: Response) => {
    try {
      const input = LoginUserSchema.parse({
        email: req.body.email,
        password: req.body.password,
      });

      const output = await this.userBusiness.login(input);

      res.status(200).send(output);
    } catch (error) {
      console.log(error);

      if (error instanceof ZodError) {
        res.status(400).send(error.issues);
      } else if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };
}
