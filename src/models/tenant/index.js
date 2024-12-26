const { Schema, model } = require("mongoose");

const TenantSchema = Schema(
  {
    subdomain: {
        type: String
    }
  },
  { colletion: "Tenants", timestamps: true }

);

module.exports = model("Tenant", TenantSchema);
