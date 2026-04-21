import React, { useState } from "react";

export default function Login({ onLogin }: { onLogin: any }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onLogin(email, password);
    };

    return (
        <div className="h-screen font-sans bg-cover bg-center flex items-center justify-center"
             style={{ backgroundImage: "url('/dist/images/login-new.jpeg')" }}>
            <div className="w-full max-w-md p-4">
                <form onSubmit={handleSubmit} className="bg-white p-10 rounded-xl shadow-2xl space-y-4">
                    <h2 className="text-gray-800 text-center text-2xl font-black mb-4 uppercase">Login</h2>

                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Email/Username</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-transparent focus:border-emerald-500 rounded outline-none transition"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-transparent focus:border-emerald-500 rounded outline-none transition"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                        />
                    </div>

                    <button className="w-full py-3 mt-4 text-white font-black bg-slate-900 hover:bg-black rounded-lg shadow-lg transform active:scale-95 transition">
                        GET STARTED
                    </button>

                    <div className="text-center pt-4 text-sm font-medium text-gray-500">
                        Don't have an account? <span className="text-blue-600 cursor-pointer hover:underline">Register</span>
                    </div>
                </form>
            </div>
        </div>
    );
}