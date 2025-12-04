const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI no esta definido en .env');
    }

    console.log('Intentando conectar a MongoDB Atlas...');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('Conectado a MongoDB Atlas correctamente');
    
    mongoose.connection.on('error', (err) => {
      console.error('ERROR en conexión MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });

  } catch (error) {
    console.error('ERROR FATAL al conectar MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;