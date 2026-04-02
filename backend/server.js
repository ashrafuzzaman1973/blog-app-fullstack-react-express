const express = require('express');
const cors = require('cors');

const blogRoutes = require('./routes/blogRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/blogs', blogRoutes);

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));