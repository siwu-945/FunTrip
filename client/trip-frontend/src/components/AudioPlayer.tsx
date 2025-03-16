import React, {useState, useEffect} from "react";
import SpotifyPlayer from "react-spotify-web-playback";

interface AudioPlayerProps {
    songs: SpotifyApi.PlaylistTrackObject[];
    accessToken: string | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ songs, accessToken }) => {
    const [currentSongUri, setCurrentSongUri] = useState<string | null>(null);
    const [play, setPlay] = useState(false);

    // 当歌曲列表变化时，自动播放第一首歌
    useEffect(() => {
        if (songs.length > 0) {
            const firstSongUri = songs[0].track?.uri;
            if (firstSongUri) {
                setCurrentSongUri(firstSongUri);
                setPlay(true); // 自动播放
            }
        }
    }, [songs]);

    // 当歌曲播放结束时，切换到下一首
    const handleSongEnd = () => {
        const currentIndex = songs.findIndex((song) => song.track?.uri === currentSongUri);
        const nextSong = songs[currentIndex + 1];
        if (nextSong?.track?.uri) {
            setCurrentSongUri(nextSong.track.uri);
            setPlay(true); // 自动播放下一首
        } else {
            setPlay(false); // 没有下一首时停止播放
        }
    };

    if (!accessToken) {
        return <div>Loading...</div>; // 如果没有 accessToken，显示加载状态
    }


    return (
        <div>
            {songs.length > 0 && (
                <>
                    {/* Spotify 播放器 */}
                    <SpotifyPlayer
                        token={accessToken}
                        showSaveIcon
                        callback={(state) => {
                            if (!state.isPlaying) {
                                handleSongEnd(); // 当歌曲播放结束时切换到下一首
                            }
                        }}
                        play={play}
                        uris={currentSongUri ? [currentSongUri] : []}
                    />
                    {/* 下一首按钮 */}
                    <div className="p-4">
                        <button
                            onClick={handleSongEnd}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Next Song
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AudioPlayer;