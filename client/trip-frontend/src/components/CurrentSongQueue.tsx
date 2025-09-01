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
}

interface SortableSongItemProps {
    song: SongObj;
    index: number;
    currentSongIndex: number;
    isHost: boolean;
    onDeleteSong: (songIndex: number) => void;
    isDeletingSong: boolean;
}

const SortableSongItem: React.FC<SortableSongItemProps> = ({ 
    song, 
    index, 
    currentSongIndex, 
    isHost, 
    onDeleteSong, 
    isDeletingSong
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

    // Swipe to delete functionality
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [showDeleteBackground, setShowDeleteBackground] = useState(false);
    const swipeStartXRef = useRef<number>(0);
    const itemRef = useRef<HTMLLIElement>(null);

    const handleSwipeStart = (clientX: number) => {
        if (!isHost) return;
        setIsSwiping(true);
        swipeStartXRef.current = clientX;
        setSwipeOffset(0);
    };

    const handleSwipeMove = (clientX: number) => {
        if (!isSwiping || !isHost) return;
        
        const deltaX = clientX - swipeStartXRef.current;
        // Only allow leftward swiping (negative deltaX)
        if (deltaX > 0) return;
        
        setSwipeOffset(deltaX);
        
        // Show delete background when swiped beyond 30% of item width
        if (itemRef.current) {
            const itemWidth = itemRef.current.offsetWidth;
            const swipePercentage = Math.abs(deltaX) / itemWidth;
            setShowDeleteBackground(swipePercentage > 0.3);
        }
    };

    const handleSwipeEnd = () => {
        if (!isSwiping || !isHost) return;
        
        setIsSwiping(false);
        
        // Delete song if swiped beyond 50% of item width
        if (itemRef.current && Math.abs(swipeOffset) > itemRef.current.offsetWidth * 0.5) {
            if (!isDeletingSong) {
                onDeleteSong(index);
            }
        }
        
        // Reset swipe state
        setSwipeOffset(0);
        setShowDeleteBackground(false);
    };

    // Touch event handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        handleSwipeStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleSwipeMove(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        handleSwipeEnd();
    };

    // Mouse event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only handle right half of the song item
        if (e.currentTarget.getBoundingClientRect().width / 2 > e.nativeEvent.offsetX) {
            return;
        }
        handleSwipeStart(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isSwiping) {
            handleSwipeMove(e.clientX);
        }
    };

    const handleMouseUp = () => {
        if (isSwiping) {
            handleSwipeEnd();
        }
    };

    const handleMouseLeave = () => {
        if (isSwiping) {
            handleSwipeEnd();
        }
    };

    return (
        <li
            ref={(node) => {
                setNodeRef(node);
                if (node) itemRef.current = node;
            }}
            style={{
                ...style,
                transform: `${style.transform} translateX(${swipeOffset}px)`,
            }}
            className={`sortable-item text-gray-700 py-2 px-3 rounded-lg shadow-sm transition-all duration-200 group relative ${
                index === currentSongIndex 
                    ? 'current-song-playing' 
                    : 'bg-white hover:bg-gray-50'
            }`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            {/* Delete background */}
            <div className={`delete-background ${showDeleteBackground ? 'visible' : ''}`}>
                <span>Delete</span>
            </div>

            {/* Song content wrapper */}
            <div 
                className="song-content-wrapper"
                style={{ transform: `translateX(${swipeOffset}px)` }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {/* 6-dots drag handle */}
                        <div
                            {...attributes}
                            {...listeners}
                            className="drag-handle cursor-grab active:cursor-grabbing"
                        >
                            <i className="fas fa-grip-vertical text-gray-400 text-xs"></i>
                        </div>
                        
                        {/* Song info */}
                        <div className="flex-1 pointer-events-none">
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
            </div>

            {/* Swipe area (right half) */}
            {isHost && (
                <div
                    className="swipe-area"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                />
            )}
        </li>
    );
};

const CurrentSongQueue: React.FC<CurrentSongQueueProps> = ({ 
    songs, 
    currentSongIndex, 
    isHost, 
    onClearQueue,
    onReorderQueue,
    onDeleteSong,
    isDeletingSong
}) => {
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                songName: songs[oldIndex]?.spotifyData.track?.name
            });
            
            const newOrder = arrayMove(songs, oldIndex, newIndex);
            onReorderQueue(newOrder);
        }
    };

    return (
        <div className="bg-gray-100 rounded-md mt-2 w-full flex flex-col h-[60vh]">
            {/* Header with recycle bin icon */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Song Queue</h3>
                {isHost && songs.length > 0 && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                        title="Clear all songs"
                    >
                        <i className="fas fa-trash-alt"></i>
                    </button>
                )}
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
            
            {/* Song Remove Modal */}
            <SongRemoveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedSongName={""}
                onRemoveSong={() => {}} // Empty function since we're only using remove all
                onRemoveAll={handleRemoveAll}
            />
        </div>
    );
};

export default CurrentSongQueue;