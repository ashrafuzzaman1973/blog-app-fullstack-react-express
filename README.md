# 🚀 NexaBlog: AI-Powered Admin Dashboard & Social Platform

**NexaBlog** is a high-performance, full-stack blogging ecosystem that combines **Artificial Intelligence**, a modern **Admin Dashboard**, and real-time social interaction. Built using the **MERN Stack**, it delivers a powerful and scalable platform for content creation, communication, and AI-assisted workflows.

---

## 🛠 Tech Stack

### 🎨 Frontend

* **React.js (Vite)** — Fast and modular UI development
* **Tailwind CSS (Admin Dashboard UI)** — Clean, responsive, professional layout
* **Socket.io Client** — Real-time communication
* **Axios** — API handling and AI integration

### ⚙️ Backend

* **Node.js & Express.js** — Scalable backend architecture
* **Google Gemini 1.5 API** — AI-powered content generation & voice processing
* **MongoDB & Mongoose** — NoSQL database & schema modeling
* **Socket.io** — Real-time messaging & live user tracking
* **JWT (JSON Web Tokens)** — Secure authentication system
* **Multer** — Image upload handling

---

## ✨ Key Features

### 📊 Admin Dashboard

* Modern **sidebar-based navigation**
* Responsive layout with analytics-style UI
* Context-aware components

### 🎙️ Voice-to-Blog (Bangla → English)

* Convert **Bangla speech into structured English blog posts**
* AI-enhanced expansion for professional-quality content

### 🤖 AI Blog Generator

* Generate full blog descriptions from a simple title
* Powered by **Gemini 1.5 Flash**

### 💬 Real-Time Messaging

* One-to-one private chat
* Live message updates via Socket.io
* Persistent chat history (MongoDB)

### 🟢 Live User Status

* Track online users in real time
* Dynamic "Active Users" system

### 🔐 Authentication System

* Secure signup/login
* JWT-based route protection
* Password hashing

### 📝 Blogging Engine

* Create, edit, and share posts
* Image upload support via Multer

---

## 📂 Project Structure

```text
.
├── backend/
│   ├── models/          # User, Blog, Message schemas
│   ├── routes/          # API routes (Auth, Blogs, AI, Voice)
│   ├── public/uploads/  # Uploaded images
│   └── server.js        # Main server & Socket.io logic
│
└── frontend/
    ├── src/
    │   ├── components/  # AdminLayout, Chat, VoiceInput
    │   ├── App.tsx      # Routing & Auth state
    │   └── Blogs.tsx    # Dashboard & Feed UI
```

---

## 🚀 Getting Started

### 1️⃣ Clone Repository

```bash
git clone https://github.com/ashrafuzzaman1973/blog-app-fullstack-react-express.git
```

### 2️⃣ Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 3️⃣ Environment Setup

Create a `.env` file in the **backend** folder:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_ai_studio_key
```

---

### 4️⃣ Run the Project

#### ▶️ Start Backend

```bash
cd backend
node server.js
```

#### ▶️ Start Frontend

```bash
cd frontend
npm run dev
```

---

## 📡 API Endpoints

### 🔐 Authentication

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | `/api/auth/signup` | Register new user |
| POST   | `/api/auth/login`  | Login & get token |

### 📝 Blogs

| Method | Endpoint     | Description                 |
| ------ | ------------ | --------------------------- |
| GET    | `/api/blogs` | Fetch all blogs             |
| POST   | `/api/blogs` | Create blog (Auth required) |

### 🤖 AI Services

| Method | Endpoint                     | Description                 |
| ------ | ---------------------------- | --------------------------- |
| POST   | `/api/ai/generate_full_post` | Title → Full blog           |
| POST   | `/api/ai/voice_to_blog`      | Bangla voice → English blog |

---

## 🧠 AI Capabilities

* **Text-to-Text Generation**
  → Input: Blog title
  → Output: Full professional article

* **Speech-to-Text + AI Expansion**
  → Input: Bangla speech
  → Output: English blog with enhanced structure

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes

   ```bash
   git commit -m "Add new feature"
   ```
4. Push to GitHub

   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request

---

## 👨‍💻 Author

**Ashrafuzzaman Ashraf**

* GitHub: [https://github.com/ashrafuzzaman1973](https://github.com/ashrafuzzaman1973)
* LinkedIn: [https://www.linkedin.com/in/ashrafuzzaman1973](https://www.linkedin.com/in/ashrafuzzaman1973)

---
