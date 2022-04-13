const express  = require('express');
const session = require('express-session');
const app = express(); //Su dung thu vien express
const bcrypt = require("bcrypt");
const dbHandler = require("./databaseHandler");


//Static Files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))

app.use(
    session({
      secret: "duong192@@##&&",
      cookie: { maxAge: 1000 * 60 * 60 * 24 },
      saveUninitialized: false,
      resave: false,
    })
  );
//Set view
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'hbs') //Khai bao su dung thu muc views
app.use(express.urlencoded({ extended: true})) //Lay du lieu tu cac Form: textbox, combobox...

//neu request la: /admin/register
app.get('/register',(req,res)=>{
    res.render('register')
})

//Kiem tra thong tin login
app.post('/login',async(req,res)=>{
    const name = req.body.txtName;
    const pass = req.body.txtPass; 
    const user = await dbHandler.checkUserLogin(name);
    if (user == -1){
        res.render("login", {errorMsg: "Not foud UserName!"});
    }
    else{
        const validPass = await bcrypt.compare(pass, user.password);
        if (validPass){
            const role = await dbHandler.checkUserRole(name);
            if (role == -1)
            {
                res.render("login", {errorMsg: "Login failed!"});
            }
            else{
                if (req.body.Role == role) { 
                    const customer = await dbHandler.getUser(name, user.email)
                    req.session.user = {
                        name: name,
                        role: role,
                        email: customer.email,
                    };
                    console.log("Loged in with: ");
                    console.log(req.session.user);
                    if (role == "Customer"){
                        res.redirect("/index/?userName="+req.session.user.name)
                    }
                    else{
                        // res.render("login", {errorMsg: "Not Login!"});
                        res.redirect("/admin/?userName="+req.session.user.name)
                    }
                }
            }
        }else {
            res.render("login", { errorMsg: "Incorrect password!"});
        }
    }
});

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get("/logout", (req, res) => {
    req.session.user = null;
    res.redirect("/");
  });

app.post("/register", async(req,res)=>{
    const userName = req.body.txtName;
    const role = req.body.Role;
    const pass = req.body.txtPassword;
    const rePass = req.body.txtRePass;
    const email = req.body.txtEmail;
    const hashPass = await bcrypt.hash(pass, 10);
    const exitUser = await dbHandler.checkUserLogin(userName);
    if (exitUser == -1){
        const validPass = await bcrypt.compare(rePass, hashPass);
        if (validPass){
            const newUser = {
                userName: userName,
                role: role,
                password: hashPass,
                email: email,
            };
            await dbHandler.insertObject("Users", newUser);
            res.render("login");
        }
        else{
            res.render("register", {errorMsg: "Password is not match"});
        }
    } 
    else{
        res.render("register", {errorMsg: "Username already used"});
    }

});

const adminController = require('./controllers/admin');
//tat cac cac dia chi co chua admin: localhost:5000/admin
app.use('/admin', adminController)

const userController = require("./controllers/customer");

app.use("/", userController);


const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)