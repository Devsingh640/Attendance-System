var express                =  require('express'),
    app                    =  express(),
    bodyParser             =  require("body-parser"),
    mongoose               =  require("mongoose"),
    passport               =  require("passport"),
    pass                   =  require("passport"),
    LocalStrategy          =  require("passport-local"), 
    methodOverride         =  require("method-override"),
    session                =  require("express-session"),
    ses                    =  require("express-session"),
    admin                  =  require("./models/admin"),
    daily                  =  require("./models/daily"),//s daily wala db add kiya hai jaise aaadmin aur user kiya hua hai
    atti                   =  require("./models/atti"),
    user                   =  require("./models/user"),//ruk jao aapne shayad do baar copy kr siya admin/admindashboard wala okzz
    async                  =  require("async"),
    nodemailer             =  require("nodemailer"),
    crypto                 =  require("crypto"),
    bcrypt                 =  require("bcryptjs"),
    flash                  =  require("connect-flash");

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
app.use(methodOverride("_method"));
app.use(flash());
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
passport.use('admin', new LocalStrategy(function(username, password, done){
    var query = {username: username};
    admin.findOne(query, function(err, admin){
        if(err) console.log(err);
        if(!admin){
            return done(null, false);
        }
        bcrypt.compare(password.toString(),admin.password, function(err, isMatch){
            if(err)console.log(err);
            if(isMatch)
                return done(null,admin);
            else
                return done(null,false);
        })
    })
}))

passport.use('user', new LocalStrategy(function(username, password, done){
    var query = {username: username};
    user.findOne(query, function(err, user){
        if(err) console.log(err);
        if(!user){
            console.log("no user")

            return done(null, false);
        }
        bcrypt.compare(password.toString(),user.password, function(err, isMatch){
            if(err) console.log(err);
            if(isMatch)
                return done(null, user);
            else
                return done(null,false);
        })
    })
}))

//serialize deserizlize

passport.serializeUser(function (entity, done) {
    done(null, { id: entity.id, type: entity.type });
});

passport.deserializeUser(function (obj, done) {
    switch (obj.type) {
        case 'admin':
            admin.findById(obj.id)
                .then(user => {
                    if (user) {
                        done(null, user);
                    }
                    else {
                        done(new Error('admin id not found:' + obj.id, null));
                    }
                });
            break;
        case 'user':
            user.findById(obj.id)
                .then(user => {
                    if (user) {
                        done(null, user);
                    } else {
                        done(new Error('user id not found:' + obj.id, null));
                    }
                });
            break;
        default:
            done(new Error('no entity type:', obj.type), null);
            break;
    }
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user; // req.user is an authenticated user
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/',(req,res) => {
  res.render("landing");
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//AUTHENTICATION ROUTES//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/new',isAdmin,(req,res) => {
  res.render("new");
});

app.get("/submit",(req,res) => {
  res.render("submit");
}); 

app.post("/new",isAdmin,function(req,res){ 
  let newUser = new user({
    username:req.body.username,
    password:req.body.password,
    first_name:req.body.first_name,
    middle_name: req.body.middle_name,
    last_name:   req.body.last_name,
    gender: req.body.gender,
    email: req.body.email,
    mobile_number: req.body.mobile_number,
    Landline_number:  req.body.Landline_number });

  bcrypt.genSalt(10, function(err,  salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
            if(!err){
                newUser.password = hash;
            }
            newUser.save(function(err){
              if(err)  {req.flash("error",err);
               res.redirect("/admin/admindashboard");}
                else{            req.flash("success","success ");
                                      res.redirect("/admin/admindashboard");
                }
                
            })
        })

      });
});

app.get('/registerAdmin',isAdmin,(req,res) => {
  res.render("adminregister");
});

app.post("/registerAdmin",isAdmin,function(req,res){
  let newUser= new admin({
    username:req.body.username,
     password:req.body.password,
    first_name:req.body.first_name,
    middle_name: req.body.middle_name,
    last_name:   req.body.last_name,
    gender: req.body.gender,
    email: req.body.email,
    mobile_number: req.body.mobile_number,
    Landline_number:  req.body.Landline_number });

   bcrypt.genSalt(10, function(err,  salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
            if(!err){
                newUser.password = hash;
            }
            newUser.save(function(err){
                if(!err){
                   
                    console.log("success in reg");
                    res.redirect("/admin/admindashboard");
                }
                else if(err)
                {
                  req.flash("Error",err);
                   res.redirect("/admin/admindashboard");
                }
            })
        })

      });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LOGIN AUTH//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/adminlogin',(req,res) => {
  res.render("admin")
});

app.post('/adminlogin', passport.authenticate("admin", {
  successRedirect : "/admin/admindashboard",
  failureRedirect : "/adminlogin"  ,
  failureFlash : true 
}), function(req, res){
});
app.get('/login',(req,res) => {
  res.render("login")
});
app.get('/admin',isAdmin,(req,res) => {
  user.find({},function(err,user){
  if(err)
   req.flash("error",err);
   else{
     res.render("submit",{user:user});
   }
});
  
});

