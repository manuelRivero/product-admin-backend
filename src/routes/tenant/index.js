const {Router} = require("express");
const { verifyTenant, getTenantConfig } = require("../../controllers/tenats");


const router = Router();


router.get('/verify-tenant', verifyTenant)
router.get('/get-tenant-config', getTenantConfig)

module.exports = router