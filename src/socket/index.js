import Notifications from "./../notifications/model";

export default (io) => {
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
