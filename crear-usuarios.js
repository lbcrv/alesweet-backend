require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Usuario = require('./models/Usuario');

const usuarios = [
  {
    nombre: 'Administrador',
    username: 'admin',
    password: 'admin12345',
    rol: 'admin'
  },
  {
    nombre: 'Usuario Ventas',
    username: 'ventas',
    password: 'ventas12345', 
    rol: 'ventas'
  },
    {
    nombre: 'Yoel Lopez',
    username: 'yoel',
    password: '12345678',
    rol: 'ventas'
  },
  {
    nombre: 'Usuario Produccion',
    username: 'produccion',
    password: 'produccion123',
    rol: 'produccion'
  }
];

const crearUsuarios = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    for (const user of usuarios) {
      // Validar contraseña antes de crear
      if (user.password.length < 8) {
        console.log(`ERROR: Password de "${user.username}" muy corta (mínimo 8 caracteres.)`);
        continue;
      }

      // Verificar si ya existe
      const existe = await Usuario.findOne({ username: user.username });
      
      if (existe) {
        console.log(`Usuario "${user.username}" ya existe.`);
        continue;
      }

      // Hashear password
      const passwordHash = await bcrypt.hash(user.password, 10);

      // Crear usuario
      await Usuario.create({
        nombre: user.nombre,
        username: user.username,
        password: passwordHash,
        rol: user.rol,
        biometriaHabilitada: false,
      });

      console.log(`   Usuario "${user.username}" creado exitosamente.`);
      console.log(`   Nombre: ${user.nombre}`);
      console.log(`   Rol: ${user.rol}`);
      console.log(`   Password: ${user.password}\n`);
    }
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
};

crearUsuarios();
