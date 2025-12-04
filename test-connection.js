require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('Probando conexion...');
    console.log('URI:', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('CONEXION EXITOSA.');
    
    // Listar bases de datos
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Bases de datos disponibles:');
    dbs.databases.forEach(db => console.log(`  - ${db.name}`));

    process.exit(0);
  } catch (error) {
    console.error(' ERROR DE CONEXION:', error.message);
    process.exit(1);
  }
};

testConnection();

