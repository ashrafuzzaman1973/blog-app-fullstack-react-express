import { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:8000");

interface BlogsProps {
    token: string;
    userEmail: string;
    onLogout: () => void;
    onLogin: (email: string, password: string) => Promise<void>;
}

interface Blog {
    _id: string;
    title: string;
    email: string;
    description: string;
    imageUrl?: string;
}

interface ChatMessage {
    author: string;
    message: string;
    time: string;
    room: string;
}

const API = "http://localhost:8000/api/blogs";
const AUTH_API = "http://localhost:8000/api/auth";

export default function Blogs({ token, userEmail, onLogout, onLogin }: BlogsProps) {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [, setLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    // --- Chat State ---
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- Chat Logic ---
    useEffect(() => {
        // Tell server we are online as soon as we have an email
        if (userEmail) {
            socket.emit("user_online", userEmail);
        }

        socket.on("user_list", (users: string[]) => {
            setOnlineUsers(users);
        });

        socket.on("chat_history", (history: ChatMessage[]) => {
            setChatHistory(history);
        });

        socket.on("receive_message", (data: ChatMessage) => {
            // Only add message to history if it belongs to the current open chat
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
    }, [userEmail, selectedUser]);

    // Handle switching between users
    const handleSelectUser = (clickedUser: string) => {
        if (clickedUser === userEmail) return;
        setSelectedUser(clickedUser);
        setChatHistory([]); // Clear view while loading
        socket.emit("join_private_room", { senderEmail: userEmail, receiverEmail: clickedUser });
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const sendMessage = () => {
        if (message.trim() === "" || !selectedUser) return;

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

    // --- Blog Logic ---
    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(API);
            setBlogs(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

    const handleAuthSubmit = async () => {
        if (isLoginMode) {
            await onLogin(authEmail, authPassword);
        } else {
            try {
                await axios.post(`${AUTH_API}/signup`, { email: authEmail, password: authPassword });
                alert("Account created! Please log in.");
                setIsLoginMode(true);
            } catch (e) { alert("Signup failed."); }
        }
    };

    const addBlog = async () => {
        if (!title.trim() || !description.trim()) return alert("Fill fields");
        setIsPosting(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (image) formData.append("image", image);

        try {
            await axios.post(API, formData, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            setTitle(""); setDescription(""); setImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchBlogs();
        } catch (e) { onLogout(); }
        finally { setIsPosting(false); }
    };

    return (
        <div className="min-h-screen bg-slate-200 py-10 px-4 flex flex-col items-center font-sans gap-8">
            {/* BLOG SECTION */}
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300">
                <div className="bg-slate-700 p-3 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    {token && <button onClick={onLogout} className="text-white text-xs bg-red-500/20 px-3 py-1 rounded hover:bg-red-500/40">Logout</button>}
                </div>

                <div className="p-8">
                    {!token ? (
                        <div className="bg-slate-50 p-6 rounded-xl border mb-6 text-center">
                            <h2 className="text-xl font-bold mb-4">{isLoginMode ? "Login to Post" : "Sign Up"}</h2>
                            <div className="space-y-3 max-w-xs mx-auto">
                                <input className="w-full p-2 border rounded" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
                                <input type="password" className="w-full p-2 border rounded" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
                                <button onClick={handleAuthSubmit} className="w-full bg-emerald-700 text-white py-2 rounded font-bold">{isLoginMode ? "Login" : "Register"}</button>
                                <p className="text-xs cursor-pointer text-slate-500 hover:underline" onClick={() => setIsLoginMode(!isLoginMode)}>{isLoginMode ? "Need an account? Sign up" : "Have an account? Login"}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 mb-10 bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100">
                            <input className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                            <textarea className="w-full p-2 border rounded h-20 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                            <input type="file" ref={fileInputRef} className="text-xs" onChange={e => setImage(e.target.files?.[0] || null)} />
                            <button onClick={addBlog} disabled={isPosting} className="w-full bg-emerald-700 text-white py-2 rounded font-bold hover:bg-emerald-800 transition-colors">Post Blog</button>
                        </div>
                    )}

                    <div className="space-y-6">
                        {blogs.map((b) => (
                            <article key={b._id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {b.imageUrl && <img src={b.imageUrl} className="w-full h-48 object-cover" />}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-lg">{b.title}</h3>
                                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{b.email}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm">{b.description}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- PRIVATE CHAT SECTION --- */}
            <div className="w-full max-w-4xl flex h-[500px] bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden">

                {/* SIDEBAR: Online Users */}
                <div className="w-1/4 bg-slate-800 text-white p-4 hidden md:flex flex-col">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Active Users
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {onlineUsers.map((user, i) => (
                            <div
                                key={i}
                                onClick={() => handleSelectUser(user)}
                                className={`text-[11px] p-2 rounded truncate border cursor-pointer transition-all ${
                                    user === userEmail ? "border-slate-700 opacity-50 cursor-default" :
                                        selectedUser === user ? "bg-emerald-600 border-emerald-400 font-bold" :
                                            "bg-slate-700/50 border-slate-600 hover:bg-slate-600"
                                }`}
                            >
                                {user === userEmail ? `${user} (You)` : user}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CHAT AREA */}
                <div className="flex-1 flex flex-col bg-slate-50">
                    <div className="bg-white p-3 border-b font-bold text-slate-700 shadow-sm flex justify-between items-center">
                        <span>{selectedUser ? `Chat with ${selectedUser}` : "Select a user to chat"}</span>
                        {selectedUser && (
                            <button onClick={() => setSelectedUser(null)} className="text-[10px] text-red-500 hover:underline">Close Chat</button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {!selectedUser ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                                <div className="text-3xl mb-2">💬</div>
                                <p className="text-sm italic">Click on an active user on the left to start a private conversation.</p>
                            </div>
                        ) : chatHistory.length === 0 ? (
                            <p className="text-center text-slate-400 text-xs mt-10">No messages yet. Say hi!</p>
                        ) : (
                            chatHistory.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.author === userEmail ? "items-end" : "items-start"}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                                        msg.author === userEmail
                                            ? "bg-emerald-600 text-white rounded-tr-none"
                                            : "bg-white border text-slate-800 rounded-tl-none"
                                    }`}>
                                        <p>{msg.message}</p>
                                        <p className="text-[9px] text-right mt-1 opacity-60">{msg.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t flex gap-2">
                        <input
                            className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-50"
                            placeholder={!token ? "Login to chat" : selectedUser ? "Write a message..." : "Select a user first"}
                            value={message}
                            disabled={!token || !selectedUser}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!token || !message.trim() || !selectedUser}
                            className="bg-emerald-700 text-white px-6 py-2 rounded-full font-bold hover:bg-emerald-800 disabled:bg-slate-300 transition-all"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}