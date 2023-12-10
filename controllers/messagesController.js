const messageModel = require("../model/messageModel")

module.exports.addMessage = async (req, res, next) => {
    try {
        const { from, to, message } = req.body;

        const data = await messageModel.create({
            sender: from,
            users: [from, to],
            message
        });

        if (data) return res.json({ message })
        return res.json({ message: 'Lỗi khi thêm tin nhắn vào database' })
    }
    catch (err) { console.log(err) }
};

module.exports.getAllMessages = async (req, res, next) => {
    try {
        const { from, to } = req.body;
        const messages = await messageModel.find({
            users: {
                $all: [from, to],
            },
        }).sort({ updatedAt: 1 });

        const projectMessages = messages.map((msg) => {
            return {
                fromSelt: msg.sender.toString() === from,
                message: msg.message,
                seen: msg.seen,
                createdAt: msg.createdAt
            }
        })

        res.json(projectMessages)
    }
    catch (err) { console.log(err) }
};

module.exports.getMessagesByUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const messages = await messageModel.aggregate([
            {
                $match: {
                    users: userId
                }
            },
            {
                $sort: { createdAt: -1 } // Sắp xếp tin nhắn theo thời gian tạo giảm dần
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $ne: ["$sender", userId] },
                            then: "$sender",
                            else: { $arrayElemAt: ["$users", 1] }
                        }
                    },
                    latestMessage: { $first: "$$ROOT" } // Get the latest message
                }
            },
            {
                $replaceRoot: { newRoot: "$latestMessage" }
            }
        ]);

        const projectMessages = messages.map((msg) => {
            return {
                id: msg._id,
                fromSelt: msg.sender.toString() === userId,
                users: msg.users,
                message: msg.message,
                seen: msg.seen,
                createdAt: msg.createdAt
            }
        })

        res.json(projectMessages)
    }
    catch (err) { console.log(err) }
};

module.exports.updateMessage = async (req, res) => {
    try {
        const _id = req.query.id;

        await messageModel.findOneAndUpdate({ _id }, { seen: true });

        res.json({ message: 'Updated message' })
    }
    catch (err) { console.log(err) }
}