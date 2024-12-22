const { Schema, model } = require("mongoose");

const SaleSchema = Schema(
  {
    status: {
      type: String,
      required:true
    },
    products: {
      type:[
        {
          quantity: { type: Number, required: true },
          data: {
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
        }
      ]
    },
    user: {
      required: true,
      type: String
    },
    name: {
      required: true,
      type: String
    },
    lastName: {
      required: true,
      type: String
    },
    dni: {
      required: true,
      type: String
    },
    phone: {
      required: true,
      type: String
    },
    postalCode: {
      required: true,
      type: String
    },
    address: {
      required: true,
      type: String
    },
    paymentId:{
      required: true,
      type: String
    },
    total: {
      type: Number,
    },
  },
  { colletion: "Sales", timestamps: true }
);

module.exports = model("Sale", SaleSchema);