app.post('/login', passport.authenticate("user", {
  successRedirect : "/stafflogin",
  failureRedirect : "/login"  ,
  failureFlash : true 
}), function(req, res){
});

app.get('/logout',(req,res)=>{
  req.logout();
  req.flash("success","hope to see you again!!");
  res.redirect("/");
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//BASIC-ROUTES///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.get('/stafflogin',isLoggedIn,function(req,res){
      res.render("stafflogin");
});

app.get('/myattendance',isLoggedIn,function(req,res){
   user.findById(req.user._id).populate("attendance").exec(function(err,user){
    if(err)
    console.log(err);
    else {
      //console.log(comment);
      res.render("myattendance" ,{user:user});
    }
  });
});

app.get('/myactivities',isLoggedIn,function(req,res){
   user.findById(req.user._id).populate("dailys").exec(function(err,user){
    if(err)
    console.log(err);
    else {
      //console.log(comment);
      res.render("myactivities" ,{user:user});
    }
  });
});

app.get('/activityform',isLoggedIn,function(req,res){
   user.findById(req.user._id).populate("dailys").exec(function(err,user){
    if(err)
    console.log(err);
    else {
      //console.log(comment);
      res.render("activityform" ,{user:user});
}
  });
});
 app.get("/attendanceform",isLoggedIn,function(req,res){

 user.findById(req.user._id,function(err,user){
   console.log(user.attendance[user.attendance.length-1]);

    if(err)
    {
      console.log(err);
    }
    else {
if(user.attendance[user.attendance.length-1]){
atti.findById(user.attendance[user.attendance.length-1],function(err,com){
    if(err)
    {
      console.log(err);
    }
    else {
          console.log(com.timeplz);
         var OneDay = new Date().getTime() + (1 * 12 * 60 * 60 * 1000);
                                   
if (OneDay > com.timeplz) {
   req.flash("error","Your Attendance is recorded once");
res.redirect("/stafflogin");
  
}
else if (OneDay < com.createdAt){
     res.render("attendanceform",{user:user});
     
}
    }
  });
}
else
{

 res.render("attendanceform",{user:user});
         
    }
  
  }
});

});

app.post("/activityform",isLoggedIn,function(req,res)
{    console.log(req.user.username);
   user.findById(req.user._id,function(err,user){
    if(err)
    {
      console.log(err);
      res.redirect("/activityform");
    }
    else {
     

        daily.create(req.body.daily,function(err,daily){
          if(err){
          console.log(err);}
          else {
            daily.author.id= req.user._id;
            daily.author.username= req.user.username;
            daily.save();
            user.dailys.push(daily);
            user.save();
            
           req.flash("success","Your activity is recorded");
            res.redirect("/stafflogin");
                  
          }

        });
    } 
  }); 
 });

app.post("/attendanceform",isLoggedIn,function(req,res)
{    //console.log(req.user.username);
   user.findById(req.user._id,function(err,user){
    if(err)
    {
      console.log(err);
      res.redirect("/attendanceform");
    }
    else {
     
      
      var startTime = '00:10:10';
      var endTime   = '23:59:00';

      currentDate   = new Date()   

      startDate     = new Date(currentDate.getTime());
      startDate.setHours(startTime.split(":")[0]);
      startDate.setMinutes(startTime.split(":")[1]);
      startDate.setSeconds(startTime.split(":")[2]);

      endDate       = new Date(currentDate.getTime());
      endDate.setHours(endTime.split(":")[0]);
      endDate.setMinutes(endTime.split(":")[1]);
      endDate.setSeconds(endTime.split(":")[2]);


valid = startDate < currentDate && endDate > currentDate;
console.log(valid);
if(valid){

        atti.create(req.body.atti,function(err,atti){
          if(err){
          console.log(err);}
          else {
            atti.author.id= req.user._id;
            atti.author.username= req.user.username;
            atti.save();
            user.attendance.push(atti);
            user.save();
            
           req.flash("success","Your attendance is recorded");
            res.redirect("/stafflogin");
                  
          }

        });
    }
     else
  {   req.flash("error","Either you are early or you are late");
      res.redirect("/stafflogin");
  }
  } 

  }); });

app.get('/admin/admindashboard',isAdmin,(req,res) => {
  res.render("admindash");
});
app.get("/admin/:id",isAdmin,function(req,res){
  user.findById(req.params.id).populate("dailys").exec(function(err,user){
    if(err)
    console.log(err);
    else {
      //console.log(comment);
      res.render("usershow" ,{user:user});

    }
  });

});
app.get("/admin/:id/attendance",isAdmin,function(req,res){
  user.findById(req.params.id).populate("attendance").exec(function(err,user){
    if(err)
    console.log(err);
    else {
      //console.log(comment);
      res.render("myattendance" ,{user:user});

    }
  });

});

