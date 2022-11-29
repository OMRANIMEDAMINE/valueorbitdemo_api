const logger = require('../../config/logger');
const MessageModel = require("../models/Message.model");
const ItemUpdateModel = require("../models/ItemUpdate.model");
const ItemModel = require("../models/Item.model");
const CategoryModel = require("../models/Category.model");
const OpportunityModel = require("../models/Opportunity.model");
const RedshiftOpportunityHistoryLogModel = require("../aws/RedshiftOpportunityHistoryLog.model");
const redshiftClient = require("../../config/redshiftConfig");
const short = require('short-uuid');
const {
  uuidEmit,
  uuidParse,
  uuidParseNano
} = require('uuid-timestamp');
let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}
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
    const finded = await MessageModel.find()
      .sort('-createddate');

    /*  .populate([ {
       path: 'item',
       populate: {
         path: 'category'
       },
       populate: {
         path: 'manageruser',
         select: '-password',
       },
       populate: {
         path: 'salesuser',
         select: '-password',
       }
     }]).sort('-createddate'); */
    //.sort({      _id: -1    });

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

exports.getById = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await MessageModel
      .findById(id); //.populate('item');

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

exports.getByItemId = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await MessageModel.find({
        item: id
      })
      .sort('-createddate');

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

exports.getByOppoId = async (req, res) => {
  try {
    const {
      id
    } = req.params;



    const finded = await MessageModel.find({
      opportunity: id
    }).sort('-createddate');


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

exports.getByOppoIdFilteredBy = async (req, res) => {
  try {
    const {
      id
    } = req.params;


    if (req.query.category_id) {
      // console.log("with category id");
      const finded = await MessageModel.find({
          opportunity: id
        }).sort('createddate')
        .populate([{
          path: 'item',
          //select: '_id name' ,   
          populate: {
            path: 'category',
            //select: '_id name',
            match: {
              _id: {
                $eq: req.query.category_id
              }
            }

          }
        }]);

      res.status(200).json({
        success: true,
        data: finded
      });


    } else {
      //console.log("without category id");

      const finded = await MessageModel.find({
          opportunity: id
        }).sort('createddate')
        .populate([{
          path: 'item',
          select: '_id name',
          populate: {
            path: 'category',
            select: '_id name'
          }
        }]);

      res.status(200).json({
        success: true,
        data: finded
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

exports.getByOppoIdFilteredBy2 = async (req, res) => {
  try {
    const {
      id
    } = req.params;

    var msgs = [];
    if (req.query.category_id) {
      //  console.log("with category id");
      const oppo = await OpportunityModel.findById(id)
        .populate([{
          path: 'processflow',
          select: ('categories'),
          populate: {
            path: 'categories',
            /*             $elemMatch: {
                 _id: req.query.category_id
               }, */
            select: ('items'),
            populate: {
              path: 'items',
              select: ('messages'),
              populate: {
                path: 'messages',
                select: ('-__v'),
                populate: {
                  path: 'item',
                  select: ('name'),
                  populate: {
                    path: 'category',
                    select: ('name'),

                  }
                }
              }
            }
          }
        }]);

      for (let category of oppo.processflow.categories) {
        if (category._id == req.query.category_id) {
          for (let item of category.items) {
            for (let msg of item.messages) {
              msgs.push(msg);
            }
          }
        }
      }
    } else {
      //console.log("without category id");

      const oppo = await OpportunityModel.findById(id)
        .populate([{
          path: 'processflow',
          select: ('categories'),
          populate: {
            path: 'categories',
            select: ('items'),
            populate: {
              path: 'items',
              select: ('messages'),
              populate: {
                path: 'messages',
                select: ('-__v'),
                populate: {
                  path: 'item',
                  select: ('name'),
                  populate: {
                    path: 'category',
                    select: ('name'),
                  }
                }
              }
            }
          }
        }]);

      for (let category of oppo.processflow.categories) {
        for (let item of category.items) {
          for (let msg of item.messages) {
            msgs.push(msg);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: msgs
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
    const opportunity_id = req.query.opportunity_id;
    const user_id = req.query.user_id;
    const item_id = req.query.item_id;

    var query = {};

    if (req.query.item_id) {
      query["item_id"] = req.query.item_id;
    }

    if (req.query.opportunity_id) {
      query["opportunity_id"] = req.query.opportunity_id;
    }

    if (req.query.user_id) {
      query["user_id"] = req.query.user_id;
    }

    const finded = await OpportunityModel.findById(opportunity_id);
    if (!finded) throw TypeError("Opportunity not found");


    //validate data as required
    verifyData(res, req.body);
    const newOne = new MessageModel(data);

    newOne.item = query["item_id"]; // <=== Assign  item id  
    newOne.opportunity = query["opportunity_id"]; // <=== Assign  opportunity id 
    newOne.createdby = query["user_id"]; // <=== Assign  opportunity id 
    newOne.createddate = Date.now();

    await newOne.save();

    const relatedItem = await ItemModel.findById({
      _id: newOne.item
    }).populate('category');

    if (!relatedItem) throw TypeError("relatedItem not found");
    relatedItem.messages.push(newOne);
    //take History in redshift log
    var objLog = new RedshiftOpportunityHistoryLogModel();
    const uuid = uuidEmit();
    const timestamp = uuidParse(uuid);
    const shortuuid = short.generate().substring(1, 6)
    const generatedID = (`${timestamp}${shortuuid}`)
    objLog.idorigin = generatedID;
    objLog.opportunityid = finded.idorigin;
    objLog.accountid = finded.accountid;
    objLog.createdbyid = query["user_id"];
    const dateTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000");
    objLog.createddate = dateTime;
    objLog.description = "UpdatePlaybook";
    objLog.stage = finded.stagename;
    objLog.resource = `${(relatedItem.category).name} - ${relatedItem.name} `;
    objLog.resourcetype = newOne.type;
    objLog.lastvalue = '';
    objLog.newvalue = newOne.value;
    objLog.opportunity = opportunity_id;
    objLog.account = finded.account;
    await takeHistoryLog(objLog);

    // Keep change history
    var newItemUpdate = new ItemUpdateModel();
    newItemUpdate.item = newItemUpdate._id;


    if ((newOne.type == "manageropinion") && (newOne.isrequest == true)) {
      (newOne.value == 1) ? relatedItem.isopinongived = false: relatedItem.isopinongived = true;
      relatedItem.manageropiniongiveddate = Date.now();
      relatedItem.manageropinion = newOne.value;
      //Keep change history
      newItemUpdate.isopinongived = true;
      newItemUpdate.manageropiniongiveddate = Date.now();
      newItemUpdate.manageropinion = newOne.value;
    }

    if ((newOne.type == "salesfeel") && (newOne.isrequest == false)) {
      (newOne.value == 1) ? relatedItem.issalesfeelgived = false: relatedItem.issalesfeelgived = true;
      relatedItem.salesfeelgiveddate = Date.now();
      relatedItem.salesfeel = newOne.value;
      //Keep change history
      newItemUpdate.issalesfeelgived = true;
      newItemUpdate.salesfeelgiveddate = Date.now();
      newItemUpdate.salesfeel = newOne.value;
    }






    const relatedItemSaved = await newItemUpdate.save();
    // relatedItem.itemupdates.push(relatedItemSaved);
    await relatedItem.save();

    const relatedItemsaved2 = await ItemModel.findOneAndUpdate({
      _id: relatedItem._id
    }, {
      $push: {
        itemupdates: relatedItemSaved._id
      }
    }, );


    const relatedOppo = await OpportunityModel.findById({
        _id: newOne.opportunity
      })
      .populate({
        path: 'processflow',
        populate: {
          path: 'categories',
          populate: {
            path: 'items',

          }
        }
      });

    if (relatedItemsaved2) {
      // console.log(finded);
      var totalcategories = relatedOppo.processflow.categories.length;
      var tab_totalitems = [];
      var tab_completed = [];
      var tab_coaching = [];

      relatedOppo.processflow.categories.forEach(async (category) => {
        tab_totalitems.push(category.items.length);
        var coaching = 0;
        var completed = 0;
        category.items.forEach(async (item) => {
          if (item.isopinongived == true) {
            coaching++;
          }
          if ((item.issalesfeelgived == true) && (item.salesfeel == 2)) {
            completed++;
          }
        });

        tab_completed.push(completed / (category.items.length));
        tab_coaching.push(coaching / (category.items.length));

        var comp = (completed / (category.items.length)) * 100;
        var coa = (coaching / (category.items.length)) * 100;

        await CategoryModel.findOneAndUpdate({
          _id: category._id
        }, {
          dealprogress: comp,
          dealcoaching: coa
        });


      });

      /*for (let category of relatedOppo.processflow.categories) {
        tab_totalitems.push(category.items.length);
        var coaching = 0;
        var completed = 0;
        for (let item of category.items) { 
          if (item.isopinongived == true) {
            coaching++;
          }
          if ((item.issalesfeelgived == true) && (item.salesfeel == 2)) {
            completed++;
          }
        }
        tab_completed.push(completed/(category.items.length));
        tab_coaching.push(coaching/(category.items.length));

      }*/


      //console.log("tab_completed: "+ tab_completed);
      const Sumtotalcompleted = tab_completed.reduce((a, b) => a + b, 0);
      const totalProgress = (Sumtotalcompleted / totalcategories) * 100;
      const totalProgressPercentage = Math.round((totalProgress + Number.EPSILON) * 100) / 100;


      //console.log("tab_coaching: "+ tab_coaching);
      const Sumtotalcoaching = tab_coaching.reduce((a, b) => a + b, 0);
      const totalcoaching = (Sumtotalcoaching / totalcategories) * 100;
      const totalcoachingPercentage = Math.round((totalcoaching + Number.EPSILON) * 100) / 100;


      relatedOppo.dealprogress = totalProgressPercentage;
      relatedOppo.dealcoaching = totalcoachingPercentage;
      //console.log("totalProgressPercentage : ", totalProgressPercentage)
      // console.log("totalcoachingPercentage : ", totalcoachingPercentage)
      const relatedOppoUpdated = await OpportunityModel.findOneAndUpdate({
        _id: relatedOppo._id
      }, {
        dealprogress: totalProgressPercentage,
        dealcoaching: totalcoachingPercentage,
      });

    }

    res.status(200).json({
      success: true,
      data: relatedItemsaved2
    })
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
  //console.log("data " + data);
  const {
    id
  } = req.params;
  //console.log("id " + id);

  try {
    //console.log("Valid Id Param : " + id);
    const edited = await MessageModel.findByIdAndUpdate(id, data);

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
    const deleted = await MessageModel.findByIdAndDelete(id);
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


 
async function takeHistoryLog(objLog) {
  try {
    console.log(`takeHistoryLog in progress . . ${objLog.createddate} `);
    //console.log(id) 
    let sql = `INSERT INTO ${process.env.DB_SCHEMA}.opportunityhistorylog (id, accountid, opportunityid, createdbyid, createddate, description, stage, resource, lastvalue, newvalue, opportunity , account, resourcetype )
VALUES ('${objLog.idorigin}', '${objLog.accountid}', '${objLog.opportunityid}', '${objLog.createdbyid}', '${objLog.createddate}' , '${objLog.description}', '${objLog.stage}' , '${objLog.resource}', '${objLog.lastvalue}', '${objLog.newvalue}', '${objLog.opportunity}' , '${objLog.account}' , '${objLog.resourcetype}'  )`;
    console.log(sql)
    await redshiftClient.query(sql, null);
    // do stuff with the eventual result and return something
  } catch (error) {
    throw Error(error);
  }
}  


