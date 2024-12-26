const Sale = require("./../../models/sales");
const Product = require("./../../models/product");
const User = require("./../../models/user");
const validation = require("./../../helpers/validate");
const mongoose = require("mongoose");
const mercadoPago = require("mercadopago");
const moment = require("moment");
const { orderStatus } = require("./const");
const Joi = require("joi");
const { finalPrice } = require("../../helpers/product");

const { MercadoPagoConfig, Payment, Preference } = mercadoPago;

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: { timeout: 5000, idempotencyKey: "abc" },
});
const payment = new Payment(client);

const createSaleFromAdmin = {
  check: async (req, res, next) => {
    const schema = Joi.object({
      paymentMethod: Joi.number().required().valid(1, 0),
      products: Joi.array()
        .items(
          Joi.object({
            _id: Joi.string().required(),
            quantity: Joi.number().required(),
          })
        )
        .required(),
    });
    validation.validateBody(req, next, schema);
  },
  do: async (req, res, next) => {
    const { uid } = req;
    const { products, paymentMethod } = req.body;
    const errorProducts = [];
    products.forEach(async (element) => {
      if (element.quantity <= 0) {
        errorProducts.push({
          _id: element._id,
          error: "Se envió una cantidad de cero",
        });
        return;
      }

      const targetProduct = await Product.findOne({
        _id: mongoose.Types.ObjectId(element._id),
      });
      if (!targetProduct) {
        errorProducts.push({
          _id: element._id,
          error: "No existe el producto",
        });
      }
    });

    if (errorProducts.length > 0) {
      res.status(400).json({
        ok: false,
        message: "No se pudo procesar la orden de los siguientes productos",
        errorProducts,
      });
      return;
    }

    let total = 0;

    for (product of products) {
      const targetProduct = await Product.findOne({
        _id: mongoose.Types.ObjectId(product._id),
      });
      if (targetProduct.stock < product.quantity) {
        errorProducts.push({ _id: product._id, error: "Producto sin stock" });
        return;
      }

      targetProduct.stock = targetProduct.stock - Number(product.quantity);

      product.name = targetProduct.name;
      product.price = targetProduct.price;
      product.discount = targetProduct.discount | null;

      await targetProduct.save();
      let discount = 0;
      if (targetProduct.discount) {
        discount = (targetProduct.price * targetProduct.discount) / 100;
        total =
          total + (targetProduct.price - discount) * Number(product.quantity);
      } else {
        total = total + targetProduct.price * Number(product.quantity);
      }
    }

    const sale = new Sale({
      products: products.map((e) => {
        return {
          data: {
            _id: e._id,
            name: e.name,
            price: e.price,
            discount: e.discount | null,
          },
          quantity: e.quantity,
        };
      }),
      user: { _id: uid },
      total,
      paymentMethod: paymentMethod,
      status: orderStatus[2],
    });

    try {
      await sale.save();
      res.status(200).json({
        ok: true,
        sale,
        errorProducts,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        message: "Sucedió un error al guardar la orden",
      });
      console.log("sale error", error);
    }
  },
};
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
const getSaleDetail = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({
      ok: false,
      message: "No se agrego el id de la orden en el request",
    });
  }

  const sale = await Sale.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
  ]);
  console.log("sale", sale);
  return res.json({
    ok: true,
    data: sale[0],
  });
};
const getSaleDetailWeb = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({
      ok: false,
      message: "No se agrego el id de la orden en el request",
    });
  }

  const sale = await Sale.aggregate([
    { $match: { paymentId: id } },
    { $unwind: '$products' },
    {
      $lookup: {
        from: 'products',
        localField: 'products.data._id',
        foreignField: '_id',
        as: 'product_data',
      },
    },
    {
      $addFields: {
        'products.details': '$product_data', // Añade todos los productos relacionados al campo `details`
      },
    },
    {
      $unset: 'product_data', // Opcional: elimina el campo product_data si no lo necesitas más
    },
    {
      $group: {
        _id: '$_id',
        paymentId: { $first: '$paymentId' },
        user: { $first: '$user' },
        status: { $first: '$status' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        name: { $first: '$name' },
        lastName: { $first: '$lastName' },
        dni: { $first: '$dni' },
        phone: { $first: '$phone' },
        postalCode: { $first: '$postalCode' },
        address: { $first: '$address' },
        products: { $push: '$products' },
      },
    },
  ]);
  
  
  console.log("sale", sale[0].products);
  return res.json({
    ok: true,
    data: sale[0],
  });
};
const changeSaleStatus = {
  check: async (req, res, next) => {
    const schema = Joi.object({
      paymentMethod: Joi.string().required(),
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
      if (req.body.paymentMethod) {
        sale.paymentMethod = req.body.paymentMethod;
      } else {
        if (!sale.paymentMethod) {
          sale.paymentMethod = null;
        }
      }
      await sale.save();
      res.json({
        ok: true,
        id: sale._id,
        status: sale.status,
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

const sales = await Sale.aggregate([
  // Filtrar por período de tiempo
  {
    $match: {
      ...dateQuery,
      status: 'PAGADO', // Opcional: solo considerar ventas pagadas
    },
  },
  // Descomponer el array de productos
  { $unwind: '$products' },
  // Calcular el subtotal de cada producto considerando el descuento
  {
    $addFields: {
      'products.subtotal': {
        $multiply: [
          '$products.data.price',
          {
            $divide: [
              { $subtract: [100, '$products.data.discount'] },
              100,
            ],
          },
          '$products.quantity',
        ],
      },
    },
  },
  // Agrupar por día y calcular el total de ventas por día
  {
    $group: {
      _id: {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }, // Formatear la fecha sin hora
      },
      total: { $sum: '$products.subtotal' }, // Sumar el total de ventas por día
    },
  },
  // Ordenar los resultados por fecha (opcional)
  {
    $sort: { _id: 1 }, // Orden ascendente por fecha
  },
]);

  
  console.log('getMonthlySales', sales)
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
  check: () => {}, // Puedes añadir validaciones si es necesario
  do: async (req, res, next) => {
    try {
      const date = req.query.from;

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
            _id: "$products.data._id", // Agrupamos por el ID del producto
            quantity: { $sum: { $toDouble: "$products.quantity" } },
            data: { $first: "$products.data" }, // Mantenemos la información del producto
            totalSales: {
              $sum: {
                $multiply: [
                  { $toDouble: "$products.quantity" },
                  {
                    $multiply: [
                      { $toDouble: "$products.data.price" },
                      { $subtract: [1, { $divide: [{ $toDouble: "$products.data.discount" }, 100] }] },
                    ],
                  },
                ],
              },
            },
          },
        },
      ]);

      // Sumar todas las ventas totales
      const total = sales.reduce((acc, sale) => acc + sale.totalSales, 0);

      res.status(200).json({
        ok: true,
        total,
        details: sales, // Incluye los detalles por producto si es útil
      });
    } catch (error) {
      console.error("Error calculating daily sales:", error);
      next(error); // Pasar el error al manejador de errores
    }
  },
};

