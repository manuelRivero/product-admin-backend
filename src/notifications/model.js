import { Schema, model } from "mongoose";

const Notifications = Schema(
  {
    type: {
      type: String,
      require: true,
    },
    body: {
      type: String,
      require: true,
    },
    readed: {
      type: Boolean,
      require: true,
    },
  },
  { colection: "notifications", timestamps: true }
);

export default model("Notifications", Notifications);
