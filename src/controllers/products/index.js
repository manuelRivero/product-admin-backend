const mongoose = require("mongoose");
const Product = require("./../../models/product");

const createProduct = async (req, res)=>{
    const {body} = req
    const product = new Product({...body})
    try {
        product.save();
        res.json({
          ok: true,
          product,
        });
      } catch (error) {
        console.log("error", error);
      }
}

const getProducts = async (req, res)=>{
  const page = Number(req.query.page) || 0;
  const regex =  new RegExp(req.query.search, 'i')
  const search = req.query.search ? {name:regex} : {};
  const minPrice = req.query.minPrice ? {$lte : Number(req.query.minPrice)} : {};
  const maxPrice = req.query.maxPrice ? {$lte : Number(req.query.maxPrice)}: {};
  const priceQuery = {price:{...minPrice, ...maxPrice}}
  const tags = req.query.tags ? {'tags.name': { $in: JSON.parse(req.query.tags) }} : {};
  
  const [products, total] = await Promise.all([
    Product.find({...search , ...tags, ...priceQuery }).skip(page * 10).limit(10),
    Product.find({...search , ...tags, ...priceQuery }).count()
  ])
  res.json({
    ok: true,
    products,
    total
  });
}

module.exports = {
    createProduct,
    getProducts
}