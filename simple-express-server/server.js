var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//Allow all requests from all domains & localhost
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var animals = [
    "puppy",
    "kitten",
    "ferocious bear",
    "penguin",
    "parrot"
];

var posts = [{
	id:1,
	title:'Title1',
   author: 'Author 1',
   tags:'Tag1',
   date_submitted: '12/10/2016',
   code: 'var x',
   comments:[{text:'hello'}]
},
{
	id:2,
	title:'Title 2',
   author: 'Author 2',
   tags:['Tag1'],
   date_submitted: '14/10/2016',
   code: 'return y',
   comments:[]
}]


app.get('/animals', function(req, res) {
    res.send(animals);
});

app.get('/posts', function(req, res) {

    res.send(posts);
});

app.get('/postId', function(req, res) {
	var postId = req.query.id;
	console.log(postId);
	posts.forEach(function(post){
		if (post.id == postId){
			console.log(post);
			res.send(post);
		}
	})
});

app.post('/animals', function(req, res){
	console.log(req.body);
  

	animals.push(req.body.data);
});

app.post('/posts', function(req, res){
  console.log('received: ',req.body.data);
  var dataObj = JSON.parse(req.body.data);

  var existingPost = posts.find(function(post){
    return post.id == dataObj.id
   })

  if (existingPost){
    for (var k in dataObj){
      if (k != 'comment'){
      existingPost[k] = dataObj[k]
      } else{
        existingPost['comments'].push(dataObj.comment)
      }

    }
  } else {
    posts.push(dataObj)
  }

});


app.listen(6060);
