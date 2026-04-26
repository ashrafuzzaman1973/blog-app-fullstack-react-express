import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Chat from "./Chat";
// @ts-ignore
import VoiceInput from "./VoiceInput";

const BASE_URL = import.meta.env.VITE_API_URL;
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
    const [isEyeTracking, setIsEyeTracking] = useState(false);

    // Data State
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [tags, setTags]    = useState<string[]>([]);

    // Loading States
    const [loading, setLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
    const [isAssisting, setIsAssisting] = useState(false);

    // Auth Form State
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const webgazerRunning = useRef(false);

    // --- WEBGAZER EYE TRACKING & AUTO-SCROLL LOGIC ---
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
                    // Force CDN for MediaPipe assets to avoid 404s
                    wg.params.faceMeshWasmPath = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/';
                    await wg.clearData();
                    webgazerRunning.current = true;

                    await wg.setGazeListener((data: any) => {
                        if (!data) return;

                        // 1. Text Highlighting
                        const target = document.elementFromPoint(data.x, data.y);
                        if (target?.classList.contains('blog-text')) {
                            document.querySelectorAll('.blog-text').forEach(el =>
                                (el as HTMLElement).style.backgroundColor = 'transparent'
                            );
                            (target as HTMLElement).style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                        }

                        // 2. Auto-Scroll Logic (Bottom 20% of screen)
                        const scrollThreshold = window.innerHeight * 0.8;
                        if (data.y > scrollThreshold) {
                            window.scrollBy({ top: 15, behavior: 'smooth' });
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

    // --- AI ASSISTANT ACTIONS ---
    const handleAIAction = async (action: "expand" | "shorten" | "professional") => {
        if (!description.trim()) return;
        setIsAssisting(true);
        try {
            const res = await axios.post(`${AI_API}/refine_content`,
                { text: description, action },
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            setDescription(res.data.refinedText);
        } catch (error) {
            console.error("AI Assistant Error:", error);
        } finally {
            setIsAssisting(false);
        }
    };

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

    const generateSEOTags = async () => {
        if (!description.trim()) return;
        try {
            const res = await axios.post(`${AI_API}/generate_tags`,
                { title, description },
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            setTags(res.data.tags);
        } catch (error) {
            console.error("Tag Generation Error:", error);
        }
    };

    const addBlog = async () => {
        if (!title.trim() || !description.trim()) return alert("Fill in fields");
        setIsPosting(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("tags", JSON.stringify(tags)); // Add this line
        if (image) formData.append("image", image);

        try {
            await axios.post(API, formData, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            setTitle(""); setDescription(""); setImage(null);
            setTags([]); // Clear tags after posting
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchBlogs();
        } catch (e) { onLogout(); }
        finally { setIsPosting(false); }
    };

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
            <header className="bg-slate-800 p-2 sticky top-0 z-50 shadow-lg">
                <div className="flex justify-between items-center px-4">
                    <div className="inline-flex items-center gap-4 text-white">
                        <i className="fas fa-bars cursor-pointer hover:text-emerald-400" onClick={() => setSidebarOpen(!isSidebarOpen)}></i>
                        <h1 className="font-bold text-lg tracking-tight">NexaBlog Admin</h1>

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

                <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                    {view === "feed" ? (
                        <div className="space-y-6 max-w-5xl mx-auto">
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

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-gray-700">New Publication</h2>
                                        {description.length > 5 && (
                                            <div className="flex gap-1 ml-4 animate-in fade-in">
                                                <button onClick={() => handleAIAction("expand")} disabled={isAssisting} className="text-[9px] bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold uppercase">✨ Expand</button>
                                                <button onClick={() => handleAIAction("professional")} disabled={isAssisting} className="text-[9px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase">👔 Formal</button>
                                            </div>
                                        )}
                                    </div>
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
                                <div className="relative">
                                    <textarea className={`w-full p-3 border rounded-xl outline-none h-32 focus:ring-2 focus:ring-emerald-500 transition-all ${isAssisting ? 'opacity-40 pointer-events-none' : ''}`}
                                              placeholder={isVoiceProcessing ? "AI is translating your voice..." : "What's on your mind?"}
                                              value={description} onChange={(e) => setDescription(e.target.value)} />
                                    {isAssisting && (
                                        <div className="absolute inset-0 flex items-center justify-center font-bold text-purple-700 text-sm">
                                            <i className="fas fa-magic animate-bounce mr-2"></i> AI Assistant is working...
                                        </div>
                                    )}

                                    {/* Insert this after the Textarea */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {tags.map((tag, index) => (
                                            <span key={index} className="bg-slate-200 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold">
                                        #{tag}
                                    </span>
                                                                    ))}
                                                                </div>

                                    <button
                                        onClick={generateSEOTags}
                                        disabled={!description}
                                        className="text-xs text-emerald-600 font-bold hover:underline mb-4 block"
                                    >
                                        <i className="fas fa-tags mr-1"></i> Auto-Generate SEO Tags
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <input type="file" ref={fileInputRef} className="text-sm text-gray-500" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                                    <button onClick={addBlog} disabled={isPosting} className="bg-emerald-700 text-white px-10 py-2 rounded-xl font-bold hover:bg-emerald-800 disabled:bg-gray-300">
                                        {isPosting ? "Posting..." : "Post"}
                                    </button>
                                </div>
                            </div>

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