import React from "react";

const Sidebar: React.FC = () => {
    const sections = [
        { title: "ChatGPT", links: ["ChatGPT", "Explore GPTs"] },
        {
            title: "Today",
            links: ["Using sscanf for conversion", "Create React App Parameters"],
        },
        {
            title: "Yesterday",
            links: ["Figure Pattern Identification"],
        },
        {
            title: "Previous 7 Days",
            links: [
                "Mandelbrot Multi-Threaded Gene",
                "SQL Max Function Usage",
                "Test LayoutLM QA",
                "创始人奖学金申请",
                "主权债务数据解释",
                "信息的英文翻译",
            ],
        },
        {
            title: "Previous 30 Days",
            links: [
                "Kants kategoriska imperativ",
                "Run Java Project Terminal",
                "Entity Relationship Diagram Basi",
                "Interest in Bloomberg Role",
                "B2B Meaning Explained",
                "Music Playlist Sharing App",
                "Visa Type Inquiry",
            ],
        },
    ];

    return (
        <aside className="w-64 bg-gray-50 p-4 overflow-y-auto border-r">
        <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
        <i className="fas fa-bars mr-2 text-gray-600"></i>
            <span className="font-semibold text-gray-700">ChatGPT</span>
        </div>
        <i className="fas fa-edit text-gray-600"></i>
        </div>
        <nav>
        <ul>
            {sections.map((section, idx) => (
                    <React.Fragment key={idx}>
                        {section.title && (
                                <li className="mb-2 mt-4 text-xs font-semibold text-gray-500">
                                    {section.title}
                                    </li>
                            )}
    {section.links.map((link, linkIdx) => (
        <li key={linkIdx}>
        <a
            href="#"
        className={`block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded ${
            link === "主权债务数据解释" ? "bg-blue-100" : ""
        }`}
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
