const logger = require('../../config/logger');
const CategoryModel = require("../models/Category.model");
const ProcessFlowModel = require("../models/ProcessFlow.model");
const ItemModel = require("../models/Item.model");

const mongoose = require("mongoose");

var _ = require("lodash");

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204).send("no_data");
    return;
  }
};


exports.getAll = async (req, res) => {
  try {
    const finded = await CategoryModel
      .find()
      .populate({
        path: 'items',
        populate: {
          path: 'messages',
        }
      });


    res.status(200).json({
      success: true,
      data: finded
    })
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



/* 
exports.getByProcessFlowId = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const finded = await CategoryModel
      .find({
        processflow: id
      })
      .populate({
        path: 'items',
        populate: ['messages']
      });

    var tab_totalitems = [];
    var tab_coaching = [];
    var tab_completed = [];

    var totalitems = 0;
    var coaching = 0;
    var completed = 0;


    if (finded) {
      totalcategories = finded.length;
      if (finded.length != 0) {
        finded.forEach(async (category) => {
          totalitems = category.items.length;
          coaching = 0;
          completed = 0;
          if (category.items.length != 0) {
            category.items.forEach(async (item) => {
              totalitems++;
              if (item.discussions.length != 0) {
                item.discussions.forEach(async (discussion) => {
                  //if ((discussion.isopinongived == true) && (discussion.manageropinion == 2)) {completed = completed + 1;}
                  if (discussion.isopinongived == true) {
                    coaching++;
                  }
                  if ((discussion.issalesfeelgived == true) && (discussion.salesfeel == 2)) {
                    completed++;
                  }
                });
              }
            });

          }
          tab_totalitems.push(category.items.length);
          tab_coaching.push(coaching);
          tab_completed.push(completed);

        });
      }

    }


    res.status(200).json({
      success: true,
      data: finded,
      totalcategories,
      tab_totalitems,
      tab_coaching,
      tab_completed
    })
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


 */

/* exports.getByProcessFlowId = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const finded = await CategoryModel
      .find({
        processflow: id
      })
      .populate({
        path: 'items',
        populate: {
          path: 'messages',
        }
      });

    console.log(finded);
    var totalcategories = finded.length;
    var tab_totalitems = [];
    var tab_coaching = [];
    var tab_completed = [];

    for (let category of finded) {
      tab_totalitems.push(category.items.length);
      var coaching = 0;
      var completed = 0;
      for (let item of category.items) {
        //if ((discussion.isopinongived == true) && (discussion.manageropinion == 2)) {completed = completed + 1;}
        if (item.isopinongived == true) {
          coaching++;
        }
        if ((item.issalesfeelgived == true) && (item.salesfeel == 2)) {
          completed++;
        }

      }
      tab_coaching.push(coaching);
      tab_completed.push(completed);

    }


    res.status(200).json({
      success: true,
      data: finded,
      totalcategories,
      tab_totalitems,
      tab_coaching,
      tab_completed
    })
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
 */









exports.getById = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await CategoryModel
      .findById(id)
      .populate({
        path: 'items',
        populate: ['messages']
      });
    res.status(200).json({
      success: true,
      data: finded
    })
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


/* exports.getByProcessFlowd = async (req, res) => {

  const {
    id
  } = req.params;


  try {
    if (mongoose.types.objectid.isvalid(id)) {
      var query = {
        processflow_id: new ObjectId(id)
      };
      //console.log("Valid Id Param " + id);
      const data = await CategoryModel.find(query);
      res.status(200).json(data);
    } else {
      //console.log("inValid Id Param " + id);
      res.status(200).json(null);
    }
  } catch (error) {
 logger.error(error.message);
    res.status(400).json(error);
  }
};
 */




exports.create = async (req, res) => {
  try {
    const data = req.body;
    const {
      id
    } = req.params;
    //validate data as required
    verifyData(res, req.body);
    const newOne = new CategoryModel(data);
    //console.log("newOne " + newOne);
    newOne.processflow = id; // <=== Assign category id from param  to category key
    //console.log("category " + newOne.category);
    newOne.createddate = Date.now();
    await newOne.save();

    const relatedOne = await ProcessFlowModel.findById({
      _id: newOne.processflow
    })

    relatedOne.categories.push(newOne);
    await relatedOne.save();
    res.status(200).json({
      success: true,
      data: newOne
    })

    // N.B UPDATE CATEGORY ecraser --> ADD $push

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
};





exports.update = async (req, res) => {
  //data validator
  verifyData(res, req.body);
  const data = req.body;
  const {
    id
  } = req.params;
  try {
    //console.log("Valid Id Param " + id);
    const edited = await CategoryModel.findByIdAndUpdate(id, data);

    // console.log("inValid Id Param " + id);
    res.status(200).json({
      success: true,
      data: edited
    })
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
    const deleted = await CategoryModel.findByIdAndDelete(id);
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

/* exports.delete = async (req, res) => {
  const {
    id
  } = req.params;
  //console.log(id);
  try {
    const deleted = await CategoryModel.findByIdAndDelete(id);
    if (!deleted) console.log("item not found");

    ProcessFlowModel.findOneAndUpdate(deleted.processflow, {
      $pull: {
        categories: {
          _id: deleted._id
        }
      }
    }, function (error, result) {
      console.log(result);
    });

    if (deleted.items.length != 0) {
      deleted.items.forEach(async (element) => {
        //console.log(element);
        const subitemdeleted = await ItemModel.findByIdAndDelete(element._id);
        if (!subitemdeleted) console.log("item not found");
      });
    }
    //const deleted = await OpportunityModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      data: deleted
    })
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; */


exports.getByProcessFlowId = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const finded = await CategoryModel
      .find({
        processflow: id
      })
      .populate('items');

    // console.log(finded);
    var totalcategories = finded.length;
    var tab_totalitems = [];
    var tab_coaching = [];
    var tab_completed = [];

    for (let category of finded) {
      tab_totalitems.push(category.items.length);
      var coaching = 0;
      var completed = 0;
      for (let item of category.items) {
        //if ((discussion.isopinongived == true) && (discussion.manageropinion == 2)) {completed = completed + 1;}
        if (item.isopinongived == true) {
          coaching++;
        }
        if ((item.issalesfeelgived == true) && (item.salesfeel == 2)) {
          completed++;
        }

      }
      tab_coaching.push(coaching);
      tab_completed.push(completed);

    }


    res.status(200).json({
      success: true,
      data: finded,
      totalcategories,
      tab_totalitems,
      tab_coaching,
      tab_completed
    })
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};