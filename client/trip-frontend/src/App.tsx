import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SongRequest } from './components/SongRequest';
import { SpotifyTest } from './spotify/SpotifyTest';
import {Home} from "./pages/Home.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/callback" element={<SpotifyTest />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App