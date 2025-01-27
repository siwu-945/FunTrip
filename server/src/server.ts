import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import spotifyRoutes from './routes/spotify';

type User = {
    id: string;
    username: string;
};
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/spotify', spotifyRoutes);

const httpServer = createServer(app);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const rooms: Record<string, { id: string; username: string }[]> = {};

const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["my-custom-header"],
    },
    allowEIO3: true
});

io.on('connection', (socket) => {

    socket.on('joinRoom', ({roomId, username} : {roomId : string; username : string}) => {
        socket.join(roomId);
        if(!rooms[roomId]) rooms[roomId] = [];

        rooms[roomId].push({id: socket.id, username: username});
        console.log("user id: " + socket.id + " user name: " + username + " room id: " + roomId);
        io.to(roomId).emit('joinRoom', roomId);
        io.to(roomId).emit('userJoined', rooms[roomId]);

        socket.on("disconnect", () => {
            rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id);
            io.to(roomId).emit("userLeft", rooms[roomId]);
        })

        socket.on("getRoomUsers", (roomId: string, callback: (users: User[]) => void) => {
            if (rooms[roomId]) {
                callback(rooms[roomId]);
            } else {
                callback([]);
            }
        })

        socket.on("exitRoom", (roomId: string) => {
            if(rooms[roomId]){
                rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id);
                io.to(roomId).emit("userLeft", rooms[roomId]);
                socket.leave(roomId);
            }
        })
    });
});

app.get('/', (req, res) => {
    res.send('server is running ' + process.env.FRONTEND_URL);
})

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});