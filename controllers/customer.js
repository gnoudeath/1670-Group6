const express = require("express");

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
  const book = await dbHandler.getAllProducts();
  res.render('index', { book:book });

})


module.exports = router;