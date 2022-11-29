const logger = require('../../config/logger');
const noteModel = require("../models/Note.model");
const oppoModel = require("../models/Opportunity.model");

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204);
    return;
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await noteModel.find()
      .populate({
        path: 'opportunity',
        select: 'id idorigin name',
        populate: [{
            path: 'account',
            select: ('id idorigin name  ')
          }
          /*  {
             path: 'manageruser',
             select: ('id idorigin'),
             populate: {
               path: 'salesusers',
               select: ('id idorigin')
             }
           } */
        ]
      }).sort({
        createddate: -1
      });
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllFilteredBy = async (req, res) => {
  try {
    var query = {};
    if (req.query.opportunity) {
      query["opportunity"] = req.query.opportunity
    }
    if (req.query.createdby) {
      query["createdby"] = req.query.createdby
    }
    const data = await noteModel.find(query)
      .populate({
        path: 'opportunity',
        select: 'id idorigin name',
        populate: [{
            path: 'account',
            select: ('id idorigin name  ')
          }
         /*  {
            path: 'manageruser',
            select: ('id idorigin'),
            populate: {
              path: 'salesusers',
              select: ('id idorigin')
            }
          } */
        ]
      }).sort({
        createddate: -1
      });
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

exports.getAllByOppoID = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("Id undefined");
    const data = await noteModel.find({
      'opportunity': req.params.id
    }).populate({
      path: 'opportunity',
      select: 'id idorigin name',
      populate: [{
          path: 'account',
          select: ('id idorigin name  ')
        }
        /*  {
           path: 'manageruser',
           select: ('id idorigin'),
           populate: {
             path: 'salesusers',
             select: ('id idorigin')
           }
         } */
      ]
    }).sort({
      createddate: -1
    });
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

exports.getById = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("Id undefined");
    const data = await noteModel.findById(req.params.id)
    .populate({
      path: 'opportunity',
      select: 'id idorigin name',
      populate: [{
        path: 'account',
        select: ('id idorigin name  ')
      },
      {
        path: 'manageruser',
        select: ('id idorigin'),
        populate: {
          path: 'salesusers',
          select: ('id idorigin  ')
        }
      }]
    }).sort({
      createddate: -1
    });

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

exports.create = async (req, res) => {
  try {
     //console.log(" HII create")
    //data validator
    if (req.body == "undefined") throw TypeError("request body undefined");
    if (!req.query.opportunity_id) throw TypeError("opportunity_id undefined");
    if (!req.query.user_id) throw TypeError("user_id undefined");
    const user_id = req.query.user_id;
    const opportunity_id = req.query.opportunity_id;
    verifyData(res, req.body);

    //seeking and setting the related opportunity
    const relatedOne = await oppoModel.findOne({
      idorigin: opportunity_id
    })

   // console.log(" relatedOne._id;")
   // console.log(relatedOne._id)
 /*    const relatedOne = await oppoModel.findById({
      _id: opportunity_id
    }) */
    if (!relatedOne) throw TypeError(`Related opportunity with ID ${opportunity_id} is not found `);
    const newOne = new noteModel({
      ...req.body
    });
    newOne.createddate = Date.now();
    newOne.opportunityid = opportunity_id;
    newOne.createdby = user_id;
    newOne.opportunity = relatedOne._id;
    const saved = await newOne.save();
 
    //update notes..under oppo
    await oppoModel.findOneAndUpdate({
      id: relatedOne._id
    }, {
      $push: {
        notes: saved
      }
    });

    res.status(200).json({
      success: true,
      data: saved
    });

  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("Id undefined");
    if (req.body == "undefined") throw TypeError("request body undefined");
    verifyData(res, req.body);

    const edited = await noteModel.findByIdAndUpdate(req.params.id, {
      ...req.body,
      createddate: Date.now(),
    });
    res.status(200).json({
      success: true,
      data: edited
    });
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("Id undefined");
    const todeleted = await noteModel.findById(req.params.id);
    if (!todeleted) throw TypeError(`Note with ID ${req.params.id} is not found `);

    //seeking and setting the related opportunity
    const relatedOne = await oppoModel.findById({
      _id: req.params.id
    })
    if (relatedOne) {
      await oppoModel.findOneAndUpdate({
        id: relatedOne._id
      }, {
        $pull: {
          notes: todeleted
        }
      });
    }

    const deleted = await noteModel.findByIdAndDelete(req.params.id);
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