if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const expressError = require('./utils/expressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');

//connects and gets rid of depreciation warnings
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
//creates an instance of express
const app = express();
//layout, partial and block template functions for the EJS template engine
app.engine('ejs', ejsMate);
//sets ejs as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
//allows the use of the files in public
app.use(express.static(path.join(__dirname, 'public')))
//makes every route use /campgrounds, and uses the campgrounds routes

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
//so you dont have to login for every request, must be after session
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//how to store user in session
passport.serializeUser(User.serializeUser());
//how to user out of the session
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    //even tho called locals can be used on any template
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', usersRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', (req, res) => {
    //loads home.ejs
    res.render('home')
});
//runs if route is not matched first,* means any kind of route
app.all('*', (req, res, next) => {
    //saves to new express error
    next(new expressError('page not found', 404))
});
//catch all for any error
//goes thru client side validation before server side validation
app.use((err, req, res, next) => {
    //destructes the new express error, you need to set default for statusCode and message
    const { statusCode = 500 } = err;
    //passes thru status code and message
    if (!err.message) err.message = 'Oh no'
    res.status(statusCode).render('error', { err })
});
//starts the server on port 3000
app.listen(3000, () => {
    console.log('Serving on port 3000')
});