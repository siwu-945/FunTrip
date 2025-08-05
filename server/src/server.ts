import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import spotifyRoutes from './routes/spotify';
import { createServer } from 'http';
import initSockets from './sockets';
import { spawn } from 'child_process';
import path from 'path'
import { rooms } from './sockets';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/spotify', spotifyRoutes);
const httpServer = createServer(app);

initSockets(httpServer);

// Health check
app.get('/', (req, res) => {
    res.send('server is running ' + process.env.FRONTEND_URL);
});

// Check if the room needs a password
app.get('/room/:roomId/requiresPassword', (req, res) : void => {
    const { roomId } = req.params;
    const room = rooms[roomId];
    res.json({ requiresPassword: !!room.password });
});

// Validate room password
app.post('/room/:roomId/validatePassword', (req, res) : void=> {
    const { roomId } = req.params;
    const { password } = req.body;
    const room = rooms[roomId];
    res.json({ valid: room.password === password });
});

// Download song from yt
app.post('/download-song', (req, res) =>{
    // TODO: we can actually make this serverless on AWS, 
    // and call it from there instead of running a script like this
    const videoUrl = req.body.song;
    const scriptPath = path.join(__dirname,'..','scripts','yt_downloader.py');
    const python = spawn('python3', [scriptPath, videoUrl]);
    let audioUrl = '';
    python.stdout.on('data', (chunk) => {
        audioUrl += chunk.toString();
    })
    python.stderr.on('data', (err) => {
        console.error('Python error:', err.toString());
      });
    python.on('close', (code) => {
        res.json({
            audiolink: audioUrl.trim()
        })
    })
})

// Search for songs on yt
app.post('/search-songs', (req, res): void => {
    const { query, maxResults = 10, sortBy = undefined } = req.body;
    
    if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
    }
    
    const scriptPath = path.join(__dirname, '..', 'scripts', 'yt_search.py');
    const args = [scriptPath, query, maxResults.toString()];
    if (sortBy) args.push(sortBy);
    const python = spawn('python3', args);
    
    let searchResults = '';
    let errorOutput = '';
    
    python.stdout.on('data', (chunk) => {
        searchResults += chunk.toString();
    });
    
    python.stderr.on('data', (err) => {
        errorOutput += err.toString();
        console.error('Python search error:', err.toString());
    });
    
    python.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({ 
                error: 'Search failed', 
                details: errorOutput 
            });
            return;
        }
        
        try {
            const results = JSON.parse(searchResults.trim());
            res.json({ results });
        } catch (parseError) {
            console.error('Failed to parse search results:', parseError);
            res.status(500).json({ 
                error: 'Failed to parse search results',
                details: searchResults 
            });
        }
    });
});

app.post('/room/:roomId/setParty', (req, res) : void => {
    const roomId = req.params.roomId;
    if (!roomId || !rooms[roomId]) {
        res.status(404).json({ error: 'Room not found' });
    }
    rooms[roomId].isParty = req.body.isParty;
    res.json({ "Success" :  `Room ${roomId} is now ${rooms[roomId].isParty ? 'in party mode' : 'not in party mode'}` });
});

// Check if user is host
app.get('/room/:roomId/isHost', (req, res) : void => {
    const roomId = req.params.roomId;
    if (!roomId || !rooms[roomId]) {
        res.status(404).json({ error: 'Room not found' });
    }
    const hostId = rooms[roomId].hostID;
    // console.log("User Id: ", req.query.userName, " Host Id: ", hostId);
    res.json({ "isHost" : hostId === req.query.userName });
});

app.get('/room/:roomId/isParty', (req, res) : void => {
    const roomId = req.params.roomId;
    if (!roomId || !rooms[roomId]) {
        res.status(404).json({ error: 'Room not found' });
    }
    res.json({ "isParty" :  rooms[roomId].isParty });
});



// Get host id
app.get('/room/getHost', (req, res) : void => {
    const roomId = req.query.roomId as string;

    if (!roomId || !rooms[roomId]) {
        res.status(404).json({ error: 'Room not found' });
    }
    // console.log("User Id: ", req.query.userName, " Host Id: ", hostId);
    res.json({ "hostId" : rooms[roomId].hostID });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});