const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, username, password, rol } = req.body;

    //VALIDACIONES DE CAMPOS OBLIGATORIOS
    if (!nombre || !username || !password || !rol) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios' 
      });
    }

    //VALIDACION DE USERNAME (minimo 3 caracteres)
    if (username.length < 3) {
      return res.status(400).json({ 
        error: 'El usuario debe tener al menos 3 caracteres' 
      });
    }

    //VALIDACION DE PASSWORD (minimo 8 caracteres)
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

    // VALIDACION DE PASSWORD (maximo 50 caracteres)
    if (password.length > 50) {
      return res.status(400).json({ 
        error: 'La contraseña no puede exceder 50 caracteres' 
      });
    }

    // VALIDACION DE PASSWORD (debe contener al menos un numero)
    if (!/\d/.test(password)) {
      return res.status(400).json({ 
        error: 'La contraseña debe contener al menos un número' 
      });
    }

    // Validar que el rol sea válido
    const rolesValidos = ['admin', 'produccion', 'ventas'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ 
        error: 'Rol inválido. Debe ser: admin, produccion o ventas' 
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ username });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      username,
      password: passwordHash,
      rol,
      biometriaHabilitada: false,
    });

    // Generar token
    const token = jwt.sign(
      { 
        userId: nuevoUsuario._id, 
        username, 
        rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario._id,
        nombre,
        username,
        rol
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { 
        userId: usuario._id, 
        username: usuario.username, 
        rol: usuario.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        username: usuario.username,
        rol: usuario.rol,
        biometriaHabilitada: usuario.biometriaHabilitada
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Habilitar/deshabilitar biometria
router.put('/biometria', verificarToken, async (req, res) => {
  try {
    const { habilitar } = req.body;

    await Usuario.findByIdAndUpdate(
      req.usuario.userId,
      { biometriaHabilitada: habilitar }
    );

    res.json({ 
      mensaje: `Biometría ${habilitar ? 'habilitada' : 'deshabilitada'} exitosamente` 
    });

  } catch (error) {
    console.error('Error en biometría:', error);
    res.status(500).json({ error: 'Error al actualizar biometría' });
  }
});

// Middleware para verificar token
function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = router;
