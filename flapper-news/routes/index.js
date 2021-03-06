var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

//get all posts
router.get('/posts',function(req,res,next){
  Post.find(function(err,posts){
    if(err){return next(err);}

    res.json(posts);
  });
});

//create new post
router.post('/posts',function(req,res,next){
  var post = new Post(req.body);

  post.save(function(err,post){
    if(err){return next(err);}

    res.json(post);
  });
});

// map logic to route parameter 'post'
router.param('post',function(req,res,next,id){
  var query = Post.findById(id);

  query.exec(function(err,post){
    if(err) {return next(err);}
    if(!post){return next(new Error('can\'t find post'));}

    req.post = post;
    return next();
  });
});

//map logic to route parameter 'comment'
router.param('comment',function(req,res,next,id){
  var query = Comment.findById(id);

  query.exec(function(err,comment){
    if(err){return next(err);}
    if(!comment){
      return next(new Error("cant't find comment"));}

    req.comment = comment;
    return next();
  });
});

//get single post
router.get('/posts/:post',function(req,res){
  req.post.populate('comments',function(err,post){
    res.json(post);
  });

});

//delete post
router.delete('/posts/:post',function(req,res){
  req.post.comments.forEach(function(id){
    Comment.remove({
      _id:id,
    },function(err){
      if(err){return next(err);}
    });
  });
  Post.remove({
    _id:req.params.post
  },function(err){
    if(err){return next(err);}
    Post.find(function(err,posts){
      if(err){ return next(err);}
      res.json(posts);
    });
  });

});

//upvote post
router.put('/posts/:post/upvote',function(req,res,next){
  req.post.upvote(function(err,post){
    if(err){return next(err);}

    res.json(post);
  });
});

//upvote comment
router.put('/posts/:post/comments/:comment/upvote',function(req,res,next){
  req.comment.upvote(function(err,comment){
    if(err){return next(err);}
    res.json(comment);
  });
});

//post comment
router.post('/posts/:post/comments',function(req,res,next){
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err,comment){
    if(err){return next(err);}

    req.post.comments.push(comment);
    req.post.save(function(err,post){
      if(err){return next(err);}

      res.json(comment);
    });
  });
});



module.exports = router;
