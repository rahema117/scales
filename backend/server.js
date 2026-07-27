const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB } = require('./config/db');
const Admin = require('./models/Admin');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // We can change this in production, but * is good for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload folder exists and serve it statically
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Route mounts
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/office-records', require('./routes/officeRecords'));

// API status check
app.get('/', (req, res) => {
  res.send('مكتب تفتيش موازين العبور - واجهة البرمجة تعمل بنجاح');
});

// Seed default Admin
const seedAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('Seeding default administrator account...');
      const defaultEmail = 'admin@obour-scales.gov.eg';
      const defaultPassword = 'admin123';
      
      const admin = new Admin({
        email: defaultEmail,
        password: defaultPassword
      });
      await admin.save();
      console.log(`Default administrator seeded successfully:`);
      console.log(`Email: ${defaultEmail}`);
      console.log(`Password: ${defaultPassword}`);
    }
  } catch (error) {
    console.error('Seeding Admin failed:', error.message);
  }
};

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'خطأ داخلي في الخادم'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  // Connect to DB
  await connectDB();
  
  // Seed database
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`Server running in mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server listening on port: ${PORT}`);
  });
};

startServer();
