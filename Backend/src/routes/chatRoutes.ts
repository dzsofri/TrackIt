import { Router } from "express";
import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();


const server = http.createServer(app);
const io = new Server(server);
const router = Router();
import { users, rooms, userJoin, userLeave, getRoomUsers, getCurrentUser, inRoomsList, roomLeave } from "../utiles/chatUtils";

io.on('connection', (socket)=>{
    console.log(socket.id)

    socket.on('getRoomList', ()=>{
        io.emit('updateRoomList', rooms)
    });

    socket.on('joinToChat', ()=>{
        const session = { user: "defaultUser", room: "defaultRoom" }; // Replace with actual session logic
        let user = userJoin(socket.id, session.user, session.room);
        socket.join(session.room);
        io.to(session.room).emit('updateRoomUsers', getRoomUsers(session.room));
        io.to(session.room).emit('userConnected', user);
        if (!inRoomsList(session.room)){
            rooms.push(session.room);
            io.emit('updateRoomList', rooms); 
        }
    });

    socket.on('leaveChat', ()=>{
        let user = getCurrentUser(socket.id);
        userLeave(socket.id);
        io.to(user.room).emit('message', 'System', `${user.username} left the chat...`);
        io.to(user.room).emit('updateRoomUsers', getRoomUsers(user.room));
        if (getRoomUsers(user.room).length == 0){
            roomLeave(user.room)
            io.emit('updateRoomList', rooms); 
        }
    });

    socket.on('sendMsg', (msg)=>{
        let user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', user, msg);
    });
});



export default router;