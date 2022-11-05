const { Schema, model } = require("mongoose");

const SaleSchema = Schema(
  {
    products: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Products",
          quantity: { type: Number, required: true },
        },
      ],
    },
    user: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: "User"
      },
    total: {
      type: Number,
    },
  },
  { colletion: "Sales", timestamps: true }
);

module.exports = model("Sale", SaleSchema);
