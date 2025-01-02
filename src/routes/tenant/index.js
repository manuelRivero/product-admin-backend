const {Router} = require("express");
const { verifyTenant, getTenantConfig, verifyAdminTenant } = require("../../controllers/tenats");


const router = Router();


router.get('/verify-tenant', verifyTenant)
router.get('verify-tenat-admin', verifyAdminTenant)
router.get('/get-tenant-config', getTenantConfig)

module.exports = router