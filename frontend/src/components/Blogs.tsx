import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Chat from "./Chat";
// @ts-ignore
import VoiceInput from "./VoiceInput";
// @ts-ignore
//import webgazer from 'webgazer';

const BASE_URL = import.meta.env.VITE_API_URL; // Uses .env.development or .env.production
const socket = io(BASE_URL);

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

const API = `${BASE_URL}/api/blogs`;
const AUTH_API = `${BASE_URL}/api/auth`;
const AI_API = `${BASE_URL}/api/ai`;

export default function Blogs({ token, userEmail, onLogout, onLogin }: BlogsProps) {
    // UI State
    const [view, setView] = useState<"feed" | "chat">("feed");
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isEyeTracking, setIsEyeTracking] = useState(false); // Manual Toggle

    // Data State
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);

    // Loading States
    const [loading, setLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);

    // Auth Form State
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- WEBGAZER EYE TRACKING LOGIC ---
    // --- WEBGAZER EYE TRACKING LOGIC with AUTO-SCROLL ---
    const webgazerRunning = useRef(false);

    useEffect(() => {
        const wg = (window as any).webgazer;

        const stopAndCleanup = () => {
            if (wg) {
                try {
                    wg.end();
                    webgazerRunning.current = false;
                    ['webgazerVideoFeed', 'webgazerVideoCanvas', 'webgazerGazeDot', 'webgazerFaceOverlay', 'webgazerFaceFeedbackBox']
                        .forEach(id => document.getElementById(id)?.remove());
                } catch (e) {}
            }
        };

        const startWebGazer = async () => {
            if (isEyeTracking && view === "feed" && wg) {
                if (webgazerRunning.current) return;

                try {
                    // Fix for the 404 errors you had earlier
                    wg.params.faceMeshWasmPath = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/';
                    await wg.clearData();
                    webgazerRunning.current = true;

                    await wg.setGazeListener((data: any) => {
                        if (!data) return;

                        // 1. HIGHLIGHT LOGIC
                        const target = document.elementFromPoint(data.x, data.y);
                        if (target?.classList.contains('blog-text')) {
                            document.querySelectorAll('.blog-text').forEach(el =>
                                (el as HTMLElement).style.backgroundColor = 'transparent'
                            );
                            (target as HTMLElement).style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                        }

                        // 2. AUTO-SCROLL LOGIC
                        // We define the "Scroll Zone" as the bottom 20% of the screen
                        const scrollThreshold = window.innerHeight * 0.8;

                        if (data.y > scrollThreshold) {
                            // Scroll smoothly. Increase '10' for faster scrolling.
                            window.scrollBy({
                                top: 15,
                                behavior: 'smooth'
                            });
                        }
                    }).begin();

                    wg.showVideoPreview(true).showPredictionPoints(true);

                    setTimeout(() => {
                        const dot = document.getElementById('webgazerGazeDot');
                        if (dot) dot.style.zIndex = '9999';
                    }, 2000);

                } catch (err) {
                    console.error("WebGazer start failed:", err);
                    webgazerRunning.current = false;
                    setIsEyeTracking(false);
                }
            } else {
                stopAndCleanup();
            }
        };

        startWebGazer();
        return () => stopAndCleanup();

    }, [isEyeTracking, view]);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(API);
            setBlogs(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

    const handleAIGenerate = async () => {
        if (!title.trim()) return;
        setIsGenerating(true);
        try {
            const res = await axios.post(`${AI_API}/generate_full_post`,
                { title },
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            setDescription(res.data.description);
        } catch (error) { console.error(error); }
        finally { setIsGenerating(false); }
    };

    const handleVoiceToBlog = async (banglaText: string) => {
        setIsVoiceProcessing(true);
        try {
            const res = await axios.post(`${AI_API}/voice_to_blog`,
                { rawTranscript: banglaText },
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            setDescription(res.data.description);
        } catch (error) { console.error(error); }
        finally { setIsVoiceProcessing(false); }
    };

    const handleAuthSubmit = async () => {
        if (isLoginMode) {
            await onLogin(authEmail, authPassword);
        } else {
            try {
                await axios.post(`${AUTH_API}/signup`, { email: authEmail, password: authPassword });
                alert("Account created! Log in now.");
                setIsLoginMode(true);
            } catch (e) { alert("Signup failed."); }
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
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            setTitle(""); setDescription(""); setImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchBlogs();
        } catch (e) { onLogout(); }
        finally { setIsPosting(false); }
    };

    // --- RENDER LOGIN VIEW ---
    if (!token) {
        return (
            <div className="h-screen font-sans bg-cover bg-center flex items-center justify-center"
                 style={{ backgroundImage: "url('/dist/images/login-new.jpeg')" }}>
                <div className="w-full max-w-lg p-4">
                    <form className="max-w-xl m-4 p-10 bg-white rounded shadow-2xl">
                        <p className="text-gray-800 font-medium text-center text-lg font-bold mb-4">
                            {isLoginMode ? "Login to Admin" : "Create Account"}
                        </p>
                        <div className="mt-2">
                            <label className="block text-sm text-gray-600">Email</label>
                            <input className="w-full px-5 py-2 text-gray-700 bg-gray-200 rounded outline-none"
                                   type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm text-gray-600">Password</label>
                            <input className="w-full px-5 py-2 text-gray-700 bg-gray-200 rounded outline-none"
                                   type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                        </div>
                        <div className="mt-6">
                            <button onClick={handleAuthSubmit} type="button" className="px-6 py-2 text-white font-light tracking-wider bg-gray-900 rounded hover:bg-black w-full">
                                {isLoginMode ? "Login" : "Sign Up"}
                            </button>
                        </div>
                        <p className="mt-4 text-xs text-blue-500 cursor-pointer text-center" onClick={() => setIsLoginMode(!isLoginMode)}>
                            {isLoginMode ? "Not registered? Create account" : "Have an account? Login"}
                        </p>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto bg-gray-100 min-h-screen flex flex-col">
            {/* Header Section */}
            <header className="bg-slate-800 p-2 sticky top-0 z-50 shadow-lg">
                <div className="flex justify-between items-center px-4">
                    <div className="inline-flex items-center gap-4 text-white">
                        <i className="fas fa-bars cursor-pointer hover:text-emerald-400" onClick={() => setSidebarOpen(!isSidebarOpen)}></i>
                        <h1 className="font-bold text-lg tracking-tight">NexaBlog Admin</h1>

                        {/* Eye Tracking Toggle */}
                        <button
                            onClick={() => setIsEyeTracking(!isEyeTracking)}
                            className={`ml-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${
                                isEyeTracking ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-700 text-gray-400'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isEyeTracking ? 'bg-white animate-ping' : 'bg-gray-500'}`}></span>
                            {isEyeTracking ? "Eye Tracking ON" : "Reader Tracking OFF"}
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-white hidden md:block text-xs font-semibold">{userEmail}</span>
                        <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition">Logout</button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden h-[calc(100vh-52px)] sticky top-[52px]`}>
                    <ul className="list-none flex flex-col p-2 space-y-1">
                        <li onClick={() => setView("feed")}
                            className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition ${view === 'feed' ? 'bg-emerald-50 text-emerald-700 font-bold border-r-4 border-emerald-600' : 'hover:bg-gray-100 text-gray-600'}`}>
                            <i className="fas fa-tachometer-alt"></i> Dashboard
                        </li>
                        <li onClick={() => setView("chat")}
                            className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition ${view === 'chat' ? 'bg-emerald-50 text-emerald-700 font-bold border-r-4 border-emerald-600' : 'hover:bg-gray-100 text-gray-600'}`}>
                            <i className="fas fa-comments"></i> Chat Messages
                        </li>
                    </ul>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                    {view === "feed" ? (
                        <div className="space-y-6 max-w-5xl mx-auto">
                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-emerald-600 border-l-8 border-emerald-900 p-6 rounded shadow text-white">
                                    <p className="text-xs font-bold uppercase opacity-80">Total Blogs</p>
                                    <h3 className="text-3xl font-black">{blogs.length}</h3>
                                </div>
                                <div className="bg-blue-600 border-l-8 border-blue-900 p-6 rounded shadow text-white">
                                    <p className="text-xs font-bold uppercase opacity-80">AI Credits</p>
                                    <h3 className="text-2xl font-black">Unlimited</h3>
                                </div>
                                <div className="bg-purple-600 border-l-8 border-purple-900 p-6 rounded shadow text-white">
                                    <p className="text-xs font-bold uppercase opacity-80">Live Status</p>
                                    <h3 className="text-2xl font-black">{isEyeTracking ? "Tracking" : "Idle"}</h3>
                                </div>
                            </div>

                            {/* Create Blog Form */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="font-bold text-gray-700">New Publication</h2>
                                    <VoiceInput onTranscript={handleVoiceToBlog} isProcessing={isVoiceProcessing} />
                                </div>
                                <div className="flex gap-2">
                                    <input className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                                           placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                                    {title.length > 2 && (
                                        <button onClick={handleAIGenerate} disabled={isGenerating} className="bg-purple-600 text-white px-6 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
                                            {isGenerating ? "Thinking..." : "✨ AI Generate"}
                                        </button>
                                    )}
                                </div>
                                <textarea className="w-full p-3 border rounded-xl outline-none h-24 focus:ring-2 focus:ring-emerald-500"
                                          placeholder={isVoiceProcessing ? "AI is translating your voice..." : "What's on your mind?"}
                                          value={description} onChange={(e) => setDescription(e.target.value)} />
                                <div className="flex items-center justify-between">
                                    <input type="file" ref={fileInputRef} className="text-sm text-gray-500" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                                    <button onClick={addBlog} disabled={isPosting} className="bg-emerald-700 text-white px-10 py-2 rounded-xl font-bold hover:bg-emerald-800 disabled:bg-gray-300">
                                        {isPosting ? "Posting..." : "Post"}
                                    </button>
                                </div>
                            </div>

                            {/* Blog Feed */}
                            <div className="grid gap-6">
                                {loading ? <p className="text-center py-10 text-gray-400 font-bold">Refreshing feed...</p> : (
                                    blogs.map((b) => (
                                        <article key={b._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                            {b.imageUrl && <img src={`${BASE_URL}${b.imageUrl}`} alt="post" className="w-full h-64 object-cover" />}
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-bold text-gray-800">{b.title}</h3>
                                                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">By {b.email.split('@')[0]}</span>
                                                </div>
                                                <p className="blog-text text-gray-600 text-sm leading-relaxed p-2 rounded transition-colors duration-500">
                                                    {b.description}
                                                </p>
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-140px)] overflow-hidden">
                            <Chat token={token} userEmail={userEmail} socket={socket} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}