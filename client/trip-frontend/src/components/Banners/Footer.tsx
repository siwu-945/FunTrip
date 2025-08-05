import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto flex flex-col items-center space-y-6 md:space-y-0 md:flex-row md:justify-between px-4">
                {/* Left Section: Footer Text */}
                <div className="text-center md:text-left">
                    <h4 className="text-xl font-bold">Stay Connected</h4>
                </div>

                {/* Right Section: Social Media Icons */}
                <div className="flex space-x-6">
                    {/* Email */}
                    <a
                        href="mailto:your.email@example.com"
                        className="hover:text-blue-400 transition"
                        aria-label="Email"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21.75 8.25l-9.526 6.351a.75.75 0 01-.448.149.75.75 0 01-.448-.149L2.25 8.25M3.75 5.25h16.5A2.25 2.25 0 0122.5 7.5v9A2.25 2.25 0 0120.25 18.75H3.75A2.25 2.25 0 011.5 16.5v-9A2.25 2.25 0 013.75 5.25z"
                            />
                        </svg>
                    </a>

                    {/* LinkedIn */}
                    <a
                        href="https://linkedin.com/in/yourprofile"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition"
                        aria-label="LinkedIn"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 8.25a6.375 6.375 0 00-6.375 6.375v3.75h-3v-3.75A9.375 9.375 0 0116.5 5.25h3.75v3h-3.75z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 12h-3v6h3v-6z"
                            />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="mt-8 text-center text-gray-500 border-t border-gray-700 pt-4">
                &copy; {new Date().getFullYear()} Supreme Karaoke. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
