import React from "react";

const Sidebar: React.FC = () => {
    const sections = [
        {
            title: "Joined Users",
            links: [
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
            ],
        },

    ];

    return (
        <aside className="w-64 h-screen bg-gray-50 p-4 overflow-y-auto border-r">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <span className="font-semibold text-2xl text-gray-700">Karaoke King</span>
                </div>
                <i className="fas fa-edit text-gray-600"></i>
            </div>
            <nav>
                <ul>
                    {sections.map((section, idx) => (
                        <React.Fragment key={idx}>
                            {section.title && (
                                <li className="mb-2 mt-4 text-sm font-semibold text-gray-500 uppercase">
                                    {section.title}
                                </li>
                            )}
                            {section.links.map((link, linkIdx) => (
                                <li key={linkIdx}>
                                    <a
                                        href="#"
                                        className={`block py-2 px-4 text-sm text-gray-700 hover:bg-gray-200 rounded`}
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </React.Fragment>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
