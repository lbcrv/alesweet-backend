const express = require("express");
const router = express.Router();
const Cliente = require("../models/Cliente");

// Middleware de autenticación
function verificarToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }
  next();
}

// GET todos
router.get("/", verificarToken, async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// GET uno
router.get("/:id", verificarToken, async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({ error: "Error al obtener cliente" });
  }
});

// POST crear
router.post("/", verificarToken, async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json({
      mensaje: "Cliente creado exitosamente",
      cliente,
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(400).json({ error: "Error creando cliente" });
  }
});

// PUT actualizar
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!clienteActualizado) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({
      mensaje: "Cliente actualizado",
      cliente: clienteActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

// DELETE eliminar
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);

    if (!clienteEliminado) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ mensaje: "Cliente eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
});

module.exports = router;
