import React, { useState } from "react";

interface AdminLayoutProps {
    children: React.ReactNode;
    userEmail: string;
    onLogout: () => void;
    setView: (view: "feed" | "chat") => void;
    currentView: string;
}

export default function AdminLayout({ children, userEmail, onLogout, setView, currentView }: AdminLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="mx-auto bg-gray-100 min-h-screen flex flex-col">
            {/* Header - Based on your index.html theme */}
            <header className="bg-slate-800 p-3 sticky top-0 z-50 shadow-md">
                <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white text-xl hover:text-emerald-400">
                            ☰
                        </button>
                        <h1 className="text-white font-bold text-lg tracking-tight">NexaBlog Admin</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-white hidden md:block text-xs font-semibold opacity-80">{userEmail}</span>
                        <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-xs font-bold transition-all">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar - Derived from the Tailwind Admin list-reset style */}
                <aside className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden h-[calc(100vh-56px)] sticky top-14`}>
                    <ul className="flex flex-col p-2 space-y-1">
                        <li
                            onClick={() => setView("feed")}
                            className={`w-full p-4 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${currentView === 'feed' ? 'bg-emerald-50 text-emerald-700 font-bold border-r-4 border-emerald-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                            <span className="text-lg">📊</span> Dashboard
                        </li>
                        <li
                            onClick={() => setView("chat")}
                            className={`w-full p-4 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${currentView === 'chat' ? 'bg-emerald-50 text-emerald-700 font-bold border-r-4 border-emerald-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                            <span className="text-lg">💬</span> Chat Messages
                        </li>
                    </ul>
                </aside>

                {/* Main Dynamic Area */}
                <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}