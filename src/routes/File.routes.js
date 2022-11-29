const express = require("express");
const router = express.Router();
const multer = require('multer');
const fileController = require("../controlers/File.controller");


const {
  authenticateToken
} = require('../../middlewares/auth.middleware')
//router.get("/names/go", authenticateToken, OpportunityStageController.getAllNames);



// ******** IMAGES Configs**********/
var storageImg = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './assets/img')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
})

const uploadImg = multer({
  storage: storageImg,
});
// ******** IMAGES Routes**********/
router.post("/image/upload", uploadImg.single("file"), fileController.uploadImage);
router.get("/image/:id", fileController.getByIdImage);
router.get("/image/", fileController.getAllImage);
router.put("/image/:id", uploadImg.single("file"), fileController.updateImage);
router.delete("/image/:id", fileController.deleteImage);


// ******** PDFs Configs**********/
var storagePdf = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './assets/pdf')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
})

const uploadPdf = multer({
  storage: storagePdf,
});



// ******** PDFs Routes**********/

router.post("/pdf/upload", uploadPdf.single("file"), fileController.uploadPDF);
router.get("/pdf/:id", fileController.getByIdPdf);
router.get("/pdf/", fileController.getAllImage);
router.put("/pdf/:id", uploadPdf.single("file"), fileController.updatePdf);
router.delete("/pdf/:id", fileController.deletePdf);


module.exports = router;
