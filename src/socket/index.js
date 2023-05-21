const Notifications = require("./../notifications/model");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("notification-readed", (notifications) => {
      notifications.forEach(async (element) => {
        await Notifications.findByIdAndUpdate(element._id, {
          readed: true,
        });
      });
    });
  });
};
