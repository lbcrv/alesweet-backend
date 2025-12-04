const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    descripcion: { type: String, default: "" },
    codigo: { type: String, required: true, unique: true },
    isv: { type: Number, default: 0.15 },
    imagenUrl: { type: String, default: "" },
    categoria: { type: String, default: "General" },
    disponible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Producto", productoSchema);
