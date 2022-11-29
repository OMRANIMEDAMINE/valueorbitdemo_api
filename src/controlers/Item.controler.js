const logger = require('../../config/logger');
const ItemModel = require("../models/Item.model");
const CategoryModel = require("../models/Category.model");
const ProcessFlowModel = require("../models/ProcessFlow.model");


const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204).send("no_data");
    return;
  }
};

exports.getAll = async (req, res) => {
  try {
    const finded = await ItemModel.find();

/* 

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
              if (item.isopinongived == true) {
                coaching++;
              }
              if ((item.issalesfeelgived == true) && (item.salesfeel == 2)) {
                completed++;
              }
            });
          }
          tab_totalitems.push(category.items.length);
          tab_coaching.push(coaching);
          tab_completed.push(completed);
        });
      }
    }
 */

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

exports.getByProcessFlowId = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const finded = await ItemModel
      .find({
        processflow: id
      })
      .populate({
        path: 'items',
        populate: ['discussions']
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
              if (item.isopinongived == true) {
                coaching++;
              }
              if ((item.issalesfeelgived == true) && (item.salesfeel == 2)) {
                completed++;
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

exports.getByOpportunityId = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const finded = await ItemModel
      .find()
      .populate({
        path: 'items',
        match: {
          opportunity: {
            $eq: id
          }
        },
        populate: {
          path: 'messages',
        }
      });


    var totalcategories = finded.length;
    var tab_totalitems = [];
    var tab_coaching = [];
    var tab_completed = [];

    for (let category of finded) {
      tab_totalitems.push(category.items.length);
      var coaching = 0;
      var completed = 0;
      for (let item of category.items) {
        for (let discussion of item.discussions) {
          //if ((discussion.isopinongived == true) && (discussion.manageropinion == 2)) {completed = completed + 1;}
          if (discussion.isopinongived == true) {
            coaching++;
          }
          if ((discussion.issalesfeelgived == true) && (discussion.salesfeel == 2)) {
            completed++;
          }
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

exports.getById = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await ItemModel
      .findById(id)
      .populate( ['messages']);
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

exports.create = async (req, res) => {
  try {
    const data = req.body;
    const {
      id
    } = req.params;
    //validate data as required
    verifyData(res, req.body);
    const newOne = new ItemModel(data);
    //console.log("newOne " + newOne);
    newOne.category = id; // <=== Assign category id from param  to category key
    //console.log("category " + newOne.category);
     await newOne.save();

    const relatedOne = await CategoryModel.findById({
      _id: newOne.category
    })

    relatedOne.items.push(newOne);
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
    const edited = await ItemModel.findByIdAndUpdate(id, data);

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
  try {
    const todeleted = await ItemModel.findById(id);
    if (todeleted) {
      if (todeleted.options.length == 0) {
        //DELETE FROM Category Template  To Item
        const relatedOne = await CategoryModel.findById({
          _id: todeleted.category
        })

        relatedOne.items.pull(todeleted);
        await relatedOne.save();

        //SAVE DELETE
        todeleted.remove();

        res.status(200).json({
          success: true,
          data: todeleted
        });
      } else {
            logger.error(error.message)
    res.status(400).json({
          success: false,
          raison: "has relationships !"
        });
      }
    } else {
      res.status(200).json({
        success: false,
        data: todeleted
      });
    }

  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};