app.delete("/admin/:id",isAdmin,(req, res) => {

user.findByIdAndRemove(req.params.id, err => {
    if (err) { res.redirect("/admin"); }
    else {
          req.flash("success","User Removed");
      res.redirect("/admin"); }
  });
});
app.get("/admin/:id/edit",isAdmin, (req, res) => {

 user.findById(req.params.id , function(err,user){
    if(err)
    res.redirect("back");
    else {
      res.render("useredit" ,{user:user});  }
  });

});
app.put("/admin/:id",isAdmin,function(req,res){

user.findByIdAndUpdate(req.params.id ,req.body.user,function(err,user){
    if(err){
      res.redirect("/admin");
    }
    else {
      req.flash("success","Editted profile successfully");
    res.redirect("/admin/"+req.params.id);
    }
  });
});
app.get("/stafflogin/edit",isLoggedIn, (req, res) => {

 user.findById(req.user._id , function(err,user){
    if(err)
    res.redirect("back");
    else {
      res.render("useredit2" ,{user:user});  }
  });

});
app.put("/stafflogin/edit",isLoggedIn,function(req,res){

user.findByIdAndUpdate(req.user._id ,req.body.user,function(err,user){
    if(err){
      res.redirect("/stafflogin");
    }
    else {
      req.flash("success","Editted profile successfully");
    res.redirect("/stafflogin");
    }
  });
});

function isLoggedIn(req, res, next){
  
  if(req.isAuthenticated()){
     if(req.user.type==="user"){
    return next();
  }
}
 res.redirect("/login");
}
function isAdmin(req, res, next){
  
  if(req.isAuthenticated()){
    if(req.user.type==="admin"){
    return next();
    }
  }

 res.redirect("/adminlogin");
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/password_reset",function(req,res){
  //res.send("you can reset password");
res.render("password_reset", {
    user: req.user
  });

});

// send confirmation emails
app.post("/password_reset", (req, res, next) => {
  // use waterfall to increase readability of the following callbacks
  async.waterfall([
    function(done) {
      // generate random token
      crypto.randomBytes(20, (err, buf) => {
        let token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      // find who made the request and assign the token to them
      user.findOne({ email: req.body.email }, (err, user) => {

        if (err) throw err;
        if (!user) {
          req.flash("error", "That  account doesn't exist.");
          return res.redirect("/password_reset");
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 36000000000; // ms, 1hour

        user.save(err => done(err, token, user));
        console.log(user.username);
      });
    },
    function(token, user, done) {
      // indicate email account and the content of the confirmation letter
      let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "devsingh640@gmail.com",
          pass: "DaddyPanther.8826621005"
        }
      });
      let mailOptions = {
        from: "devsingh640@gmail.com",
        to: user.email,
        subject: "Reset your  Password",
        text: "Hi " + user.firstName + ",\n\n" +
              "We've received a request to reset your password. If you didn't make the request, just ignore this email. Otherwise, you can reset your password using this link:\n\n" +
               req.headers.host + "/reset/" + token + "\n\n" +
              "Thanks.\n"+
              "The Taraak Team\n"
      };
      // send the email
      smtpTransport.sendMail(mailOptions, err => {
        if (err) console.log(err);
        console.log("mail sent");
        req.flash("success", "An email has been sent to " + user.email + " with further instructions.");
        done(err, "done");
      });
    }
  ], err => {
    if (err) return next(err);
    res.redirect("/password_reset");
  });
});

//==============================================================================================
//reset ROUTES
//==============================================================================================
app.get('/reset/:token', function(req, res) {
  user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {

    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/password_reset');
    }
     else { res.render("reset", { token: req.params.token }) }
  });
});
// update password
app.post("/reset/:token", (req, res) => {
  async.waterfall([
    function(done) {
      user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
console.log(user.username);
        if (err) throw err;
        if (!user) {
          req.flash("error", "Password reset token is invalid or has expired.");
          return res.redirect("/password_reset");
        }
        // check password and confirm password
        if (req.body.password === req.body.confirm) {
          // reset password using setPassword of passport-local-mongoose
          user.setPassword(req.body.password, err => {
            if (err) throw err;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;

            user.save(err => {
              if (err) throw err;
              req.logIn(user, err => {
                done(err, user);
              });
            });
          });
        } else {
          req.flash("error", "Passwords do not match");
          return res.redirect("back");
        }
      });
    },
    function(user, done) {
      let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "devsingh640@gmail.com",
          pass: "DaddyPanther.8826621005"
        }
      });
      let mailOptions = {
        from: "devsingh640@gmail.com",
        to: user.email,
        subject: "Your attendance syatem Password has been changed",
        text: "Hi " + user.firstName + ",\n\n" +
              "This is a confirmation that the password for your account " + user.email + "  has just been changed.\n\n" +
              "Best,\n"+
              "The Taraak Team\n"
      };
      smtpTransport.sendMail(mailOptions, err => {
        if (err) throw err;
        req.flash("success", "Your password has been changed.");
        done(err);
      });
    },
  ], err => {
    if (err) throw err;
    res.redirect("back");
  });
});