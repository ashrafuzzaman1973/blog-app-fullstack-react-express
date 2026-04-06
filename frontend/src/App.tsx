import { useState } from "react";
import axios from "axios";
import Blogs from "./components/Blogs";

function App() {
    // 1. Move state inside the component
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [userEmail, setUserEmail] = useState(localStorage.getItem("email") || "");

    // 2. Authentication Logic
    const handleLogin = async (email: any, password: any) => {
        try {
            const res = await axios.post("http://localhost:8000/api/auth/login", { email, password });

            // Save to storage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("email", res.data.email);

            // Update state
            setToken(res.data.token);
            setUserEmail(res.data.email);
        } catch (error) {
            alert("Login failed! Check your credentials.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        setToken("");
        setUserEmail("");
    };

    return (
        <div className="app-container">
            {/* 3. Pass token and handlers to Blogs component */}
            <Blogs
                token={token}
                userEmail={userEmail}
                onLogout={handleLogout}
                onLogin={handleLogin}
            />
        </div>
    );
}

export default App;