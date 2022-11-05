const Sale = require("./../../models/sales");
const Product = require("./../../models/product");
const User = require("./../../models/user");

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
  const page = Number(req.query.page) || 0;
  const regex = new RegExp(req.query.search, "i");
  const search = req.query.search ? { name: regex } : {};
  const tags = req.query.tags
    ? { "tags.name": { $in: JSON.parse(req.query.tags) } }
    : {};
  const [sales, total] = await Promise.all(
    [
      Sale.find({ ...search, ...tags })
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
module.exports = {
  createSale,
  getSales,
};
