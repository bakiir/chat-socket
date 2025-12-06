"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    sender: {
        type: String
    },
    content: {
        type: String
    },
    timestamp: {
        type: Date
    },
    isGroup: {
        type: Boolean
    },
    groupName: {
        type: String
    },
    receiver: String
});
exports.Message = (0, mongoose_1.model)('Message', messageSchema);
//# sourceMappingURL=Message.js.map