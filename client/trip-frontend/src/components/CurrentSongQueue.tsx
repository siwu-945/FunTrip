import React from 'react';
import { SongObj } from '../types';
import './CurrentSongQueue.css';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CurrentSongQueueProps {
    songs: SongObj[];
    currentSongIndex: number;
    isHost: boolean;
    onClearQueue: () => void;
    onReorderQueue: (newOrder: SongObj[]) => void;
    onDeleteSong: (songIndex: number) => void;
    isDeletingSong: boolean;
}

const SortableSongItem: React.FC<{
    song: SongObj;
    index: number;
    currentSongIndex: number;
    isHost: boolean;
    onDeleteSong: (songIndex: number) => void;
    isDeletingSong: boolean;
}> = ({ song, index, currentSongIndex, isHost, onDeleteSong, isDeletingSong }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: index });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`sortable-item text-gray-700 py-2 px-3 rounded-lg shadow-sm transition-all duration-200 cursor-move group relative ${
                index === currentSongIndex 
                    ? 'current-song-playing' 
                    : 'bg-white hover:bg-gray-50'
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <i className="fas fa-grip-vertical text-gray-400 text-xs"></i>
                    <div className="flex-1">
                        <div className="font-medium text-gray-800 flex items-center gap-2">
                            {song.spotifyData.track?.name || ""}
                            {index === currentSongIndex && (
                                <span className="text-green-600">
                                    <i className="fas fa-play"></i>
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">
                            {song.spotifyData.track?.artists?.[0]?.name || ""}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Delete only visible to host on hover */}
            {isHost && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isDeletingSong) {
                            console.log("Deleting song:", {
                                index,
                                songName: song.spotifyData.track?.name
                            });
                            onDeleteSong(index);
                        }
                    }}
                    disabled={isDeletingSong}
                    className={`delete-button opacity-0 group-hover:opacity-100 
                             cursor-pointer
                             ${isDeletingSong ? 'cursor-not-allowed' : ''}`}
                    title={isDeletingSong ? "Deleting..." : "Delete song"}
                >
                    {isDeletingSong ? (
                        <i className="fas fa-spinner fa-spin text-sm"></i>
                    ) : (
                        <span className="text-lg font-light">−</span>
                    )}
                </button>
            )}
        </li>
    );
};

// TODO update the song names with actual added songs
const CurrentSongQueue: React.FC<CurrentSongQueueProps> = ({ 
    songs, 
    currentSongIndex, 
    isHost, 
    onClearQueue,
    onReorderQueue,
    onDeleteSong,
    isDeletingSong
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = Number(active.id);
            const newIndex = Number(over?.id);
            
            console.log("Reordering songs:", {
                fromIndex: oldIndex,
                toIndex: newIndex,
                songName: songs[oldIndex]?.spotifyData.track?.name
            });
            
            const newOrder = arrayMove(songs, oldIndex, newIndex);
            onReorderQueue(newOrder);
        }
    };

    return (
        <div className="bg-gray-100 rounded-md mt-2 w-full flex flex-col h-[60vh]">
            <div className="bg-gray-100 p-4 rounded-t-md">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-center flex-1">Current Song Queue</h2>
                    {isHost && songs.length > 0 && (
                        <button
                            onClick={() => {
                                console.log("Current song stream before clearing:", {
                                    songsCount: songs.length,
                                    songs: songs.map(s => s.spotifyData.track?.name),
                                    currentSongIndex
                                });
                                onClearQueue();
                            }}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-1"
                        >
                            <i className="fas fa-trash text-xs"></i>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {songs.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={songs.map((_, index) => index)}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className="space-y-2">
                                {songs.map((song, index) => (
                                    <SortableSongItem
                                        key={index}
                                        song={song}
                                        index={index}
                                        currentSongIndex={currentSongIndex}
                                        isHost={isHost}
                                        onDeleteSong={onDeleteSong}
                                        isDeletingSong={isDeletingSong}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <i className="fas fa-music text-2xl mb-2"></i>
                        <p className="text-sm">Add some songs to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrentSongQueue;
