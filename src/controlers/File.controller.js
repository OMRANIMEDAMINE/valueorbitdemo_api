const logger = require('../../config/logger');
const mongoose = require('mongoose');

const fileModel = require('../models/File.model');

const fs = require('fs');

// ********** IMAGES *****************//
exports.uploadImage = async (req, res) => {
    try {
        //const imgsend = ""+process.env.PUBLIC_DIR + req.file.filename      
        const img = new fileModel({
            filename: req.file.filename,
            description: "Profile Image uploaded",
            isImage: true

        });
        const result = await img.save()

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
            logger.error(error.message)
    res.status(400).json({
            success: false,
            message: error.message
        });
    }
};



exports.getAllImage = async (req, res) => {
    try {
        const data = await fileModel.find();
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
            logger.error(error.message)
    res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getByIdImage = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await fileModel.findById(id);
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
            logger.error(error.message)
    res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateImage = async (req, res) => {
    try {
        //const data = req.body;
        //const reqfilename = req.file.filename;
        const { id } = req.params;
        const finded = await fileModel.findById(id);
        if (finded) {
            var filePath = '' + process.env.ASSETS_PATH_IMG + finded.filename; 
            fs.unlinkSync(filePath);
            finded.filename = req.file.filename;
            finded.description = "Profile Image uploaded";
            finded.isImage = true;
        }
        const result = await finded.save()
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
            logger.error(error.message)
    res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await fileModel.findByIdAndDelete(id);
        if (deleted) {
            var filePath = '' + process.env.ASSETS_PATH_IMG + deleted.filename;
            //console.log("filePath " + filePath);
            fs.unlinkSync(filePath);
        }
        res.status(200).json({
            success: true,
            data: deleted
        });
    } catch (error) {
            logger.error(error.message)
    res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// ********* PDFs *****************//
exports.uploadPDF = async (req, res) => {
    try {
        //const imgsend = ""+process.env.PUBLIC_DIR + req.file.filename
        const img = new fileModel({
            filename: req.file.filename,
            description: "PDF uploaded",
            isPDF: true
        });

        const result = await img.save()
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
            logger.error(error.message)
    res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllPdf = async (req, res) => {
    try {
        const data = await fileModel.find();
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
            logger.error(error.message)
    res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getByIdPdf = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await fileModel.findById(id);
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
            logger.error(error.message)
    res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updatePdf = async (req, res) => {
    const { id } = req.params;

    try {
        const finded = await fileModel.findById(id);
        if (finded) {
            var filePath = '' + process.env.ASSETS_PATH_IMG + finded.filename; 
            fs.unlinkSync(filePath); 
            finded.filename = req.file.filename;
            finded.description = "Profile Image uploaded";
            finded.isImage = true;
        }
        const result = await finded.save()
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
            logger.error(error.message)
    res.status(400).json({
            success: false,
            message: error.message
        });
    }
};



exports.deletePdf = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await fileModel.findByIdAndDelete(id);
        if (deleted) {
            var filePath = '' + process.env.ASSETS_PATH_PDF + deleted.filename;
            //console.log("filePath " + filePath);
            fs.unlinkSync(filePath);
        }
        res.status(200).json({
            success: true,
            data: deleted
        });
    } catch (error) {
            logger.error(error.message)
    res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
