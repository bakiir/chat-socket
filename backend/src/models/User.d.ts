import { Document, Model } from "mongoose";
export interface IUser extends Document {
    username: string;
    password: string;
}
declare const User: Model<IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map