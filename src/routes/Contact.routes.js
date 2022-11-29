const express = require("express");
const router = express.Router();

const contactController = require("../controlers/Contact.controller");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')


router.get("/",  authenticateToken,  contactController.getAll);
router.get("/names/go/",  authenticateToken, contactController.getAllNames);
router.get("/names/account/:id",   contactController.getAllNamesByAccountID);
router.get("/names/sales/:id",  authenticateToken, contactController.getAllNamesBySalesID);
router.get("/names/manager/:id",  authenticateToken, contactController.getAllNamesByManagerID);

router.get("/:id",  authenticateToken, contactController.getById);
router.post("",  authenticateToken, contactController.create);
router.put("/:id",  authenticateToken, contactController.update);
router.delete("/:id",  authenticateToken, contactController.delete);


module.exports = router;