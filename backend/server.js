const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const recommendRoutes = require("./routes/recommend");
require('dotenv').config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use("/api/recommend", recommendRoutes);

// simple test route
app.get('/', (req, res) => {
  res.send('API Running');
});

// connect to MongoDB and then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });
