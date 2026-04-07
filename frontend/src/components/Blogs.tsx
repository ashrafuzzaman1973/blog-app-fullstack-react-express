import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Chat from "./Chat"; // We will create this file next

// Initialize socket here to pass down to components
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

const API = "http://localhost:8000/api/blogs";
const AUTH_API = "http://localhost:8000/api/auth";

export default function Blogs({ token, userEmail, onLogout, onLogin }: BlogsProps) {
    // Navigation State
    const [view, setView] = useState<"feed" | "chat">("feed");

    // Blog State
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    // Auth UI State
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Blogs Logic
    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(API);
            setBlogs(res.data);
        } catch (error) {
            console.error("Fetch failed", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const handleAuthSubmit = async () => {
        if (isLoginMode) {
            await onLogin(authEmail, authPassword);
        } else {
            try {
                await axios.post(`${AUTH_API}/signup`, { email: authEmail, password: authPassword });
                alert("Account created! Please log in.");
                setIsLoginMode(true);
            } catch (e) {
                alert("Signup failed.");
            }
        }
    };

    const addBlog = async () => {
        if (!title.trim() || !description.trim()) return alert("Fill in fields");
        setIsPosting(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (image) formData.append("image", image);

        try {
            await axios.post(API, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                }
            });
            setTitle(""); setDescription(""); setImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchBlogs();
        } catch (e) {
            alert("Session expired");
            onLogout();
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 py-6 px-4 flex flex-col items-center font-sans gap-6">

            {/* --- TOP NAVIGATION BAR --- */}
            <div className="w-full max-w-4xl bg-white shadow-md rounded-2xl p-2 flex items-center justify-between border border-slate-200">
                <div className="flex gap-2">
                    <button
                        onClick={() => setView("feed")}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${view === "feed" ? "bg-emerald-700 text-white shadow-lg" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                        🏠 Home Feed
                    </button>
                    {/* 🛡️ ONLY SHOW MESSAGES IF LOGGED IN */}
                    {token && (
                        <button
                            onClick={() => setView("chat")}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${view === "chat" ? "bg-emerald-700 text-white shadow-lg" : "text-slate-600 hover:bg-slate-100"}`}
                        >
                            💬 Messages
                        </button>
                    )}
                </div>

                {token ? (
                    <div className="flex items-center gap-4 pr-4">
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full hidden sm:block">
                {userEmail}
            </span>
                        <button onClick={onLogout} className="text-red-500 font-bold text-sm hover:underline">
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="pr-4 italic text-slate-400 text-xs">
                        Login to access all features
                    </div>
                )}
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="w-full max-w-4xl">
                {view === "feed" ? (
                    <div className="space-y-6">
                        {/* Auth / Post Form */}
                        {!token ? (
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center max-w-md mx-auto">
                                <h2 className="text-2xl font-bold mb-4">{isLoginMode ? "Welcome Back" : "Create Account"}</h2>
                                <div className="space-y-3">
                                    <input className="w-full p-3 border rounded-xl outline-none" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
                                    <input type="password" className="w-full p-3 border rounded-xl outline-none" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
                                    <button onClick={handleAuthSubmit} className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl hover:bg-emerald-800 transition-all">
                                        {isLoginMode ? "Login" : "Register"}
                                    </button>
                                    <p className="text-sm text-slate-500 cursor-pointer" onClick={() => setIsLoginMode(!isLoginMode)}>
                                        {isLoginMode ? "New here? Sign up" : "Already have an account? Login"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 space-y-4">
                                <h2 className="font-bold text-slate-700">Create a New Post</h2>
                                <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                                <textarea className="w-full p-3 border rounded-xl outline-none h-24 resize-none focus:ring-2 focus:ring-emerald-500" placeholder="What's on your mind?" value={description} onChange={(e) => setDescription(e.target.value)} />
                                <div className="flex items-center justify-between">
                                    <input type="file" ref={fileInputRef} className="text-xs text-slate-500" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                                    <button onClick={addBlog} disabled={isPosting} className="bg-emerald-700 text-white px-8 py-2 rounded-xl font-bold hover:bg-emerald-800 disabled:bg-slate-300">
                                        {isPosting ? "Posting..." : "Post"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Blog List */}
                        <div className="grid gap-6">
                            {loading ? (
                                <p className="text-center py-10 text-slate-400">Loading your feed...</p>
                            ) : (
                                blogs.map((b) => (
                                    <article key={b._id} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                                        {b.imageUrl && <img src={b.imageUrl} alt="post" className="w-full h-64 object-cover" />}
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-xl font-bold text-slate-800">{b.title}</h3>
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                    {b.email.split('@')[0]}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed text-sm">{b.description}</p>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    /* --- CHAT VIEW --- */
                    <Chat token={token} userEmail={userEmail} socket={socket} />
                )}
            </div>
        </div>
    );
}