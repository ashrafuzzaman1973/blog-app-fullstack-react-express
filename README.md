# 🚀 NexaBlog: AI-Powered Real-Time Social Platform

**NexaBlog** is a cutting-edge, full-stack blogging application that blends traditional content creation with **Artificial Intelligence** and real-time social interaction. Built on the **MERN Stack**, it allows users to brainstorm posts using AI, share them instantly, and engage in private real-time conversations.

---

## 🛠 Tech Stack

### Frontend:
- **React.js (Vite):** Ultra-fast, component-based UI.
- **Tailwind CSS:** Modern, utility-first responsive styling.
- **Socket.io-Client:** Real-time bi-directional communication.
- **Axios:** For robust API communication and AI integration.

### Backend:
- **Node.js & Express.js:** Scalable server architecture.
- **Google Gemini 1.5 API:** Powering the "AI Generate" engine for content creation.
- **MongoDB & Mongoose:** Persistent storage for users, blogs, and chat history.
- **Socket.io:** Managing real-time private messaging and live status.
- **JWT (JSON Web Tokens):** Secure, stateless user authentication.
- **Multer:** Handling multi-part form data for image uploads.

---

## ✨ Key Features

- **🤖 AI-Assisted Blogging:** Generate professional blog descriptions instantly from just a title using the **Gemini 1.5 Flash** model.
- **🔐 Secure Auth:** Complete Signup/Login flow with hashed passwords and JWT protection.
- **📝 Rich Blogging Engine:** Create and share posts with support for high-quality image uploads.
- **💬 Private Messaging:** - Real-time one-on-one chat.
    - Automatic chat history retrieval from MongoDB.
    - Isolated socket rooms for secure, private conversations.
- **🟢 Live Status:** Real-time "Active Users" sidebar indicating who is currently online.
- **📱 Responsive & Context-Aware:** Fully optimized for mobile; navigation adapts based on authentication status.

---

## 📂 Project Structure

```text
.
├── backend/
│   ├── models/          # User, Blog, and Message Schemas
│   ├── routes/          # API Endpoints (Auth, Blogs, AI)
│   ├── public/uploads/  # Stored Blog Images
│   ├── .env             # API Keys (Mongo, JWT, Gemini)
│   └── server.js        # Entry point & Socket logic
└── frontend/
    ├── src/
    │   ├── components/  # Chat.tsx, AI-UI elements
    │   ├── App.tsx      # Core State Management
    │   └── Blogs.tsx    # Feed UI with AI "Magic" Button
```

---

## 🚀 Getting Started

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/ashrafuzzaman1973/blog-app-fullstack-react-express.git

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup
Create a `.env` file in the **backend** directory:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_ai_studio_key
```

### 3. Execution
**Start Backend:**
```bash
cd backend
node server.js
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Create a new account | No |
| `POST` | `/api/auth/login` | Authenticate user & get token | No |
| `GET` | `/api/blogs` | Fetch all public blog posts | No |
| `POST` | `/api/blogs` | Create a blog post (with Multer) | **Yes** |
| `POST` | `/api/ai/generate_full_post` | Generate description via Gemini | **Yes** |

---

## 🤝 Contributing
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AI-Enhancement`).
3. Commit your Changes (`git commit -m 'Add AI functionality'`).
4. Push to the Branch (`git push origin feature/AI-Enhancement`).
5. Open a Pull Request.

---

**Author:** Ashrafuzzaman Ashraf  
**GitHub:** [ashrafuzzaman1973](https://github.com/ashrafuzzaman1973)  
**LinkedIn:** [Ashrafuzzaman](https://www.linkedin.com/in/ashrafuzzaman1973)
