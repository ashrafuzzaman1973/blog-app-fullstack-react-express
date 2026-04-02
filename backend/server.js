const path = require('path');
const express = require('express');
const cors = require('cors');

const blogRoutes = require('./routes/blogRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// THIS IS THE MISSING LINK:
// It tells Express: "If someone asks for /uploads, look inside the public/uploads folder"
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api/blogs', blogRoutes);

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));