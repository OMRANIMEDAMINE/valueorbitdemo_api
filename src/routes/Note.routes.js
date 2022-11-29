const express = require("express");
const router = express.Router();
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

const noteController = require("../controlers/Note.controller"); 

//router.get("/",  authenticateToken, noteController.getAll);
router.get("/",   noteController.getAll);
router.get("/filteredby/opportunity/:id",   noteController.getAllByOppoID);
router.get("/filteredby/:opportunity?/:createdby?",   noteController.getAllFilteredBy);
router.get("/:id",   noteController.getById);
router.post("/:opportunity?/:createdby?",   noteController.create);
router.put("/:id",   noteController.update);
router.delete("/:id",   noteController.delete);

module.exports = router;