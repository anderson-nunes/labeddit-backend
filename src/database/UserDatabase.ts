import { BaseDatabase } from "./BaseDatabase";
export interface UserDB {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
}

export class UserDatabase extends BaseDatabase {
  public static TABLE_USERS = "users";

  public async findUsers(q: string | undefined) {
    let usersDB;

    if (q) {
      const result: UserDB[] = await BaseDatabase.connection(
        UserDatabase.TABLE_USERS
      ).where("name", "LIKE", `%${q}%`);

      usersDB = result;
    } else {
      const result: UserDB[] = await BaseDatabase.connection(
        UserDatabase.TABLE_USERS
      );

      usersDB = result;
    }
    return usersDB;
  }

  public async findUserById(id: string) {
    const [usersDB]: UserDB[] | undefined[] = await BaseDatabase.connection(
      UserDatabase.TABLE_USERS
    ).where({ id });

    return usersDB;
  }

  public async findUserByName(name: string) {
    const [result]: UserDB[] | undefined[] = await BaseDatabase.connection(
      UserDatabase.TABLE_USERS
    ).where({ name });

    return result;
  }

  public async findUserByEmail(email: string): Promise<UserDB | undefined> {
    const [userDB]: UserDB[] | undefined[] = await BaseDatabase.connection(
      UserDatabase.TABLE_USERS
    ).where({ email });

    return userDB;
  }

  public async insertUser(newUserDB: UserDB) {
    await BaseDatabase.connection(UserDatabase.TABLE_USERS).insert(newUserDB);
  }
}
