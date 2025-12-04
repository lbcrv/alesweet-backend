require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

const limpiarUsuarios = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const resultado = await Usuario.deleteMany({});
    console.log(`🗑️  ${resultado.deletedCount} usuarios eliminados\n`);

    console.log('Base de datos limpia');
    console.log('Ahora ejecuta: node crear-usuarios.js\n');

    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
};

limpiarUsuarios();
