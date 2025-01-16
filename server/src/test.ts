import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// Add cors middleware
app.use(cors({
    origin: "http://localhost:5173", // Your React app URL
    credentials: true
}));

const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Your React app URL
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["my-custom-header"],
    },
    allowEIO3: true // Allow Engine.IO version 3
});

io.on('connection', (socket) => {
    console.log('A user connected');
});

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});