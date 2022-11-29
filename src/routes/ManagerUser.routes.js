const express = require("express");
const router = express.Router();

const managerUserController = require("../controlers/ManagerUser.controler");



const {
    authenticateToken
} = require('../../middlewares/auth.middleware')


 

//router.get("/",  authenticateToken, managerUserController.getAll);


router.get("/",   managerUserController.getAll);
router.post("/:id",  authenticateToken, managerUserController.create);
router.get("/:id",  authenticateToken, managerUserController.getById);
//router.get("/filtered/:fiscalyear?/:fiscalquarter?/:fiscalmonth?/",  managerUserController.getByIdInPeriod);
router.get("/idorigin/:id",  authenticateToken, managerUserController.getByOriginId);



router.get("/auth/findby/:login?/:password?",  authenticateToken, managerUserController.getByUsernamePassword);
router.put("/:id",   managerUserController.update);
router.delete("/:id",  authenticateToken, managerUserController.delete);



module.exports = router;