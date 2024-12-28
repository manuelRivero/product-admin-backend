const { string } = require("joi");
const { Schema, model } = require("mongoose");

const featureSchema = Schema({
  color: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  stock: {
    type: String,
    default: 0
  }
});

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
    status:{
      available:{
        type:Boolean,
        default: false
      }
    },
    images: {
      type: [
        {
          url: {
            type: String,
          },
        },
      ],
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
    description:{
      type:String
    },
    stock: {
      type: Number,
      default:0,
    },
    discount: {
      type: Number,
      default: 0
    },
    features: {type: [featureSchema], default: []},
    tenant: {
      type: String,
      default: null,
    }
  },
  { colection: "products", timestamps: true }
);

module.exports = model("Products", ProductSchema);
