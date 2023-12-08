import { Server } from 'socket.io'

const io = new Server({
    cors: {
        origin: "http://localhost:5173"
    }
})

let onlineUsers = [];

const addNewUser = (userId, socketId) => {
    if (onlineUsers.every(user => user.userId !== userId)) {
        onlineUsers.push({ userId, socketId })
        console.log('someone is connected');
    }
}

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId)
    console.log('someone is disconnected');
}

const getUser = (userId) => {
    return onlineUsers.find(user => user.userId === userId);
}


io.on("connection", (socket) => {
    socket.on("newUser", (userId) => {
        addNewUser(userId, socket.id)
        console.log(onlineUsers);
    })

    socket.on('sendFromAdminToEmployer', ({ receiverId, description, type }) => {

        const receiver = getUser(receiverId)
        if (receiver) {
            io.to(receiver.socketId).emit("getNotification", {
                senderId: 'a68af9ff-7835-426e-b9e1-3c3dd081a40b', receiverId, description, type, seen: 0, createdAt: new Date()
            })
        }
    })

    socket.on('sendNotificationForNewJob', ({ employerId, description, type, topFreelancers }) => {
        const receiver = getUser(employerId)
        if (receiver) {
            io.to(receiver.socketId).emit("getNotification", {
                senderId: 'a68af9ff-7835-426e-b9e1-3c3dd081a40b', receiverId: employerId, description, type, seen: 0, createdAt: new Date()
            })
        }

        topFreelancers.forEach(freelancer => {
            const receiver = getUser(freelancer)
            if (receiver) {
                io.to(receiver.socketId).emit("getNotification", {
                    senderId: 'a68af9ff-7835-426e-b9e1-3c3dd081a40b', receiverId: freelancer, description, type: 4, seen: 0, createdAt: new Date()
                })
            }
        })
    })

    socket.on('sendFromFreelancerToEmployer', ({ senderId, receiverId, type, description }) => {
        const receiver = getUser(receiverId)
        if (receiver) {
            io.to(receiver.socketId).emit("getNotification", {
                senderId, receiverId, type, description, seen: 0, createdAt: new Date()
            })
        }
    })

    socket.on("disconnect", () => {
        removeUser(socket.id);
    });
})

io.listen(3001)