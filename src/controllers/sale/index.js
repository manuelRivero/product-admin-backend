const Sale = require("./../../models/sales");
const Product = require("./../../models/product");
const User = require("./../../models/user");
const validation = require("./../../helpers/validate");
const mongoose = require("mongoose");

const moment = require("moment");
const { orderStatus } = require("./const");
const Joi = require("joi");

const createSale = {
  check: async (req, res, next) => {
    const schema = Joi.object({
      product: Joi.string().required(),
      user: Joi.object({
        email: Joi.string().required(),
        phone: Joi.number().required(),
      }),
    });
    validation.validateBody(req, next, schema);
  },
  do: async (req, res) => {
    const { product, user } = req.body;

    const targetProduct = await Product.findOne({
      _id: mongoose.Types.ObjectId(product),
    });
    if (!targetProduct) {
      return res.status(400).json({
        ok: false,
        message: "No se encontro el producto",
      });
    }

    if (targetProduct.stock < 1) {
      return res.status(400).json({
        ok: false,
        message: "El producto no cuanta con stock",
      });
    }

    targetProduct.stock = targetProduct.stock - 1;
    await targetProduct.save();
    let discount = 0;
    let total = 0;
    if (targetProduct.discount) {
      discount = (targetProduct.price * targetProduct.discount) / 100;
      total = targetProduct.price - discount;
    } else {
      total = targetProduct.price;
    }

    const sale = new Sale({
      status: "PENDIENTE",
      product: {
        quantity: 1,
        data: {
          _id: targetProduct.id,
          name: targetProduct.name,
          price: targetProduct.price,
          discount: targetProduct.discount ? targetProduct.discount : 0,
        },
      },
      user,
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
  },
};
const getSales = async (req, res) => {
  const { query } = req;
  const page = Number(req.query.page) || 0;
  const status = query.status ? { status: orderStatus[query.status] } : {};

  const [sales, total] = await Promise.all(
    [
      Sale.find({ ...status })
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
  check: async (req, res, next) => {
    const schema = Joi.object({
      id: Joi.string().required(),
      status: Joi.number()
        .valid(...[0, 1, 2, 3, 4, 5])
        .required(),
    });
    validation.validateBody(req, next, schema);
  },
  do: async (req, res, next) => {
    try {
      const sale = await Sale.findById(mongoose.Types.ObjectId(req.body.id));
      if (!sale) {
        res.status(400).json({
          ok: false,
          error: "No se encontro el numero de la orden",
        });
        return;
      }
      sale.status = orderStatus[req.body.status];
      console.log("sale", sale);
      await sale.save();
      res.json({
        ok: true,
        id: sale._id,
      });
    } catch (error) {
      console.log("error", error);
      res.status(400).json({
        ok: false,
        error: "No se ha podido actualizar el estatus de la orden",
      });
    }
  },
};
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
          quantity: { $sum: { $toDouble: "$products.quantity" } },
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
      { $unwind: "$product_data" },
      {
        $project: {
          _id: 1,
          quantity: 1,
          product_data: "$product_data",
        },
      },
    ]);

    let total = 0;
    console.log("sales", sales);
    sales.forEach((sale) => {
      total =
        total + parseInt(sale.product_data.price) * parseInt(sale.quantity);
    });

    res.status(200).json({
      ok: true,
      total,
    });
  },
};

module.exports = {
  createSale,
  getSales,
  totalByDate,
  dailySales,
  getMonthlySales,
  changeSaleStatus,
};
