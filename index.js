var express                =  require('express'),
    app                    =  express(),
    bodyParser             =  require("body-parser"),
    mongoose               =  require("mongoose"),
    passport               =  require("passport"),
    pass                   =  require("passport"),
    LocalStrategy          =  require("passport-local"), 
    Localstrategy          =  require("passport-local"), 
    session                =  require("express-session"),
    ses                =  require("express-session"),
    admin                  =  require("./models/admin");
    user                   =  require("./models/user");

app.use(express.static(__dirname + '/public'));

  const server = app.listen(process.env.PORT||5000,function(){
    console.log("<<<<<<<<<<<<<<<<<<<<WELCOME DADDYPANTHER NAATS IS NOW ONLINE>>>>>>>>>>>>>>>>>>>>");
  });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//CONNECTING DATABASE//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

mongoose.connect('mongodb://127.0.0.1/attendance', { useNewUrlParser: true } , function(err, db){
  if (err){
    console.log('Unable to connect to the server. Please start the server. Error:', err);
  } 
  else{
    console.log('<<<<<<<<<<<<<<<<<WELCOME DADDYPANTHER NAATS DATA-BASE CONNECTED>>>>>>>>>>>>>>>>>');
  }
});
app.use(bodyParser.urlencoded({extended:true}));                //this line will be needed whenever ve are posting forms.
app.set("view engine","ejs");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PASSWORD CONFIGURATION/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(session({
  secret: "process.env.SESSIONSECRET",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());                                 //we will need these lines every time whenever we will use passsport module.
app.use(passport.session());                                    //we will need these lines every time whenever we will use passsport module.
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());                   //this is really important line as it is responsible for reading session taking the data from the session and encrepting it. 
passport.deserializeUser(user.deserializeUser());               //this is really important line as it is responsible for reading session taking the data from the session and decrripting it. 

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/',(req,res) => {
  res.render("landing");
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//AUTHENTICATION ROUTES//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/new',(req,res) => {
  res.render("new");
});

app.get("/submit",(req,res) => {
  res.render("submit");
}); 

app.post("/new",function(req,res){ 
  let newUser = new user({
    username:req.body.username,
    first_name:req.body.first_name,
    middle_name: req.body.middle_name,
    last_name:   req.body.last_name,
    gender: req.body.gender,
    email: req.body.email,
    mobile_number: req.body.mobile_number,
    Landline_number:  req.body.Landline_number });

    user.register(newUser,req.body.password, function(err,user){ 
        if(err)
          {
            console.log(err);
            return res.render("new");
          }
        res.redirect("/admin/admindashboard");
      });
});

app.get('/registerAdmin',(req,res) => {
  res.render("adminregister");
});

app.post("/registerAdmin",function(req,res){
  let newUser= new admin({
    username:req.body.username,
    first_name:req.body.first_name,
    middle_name: req.body.middle_name,
    last_name:   req.body.last_name,
    gender: req.body.gender,
    email: req.body.email,
    mobile_number: req.body.mobile_number,
    Landline_number:  req.body.Landline_number });

    admin.register(newUser,req.body.password, function(err,user){ 
        if(err)
          {
            console.log(err);
            return res.render("new");
          }
      
            res.redirect("/admin/admindashboard");
       
      });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LOGIN AUTH//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/login',(req,res) => {
  res.render("login")
});

app.post('/login', passport.authenticate("local", {
  successRedirect : "/stafflogin",
  failureRedirect : "/login"  
}), function(req, res){
      

});
app.get('/adminlogin',(req,res) => {
  res.render("admin")
});

app.post('/adminlogin', pass.authenticate("local", {
  successRedirect : "/admin/admindashboard",
  failureRedirect : "/adminlogin"  
}), function(req, res){
});

app.get('/logout',(req,res)=>{
  req.logout();
  res.redirect("/");
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//BASIC-ROUTES///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/userlogin',(req,res) => {
  res.render("userlogin");
});

app.get('/stafflogin',isLoggedIn,function(req,res){
  res.render("stafflogin");
});

app.get('/admin/admindashboard',isLoggedIn,(req,res) => {
  res.render("admindash");
});

app.get('/attandance',(req,res) => {
  res.render("attandance");
});

app.get('/admin',(req,res) => {
  res.render("admin");
});

function isLoggedIn(req, res, next){
  console.log(req.isAuthenticated());
  if(req.isAuthenticated()){
    return next();
  }
 res.redirect("/login");
}
