const mongoose = require("mongoose");

const clienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String, default: null },
    rtn: { type: String, default: null },
    direccion: { type: String, default: null },
    tipoCliente: { type: String, default: "minorista" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cliente", clienteSchema);
