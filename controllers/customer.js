const express = require("express");
const dbHandler = require("../databaseHandler");
const router = express.Router();
router.use(express.static("public"));

const {MongoClient, Int32, Db} = require('mongodb')
const async = require('hbs/lib/async');
const { get } = require("express/lib/response");
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

// router.get('/updateprofile', async(req, res)=>{
//   const updateprofile = await dbHandler.getDocumentById(id, "Users");
//   const profile = await dbHandler.getUser();
//   res.render('updateprofile',{profile:profile, updateprofile:updateprofile})
// })

router.post('/profiles', async (req,res) =>{
  const fullname = req.body.txtFullname;
  const email = req.body.txtEmail;
  const address = req.body.txtAddress;
  const phone = req.body.txtPhone;
  const user = await dbHandler.getUser(req.session.user.name)
  const updateValues = {$set: {userName: user.userName, email: email, fullname: fullname,phone: phone, role: user.role, password: user.password, address: address }}
  console.log(updateValues);
  await dbHandler.updateDocument(user._id, updateValues, "Users");
  res.redirect('/profiles')
})


// router.get('/updatecat',async(req,res)=>{
//   const id = req.query.id
//   const result = await dbHandler.getDocumentById(id, "Category")
//   const cat = await dbHandler.getAllCategory();
//   res.render('Admin_Category',{cat:cat, result:result})
// })

// router.post('/updatecat',async(req,res)=>{
//   const nameCat = req.body.name
//   const descCat = req.body.desc
//   const id = req.body.id
//   const UpdateValue = {$set: {cat_name:nameCat , cat_desc:descCat}}
//   await dbHandler.updateDocument(id, UpdateValue,"Category")
//   res.redirect('/admin/category')
// })

router.get('/index', async (req, res) =>{
  const { user } = req.session;
  var passedVariable = req.query.userName;
  console.log(passedVariable);
  const book = await dbHandler.getAllProducts();
  const cat = await dbHandler.getAllCategory();
  res.render('index', { book:book,userName:passedVariable, userRole:user.role ,cat:cat });

})

router.get("/details", async(req, res) =>{
  const id = req.query.id;
  const result = await dbHandler.getDocumentById(id, "Book");
  const { user } = req.session;
  console.log(result)
  if(!req.session.user){
    res.render("details", {details: result, cat: result.cat, userName:user.name
      , userRole:user.role});
      console.log(user)
  }
  else{
    res.render("details", {
      details: result,
      user: req.session.user,
      cat:result.cat,
      userName:user.name,
      userRole:user.role,
    });
  }
});

router.post('/details',async(req,res)=>{
  const id = req.body.id
  const book = await dbHandler.getDocumentById(id,"Book")
  const quantity = req.body.quantity
  const total = quantity * book.price
  const status = "Processing"
  const username = req.session.user.name
  const user = await dbHandler.getUser(username)
  var today = new Date()
  var time = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()+ '-' + today.getHours() + ":" + today.getMinutes();
  const newOrder = {
    user:user.userName,
    book:book,
    quantity:quantity,
    date:time,
    total_money:total,
    status:status

  }
  
  await dbHandler.insertObject("CustomerOrder",newOrder)
  res.redirect('/purchasehistory')
})

router.get('/purchasehistory',async(req,res)=>{
  const order = await dbHandler.findOrder(req.session.user.name)

  res.render('purchasehistory',{order:order})
})

module.exports = router;