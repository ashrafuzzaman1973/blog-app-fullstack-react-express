
# 🚀 NexaBlog: Real-Time Social Blogging Platform

**NexaBlog** is a modern, full-stack blogging application that integrates content creation with real-time social interaction. Built using the **MERN Stack**, it features a secure authentication system, dynamic blog posting with image uploads, and a private one-on-one messaging system.

---

## 🛠 Tech Stack

### Frontend:
- **React.js (Vite):** Fast, component-based UI.
- **Tailwind CSS:** Modern, responsive styling.
- **Socket.io-Client:** Real-time bi-directional communication.
- **Axios:** Promise-based HTTP client for API calls.

### Backend:
- **Node.js & Express.js:** Scalable server-side architecture.
- **MongoDB & Mongoose:** NoSQL database for persistent storage of blogs, users, and chat history.
- **Socket.io:** Powering the real-time private messaging engine.
- **JWT (JSON Web Tokens):** Secure user authentication.
- **Multer:** Middleware for handling image uploads.

---

## ✨ Features

- **🔐 Secure Auth:** Full Signup/Login flow with JWT protection.
- **📝 Blogging Engine:** Create, view, and share blog posts with image support.
- **💬 Private Messaging:** - Real-time one-on-one chat.
    - Automatic chat history retrieval from MongoDB.
    - Unique room generation for private conversations.
- **🟢 Live Status:** Real-time "Active Users" sidebar showing who is online.
- **📱 Responsive Design:** Optimized for mobile, tablet, and desktop views.
- **🚦 Navigation:** Context-aware menu (Messages button only appears when logged in).

---

## 📂 Project Structure

```text
.
├── backend/
│   ├── models/          # Mongoose Schemas (User, Blog, Message)
│   ├── routes/          # API Endpoints (Auth, Blogs)
│   ├── public/uploads/  # Stored Blog Images
│   ├── .env             # Environment Variables
│   └── server.js        # Server Entry & Socket Logic
└── frontend/
    ├── src/
    │   ├── components/  # Chat.tsx, etc.
    │   ├── App.tsx      # Main Logic & State
    │   └── Blogs.tsx    # Feed UI & Navigation
```

---

## 🚀 How to Run the Project

### 1. Clone and Install Dependencies
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
```

### 3. Start the Application
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
Open `http://localhost:5173` to view the app.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Create a new account | No |
| `POST` | `/api/auth/login` | Authenticate user & get token | No |
| `GET` | `/api/blogs` | Fetch all public blog posts | No |
| `POST` | `/api/blogs` | Create a new blog with image | Yes |

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create.
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Author:** [Ashrafuzzaman Ashraf]  
**GitHub:** [@https://github.com/ashrafuzzaman1973](https://github.com/yourusername)  
**LinkedIn:** [https://www.linkedin.com/in/ashrafuzzaman1973](https://linkedin.com/in/yourprofile)