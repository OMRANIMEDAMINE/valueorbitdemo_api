const logger = require('../../config/logger');
const ItemModel = require("../models/Item.model");
const OpportunityModel = require("../models/Opportunity.model");
 

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204).send("no_data");
    return;
  }
};


 
exports.findByItemId = async (req, res) => {  
  const {
    id
  } = req.params;
  try {
    const finded = await ItemModel.findById(id).populate(['messages']);

    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



 
exports.findByOppoId = async (req, res) => {  
  const {
    id
  } = req.params;
  try {
    const finded = await ItemModel.findById(id).populate(['messages']);

    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};






exports.getByItemIdandOpportunityId = async (req, res) => {
  try {
    //const { id } = req.params;
    var query = {};

    if (req.query.item_id) {
      query["item_id"] = req.query.item_id
    }

    if (req.query.opportunity_id) {
      query["opportunity_id"] = req.query.opportunity_id
    }

    const finded = await DiscussionModel
      .findOne({
        item: query["item_id"],
        opportunity: query["opportunity_id"],
      })
      .populate(['messages']);

    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

 
 


exports.getByOpportunityId = async (req, res) => {

  try {
    const {
      id
    } = req.params;
    const finded = await DiscussionModel
      .findOne({
        opportunity: id
      }).populate(['messages']);
    res.status(200).json({
      success: true,
      data: finded
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
    const data = req.body;
    //const { id } = req.params;
    var query = {};

    if (req.query.item_id) {
      query["item_id"] = req.query.item_id;
    }

    if (req.query.opportunity_id) {
      query["opportunity_id"] = req.query.opportunity_id;
    }
    //validate data as required
    verifyData(res, req.body);
    const newOne = new DiscussionModel(data);

    newOne.item = query["item_id"]; // <=== Assign  id  
    newOne.opportunity = query["opportunity_id"]; // <=== Assign  id 
    newOne.createddate = Date.now();
    //console.log("newOne " + newOne);  
    await newOne.save();

    //Add To Item
    //const relatedOne = await ItemModel.findById({
    //  _id: newOne.item
    //})
    //relatedOne.items.push(newOne);
    //await relatedOne.save();

    //Add To Opportunity
    const relatedOpportunity = await OpportunityModel.findById({
      _id: newOne.opportunity
    })
    relatedOpportunity.discussions.push(newOne);
    await relatedOpportunity.save();


    //Add To Item
    const relatedItem = await ItemModel.findById({
      _id: newOne.item
    })
    relatedItem.discussions.push(newOne);
    await relatedItem.save();



    res.status(200).json({
      success: true,
      data: newOne
    })


  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.update = async (req, res) => {
  //data validator
  verifyData(res, req.body);
  const data = req.body;
  //console.log("data " + data);
  const {
    id
  } = req.params;
  //console.log("id " + id);

  try {
    //console.log("Valid Id Param " + id);
    const edited = await DiscussionModel.findByIdAndUpdate(id, data);

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
  const {
    id
  } = req.params;
  //console.log(id);
  try {
    const deleted = await DiscussionModel.findById(id);
    if (deleted) deleted.remove()
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