import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000/api/blogs";

function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const fetchBlogs = async () => {
        const res = await axios.get(API);
        setBlogs(res.data);
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const addBlog = async () => {
        if (!title || !content) return;
        await axios.post(API, { title, content });
        setTitle("");
        setContent("");
        fetchBlogs();
    };

    const deleteBlog = async (id) => {
        await axios.delete(`${API}/${id}`);
        fetchBlogs();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto">

                {/* Title */}
                <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
                    📝 Blog App
                </h1>

                {/* Form */}
                <div className="bg-white p-5 rounded-2xl shadow-md mb-6">
                    <input
                        className="w-full border p-2 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <textarea
                        className="w-full border p-2 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Write content..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <button
                        onClick={addBlog}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
                    >
                        ➕ Add Blog
                    </button>
                </div>

                {/* Blog List */}
                <div className="space-y-4">
                    {blogs.map((b) => (
                        <div
                            key={b.id}
                            className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition"
                        >
                            <h2 className="text-xl font-semibold text-gray-800">
                                {b.title}
                            </h2>
                            <p className="text-gray-600 mt-2">{b.content}</p>

                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={() => deleteBlog(b.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                                >
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default Blogs;