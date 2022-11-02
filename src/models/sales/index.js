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
    // user: {
    //     required: true,
    //     type: Schema.Types.ObjectId,
    //     ref: "user"
    //   },
    total:{
      type:Number
    }
  },
  { colletion: "Sales" }
);

module.exports = model("Sale", SaleSchema);
