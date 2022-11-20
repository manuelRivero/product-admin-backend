import Notification from "./model.js";

export const list = {
  do: async (req, res, next) => {
    const page = Number(req.query.page) || 0;

    const notifications = await Notification.find()
      .skip(page * 10)
      .limit(10)
      .lean();
    res.status(200).json({
      ok: true,
      notifications,
    });
  },
};
