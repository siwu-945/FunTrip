import React, { useState, useRef, useEffect } from 'react';
import { SongObj } from '../types';
import './CurrentSongQueue.css';
import SongRemoveModal from './Popups/SongRemoveModal';
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
    setCurrentIndex: (idx: number) => void;
}

interface SortableSongItemProps {
    song: SongObj;
    index: number;
    currentSongIndex: number;
    isHost: boolean;
    onDeleteSong: (songIndex: number) => void;
    isDeletingSong: boolean;
    onLongPress: (songIndex: number, songName: string) => void;
}

const SortableSongItem: React.FC<SortableSongItemProps> = ({ 
    song, 
    index, 
    currentSongIndex, 
    isHost, 
    onDeleteSong, 
    isDeletingSong,
    onLongPress 
}) => {
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

    // Long press functionality
    const longPressTimerRef = useRef<number | null>(null);
    const [isLongPressing, setIsLongPressing] = useState(false);

    const handleMouseDown = () => {
        if (!isHost) return;
        
        longPressTimerRef.current = setTimeout(() => {
            setIsLongPressing(true);
            onLongPress(index, song.spotifyData.track?.name || "");
        }, 1500);
    };

    const handleMouseUp = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        setIsLongPressing(false);
    };

    const handleMouseLeave = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        setIsLongPressing(false);
    };

    useEffect(() => {
        return () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
            }
        };
    }, []);

    return (
        <li
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className={`sortable-item text-gray-700 py-2 px-3 rounded-lg shadow-sm transition-all duration-200 cursor-move group relative ${
                index === currentSongIndex 
                    ? 'current-song-playing' 
                    : 'bg-white hover:bg-gray-50'
            } ${isLongPressing ? 'scale-95' : ''}`}
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
    isDeletingSong,
    setCurrentIndex,
}) => {
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSongIndex, setSelectedSongIndex] = useState<number>(-1);
    const [selectedSongName, setSelectedSongName] = useState<string>("");

    const handleLongPress = (songIndex: number, songName: string) => {
        setSelectedSongIndex(songIndex);
        setSelectedSongName(songName);
        setIsModalOpen(true);
    };

    const handleRemoveSong = () => {
        if (selectedSongIndex >= 0) {
            onDeleteSong(selectedSongIndex);
        }
    };

    const handleRemoveAll = () => {
        onClearQueue();
    };
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
            currentSongIndex: currentSongIndex,
            songName: songs[oldIndex]?.spotifyData.track?.name
        });
        
        const newOrder = arrayMove(songs, oldIndex, newIndex);
        
        // Calculate the new current song index after reordering
        let newCurrentIndex = currentSongIndex;
        
        if (currentSongIndex === oldIndex) {
            // The currently playing song was moved
            newCurrentIndex = newIndex;
            console.log("Currently playing song moved to:", newIndex);
        } else if (oldIndex < currentSongIndex && newIndex >= currentSongIndex) {
            // A song before the current song was moved to after it
            newCurrentIndex = currentSongIndex - 1;
            console.log("Song moved from before to after current, new index:", newCurrentIndex);
        } else if (oldIndex > currentSongIndex && newIndex <= currentSongIndex) {
            // A song after the current song was moved to before it
            newCurrentIndex = currentSongIndex + 1;
            console.log("Song moved from after to before current, new index:", newCurrentIndex);
        }
        // If none of the above conditions are met, currentSongIndex stays the same
        setCurrentIndex(newCurrentIndex);
        onReorderQueue(newOrder);
    }
};

    return (
        <div className="bg-gray-100 rounded-md mt-2 w-full flex flex-col h-[60vh]">
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
                                        onLongPress={handleLongPress}
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
            
            {/* Song Remove Modal */}
            <SongRemoveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedSongName={selectedSongName}
                onRemoveSong={handleRemoveSong}
                onRemoveAll={handleRemoveAll}
            />
        </div>
    );
};

export default CurrentSongQueue;
