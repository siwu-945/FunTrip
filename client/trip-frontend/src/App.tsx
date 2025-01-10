import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpotifyTest } from './spotify/SpotifyTest';
import {Home} from "./pages/Home.tsx";
import {SpotifyLogin} from "./spotify/SpotifyLogin.tsx";
import '@fortawesome/fontawesome-free/css/all.min.css';
import {useEffect} from "react";


let code =  new URLSearchParams(window.location.search).get('code');

function App() {

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('./service-worker.js')
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, []);

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