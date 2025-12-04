const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const pedidosRoutes = require('./routes/pedidos');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// CONECTAR A MONGODB ANTES DE INICIAR SERVIDOR
connectDB().then(() => {
  // Rutas
  app.use('/api/auth', authRoutes);
  app.use('/api/productos', productosRoutes);
  app.use('/api/clientes', clientesRoutes);
  app.use('/api/pedidos', pedidosRoutes);

  // Ruta de prueba
  app.get('/', (req, res) => {
    res.json({ mensaje: 'API Ale Sweet funcionando' });
  });

  // Iniciar servidor
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('❌ No se pudo iniciar el servidor:', err);
  process.exit(1);
});
