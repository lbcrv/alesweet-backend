const mongoose = require("mongoose");

const pedidoSchema = new mongoose.Schema(
  {
    id: { type: String }, //ID generado en Flutter

    tipoCliente: { type: String, required: true },

    clienteNombre: { type: String, required: true },
    clienteTelefono: { type: String, required: true },
    clienteRTN: { type: String, required: true },

    nombreInstitucion: { type: String, default: null },
    nombreTienda: { type: String, default: null },

    direccion: { type: String, required: true },
    ocasion: { type: String, default: "" },

    items: [
      {
        producto: { type: Object, required: true },
        cantidad: { type: Number, required: true },
      },
    ],

    fechaEntrega: { type: Date, required: true },
    total: { type: Number, required: true },

    estado: {
      type: String,
      enum: ["pendiente", "enProceso", "listo", "entregado"],
      default: "pendiente",
    },

    prioridad: { type: Number, default: 2 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pedido", pedidoSchema);
