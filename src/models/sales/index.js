const { Schema, model } = require("mongoose");

const SaleSchema = Schema(
  {
    status: {
      type: String,
    },
    products: {
      quantity: { type: Number, required: true },
      product: {
        type: {
          _id: { type: Schema.Types.ObjectId, ref: "Products" },
          name: {
            type: String,
            required: true,
            trim: true,
          },
          price: {
            type: Number,
            required: true,
          },
          discount: {
            type: Number,
          },
        },
      },
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
