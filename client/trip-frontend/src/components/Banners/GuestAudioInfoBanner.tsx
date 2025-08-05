export const GuestAudioInfoBanner = () => {
    return (
        <div className= "text-gray-500 p-2 rounded-lg mb-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <span className="truncate text-xs sm:text-sm md:text-base w-full">
                    Guest users can listen to the audio stream but cannot control playback or manage the queue.
                </span>
            </div>
        </div>
    );
}