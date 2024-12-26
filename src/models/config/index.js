const { Schema, model } = require("mongoose");

const ConfigSchema = Schema(
  {
    subdomainId: { type: Schema.Types.ObjectId, ref: "Tenants" },

    palette: {
      primary: { type: String },
    },
  },
  { colletion: "Congis", timestamps: true }
);

module.exports = model("Configs", ConfigSchema);
