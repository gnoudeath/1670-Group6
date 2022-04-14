const express = require("express");
const app = express();
const dbHandler = require("../databaseHandler");
const router = express.Router();
router.use(express.static("public"));

const {MongoClient, Int32, Db} = require('mongodb')
const async = require('hbs/lib/async')
const url = "mongodb+srv://new-duong-0805:123456789td@cluster0.pbe5o.mongodb.net/test";
const client = new MongoClient(url, {useNewUrlParser: true,useUnifiedTopology: true });


router.use((req, res, next) => {
    console.log(req.session);
    const { user } = req.session;
    if (user) {
      if (user.role == "Customer") {
        next("route");
      } else {
        res.sendStatus(404);
      }
    } else {
      res.redirect("/login");
    }
  });


router.get('/index', async (req, res) =>{
  const { user } = req.session;
  var passedVariable = req.query.userName;
  console.log(passedVariable);
  const book = await dbHandler.getAllProducts();
  const cat = await dbHandler.getAllCategory();
  res.render('index', { book:book,userName:passedVariable, userRole:user.role ,cat:cat });

})

//search
router.get("/search", async (req, res) => {
  const book = await dbHandler.getAllProducts();
  const searchInput = req.query.searchInput;
  if (isNaN(Number.parseFloat(searchInput)) == false) {
    await SearchObject(
      req,
      searchInput,
      book,
      res,
      dbHandler.searchObjectbyPrice,
      "Book",
      Number.parseFloat(searchInput),
      " VND"
    );
  } else {
    await SearchObject(
      req,
      searchInput,
      book,
      res,
      dbHandler.searchObjectbyName,
      "Book",
      searchInput,
      ""
    );
  }
});

async function SearchObject(
  req,
  searchInput,
  book,
  res,
  dbFunction,
  collectionName,
  searchInput,
  mess
) {
  const resultSearch = await dbFunction(collectionName, searchInput);
  if (resultSearch.length != 0) {
    if (!req.session.user) {
      res.render("search", {
        searchBook: resultSearch,
        book:book,
      });
    } else {
      res.render("search", {
        searchBook: resultSearch,
        book:book,
      });
    }
  } else {
    if (!req.session.user) {
      const message = "Not found " + searchInput + mess;
      res.render("search", {
        book:book,
        errorSearch: message,
      });
    } else {
      const message = "Not found " + searchInput + mess;
      res.render("search", {
        book:book,
        errorSearch: message,
        user: req.session.user,
      });
    }
  }
}
router.get('/profiles', async (req, res) => {
  const profile = await dbHandler.getUser(req.session.user.name)  
  res.render("profiles", {user:profile})
});


router.post('/updateprofile', async (req,res) =>{
  const fullname = req.body.txtFullname;
  const email = req.body.txtEmail;
  const address = req.body.txtAddress;
  const phone = req.body.txtPhone;
  const user = await dbHandler.getUser(req.session.user.name)
  const updateValues = {$set: {userName: user.userName, email: email, fullname: fullname,phone: phone, role: user.role, password: user.password, address: address }}
  console.log(updateValues);
  await dbHandler.updateDocument(user._id, updateValues, "Users");
  res.redirect('profiles')
})
module.exports = router;