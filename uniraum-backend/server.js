require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();

// CORS settings
const corsOptions = {
  origin: "http://localhost:3000" // Frontend address
};

app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Simple test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to UniRaum server!" });
});

// Add routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/room.routes')(app);
require('./routes/booking.routes')(app);
require('./routes/damage-report.routes')(app);

// Set port and start server
const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  
  // Create initial data if needed
  if (process.env.NODE_ENV === 'development') {
    try {
      require('./utils/init-data')();
    } catch (error) {
      console.error("Error creating initial data:", error);
    }
  }
});