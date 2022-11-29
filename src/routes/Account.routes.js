const express = require("express");
const router = express.Router();
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

const accountController = require("../controlers/Account.controller");
router.get("/region/names", authenticateToken, accountController.getAllRegionNames);
router.get("/country/names", authenticateToken, accountController.getAllCountryNames);

router.get("/",  authenticateToken, accountController.getAll);
router.get("/by/manager/:id",  authenticateToken, accountController.getAllByManagerID_Origin);
router.get("/by/sales/:id",  authenticateToken, accountController.getAllBySalesID_Origin);
router.get("/:id",  authenticateToken, accountController.getById);
router.post("",  authenticateToken, accountController.create);
router.put("/:id",  authenticateToken, accountController.update);
//router.put("/correction/go/",  authenticateToken, accountController.updatetest);
router.delete("/:id",  authenticateToken, accountController.delete);

module.exports = router;