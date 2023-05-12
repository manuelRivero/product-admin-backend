import Notification from "./model.js";

export const list = {
  do: async (req, res, next) => {
    const page = Number(req.query.page) || 0;

    const [notifications, total ] = await Promise.all([Notification.find()
      .skip(page * 10)
      .limit(10)
      .lean(), Notification.find().count()]) 
    res.status(200).json({
      ok: true,
      notifications,
      total
    });
  },
};
