const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require("socket.io");
const Filter = require('bad-words');
const { generatMeessage, generateLocation } = require("./utils/messages");
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app) // create new websever
const io = socketio(server);   // configure socket works with configured server

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log("websocket connection")

    // event emmiters

    socket.on('join', ({ username, room } = {}, cb) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) 
            return cb(error);
        socket.join(user.room);  // allow to join a given room
        socket.emit('message', generatMeessage("Admin", 'Welcome'));
        socket.broadcast.to(user.room).emit('message', generatMeessage("Admin", user.username + ' has joined')); //send to all user execpt current user
        io.to(user.room).emit('roomdata', {
            room: user.room,
            users: getUserInRoom(user.room),
        })
        cb();
    });

    socket.on('sendMessage', (msg, cb) => {
        const user = getUser(socket.id);

        const filter = new Filter();
        if (filter.isProfane(msg)) {
            return cb('bad words not allowed');
        }
        io.to(user.room).emit('message', generatMeessage(user.username, msg)); // send to all user
        cb('delivered');  // acknowledgement for deliverd message
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generatMeessage("Admin", user.username + ' has left')); // send to all user
            io.to(user.room).emit('roomdata', {
                room: user.room,
                users: getUserInRoom(user.room),
            });
        }

    });

    socket.on('sendLocation', (location, cb) => {
        const user = getUser(socket.id);
        console.log(user);
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${location.latitide},${location.longitude}`));
        cb("location sent")
    });
})


server.listen(port, () => {
    console.log("app started in " + port);
})