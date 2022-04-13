const express = require('express')
const req = require('express/lib/request')
const res = require('express/lib/response')
const router = express.Router()
const app = express()
const dbHandler = require("../databaseHandler");
const bcrypt = require("bcrypt");

const {MongoClient, Int32, Db} = require('mongodb')
const async = require('hbs/lib/async')
const url = "mongodb+srv://new-duong-0805:123456789td@cluster0.pbe5o.mongodb.net/test";
const client = new MongoClient(url, {useNewUrlParser: true,useUnifiedTopology: true });

router.use((req, res, next) => {
    const { user } = req.session; //same as: user = req.session.user
    if (user) { //if have an account
        if (user.role == "Admin") { //if role = admin
            next("route"); //next to the same URL
        } else { res.sendStatus(404); }
    } else { //don't have an account
        res.redirect('/login');
    }
})

router.get('/', async (req, res) =>{
    
    const client = await MongoClient.connect(url);
    const dbo = client.db("Test");
    const allProducts = await dbo.collection("Book").find({}).toArray();
    res.render('homeAdmin', { data: allProducts});
    
})


//Admin
module.exports = router;
router.get('/product', async (req, res) => {
    const book = await dbHandler.getAllProducts("Book")
    res.render("Admin_Product", {book:book})
    
});
//addbook
router.get('/addbook', async (req, res)=> {
    res.render("AddBook")
})
router.post('/addbook', async (req, res) => {
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const image = req.body.txtImage
    const Description = req.body.txtDescription
    const newBook = {name:nameInput, des:Description, price:Number.parseFloat(priceInput), pic:image, }
    await dbHandler.insertObject("Book", newBook)
    res.redirect('/admin/product')
})
//delete book
router.get('/deletebook', async (req, res) => {
    const id = req.query.id
    console.log(id)
    await dbHandler.deleteDocumentById("Book", id)
    res.redirect('/admin/product')
})
router.get('/updatebook', async (req, res) => {
    const id = req.query.id
    const result = await dbHandler.getDocumentById(id, "Book")
    res.render('updatebook', {book:result})
})
router.post('/updatebook', async (req, res) => {
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const image = req.body.txtImage
    const Description = req.body.txtDescription
    const UpdateValue = {$set: {name:nameInput, des:Description, price:Number.parseFloat(priceInput), image:image,}}
    const id = req.body.txtid
    console.log(UpdateValue)
    console.log(id)
    await dbHandler.updateDocument(id, UpdateValue,"Book")
    res.redirect('/admin/product')
})


router.get('/category', async(req,res)=>{
    const cat = await dbHandler.getAllCategory();
    res.render('Admin_Category',{cat:cat})
})

router.post('/category',async(req,res)=>{
    const catName = req.body.name;
    const catDesc = req.body.desc;
    const newCat = {
        cat_name:catName,
        cat_desc:catDesc,
        
    }
    await dbHandler.insertObject("Category", newCat)
    res.redirect('/admin/category')

})

router.get('/deletecat',async(req,res)=>{
    const id = req.query.id
    await dbHandler.deleteDocumentById("Category", id)
    res.redirect('/admin/category')
})

module.exports = router;