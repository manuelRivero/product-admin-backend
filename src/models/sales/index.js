const { Schema, model } = require("mongoose");

const SaleSchema = Schema(
  {
    products: {
      type: [
        {
          quantity: { type: Number, required: true },
          product: { type: Schema.Types.ObjectId, ref: "Products" },
        },
      ],
    },
    user: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    total: {
      type: Number,
    },
  },
  { colletion: "Sales", timestamps: true }
);

module.exports = model("Sale", SaleSchema);
