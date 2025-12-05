const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");
const multer = require("multer"); // 
const path = require("path"); // 
const fs = require("fs"); // 

// Middleware de autenticacion
function verificarToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }
  next();
}

const uploadDir = "uploads/productos";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "producto-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif, webp)"));
  },
});

//Endpoint para subir imagen
router.post(
  "/upload-imagen",
  verificarToken,
  upload.single("imagen"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se recibió ninguna imagen" });
      }

      // URL de la imagen
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/productos/${req.file.filename}`;

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