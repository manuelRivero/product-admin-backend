import { io } from "./../../index.js";
import Notifications from "./../";

io.on("notification-readed", (notifications) => {
  notifications.forEach(async (element) => {
    await Notifications.findByIdAndUpdate(element.id, {
      readed: true,
    });
  });
});
