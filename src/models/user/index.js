const { string } = require("joi");
const { Schema, model } = require("mongoose");

const UserSchema = Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  email:{
    type:String,
    unique:true
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    validate(value) {
      if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        throw new Error(
          "Password must contain at least one letter and one number"
        );
      }
    },
  },
  provider: {
    type: String,
    default: "web",
  },

}, {
    collection: "Users",
    timestamps: true 
});

module.exports = model("User", UserSchema)