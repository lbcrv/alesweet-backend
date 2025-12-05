const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");
const multer = require("multer"); 

function verificarToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }
  next();
}

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'alesweet/productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1024, height: 1024, crop: 'limit' }]
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/upload-imagen",
  verificarToken,
  upload.single("imagen"),
  (req, res) => {
    try {
      console.log("Subiendo imagen a Cloudinary...");
      
      if (!req.file) {
        console.log("No se recibió archivo");
        return res.status(400).json({ error: "No se recibió ninguna imagen" });
      }

      // Cloudinary devuelve la URL en req.file.path
      const imageUrl = req.file.path;

      console.log("Imagen subida exitosamente:", imageUrl);

      res.json({
        success: true,
        imageUrl: imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET todos los productos
router.get("/", verificarToken, async (req, res) => {
  try {
    const productos = await Producto.find().sort({ nombre: 1 });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// GET un producto por ID
router.get("/:id", verificarToken, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// POST crear producto
router.post("/", verificarToken, async (req, res) => {
  try {
    const { nombre, categoria, precio, descripcion, imagenUrl } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({
        error: "Nombre y precio son requeridos",
      });
    }

    const nuevoProducto = await Producto.create({
      nombre,
      categoria: categoria || "General",
      precio: parseFloat(precio),
      descripcion: descripcion || "",
      codigo: req.body.codigo || `PROD-${Date.now()}`,
      isv: req.body.isv || 0.15,
      imagenUrl: imagenUrl || "",
      disponible: true,
    });

    res.status(201).json({
      mensaje: "Producto creado exitosamente",
      producto: nuevoProducto,
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(400).json({ error: "Error al crear producto" });
  }
});

// PUT actualizar producto
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const { nombre, categoria, precio, descripcion, imagenUrl, disponible } =
      req.body;

    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        categoria,
        precio: parseFloat(precio),
        descripcion,
        imagenUrl,
        disponible,
      },
      { new: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({
      mensaje: "Producto actualizado exitosamente",
      producto: productoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// DELETE eliminar producto
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const productoEliminado = await Producto.findByIdAndDelete(req.params.id);

    if (!productoEliminado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ mensaje: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

module.exports = router;