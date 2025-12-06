import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    passwordHash: string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },
    passwordHash: {
        type: String,
        required: true
    }
});

export const User = model<IUser>('User', userSchema);
