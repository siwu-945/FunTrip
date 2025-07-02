import { Socket, Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { User } from './types/user';
import { RoomInfo } from './types/room';
import { SongObj } from './types';

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

    /**
     * Audio Player Management
     */


    /**
     * Playlist management
     */
    const getCurrentSongQueue = (roomId : string) => {
        io.emit("getCurrentSongStream", [...rooms[roomId].getSongStream])
    }

    const updateCurrentSongQueue = (newSongs : SongObj[]) => {
        io.emit("updateSongStream", [...newSongs])
    }

    const addSongToStream = (roomID : string, selectedTracks: SpotifyApi.PlaylistTrackObject[]) => {
        const newSongs = rooms[roomID].addSongToStream(selectedTracks);
        updateCurrentSongQueue(newSongs)
    };

    const removeSongFromStream = () => {

    }
    /**
     * User Management
     */
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
        // separate create and join
        socket.on('joinRoom', ({roomId, username, action}: {roomId: string; username: string; action: 'create' | 'join'}) => {
            if (action === 'create') {
                if (roomExist(roomId)) {
                    socket.emit('roomError', { message: 'Room ID already in use. Please choose another.' });
                    return;
                }
            } else if (action === 'join') {
                if (!roomExist(roomId)) {
                    socket.emit('roomError', { message: 'Room does not exist. Please check your Room ID.' });
                    return;
                }
            }
            createAndJoinRoom(roomId, socket);
            addUserToRoom(socket.id, roomId, username);
            getCurrentSongQueue(roomId);
            
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

        socket.on("addSongToStream", ({selectedTracks, roomId} : {selectedTracks: SpotifyApi.PlaylistTrackObject[], roomId : string}) => {
            if (rooms[roomId]) {
                addSongToStream(roomId, selectedTracks)
            }
            else{
                console.error("No such room exist")
            }
        })

        socket.on("pauseAndPlayEvent", ({roomId, isPaused} : {roomId : string, isPaused : boolean}) => {
            socket.to(roomId).emit('updatePlayingStatus', isPaused);
        })

        socket.on('sendMessage', ({ roomId, message }) => {
            // broadcast the message to all clients in the room including the sender
            io.to(roomId).emit('receiveMessage', message);
        });
    });
}
