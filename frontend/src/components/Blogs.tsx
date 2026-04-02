import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

interface Blog {
    id: string;
    title: string;
    email: string;
    description: string;
    imageUrl?: string; // Matches the backend property
}

const API = "http://localhost:8000/api/blogs";

export default function Blogs() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [title, setTitle] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    // Reference for the file input to clear it manually
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

    const addBlog = async () => {
        if (!title.trim() || !description.trim()) {
            alert("Please fill in the title and description");
            return;
        }

        setIsPosting(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("email", email);
        formData.append("description", description);
        if (image) formData.append("image", image);

        try {
            await axios.post(API, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Success: Clear fields
            setTitle("");
            setEmail("");
            setDescription("");
            setImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

            fetchBlogs();
        } catch (e) {
            console.error("Upload failed", e);
            alert("Upload failed. Check server console.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-200 py-10 px-4 flex justify-center font-sans">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300">

                {/* Decorative Header Bar */}
                <div className="bg-slate-700 p-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-400 text-xs ml-2 opacity-50">localhost:5173</span>
                </div>

                {/* App Title */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 py-8 border-b border-slate-100">
                    <h1 className="text-4xl font-bold text-center text-slate-800">Blog App</h1>
                </div>

                <div className="p-8">
                    {/* Form Section */}
                    <div className="space-y-4 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">Title</label>
                                <input
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Enter title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                                <input
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                            <textarea
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none"
                                placeholder="What's on your mind?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Cover Image</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                            />
                        </div>

                        <button
                            onClick={addBlog}
                            disabled={isPosting}
                            className={`w-full font-semibold py-3 rounded-lg transition-all shadow-md active:scale-[0.99] ${
                                isPosting ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-800 text-white"
                            }`}
                        >
                            {isPosting ? "Posting..." : "Post Blog"}
                        </button>
                    </div>

                    {/* Blog Feed */}
                    <div className="space-y-10">
                        {loading ? (
                            <p className="text-center text-slate-400 animate-pulse">Loading posts...</p>
                        ) : blogs.length > 0 ? (
                            blogs.map((b) => (
                                <article key={b.id}
                                         className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                                    {b.imageUrl && (
                                        <div className="w-full h-56 overflow-hidden">
                                            <img src={b.imageUrl} alt="blog cover"
                                                 className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"/>
                                        </div>
                                    )}
                                    <div className="p-8">
                                        <div className="flex justify-between items-start">
                                            <h2 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{b.title}</h2>
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                                {b.email || 'Member'}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 mt-4 leading-relaxed whitespace-pre-wrap">{b.description}</p>
                                        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs">
                                            <div className="flex gap-4">
                                                <span>2 min read</span>
                                                <span>•</span>
                                                <span>ID: {b.id.toString().slice(-4)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                                No posts yet. Start the conversation!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}