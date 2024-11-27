import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpotifyTest } from './spotify/SpotifyTest';
import {Home} from "./pages/Home.tsx";
import {SpotifyLogin} from "./spotify/SpotifyLogin.tsx";
import '@fortawesome/fontawesome-free/css/all.min.css';


let code =  new URLSearchParams(window.location.search).get('code');

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/callback" element={<SpotifyTest />} />
                <Route path="/spotify" element={<SpotifyLogin code={code}/>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App