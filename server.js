require('dotenv').config();

const express = require('express');
const app = express();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// DB Connection
connectDB();

// Start server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
