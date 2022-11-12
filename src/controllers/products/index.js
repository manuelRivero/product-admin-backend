const mongoose = require("mongoose");
const Product = require("./../../models/product");
const User = require("./../../models/user");
const jwt = require("jsonwebtoken");

const createProduct = async (req, res) => {
  const { body } = req;
  const product = new Product({ ...body });
  try {
    product.save();
    res.json({
      ok: true,
      product,
    });
  } catch (error) {
    console.log("error", error);
  }
};

const getProducts = async (req, res) => {
  const token = req.get("x-token");
  const user = {};
  if (token) {
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    user._id = uid;
  }
  
  const page = Number(req.query.page) || 0;
  const regex = new RegExp(req.query.search, "i");
  const search = req.query.search ? { name: regex } : {};
  const minPrice = req.query.minPrice
    ? { $lte: Number(req.query.minPrice) }
    : null;
  const maxPrice = req.query.maxPrice
    ? { $lte: Number(req.query.maxPrice) }
    : null;
  const priceQuery = minPrice && maxPrice ? { price: { ...minPrice, ...maxPrice } } : {};
  const tags = req.query.tags
    ? { "tags.name": { $in: JSON.parse(req.query.tags) } }
    : {};

  let [products, total] = await Promise.all([
    Product.find({ ...search, ...tags, ...priceQuery })
      .skip(page * 10)
      .limit(10).lean(),
    Product.find({ ...search, ...tags, ...priceQuery }).count(),
  ]);
  const targetUser = await User.findById(user._id);
  products.forEach((product) => {
    if (targetUser.likedProducts.includes(product)) {

      product.liked = true;
    } else {
      product.liked = false;
    }
  });

  res.json({
    ok: true,
    products,
    total,
  });
};

// const likeProduct = {
//   check:(req, res, next) => {
//     const schema = Joi.object({
//         like: Joi.boolean().required(),
//     });
//     validation.validateBody(req, next, schema);
// },
//   do:async (req, res) =>{
//     const {product} = req;
//     const targetProduct = Product.findById(product);
//     if(!targetProduct){
//       return res.status(404).json({
//         ok:false,
//         message:"El producto no existe"
//       })
//     }
// }}

module.exports = {
  createProduct,
  getProducts,
};
