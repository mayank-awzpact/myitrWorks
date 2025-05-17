const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
const app = express();
app.use(express.json());
app.listen(5000, '0.0.0.0', () => {
  console.log('Server is running...');
});

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error: ", err));

app.use('/api/users', userRoutes);
app.get('/test-api', (req, res) => {
    res.json({
        success: true,
        message: 'Test API working!'
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
