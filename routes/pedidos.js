const express = require("express");
const router = express.Router();
const Pedido = require("../models/Pedido");

// Middleware de autenticación
function verificarToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }
  next();
}

// GET todos los pedidos
router.get("/", verificarToken, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

// GET pedidos por estado
router.get("/estado/:estado", verificarToken, async (req, res) => {
  try {
    const pedidos = await Pedido.find({ estado: req.params.estado }).sort({
      createdAt: -1,
    });
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos por estado:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

// GET un pedido por ID
router.get("/:id", verificarToken, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json(pedido);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    res.status(500).json({ error: "Error al obtener pedido" });
  }
});

// POST crear pedido
router.post("/", verificarToken, async (req, res) => {
  try {
    const { clienteNombre, items } = req.body;

    if (!clienteNombre || !items || items.length === 0) {
      return res.status(400).json({
        error: "Cliente e items son requeridos",
      });
    }

    // Generar numero de pedido único (6 digitos)
    const ultimoPedido = await Pedido.findOne().sort({ createdAt: -1 });
    let numeroPedido;
    
    if (ultimoPedido && ultimoPedido.numeroPedido) {
      numeroPedido = (parseInt(ultimoPedido.numeroPedido) + 1).toString().padStart(6, '0');
    } else {
      numeroPedido = "000001";
    }

    console.log(`Generando pedido número: ${numeroPedido}`);

    // Calcular total
    let total = 0;
    for (const item of items) {
      const precio = item.producto.precio || 0;
      const cantidad = item.cantidad || 0;
      total += precio * cantidad;
    }

    const nuevoPedido = await Pedido.create({
      numeroPedido,
      ...req.body,
      total,
      estado: req.body.estado || "pendiente",
    });

    res.status(201).json({
      mensaje: "Pedido creado exitosamente",
      pedido: nuevoPedido,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(400).json({ error: "Error al crear pedido" });
  }
});

router.put("/:id/estado", verificarToken, async (req, res) => {
  try {
    const { estado } = req.body;

    const estadosValidos = ["pendiente", "enProceso", "listo", "entregado"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: "Estado inválido",
      });
    }

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!pedidoActualizado) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json({
      mensaje: "Estado actualizado",
      pedido: pedidoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

router.put("/:id", verificarToken, async (req, res) => {
  try {
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!pedidoActualizado) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json({
      mensaje: "Pedido actualizado",
      pedido: pedidoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
});

router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const pedidoEliminado = await Pedido.findByIdAndDelete(req.params.id);

    if (!pedidoEliminado) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json({ mensaje: "Pedido eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
});

module.exports = router;
