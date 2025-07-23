import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const cookieConsent = Cookies.get('cookieConsent');
        if (!cookieConsent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        Cookies.set('cookieConsent', 'true', { expires: 365 });
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm">
                    We use cookies to enhance your experience on our website. By continuing to use our site, you agree to our use of cookies.
                </div>
                <button
                    onClick={handleAccept}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Accept
                </button>
            </div>
        </div>
    );
};

export default CookieBanner; 