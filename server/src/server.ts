import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import spotifyRoutes from './routes/spotify';


const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/spotify', spotifyRoutes);

const httpServer = createServer(app);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

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

    socket.on('songRequest', (song) => {
        // Broadcast the song request to all clients
        io.emit('songUpdate', song);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('server is running ' + process.env.FRONTEND_URL);
})

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});