const createSaleByClient = {
  do: async (req, res) => {
    const {
      email,
      name,
      lastName,
      dni,
      products,
      address,
      postalCode,
      phone,
    } = req.body;

    const {mercadoPagoToken} = req.session.tenantConfig
    const { tenant } = req;
    
    if (!mercadoPagoToken) {
      console.log("sin token de mercado pago")
        return res.status(400).json({ ok: false, message: "Mercado Pago credentials not configured" });
    }
    
    const client = new MercadoPagoConfig({
      accessToken: mercadoPagoToken,
      options: { timeout: 5000, idempotencyKey: "abc" },
    });
    try {
      const body = {
        items: products.map((product) => ({
          title: product.name,
          unit_price: finalPrice(product.price, product.discount),
          quantity: Number(product.quantity),
          currency_id: "ARS",
        })),
        auto_return: "approved",
        back_urls: {
          success: "https://ecommerce-front-rr7v.onrender.com/compra-exitosa",
          failure: "https://ecommerce-front-rr7v.onrender.com/compra-fallida",

        },
        payer: {
          email,
        },
        metadata: {
          user:email,
          name,
          lastName,
          dni,
          products,
          address,
          postalCode,
          phone,
          sub_domain: tenant,
        },
        notification_url: `https://product-admin-backend.onrender.com/api/sale/save-sale?mercadoPagoToken=${mercadoPagoToken}`,
      };
      console.log('mercado pago body', body)


      const preference = await new Preference(client);
      const response = await preference.create({ body });
      res.json(response);
    } catch (error) {
      console.log("createSaleByClient error", error);
    }
  },
};

const saveSaleByNotification = async (req, res) => {
  const { topic } = req.query;
  const { id, mercadoPagoToken } = req.query;
  console.log("req", req.query)

  const client = new MercadoPagoConfig({
    accessToken: mercadoPagoToken,
    options: { timeout: 5000, idempotencyKey: "abc" },
  });

  const payment = new Payment(client);


  if (topic === "payment") {
    // Si la notificación es de tipo pago
    try {
      const { metadata } = await payment.get({ id }); // Consultas el pago en MP

      const {
        user,
        name,
        last_name,
        dni,
        products,
        address,
        postal_code,
        phone,
        sub_domain
      } = metadata;
      console.log("metadata", metadata);

      const newSale = new Sale({
        tenant: sub_domain,
        status: "PAGADO",
        user,
        name,
        lastName: last_name,
        dni,
        products : products.map((product) =>({ quantity: product.quantity, data: {...product}})),
        paymentId: id,
        address,
        postalCode: postal_code,
        phone,
      });
      const response = await newSale.save();
      console.log('response', response)
      res.sendStatus(200);
      // Procesa la información del pago según tus necesidades
    } catch (error) {
      console.error("Error al consultar el pago:", error);
      res.sendStatus(500);
    }
  }
};

module.exports = {
  createSale,
  getSales,
  totalByDate,
  dailySales,
  getMonthlySales,
  changeSaleStatus,
  createSaleFromAdmin,
  getSaleDetail,
  createSaleByClient,
  saveSaleByNotification,
  getSaleDetailWeb,
};
