const Sale = require("./../../models/sales");
const Product = require("./../../models/product");

const createSale = async (req, res) => {
  const { products } = req.body;
  const unavailableProducts = [];
  const errorStockProducts = [];
  let total = 0;
  products.forEach((element) => {
    const handleProduct = async () => {
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
      } else {
        product.stock = product.stock - Number(element.quantity);
        await product.save();
        let discount = 0;
        if (product.discount) {
          discount = (product.price * product.discount) / 100;
          total = total + (product.price - discount) * Number(element.quantity);
        } else {
          total = total + product.price * Number(element.quantity);
        }
      }
    };
    handleProduct();
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
    res.status(400).json({
      ok: false,
      message: "Los siguientes productos no cuentan con stock disponible",
      unavailableProducts,
    });
    return;
  } else {
    const sale = new Sale({
      products: products.map((e) => {
        return {
          _id: e._id,
          quantity: e.quantity,
        };
      }),
      total,
    });
    try {
      await sale.save();
      res.status(200).json({
        ok: true,
        sale: sale,
      });
    } catch (error) {}
  }
};

module.exports = {
  createSale,
};
