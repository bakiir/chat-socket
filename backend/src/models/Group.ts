import { Schema, model, Document, Types } from 'mongoose';

export interface IGroup extends Document {
    groupName: string;
    adminUsername: string;
    users: Types.ObjectId[]; // Array of User ObjectIds
}

const groupSchema = new Schema<IGroup>(
{
    groupName: { type: String, required: true, unique: true },
    adminUsername: { type: String, required: true },
    users:   [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

export const Group = model<IGroup>('Group', groupSchema);
