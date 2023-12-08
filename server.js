const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const socket = require('socket.io')
const messageRoutes = require("./routes/messagesRoute")

const app = express()
require('dotenv').config()

app.use(cors())
app.use(express.json());

app.use("/api/socket/", messageRoutes)

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to mongodb');
    })
    .catch(err => console.log(err.message))

const server = app.listen(process.env.PORT, () => {
    console.log('Server listening on port ' + process.env.PORT);
})

const io = socket(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    }
})

let onlineUsers = [];

const addNewUser = (userId, socketId) => {
    console.log(userId, socketId)
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

    socket.on("removeUser", () => {
        removeUser(socket.id);
        console.log(onlineUsers);
    });


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

    socket.on('send-message', (data) => {
        const receiver = getUser(data.to)
        if (receiver) {
            io.to(receiver.socketId).emit('msg-receive', { message: data.message, from: data.from, createdAt: new Date() })
        }
    })

    socket.on("disconnect", () => {
        removeUser(socket.id);
        console.log(onlineUsers);
    });
})
