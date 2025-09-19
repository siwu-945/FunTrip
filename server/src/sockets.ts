import { Socket, Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { User } from './types/user';
import { RoomInfo } from './types/room';
import { SongObj } from './types';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const rooms: Record<string, RoomInfo> = {};

export default function initSockets(httpServer: HTTPServer): Server {
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
    const getCurrentSongsInfo = (roomId : string) => {
        const songIdx = rooms[roomId].currentSongIndex;
        // return current song queue of the room
        io.to(roomId).emit("getCurrentSongStream", [...rooms[roomId].getSongStream])

        // return current song playing progress
        const progress = rooms[roomId].getCurrentProgress();
        io.to(roomId).emit("progressSync", progress);

        io.to(roomId).emit("songIndexUpdated", {
            songIndex: songIdx,
            songName: rooms[roomId].getSongStream[songIdx]?.spotifyData.track?.name
        });
        io.to(roomId).emit('isMusicPlaying', !rooms[roomId].isPaused);
    }

    const updateCurrentSongQueue = (newSongs : SongObj[], roomId : string) => {
        io.to(roomId).emit("updateSongStream", [...newSongs])
    }

    const addSongToStream = (roomID : string, selectedTracks: SpotifyApi.PlaylistTrackObject[]) => {
        const newSongs = rooms[roomID].addSongToStream(selectedTracks);
        // Send the entire updated queue
        updateCurrentSongQueue(rooms[roomID].getSongStream, roomID)
    };

    const removeSongFromStream = () => {

    }
    /**
     * User Management
     */
    const createAndJoinRoom = (roomId: string, socket : Socket, password?: string) => {
        if(!roomExist(roomId)){
            rooms[roomId] = new RoomInfo(roomId, password);
            console.log('Room created:', rooms[roomId]);
        }

        if(rooms[roomId].requiresPassword){
            promptPassword();
        }

        socket.join(roomId);
    }

    const addUserToRoom = (socketId : string, roomId : string, username : string, avatarIdx :number) => {
        const room = rooms[roomId];

        if(room.userExist(username)){
            promptChangeUserName();
        }

        const newUser = new User(socketId, username, avatarIdx)
        if (!room.hostID){
            newUser.isHost = true;
            room.hostID = username;
        }
        room.addUserToRoom(newUser)
    }

    const promptPassword = () => {
        //TODO 
    }

    const promptChangeUserName = () => {
        //TODO 
    }

    const disconnectUserFromRoom = (roomId : string, username : string, io : Server ) => {
        if(!rooms[roomId]) return;
        rooms[roomId].removeUser(username);
        if(rooms[roomId].getUsers.size === 0){
            delete rooms[roomId];
            return;
        }
        io.to(roomId).emit("userLeft", [...rooms[roomId].getUsers]);
    }
    
    io.on('connection', (socket) => {
        socket.on('userRejoined', ({roomId, username} : {roomId:string; username:string}) =>{
            if(!roomExist(roomId)){
                console.error("No such room exist");
                return;
            }
            const songIdx = rooms[roomId].currentSongIndex;
            socket.join(roomId)
            io.to(roomId).emit("getCurrentSongStream", [...rooms[roomId].getSongStream])
            io.to(roomId).emit("songIndexUpdated", {
                songIndex: songIdx,
                songName: rooms[roomId].getSongStream[songIdx]?.spotifyData.track?.name
            });
        })
        // separate create and join
        socket.on('joinRoom', ({roomId, username, action, password, avatarIdx}: {roomId: string; username: string; action: 'create' | 'join'; password?: string, avatarIdx : number}) => {
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
            createAndJoinRoom(roomId, socket, password);
            addUserToRoom(socket.id, roomId, username, avatarIdx);
            getCurrentSongsInfo(roomId);
            
            // io.to(roomId).emit('joinRoom', roomId);
            io.to(roomId).emit('userJoined', [...rooms[roomId].getUsers]);
            io.to(roomId).emit('currentPlayingStatus', [...rooms[roomId].getUsers]);
            const progress = rooms[roomId].getCurrentProgress();
            io.to(roomId).emit('updateCurrentAudioProgress', progress.currentTime);
            io.to(roomId).emit('getIsPartyStatus', rooms[roomId].isParty);
            
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

        socket.on("clearQueue", ({roomId, username} : {roomId : string, username : string}) => {
            if (!rooms[roomId]) {
                console.error("No such room exist");
                return;
            }
            
            // Check if user is host
            if (rooms[roomId].hostID !== username) {
                return;
            }
            
            console.log("Clear Queue request from host:", username, "for room:", roomId);
            
            // Clear the queue
            const clearedQueue = rooms[roomId].clearQueue();
            
            console.log("Current song stream after clearing:", {
                songsCount: clearedQueue.length,
                songs: clearedQueue.map(s => s.spotifyData.track?.name)
            });
            
            // Update all clients in the room
            updateCurrentSongQueue(clearedQueue, roomId);
        })

        socket.on("deleteSong", ({roomId, username, songIndex} : {roomId : string, username : string, songIndex : number}) => {
            if (!rooms[roomId]) {
                console.error("No such room exist");
                return;
            }
            
            // Check if user is host
            if (rooms[roomId].hostID !== username) {
                console.error("User is not host, cannot delete song");
                socket.emit('deleteSongError', { message: 'Only the host can delete songs' });
                return;
            }
            
            console.log("Delete Song request from host:", username, "for room:", roomId, "songIndex:", songIndex);
            
            // Delete the song
            const updatedQueue = rooms[roomId].deleteSong(songIndex);
            
            console.log("Current song stream after deletion:", {
                songsCount: updatedQueue.length,
                songs: updatedQueue.map(s => s.spotifyData.track?.name)
            });
            
            // Update all clients in the room
            updateCurrentSongQueue(updatedQueue, roomId);
        })

        socket.on("updateSongIndex", ({roomId, songIndex} : {roomId : string, songIndex : number}) => {           
            // Update the current song index
            if(!rooms[roomId]) return;
            rooms[roomId].updateCurrentSongIndex(songIndex);

            io.to(roomId).emit("songIndexUpdated", {
                songIndex: songIndex,
                songName: rooms[roomId].getSongStream[songIndex]?.spotifyData.track?.name
            });
        })

        socket.on("startPlayback", ({roomId} : {roomId : string}) => {
            if(!rooms[roomId]) return
            
            // Start playback tracking
            rooms[roomId].startSongPlayback();
            
            io.to(roomId).emit("playbackStarted", rooms[roomId].getCurrentProgress());
        })

        socket.on("pausePlayback", ({roomId} : {roomId : string}) => {
            if (!rooms[roomId]) {
                console.error("No such room exist");
                return;
            }
            
            console.log("Pause playback request for room:", roomId);
            
            // Pause playback tracking
            rooms[roomId].pauseSongPlayback();
            
            io.to(roomId).emit("playbackPaused", rooms[roomId].getCurrentProgress());
        })

        socket.on("requestProgressSync", ({roomId} : {roomId : string}) => {
            if (!rooms[roomId]) {
                console.error("No such room exist");
                return;
            }
                        
            // Send current progress to the requesting client
            const progress = rooms[roomId].getCurrentProgress();
            socket.emit("progressSync", progress);
            
            console.log("Sent progress sync:", {
                roomId,
                currentSongIndex: progress.currentSongIndex,
                currentTime: progress.currentTime,
                isPaused: progress.isPaused
            });
        })

        socket.on("reorderQueue", ({roomId, username, newOrder} : {roomId : string, username : string, newOrder: SongObj[]}) => {
            if (!rooms[roomId]) {
                console.error("No such room exist");
                return;
            }
            
            console.log("Reorder Queue request from user:", username, "for room:", roomId);
            
            // Reorder the queue
            const reorderedQueue = rooms[roomId].reorderQueue(newOrder);
            
            console.log("Current song stream after reordering:", {
                songsCount: reorderedQueue.length,
                songs: reorderedQueue.map(s => s.spotifyData.track?.name)
            });
            
            // Update all clients in the room
            updateCurrentSongQueue(reorderedQueue, roomId);
        })

        socket.on("pauseAndPlayEvent", ({roomId, isPaused, progressTime} : {roomId : string, isPaused : boolean, progressTime : number}) => {
            if(isPaused == null || !rooms[roomId]) return;

            console.log("progressTime: ", progressTime, " isPaused: ", isPaused);
            
            if(isPaused){
                rooms[roomId].pauseSongPlayback();
                io.to(roomId).emit("playbackPaused", progressTime);
            }else{
                rooms[roomId].startSongPlayback();
                io.to(roomId).emit("playbackStarted", progressTime);
            }
            
            io.to(roomId).emit('updatePlayingStatus', isPaused);
        })

        socket.on("changeRoomType", ({roomId, isParty} : {roomId : string, isParty : boolean}) => {
            if (rooms[roomId]) {
                rooms[roomId].isParty = isParty;
                io.to(roomId).emit('roomtypeChanged', isParty);
            } else {
                console.error("No such room exist");
            }
        });

        socket.on('sendMessage', ({ roomId, message }) => {
            // broadcast the message to all clients in the room including the sender
            io.to(roomId).emit('receiveMessage', message);
        });
    });
    
    return io;
}
