import { UserProfilProps } from "../../types";
import { avatarImages, bgColors} from "./AvatarImages";


const UserProfile: React.FC<UserProfilProps> = ({ username, pfpIndex }) => {
    const colorClass = bgColors[pfpIndex % bgColors.length];
    const initial = username.charAt(0).toUpperCase();

    return (
        <div className={`w-10 h-10 rounded-full shadow-md overflow-hidden relative ${colorClass}`}>
            <img
                src={avatarImages[pfpIndex]}
                alt={`${username}'s avatar`}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                }}
            />
            {/* Fallback gradient (hidden by default) */}
            <div
                className={`absolute inset-0 w-full h-full rounded-full ${colorClass} flex items-center justify-center text-white font-semibold text-sm`}
                style={{ display: 'none' }}
            >
                {initial}
            </div>
        </div>
    );
}

export default UserProfile;