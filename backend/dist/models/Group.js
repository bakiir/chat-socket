"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const mongoose_1 = require("mongoose");
const groupSchema = new mongoose_1.Schema({
    groupName: String,
    adminUsername: String,
    users: [String]
});
exports.Group = (0, mongoose_1.model)('Group', groupSchema);
//# sourceMappingURL=Group.js.map