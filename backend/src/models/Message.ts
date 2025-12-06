import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
    sender: String,
    content: String,
    timestamp:Date,
    isGroup:Boolean,
    groupName:String,
    receiver: String

}

const messageSchema = new Schema<IMessage>({
    sender: {
        type: String
    },
    content:{
        type: String
    },
    timestamp:{
        type: Date
    },
    isGroup:{
        type:Boolean
    },
    groupName:{
        type:String
    },
    receiver: String

});

export const Message = model<IMessage>('Message', messageSchema);
