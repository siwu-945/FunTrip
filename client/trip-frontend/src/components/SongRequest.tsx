import {useEffect, useState} from 'react';
import { Socket } from 'socket.io-client';

interface Props {
    socket: Socket | null;
}

export const SongRequest: React.FC<Props> = ({ socket }) => {
    const [songName, setSongName] = useState('');
    const [songs, setSongs] = useState<string[]>([]);

    useEffect(() => {
        if (!socket) return;

        socket.on('songUpdate', (song: string) => {
            console.log('Received song:', song);
            setSongs(prev => [...prev, song]);
        });

        return () => {
            socket.off('songUpdate');
        };
    }, [socket]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!socket || !songName.trim()) return;

        socket.emit('songRequest', songName);
        setSongName('');
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    value={songName}
                    onChange={(e) => setSongName(e.target.value)}
                    placeholder="Enter song name..."
                />
                <button type="submit">Request Song</button>
            </form>
            <div>
                {songs.map((song, index) => (
                    <div key={index}>{song}</div>
                ))}
            </div>
        </div>
    );
};