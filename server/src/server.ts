import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import spotifyRoutes from './routes/spotify';
import { createServer } from 'http';
import initSockets from './sockets';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/spotify', spotifyRoutes);
const httpServer = createServer(app);

initSockets(httpServer);

app.get('/', (req, res) => {
    res.send('server is running ' + process.env.FRONTEND_URL);
})

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});