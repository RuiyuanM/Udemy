const express = require('express');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(express.static('public/images')); 
// Map global promise - get rid of warning
mongoose.Promise = global.Promise; // HX: only Mongo 4 needed, Mongo 5 no need
// Connect to mongoose
//2nd option: mongoose.connect('mongodb://username:password@host:port/database?options...');
//2nd option from: https://mongoosejs.com/docs/4.x/docs/connections.html
mongoose.connect('mongodb://localhost/vidjot-dev', {
  useMongoClient: true
})
  .then(() => console.log('MongoDB Connected...'))//If your code does something asynchronous, then you can use promises and .then.
  .catch(err => console.log(err));

// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware  //To handle HTTP POST request in Express.js version 4 and above, you need to install middleware module called body-parser.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method override middleware
app.use(methodOverride('_method'));  //????

// Express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

// Global variables
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome to AI world';
  res.render('index', {
    title: title
  });
});

// Self_Driving_Car Route
app.get('/Self_Driving_Car', (req, res) => {
  res.render('Self_Driving_Car');
});

// Image_search Route
app.get('/Image_search', (req, res) => {
  res.render('Image_search');
});

// Facial_detection Route
app.get('/Facial_detection', (req, res) => {
  res.render('Facial_detection');
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Idea Index Page
app.get('/ideas', (req, res) => {
  Idea.find({})
    .sort({date:'desc'})
    .then(ideas => {
      res.render('ideas/index', {
        ideas:ideas
      });
    });
});

// Add Idea Form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add');
});

// Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    res.render('ideas/edit', {
      idea:idea
    });
  });
});

// Process Form
app.post('/ideas', (req, res) => {
  let errors = [];

  if(!req.body.title){
    errors.push({text:'Please add a title'});
  }
  if(!req.body.details){
    errors.push({text:'Please add some details'});
  }

  if(errors.length > 0){
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Machine Learning idea added');
        res.redirect('/ideas');
      })
  }
});

// Edit Form process
app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save()
      .then(idea => {
        req.flash('success_msg', 'Machine Learning idea updated');
        res.redirect('/ideas');
      })
  });
});

// Delete Idea
app.delete('/ideas/:id', (req, res) => {
  Idea.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Machine Learning idea removed');
      res.redirect('/ideas');
    });
});

const port = 5000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});