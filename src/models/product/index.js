const { Schema, model } = require("mongoose");

const ProductSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    img: {
      type: String,
    },
    tags: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
        },
      ],
    },
    stock: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
    },
  },
  { colection: "products", timestamps: true }
);

module.exports = model("Products", ProductSchema);
