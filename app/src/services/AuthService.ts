import {inject, injectable} from "inversify";
import {USER_DAL} from "../../inversify/identifiers/common";
import {UserDAL} from "../DAL/UserDAL";
import {User} from "../models/contracts/User";
import * as Bluebird from "bluebird";
import {UserError} from "../models/exceptions/UserError";

@injectable()
export class AuthService {
    constructor(
        @inject(USER_DAL) private userDAL: UserDAL
    ) {}

    public async singUp(nickname: string, email: string, password: string): Promise<User> {
        const [usersWithNickname, usersWithEmail] = await Bluebird.all<User[], User[]>([
            this.userDAL.getUsersByNickName(nickname),
            this.userDAL.getUsersByEmail(email)
        ]);

        if (usersWithNickname.length) {
            throw new UserError(`This nickname already exists`, 4);
        }

        if (usersWithEmail.length) {
            throw new UserError(`This email already is used in the system`, 4);
        }

        const userData: User = {
            nickname: nickname,
            balance: 1000,
            email: email,
            role: "user",
            password: password
        };

        return this.userDAL.createUser(userData);
    }
}