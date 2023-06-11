const mongoose = require("mongoose");
const Product = require("./../../models/product");
const Sales = require("./../../models/sales");
const User = require("./../../models/user");
const jwt = require("jsonwebtoken");
const validation = require("./../../helpers/validate");
const Joi = require("joi");
const { cloudinary } = require("./../../helpers/imageUpload");
const ExcelJS = require("exceljs");
var workbook = new ExcelJS.Workbook();
var AdmZip = require("adm-zip");
var fs = require("fs");
const path = require("path");

// schemas
const { createProductSchema } = require("./../../schemas/products");
const product = require("./../../models/product");

const createProduct = {
  check: (req, res, next) => {
    const { body } = req;
    if (!req.files?.productImage) {
      res.json({
        true: false,
        error: "Las imagenes son requeridas",
      });
    } else {
      req.body.tags = JSON.parse(body.tags);
      req.body.status = JSON.parse(body.status);
      validation.validateBody(req, next, createProductSchema);
    }
  },
  do: async (req, res) => {
    const { body, files } = req;
    const productImages = [];
    if (files.productImage.length) {
      for (let element of files.productImage) {
        try {
          const imageUrl = await cloudinary.uploader.upload(
            element.tempFilePath,
            { folder: "products" }
          );
          productImages.push({ url: imageUrl.secure_url });
        } catch {}
      }
    } else {
      console.log("else case");
      try {
        const imageUrl = await cloudinary.uploader.upload(
          files.productImage.tempFilePath,
          { folder: "products" }
        );
        productImages.push({ url: imageUrl.secure_url });
      } catch {}
    }
    const product = new Product({ ...body, images: productImages });
    try {
      product.save();
      res.json({
        ok: true,
        product,
      });
    } catch (error) {
      console.log("error", error);
    }
  },
};
const editProduct = {
  check: async (req, res, next) => {
    req.body.tags = JSON.parse(req.body.tags);
    req.body.status = JSON.parse(req.body.status);
    req.body.deletedImages = JSON.parse(req.body.deletedImages);
    validation.validateBody(req, next, createProductSchema);
  },
  do: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ ok: false, error: "No hay id en la petición" });
    }
    let productImages = [];
    if (req.files) {
      if (req.files.productImage.length) {
        for (let element of req.files.productImage) {
          try {
            const imageUrl = await cloudinary.uploader.upload(
              element.tempFilePath,
              { folder: "products" }
            );
            productImages.push({ url: imageUrl.secure_url });
          } catch {}
        }
      } else {
        console.log("else case");
        try {
          const imageUrl = await cloudinary.uploader.upload(
            req.files.productImage.tempFilePath,
            { folder: "products" }
          );
          productImages.push({ url: imageUrl.secure_url });
        } catch {}
      }
    }
    const product = await Product.findById(id);
    if (req.body.deletedImages) {
      product.images = product.images.filter((image, index) => {
        const deleteImages = req.body.deletedImages;
        const targetImage = deleteImages.find((e) => {
          console.log("index", index);
          console.log("e", e);
          return index === e;
        });
        console.log("target image", targetImage)
        if (targetImage >= 0) {
          return false;
        } else {
          return true;
        }
      });
    }
    console.log("product images", product.images )
    product.name = req.body.name;
    product.price = req.body.price;
    product.description = req.body.description;
    product.stock = req.body.stock;
    product.images = [...product.images, ...productImages];
    product.tags = req.body.tags;
    product.status.available = req.body.status.available;

    const productSave = await product.save();

    console.log("product", product);
    console.log("productSave", productSave);

    res.json({
      ok: true,
      product,
    });
  },
};
const createProductsFromExcel = {
  check: async (req, res, next) => {
    if (!req.files?.excel) {
      res.json({
        true: false,
        error: "El excel es requerido",
      });
    } else {
      next();
    }
  },
  do: async (req, res) => {
    const filePath = req.files.excel.tempFilePath;
    workbook.xlsx.readFile(filePath).then(async function () {
      var workSheet = workbook.getWorksheet("productos");

      for (let i = 1; i <= workSheet.rowCount; i++) {
        const setProduct = async () => {
          if (i === 1) return;
          const currentRow = workSheet.getRow(i);
          const productId = currentRow.getCell(1).value;

          const productData = {
            name: currentRow.getCell(2).value,
            price: currentRow.getCell(3).value,
            tags: currentRow
              .getCell(4)
              .value.split(",")
              .map((e) => ({ name: e })),
            description: currentRow.getCell(5).value,
            stock: currentRow.getCell(6).value,
          };

          if (productId) {
            console.log("id case");
            await Product.findOneAndUpdate(
              { _id: productId },
              { ...productData }
            );
          } else {
            console.log("new product case");
            const product = new Product({ ...productData });
            await product.save();
          }
        };
        await setProduct();
      }

      res.json({
        ok: true,
      });
    });
  },
};
const createProductsImages = {
  check: async (req, res, next) => {
    if (!req.files?.zip) {
      res.json({
        true: false,
        error: "El archivo zip es requerido",
      });
    } else {
      next();
    }
  },
  do: async (req, res, next) => {
    const filePath = req.files.zip.tempFilePath;
    const zip = new AdmZip(filePath);
    zip.extractAllTo("./output");
    fs.readdir("./output", (err, imagesFolder) => {
      imagesFolder.forEach((subFolder) => {
        fs.readdir("./output" + "/" + subFolder, (err, file) => {
          file.forEach((e) => {
            const fileId = e;
            fs.readdir(
              "./output" + "/" + subFolder + "/" + e,
              async (err, image) => {
                const product = await Product.findById(fileId);
                const resultUrl = await Promise.all(
                  image.map((element) => {
                    return cloudinary.uploader.upload(
                      `./output/${subFolder}/${e}/${element}`
                    );
                  })
                );
                product.images = resultUrl.map((e) => ({ url: e.secure_url }));
                const response = await product.save();
              }
            );
          });
        });
      });
    });
    res.json({
      ok: true,
    });
  },
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
  const priceQuery =
    minPrice && maxPrice ? { price: { ...minPrice, ...maxPrice } } : {};
  const tags = req.query.tags
    ? { "tags.name": { $in: JSON.parse(req.query.tags) } }
    : {};

  let [products, total] = await Promise.all([
    Product.find({ ...search, ...tags, ...priceQuery })
      .skip(page * 10)
      .limit(10)
      .lean(),
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

const getProductDetail = {
  do: async (req, res) => {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({
        ok: false,
        error: "No hay id en la petición",
      });
    }

    const product = await Product.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(id) },
      },
    ]);

    console.log("product", product);

    if (product.length > 0) {
      res.json({
        ok: true,
        product: product[0],
      });
    } else {
      res.status(404).json({
        ok: false,
        error: "Id invalido",
      });
    }
  },
};

