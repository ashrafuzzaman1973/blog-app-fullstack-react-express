import { useEffect, useState, useCallback } from "react";
import axios from "axios";

interface Blog {
    id: string;
    title: string;
    email: string;
    description: string;
}

const API = "http://localhost:8000/api/blogs";

export default function Blogs() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [title, setTitle] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

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

    // Inside your addBlog function in Blogs.tsx
    const addBlog = async () => {
        // Check if required fields are filled
        if (!title.trim() || !description.trim()) return;

        try {
            // Send the complete object to the backend
            await axios.post(API, {
                title: title,
                email: email,
                description: description
            });

            // Clear all inputs after success
            setTitle("");
            setEmail("");
            setDescription("");

            fetchBlogs(); // Refresh the list
        } catch (error) {
            console.error("Error posting blog:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-200 py-10 px-4 flex justify-center">
            {/* Main Browser-style Container */}
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300">

                {/* Decorative Header Bar */}
                <div className="bg-slate-700 p-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                {/* App Title with Gradient Background */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 py-8 border-b border-slate-100">
                    <h1 className="text-4xl font-bold text-center text-slate-800">Blog App</h1>
                </div>

                <div className="p-8">
                    {/* Form Section */}
                    <div className="space-y-4 mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">Title</label>
                                <input
                                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Please write a title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">Email</label>
                                <input
                                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Please write a email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Description</label>
                            <input
                                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={addBlog}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg transition-colors shadow-md active:scale-[0.99]"
                        >
                            Post
                        </button>
                    </div>

                    {/* Blog Feed */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="text-center text-slate-400">Loading...</div>
                        ) : (
                            blogs.map((b) => (
                                <div key={b.id} className="p-6 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <h2 className="text-xl font-bold text-slate-800 mb-2">{b.title}</h2>
                                    <p className="text-slate-600 leading-relaxed">{b.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}