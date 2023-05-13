const Sale = require("./../../models/sales");
const Product = require("./../../models/product");
const User = require("./../../models/user");

const moment = require("moment");

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
      return total + (product.price - discount) * Number(element.quantity);
    } else {
      return total + product.price * Number(element.quantity);
    }
  }, 0);

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
  } catch (error) {}
};
const getSales = async (req, res) => {
  const { query } = req;
  if (!query.maxDate && query.minDate) {
    return res.status(404).json({
      ok: false,
      message: "La fecha máxima es requerida",
    });
  }
  if (!query.minDate && query.maxDate) {
    return res.status(404).json({
      ok: false,
      message: "La fecha minima es requerida",
    });
  }

  if (query.minDate && !moment(query.minDate, "YYYY-MM-DD").isValid()) {
    return res.status(404).json({
      ok: false,
      message: "La fecha minima no es valida",
    });
  }
  if (query.maxDate && !moment(query.maxDate, "YYYY-MM-DD").isValid()) {
    return res.status(404).json({
      ok: false,
      message: "La fecha máxima no es valida",
    });
  }
  const page = Number(req.query.page) || 0;
  const regex = new RegExp(req.query.search, "i");
  const search = req.query.search ? { name: regex } : {};
  const tags = req.query.tags
    ? { "tags.name": { $in: JSON.parse(req.query.tags) } }
    : {};
  const maxDate = query.maxDate
    ? { $lte: new Date(new Date(query.maxDate).setHours(23, 59)) }
    : {};
  const minDate = query.minDate ? { $gte: new Date(query.minDate) } : {};
  const dateQuery =
    query.minDate && query.maxDate
      ? { createdAt: { ...maxDate, ...minDate } }
      : {};
  const [sales, total] = await Promise.all(
    [
      Sale.find({ ...search, ...tags, ...dateQuery })
        .populate({ path: "user", select: "name lastname email provider" })
        .populate({ path: "products", select: "name price" })
        .skip(page * 10)
        .limit(10),
    ],
    Sale.find({ ...search, ...tags })
  );
  res.status(200).json({
    ok: true,
    sales,
    total,
  });
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
    let date = moment(moment.now()).subtract(7, "d").format("YYYY-MM-DD");
    const sales = await Sale.aggregate([
      { $match: { createdAt: { $gte: new Date(date) } } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          day: "$_id",
        },
      },
      {
        $sort: {
          day: 1,
        },
      },
    ]);
    console.log("sales by day", sales);
    res.status(200).json({
      ok: true,
      sales,
    });
  },
};

module.exports = {
  createSale,
  getSales,
  totalByDate,
  dailySales,
  getMonthlySales,
};
