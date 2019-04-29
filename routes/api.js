/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const shortid = require('shortid')

module.exports = function (app) {
  MongoClient.connect(MONGODB_CONNECTION_STRING,
                      { useNewUrlParser: true },
                      function(err, db) {
    const dbo = db.db("fcc-projects");
    if(err){console.log(err)}
    else console.log('successful db connection...')
    
    app.route('/api/books')
      .get(function (req, res){
        dbo.collection('books')
          .find({})
          .toArray((err,result)=>{
          if(err)console.log(err)
          if(result){
            const data = result.map(d=>{
              return {
                _id: d._id,
                title: d.title,
                commentcount: d.comments.length
              }
            });
            res.send(data)
          }else{
            
          }
          
        })
        //response will be array of book objects
        //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      })

      .post(function (req, res){
        var title = req.body.title;
        if(title == null || title == ''){
          res.send('title required')
          return;
        }
        dbo.collection('books')
          .insertOne({
            _id: shortid.generate(),
            title: title,
            comments: []
          },(err,data)=>{
            if(err)console.log(err)
            res.send(data)
          })
        //response will contain new book object including atleast _id and title
      })

      .delete(function(req, res){
        dbo.collection('books').deleteMany({},(err,data)=>{
          if(err)console.log(err)
          else res.send('complete delete successful')
        })
        
        //if successful response will be 'complete delete successful'
      });



    app.route('/api/books/:id')
      .get(function (req, res){
        var bookid = req.params.id;
        if(req.body != {}){
          dbo.collection('books')
            .findOne({_id: bookid},(err,data)=>{
              if(data){
                res.send(data)
              }else{
                res.status(403).send('book does not exist')
              }
          })
        }
        if(req.body == {}){
          res.status(403).send('no book exists')
        }
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      })

      .post(function(req, res){
        var bookid = req.params.id;
        var comment = req.body.comment;
        console.log('post2...', bookid, comment)
        dbo.collection('books')
          .updateOne({_id: bookid},
                     {$push:{comments:comment}},
                     (err,data)=>{
          res.send(data)
        })
        //json res format same as .get
      })

      .delete(function(req, res){
        var bookid = req.params.id;
        dbo.collection('books')
          .deleteOne({_id: bookid},
                     (err, data) => {
          if(err)console.log(err)
          else res.send('delete successful')
        })
        //if successful response will be 'delete successful'
      });

  })
}
