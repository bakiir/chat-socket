"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const Group_1 = require("../models/Group");
const Message_1 = require("../models/Message");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// Create a new group
router.post('/groups', auth_middleware_1.authMiddleware, async (req, res) => {
    const { name, members } = req.body; // members is an array of user IDs
    if (!name || !members || members.length < 2) {
        return res.status(400).json({ message: 'Group name and at least 2 members are required' });
    }
    const allMembers = [...new Set([...members, req.user.userId])]; // Include creator and ensure uniqueness
    if (allMembers.length < 3) {
        return res.status(400).json({ message: 'A group must have at least 3 unique members' });
    }
    try {
        const memberDocs = await User_1.User.find({ '_id': { $in: allMembers } });
        if (memberDocs.length !== allMembers.length) {
            return res.status(404).json({ message: 'One or more members not found' });
        }
        const newGroup = new Group_1.Group({
            groupName: name,
            users: allMembers,
            adminUsername: req.user.username,
        });
        await newGroup.save();
        res.status(201).json(newGroup);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating group' });
    }
});
// Get all chats (DMs and Groups) for the current user
router.get('/', auth_middleware_1.authMiddleware, async (req, res) => {
    const currentUserId = req.user.userId;
    const currentUsername = req.user.username;
    try {
        // Get groups the user is a member of
        const groups = await Group_1.Group.find({ users: currentUserId }).select('groupName _id');
        // Get DMs by finding all messages sent to or by the user
        const dmUsers = await Message_1.Message.aggregate([
            { $match: { $or: [{ sender: currentUsername }, { receiver: currentUsername }], isGroup: false } },
            { $project: {
                    partner: {
                        $cond: {
                            if: { $eq: ["$sender", currentUsername] },
                            then: "$receiver",
                            else: "$sender"
                        }
                    }
                } },
            { $group: { _id: "$partner" } }
        ]);
        const dmUsernames = dmUsers.map(u => u._id);
        const dmUserDetails = await User_1.User.find({ username: { $in: dmUsernames } }).select('username _id');
        res.json({ groups, dms: dmUserDetails });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching chats' });
    }
});
// Get DM chat history
router.get('/history/dm/:otherUsername', auth_middleware_1.authMiddleware, async (req, res) => {
    const { otherUsername } = req.params;
    const currentUsername = req.user.username;
    try {
        const messages = await Message_1.Message.find({
            isGroup: false,
            $or: [
                { sender: currentUsername, receiver: otherUsername },
                { sender: otherUsername, receiver: currentUsername }
            ]
        }).sort({ timestamp: 1 });
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching DM history' });
    }
});
// Get Group chat history
router.get('/history/group/:groupId', auth_middleware_1.authMiddleware, async (req, res) => {
    const { groupId } = req.params;
    const currentUserId = req.user.userId;
    try {
        const group = await Group_1.Group.findById(groupId);
        if (!group || !group.users.includes(currentUserId)) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }
        const messages = await Message_1.Message.find({
            isGroup: true,
            groupName: group.groupName
        }).sort({ timestamp: 1 });
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching group history' });
    }
});
exports.default = router;
//# sourceMappingURL=chats.js.map