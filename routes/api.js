/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose')
var {Schema} = mongoose;
const CONNECTION_STRING = process.env.DB;

let issueSchema = new Schema ({
  project: String,
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_by: {type: String, required: true},
  assigned_to: {type: String, default: " "},
  status_text: {type: String, default: " "},
  created_on: {type: Date, default: Date.now()},
  updated_on: {type:Date, default: Date.now()},
  open: {type: Boolean, default: true}
});

let Issues = mongoose.model('Issues', issueSchema)
mongoose.connect(CONNECTION_STRING, function(err, db) {
  if(err){
  console.log("could not connect")
    }
  else{console.log("connected to mongoDB")}});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      let query = req.query;
      query.project = project;
      Issues.find(query,(err,issues)=>{
        res.send(issues)
      })
    })
    
    .post(function (req, res){
      var project = req.params.project;
    
      let bodyKeys = Object.keys(req.body);    
      let issueObj = {project: project};
      for(let key in bodyKeys){
        issueObj[bodyKeys[key]] =req.body[bodyKeys[key]]
      }
    
      let issue = new Issues(issueObj)
      let error = false;
      issue.save((err)=>{
        if(err){
          error = true;
          res.json({error:"need to fill out required fields"})
        }else{
          res.json({issue_title:issue.issue_title,
                issue_text: issue.issue_text,
                created_by:issue.created_by, 
                assigned_to:issue.assigned_to,
                status_text:issue.status_text,
                created_on:issue.created_on,
                updated_on:issue.updated_on,
                open:issue.open,
                id:issue._id})
        }
      });
      
    
      
      })
    
    
    .put(function (req, res){
      var project = req.params.project;
      Issues.findOne({_id:req.body._id},(err,issue)=>{
        if(err){
          res.send("could not update "+req.body._id)
        }
        else{
          let bodyKeys = Object.keys(req.body);
          
          for(let param in req.body){
          issue[param] = req.body[param]
        }
          issue.updated_on = Date.now();
          issue.save();
          if(bodyKeys.length===0){
            res.send("no updated field sent")
          }
          else{
            res.send('successfully updated')
          }
        }
        
      })
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      if(!req.body._id){
        res.send("_id error, no id sent")
      }
      Issues.deleteOne({_id:req.body._id},(err)=>{
        if(err){
          res.send("could not delete" + req.body._id)
        }else{
          res.send("deleted "+req.body._id)
        }
      })
    });
    
};
