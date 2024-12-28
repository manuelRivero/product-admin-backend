const Tenant = require("../../models/tenant");

const tenantMiddleware = async (req, res, next) => {
    try {
        const { tenant } = req.query; // O usa req.headers.host para subdominios
        const config = await Tenant.findOne({ subdomain: tenant }).lean();

        console.log('tenant config', config)
        if (!config) {
            return res.status(404).json({ ok: false, message: "Tenant not found" });
        }
        req.tenantConfig = config;
        req.tenant = tenant;
        next();
    } catch (error) {
        console.error("Error loading tenant configuration:", error);
        return res.status(500).json({ ok: false, message: "Server error" });
    }
};

module.exports = {
    tenantMiddleware
}