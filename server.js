const express = require('express');
const app = express();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use('/api/users', userRoutes);

connectDB();

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
