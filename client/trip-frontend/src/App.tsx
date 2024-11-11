import { SongRequest } from './components/SongRequest';
import { useSocket } from './hooks/useSocket';

function App() {
    const { socket, connected } = useSocket();

    return (
        <div>
            <h1>Connection status: {connected ? 'Welcome!' : 'Disconnected'}</h1>
            <SongRequest socket={socket} />
        </div>
    )
}

export default App