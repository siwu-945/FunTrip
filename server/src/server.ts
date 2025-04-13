import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import spotifyRoutes from './routes/spotify';
import { createServer } from 'http';
import initSockets from './sockets';
import { spawn } from 'child_process';
import path from 'path'

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/spotify', spotifyRoutes);
const httpServer = createServer(app);

initSockets(httpServer);

app.get('/', (req, res) => {
    res.send('server is running ' + process.env.FRONTEND_URL);
})

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

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});