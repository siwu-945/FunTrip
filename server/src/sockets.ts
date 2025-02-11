import { Socket, Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { User } from './types/user';
import { RoomInfo } from './types/room';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export default function initSockets(httpServer: HTTPServer) {
    const rooms: Record<string, RoomInfo> = {};

    const io = new Server(httpServer, {
        cors: {
            origin: CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["my-custom-header"],
        },
        allowEIO3: true
    });

    const roomExist = (roomId : string) : boolean => {
        return rooms[roomId] != null;
    }

    const createAndJoinRoom = (roomId: string, socket : Socket) => {
        if(!roomExist(roomId)){
            rooms[roomId] = new RoomInfo(roomId);
        }

        if(rooms[roomId].requiresPassword){
            promptPassword();
        }

        socket.join(roomId);
    }

    const addUserToRoom = (socketId : string, roomId : string, username : string) => {
        const room = rooms[roomId];

        if(room.userExist(username)){
            promptChangeUserName();
        }

        const newUser = new User(socketId, username)
        room.addUserToRoom(newUser)
        // userList.set(socketId, username);
    }

    const promptPassword = () => {
        //TODO 
    }

    const promptChangeUserName = () => {
        //TODO 
    }

    const disconnectUserFromRoom = (roomId : string, username : string, io : Server ) => {
        rooms[roomId].removeUser(username);
        io.emit("userLeft", [...rooms[roomId].getUsers.keys()]);
    }
    
    io.on('connection', (socket) => {
    
        socket.on('joinRoom', ({roomId, username} : {roomId : string; username : string}) => {

            createAndJoinRoom(roomId, socket);
            addUserToRoom(socket.id, roomId, username);

            io.to(roomId).emit('joinRoom', roomId);
            io.to(roomId).emit('userJoined', [...rooms[roomId].getUsers.keys()]);
    
            socket.on("disconnect", () => {
                disconnectUserFromRoom(roomId, username, io);
                socket.leave(roomId);
            })
    
            socket.on("exitRoom", (roomName: string) => {
                disconnectUserFromRoom(roomName, username, io);
                socket.leave(roomName);
            })
        });
    
        socket.on("getUserNames", (roomId: string, callback: (users: string[]) => void) => {
            if (rooms[roomId]) {
                const userNames : Map<string, User> = rooms[roomId].getUsers; 
                callback([...userNames.keys()]);
            } else {
                console.log("No users in the room");
                callback([]);
            }
        })
    });
}
