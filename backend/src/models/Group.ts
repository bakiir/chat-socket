import { Schema, model, Document } from 'mongoose';

export interface IGroup extends Document {
    groupName: string;
    adminUsername: string,
    users: [string]
}

const groupSchema = new Schema<IGroup>(
{
    groupName: String,
    adminUsername: String,
    users:   [String]
});

export const Group = model<IGroup>('Group', groupSchema);