const getAdminProducts = async (req, res) => {
  const page = Number(req.query.page) || 0;
  const regex = new RegExp(req.query.search, "i");
  const search = req.query.search ? { name: regex } : {};
  const minPrice = req.query.minPrice
    ? { $lte: Number(req.query.minPrice) }
    : null;
  const maxPrice = req.query.maxPrice
    ? { $lte: Number(req.query.maxPrice) }
    : null;
  const priceQuery =
    minPrice && maxPrice ? { price: { ...minPrice, ...maxPrice } } : {};
  const tags = req.query.tags
    ? { "tags.name": { $in: JSON.parse(req.query.tags) } }
    : {};

  let [products, count] = await Promise.all([
    Product.find({ ...search, ...tags, ...priceQuery })
      .skip(page * 10)
      .limit(10)
      .lean(),
    Product.find({ ...search, ...tags, ...priceQuery }).count(),
  ]);

  res.json({
    ok: true,
    data: products,
    pageInfo: count,
  });
};

const likeProduct = {
  check: (req, res, next) => {
    const schema = Joi.object({
      like: Joi.boolean().required(),
    });

    validation.validateBody(req, next, schema);
  },
  do: async (req, res) => {
    const { uid } = req;
    const { like } = req.body;
    const { id } = req.params;
    const targetProduct = await Product.findById(id);
    if (!targetProduct) {
      return res.status(404).json({
        ok: false,
        message: "El producto no existe",
      });
    }

    const targetUser = await User.findById(uid);
    if (like) {
      if (!targetUser.likedProducts.includes(targetProduct._id)) {
        console.log("producto incluido");
        targetUser.likedProducts = [
          ...targetUser.likedProducts,
          targetProduct._id,
        ];
      }
    } else {
      targetUser.likedProducts = targetUser.likedProducts.filter(
        (e) => e === targetProduct._id
      );
    }
    await targetUser.save();
    res.status(200).json({
      ok: true,
      targetUser,
    });
  },
};
const topProducts = async (req, res) => {
  const page = req.query.page || 0;

  const topProducts = await Sales.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products._id",
        count: {
          $sum: "$products.quantity",
        },
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
        _id: 0,
        productData: "$product_data",
        count: 1,
      },
    },

    {
      $facet: {
        metadata: [{ $count: "count" }],
        data: [
          { $skip: page * 10 },
          { $limit: 10 },
          { $sort: { "product_data.price": -1 } },
        ],
      },
    },
  ]);

  console.log("top products", topProducts[0].data);
  console.log("top products metadata", topProducts[0].metadata);

  res.json({
    ok: true,
    data: topProducts[0].data,
    metadata: topProducts[0].metadata,
  });
};
module.exports = {
  createProduct,
  getProducts,
  likeProduct,
  topProducts,
  createProductsFromExcel,
  createProductsImages,
  getAdminProducts,
  getProductDetail,
  editProduct,
};
