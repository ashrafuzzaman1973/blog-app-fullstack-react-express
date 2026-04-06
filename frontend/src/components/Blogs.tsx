import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

// 1. Define Props to receive state from App.tsx
interface BlogsProps {
    token: string;
    userEmail: string;
    onLogout: () => void;
    onLogin: (email: string, password: string) => Promise<void>;
}

interface Blog {
    id: string;
    title: string;
    email: string;
    description: string;
    imageUrl?: string;
}

const API = "http://localhost:8000/api/blogs";
const AUTH_API = "http://localhost:8000/api/auth";

export default function Blogs({ token, userEmail, onLogout, onLogin }: BlogsProps) {
    // --- Blog Feed State ---
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    // --- Local Auth UI State ---
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

    // Handle Auth Submission (Login or Sign-up)
    const handleAuthSubmit = async () => {
        if (isLoginMode) {
            await onLogin(authEmail, authPassword);
        } else {
            try {
                await axios.post(`${AUTH_API}/signup`, { email: authEmail, password: authPassword });
                alert("Account created! Please log in.");
                setIsLoginMode(true);
            } catch (e) {
                console.log("sign up fail"+e)
                alert("Signup failed.");
            }
        }
    };

    const addBlog = async () => {
        if (!title.trim() || !description.trim()) return alert("Fill in title and description");

        setIsPosting(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("email", userEmail); // Automatically uses the logged-in email
        formData.append("description", description);
        if (image) formData.append("image", image);

        try {
            await axios.post(API, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                }
            });

            setTitle("");
            setDescription("");
            setImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchBlogs();
        } catch (e) {
            alert("Session expired. Please log in again.");
            onLogout();
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-200 py-10 px-4 flex justify-center font-sans">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300">

                {/* Header Bar */}
                <div className="bg-slate-700 p-3 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    {token && (
                        <button onClick={onLogout} className="text-white text-xs bg-red-500/20 hover:bg-red-500/40 px-3 py-1 rounded">
                            Logout
                        </button>
                    )}
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 py-8 border-b border-slate-100">
                    <h1 className="text-4xl font-bold text-center text-slate-800">Blog App</h1>
                    {token && <p className="text-center text-emerald-600 font-medium text-sm mt-1">Logged in as: {userEmail}</p>}
                </div>

                <div className="p-8">
                    {/* --- AUTH UI --- */}
                    {!token ? (
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 mb-10 text-center">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">
                                {isLoginMode ? "Login to Post" : "Sign Up"}
                            </h2>
                            <div className="space-y-3 max-w-sm mx-auto">
                                <input
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                                />
                                <input
                                    type="password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                                />
                                <button onClick={handleAuthSubmit} className="w-full bg-emerald-700 text-white font-bold py-3 rounded-lg hover:bg-emerald-800 transition-colors">
                                    {isLoginMode ? "Login" : "Register"}
                                </button>
                                <p className="text-sm text-slate-500 cursor-pointer hover:underline" onClick={() => setIsLoginMode(!isLoginMode)}>
                                    {isLoginMode ? "Don't have an account? Sign up" : "Have an account? Login"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* --- POST FORM --- */
                        <div className="space-y-4 mb-10 bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">Title</label>
                                <input
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Enter title..."
                                    value={title} onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                                <textarea
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                                    placeholder="What's on your mind?"
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Cover Image</label>
                                <input
                                    type="file" ref={fileInputRef} accept="image/*"
                                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                />
                            </div>

                            <button
                                onClick={addBlog} disabled={isPosting}
                                className={`w-full font-bold py-3 rounded-lg shadow-md active:scale-[0.99] transition-all ${
                                    isPosting ? "bg-slate-400" : "bg-emerald-700 hover:bg-emerald-800 text-white"
                                }`}
                            >
                                {isPosting ? "Publishing..." : "Post Blog"}
                            </button>
                        </div>
                    )}

                    {/* --- FEED --- */}
                    <div className="space-y-10">
                        {loading ? (
                            <p className="text-center text-slate-400">Loading feed...</p>
                        ) : blogs.map((b) => (
                            <article key={b.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                                {b.imageUrl && (
                                    <div className="w-full h-64 overflow-hidden">
                                        <img src={b.imageUrl} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                    </div>
                                )}
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-2xl font-bold text-slate-800">{b.title}</h2>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                            {b.email}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{b.description}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}