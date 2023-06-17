const Sale = require("./../../models/sales");
const Product = require("./../../models/product");
const User = require("./../../models/user");
const validation = require("./../../helpers/validate");
const mongoose = require("mongoose");



const moment = require("moment");
const { orderStatus } = require("./const");
const Joi = require("joi");

const createSale = async (req, res) => {
  const { products } = req.body;
  const { uid } = req;
  const unavailableProducts = [];
  const errorStockProducts = [];

  const user = await User.findById(uid);
  if (!user) {
    return res.status(400).json({
      ok: false,
      message: "Credenciales invalidas",
    });
  }

  products.forEach(async (element) => {
    if (element.quantity <= 0) {
      unStockProducts.push(element._id);
      return;
    }
    const product = await Product.findOne({
      _id: element._id,
      stock: { $gte: Number(element.quantity) },
    });
    if (!product) {
      unavailableProducts.push(element._id);
    }
  });

  if (errorStockProducts.length > 0) {
    res.status(400).json({
      ok: false,
      message: "Los siguientes productos se han enviado con un stock de 0",
      errorStockProducts: errorStockProducts,
    });
    return;
  }
  if (unavailableProducts.length > 0) {
    return res.status(400).json({
      ok: false,
      message: "Los siguientes productos no cuentan con stock disponible",
      unavailableProducts,
    });
  }
  const total = await products.reduce(async (total, element) => {
    const product = await Product.findOne({
      _id: element._id,
    });
    product.stock = product.stock - Number(element.quantity);
    await product.save();
    let discount = 0;
    if (product.discount) {
      discount = (product.price * product.discount) / 100;
      return (
        (await total) + (product.price - discount) * Number(element.quantity)
      );
    } else {
      return (await total) + product.price * Number(element.quantity);
    }
  }, Promise.resolve(0));

  const sale = new Sale({
    products: products.map((e) => {
      return {
        _id: e._id,
        quantity: e.quantity,
      };
    }),
    user: user._id,
    total,
  });
  try {
    await sale.save();
    res.status(200).json({
      ok: true,
      sale: sale,
    });
  } catch (error) {
    console.log("sale error", error);
  }
};
const getSales = async (req, res) => {
  const { query } = req;
  const page = Number(req.query.page) || 0;
  const status = query.status ? {status: orderStatus[query.status]} : {}

  const [sales, total] = await Promise.all(
    [
      Sale.find({...status})
        .populate({ path: "user", select: "name lastname email provider" })
        .skip(page * 10)
        .limit(10),
    ],
    Sale.find().count()
  );
  res.status(200).json({
    ok: true,
    sales,
    total,
  });
};
const changeSaleStatus = {
  check: async (req, res, next) =>{
    const schema = Joi.object({
      id:Joi.string().required(),
      status: Joi.number().valid(...[0,1,2,3,4,5]).required()
    })
    validation.validateBody(req, next, schema);
  },
  do: async (req, res, next) =>{
    try {
      const sale = await Sale.findById(mongoose.Types.ObjectId(req.body.id));
      if(!sale){
        res.status(400).json({
          ok:false,
          error:"No se encontro el numero de la orden"
        })
        return
      }
      sale.status = orderStatus[req.body.status];
      console.log("sale", sale)
      await sale.save()
      res.json({
        ok:true,
        id:sale._id
      })
    } catch (error) {
      console.log("error", error)
      res.status(400).json({
        ok:false,
        error:"No se ha podido actualizar el estatus de la orden"
      })
    }
  }
}
const getMonthlySales = async (req, res) => {
  const { query } = req;
  const startOfMonth = moment(query.date, "DD-MM-YYYY").startOf("month");
  const endOfMonth = moment(query.date, "DD-MM-YYYY").endOf("month");

  const dateQuery = {
    createdAt: {
      $gte: new Date(startOfMonth),
      $lte: new Date(endOfMonth),
    },
  };
  const [sales] = await Promise.all([
    Sale.aggregate([
      {
        $match: { ...dateQuery },
      },
      { $group: { _id: "$createdAt", total: { $sum: "$total" } } },
    ]),
  ]);
  res.status(200).json({
    ok: true,
    sales,
  });
};

const totalByDate = {
  check: (req, res, next) => {},

  do: async (req, res, next) => {
    const today = new Date();
    const { from } = req.query;
    let date = moment(moment.now());
    if (from === "day") {
      date = date.subtract(1, "d").format("YYYY-MM-DD");
    }
    if (from === "week") {
      date = date.subtract(7, "d").format("YYYY-MM-DD");
    }
    if (from === "month") {
      date = date.subtract(1, "month").format("YYYY-MM-DD");
    }
    if (from === "year") {
      date = date.subtract(1, "year").format("YYYY-MM-DD");
    }
    const sales = await Sale.aggregate([
      // First Stage
      {
        $match: { createdAt: { $gte: new Date(date), $lt: today } },
      },
    ]);
    const total = sales.reduce((acumulator, value) => {
      return Number(acumulator) + Number(value.total);
    }, 0);
    console.log("total", total);
    res.status(200).json({
      ok: true,
      total,
    });
  },
};
const dailySales = {
  check: () => {},
  do: async (req, res, next) => {
    let date = req.query.from;
 
    const sales = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $lte: moment(date).utc().endOf("date").toDate(),
            $gte: moment(date).utc().startOf("date").toDate(),
          },
        },
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products._id",
          quantity:{ $sum : {"$toDouble":"$products.quantity"}}
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product_data",
        },
      },
      { $unwind:"$product_data"},
      {$project:{
        _id:1,
        quantity:1,
        product_data: "$product_data"
      }}

    ]);

    let total = 0
    console.log("sales", sales)
    sales.forEach(sale => {
      total = total + parseInt(sale.product_data.price) * parseInt(sale.quantity)
    })
    
    res.status(200).json({
      ok: true,
      total
    });
  },
};

module.exports = {
  createSale,
  getSales,
  totalByDate,
  dailySales,
  getMonthlySales,
  changeSaleStatus
};
