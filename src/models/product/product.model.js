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
  },
  { colection: "products" }
);

module.exports = model("Products", ProductSchema);
