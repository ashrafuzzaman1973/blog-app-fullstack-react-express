import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";

interface ChatProps {
    userEmail: string;
    token: string;
    socket: Socket;
}

interface ChatMessage {
    author: string;
    message: string;
    time: string;
    room: string;
}

export default function Chat({ userEmail, token, socket }: ChatProps) {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- SOCKET LISTENERS ---
    useEffect(() => {
        if (!userEmail) return;

        // Tell server we are online
        socket.emit("user_online", userEmail);

        socket.on("user_list", (users: string[]) => {
            setOnlineUsers(users);
        });

        socket.on("chat_history", (history: ChatMessage[]) => {
            setChatHistory(history);
        });

        socket.on("receive_message", (data: ChatMessage) => {
            // Only update history if the message is from the user we are currently chatting with
            const currentRoom = selectedUser ? [userEmail, selectedUser].sort().join("_") : "";
            if (data.room === currentRoom) {
                setChatHistory((prev) => [...prev, data]);
            }
        });

        return () => {
            socket.off("user_list");
            socket.off("chat_history");
            socket.off("receive_message");
        };
    }, [userEmail, selectedUser, socket]);

    // --- AUTO SCROLL ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    // --- ACTIONS ---
    const handleSelectUser = (clickedUser: string) => {
        if (clickedUser === userEmail) return;
        setSelectedUser(clickedUser);
        setChatHistory([]); // Clear the window while loading new history
        socket.emit("join_private_room", { senderEmail: userEmail, receiverEmail: clickedUser });
    };

    const sendMessage = () => {
        if (!message.trim() || !selectedUser || !token) return;

        const roomID = [userEmail, selectedUser].sort().join("_");
        const messageData = {
            room: roomID,
            author: userEmail,
            message: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        socket.emit("send_message", messageData);
        setChatHistory((prev) => [...prev, messageData]);
        setMessage("");
    };

    return (
        <div className="w-full max-w-4xl flex h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mx-auto animate-in fade-in zoom-in duration-300">

            {/* SIDEBAR */}
            <div className="w-1/3 md:w-1/4 bg-slate-900 text-white p-4 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Active Now
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                    {onlineUsers.length <= 1 ? (
                        <p className="text-[10px] text-slate-500 italic">No one else is online...</p>
                    ) : (
                        onlineUsers.map((user, i) => (
                            user !== userEmail && (
                                <div
                                    key={i}
                                    onClick={() => handleSelectUser(user)}
                                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                                        selectedUser === user
                                            ? "bg-emerald-600 border-emerald-400 shadow-lg shadow-emerald-900/20"
                                            : "bg-slate-800/50 border-transparent hover:bg-slate-800 hover:border-slate-700"
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold uppercase">
                                        {user.charAt(0)}
                                    </div>
                                    <div className="flex-1 truncate">
                                        <p className="text-xs font-medium truncate">{user.split('@')[0]}</p>
                                        <p className="text-[9px] text-slate-400 truncate group-hover:text-slate-300">{user}</p>
                                    </div>
                                </div>
                            )
                        ))
                    )}
                </div>
            </div>

            {/* MESSAGE AREA */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {/* Header */}
                <div className="bg-white p-4 border-b flex items-center justify-between shadow-sm">
                    {selectedUser ? (
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-bold text-slate-700 text-sm">{selectedUser}</span>
                        </div>
                    ) : (
                        <span className="text-slate-400 text-sm font-medium">Select a conversation</span>
                    )}
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {!selectedUser ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                            <div className="p-4 bg-slate-100 rounded-full text-3xl">✉️</div>
                            <p className="text-sm italic">Choose a friend to start chatting</p>
                        </div>
                    ) : chatHistory.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-[11px] text-slate-400 bg-slate-100 inline-block px-4 py-1 rounded-full">This is the start of your private conversation</p>
                        </div>
                    ) : (
                        chatHistory.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.author === userEmail ? "items-end" : "items-start"}`}>
                                <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                                    msg.author === userEmail
                                        ? "bg-emerald-600 text-white rounded-tr-none"
                                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                }`}>
                                    <p className="leading-relaxed">{msg.message}</p>
                                    <p className={`text-[8px] mt-1 text-right ${msg.author === userEmail ? "text-emerald-100" : "text-slate-400"}`}>
                                        {msg.time}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Input */}
                <div className="p-4 bg-white border-t">
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-full border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                        <input
                            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm text-slate-700"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder={selectedUser ? "Write your message..." : "Select a user first..."}
                            disabled={!selectedUser}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!selectedUser || !message.trim()}
                            className="bg-emerald-600 text-white p-2 px-6 rounded-full font-bold text-xs hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}