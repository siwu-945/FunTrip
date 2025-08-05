import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpotifyTest } from './spotify/SpotifyTest';
import {Home} from "./pages/Home.tsx";
import CookieBanner from './components/Banners/CookieBanner.tsx';
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {

    return (
        <BrowserRouter>
            <CookieBanner />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/callback" element={<SpotifyTest />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App