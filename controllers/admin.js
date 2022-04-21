const express = require('express')
const req = require('express/lib/request')
const res = require('express/lib/response')
const router = express.Router()
const app = express()
const dbHandler = require("../databaseHandler");
const bcrypt = require("bcrypt");

const {MongoClient, Int32, Db} = require('mongodb')
const async = require('hbs/lib/async')
const { route } = require('./customer')
const { query } = require('express')
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



//Admin
module.exports = router;
router.get('/product', async (req, res) => {
    const book = await dbHandler.getAllProducts("Book")  
    res.render("Admin_Product", {book:book})
    
});

//addbook
router.get('/addbook', async (req, res)=> {
    const cat = await dbHandler.getAllCategory();
    res.render("AddBook",{cat:cat})
})
router.post('/addbook', async (req, res) => {
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const image = req.body.txtImage
    const Description = req.body.txtDescription
    const cat = req.body.cat
    const catid = await dbHandler.getDocumentById(cat,'Category')
    const newBook = {name:nameInput, des:Description, price:Number.parseFloat(priceInput), pic:image, cat:catid}
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
    const cat = await dbHandler.getAllCategory();
    res.render('updatebook', {book:result , cat: cat})
})
router.post('/updatebook', async (req, res) => {
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const image = req.body.txtImage
    const Description = req.body.txtDescription
    const cat = req.body.cat
    const catid = await dbHandler.getDocumentById(cat,'Category')
    const UpdateValue = {$set: {name:nameInput, des:Description, price:Number.parseFloat(priceInput), image:image, cat:catid}}
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

router.get('/updatecat',async(req,res)=>{
    const id = req.query.id
    const result = await dbHandler.getDocumentById(id, "Category")
    const cat = await dbHandler.getAllCategory();
    res.render('Admin_Category',{cat:cat, result:result})
})

router.post('/updatecat',async(req,res)=>{
    const nameCat = req.body.name
    const descCat = req.body.desc
    const id = req.body.id
    const UpdateValue = {$set: {cat_name:nameCat , cat_desc:descCat}}
    await dbHandler.updateDocument(id, UpdateValue,"Category")
    res.redirect('/admin/category')
})

//update Status
router.post("/updatestatus", async (req,res)=>{
    const id = req.body.id
    const status = req.body.status
    const order = await dbHandler.getDocumentById(id,"CustomerOrder")
    order["status"] = status
    const neworder = {$set:{user:order.user, books:order.books,quantity:order.quantity, date:order.date, total_money:order.total_money, status:order.status}}
    await dbHandler.updateDocument(id, neworder, "CustomerOrder")

    res.redirect('/admin')
})





//feedback manage

router.get("/feedbackmanage", async (req, res) =>{
    let result = await dbHandler.getAllFB("Feedback");
    res.render('feedbackmanage', {feedback: result, user: req.session.user})
});

router.get("/feedbackmanage/delete", async(req, res) =>{
    await dbHandler.deleteDocumentById('Feedback', req.query.id);
    res.redirect('/admin/feedbackmanage');
});

router.get("/feedbackmanage/:day", async (req, res, next) =>{
    let result = await dbHandler.getAllFB("Feedback");
    const today = new Date();
    if (req.params.day == "today"){
        result = result.filter((f) =>{
            return new Date(f.time).toDateString() === today.toDateString(); //chuyển f.time về string dạng ngày 
        });
        res.render("feedbackmanage", {
            feedback: result,
            user: req.session.user,
        });
    }
    else if (req.params.day === "1weeks"){
        const queryTimeDay = new Date(today.setDate(today.getDate() -7)); //-7 day 
        result = result.filter((f) => new Date(f.time) > queryTimeDay);
        res.render("feedbackmanage", {
            feedback: result,
            user: req.session.user,
        });
    }
    else if (req.params.day === "1months"){
        const queryTimeDay = new Date(today.setMonth(today.getMonth() -1)); //-30 day 
        result = result.filter((f) => new Date(f.time) > queryTimeDay);
        res.render("feedbackmanage", {
            feedback: result,
            user: req.session.user,
        });
    }
    else{
        next("route");
    }
});

router.get("/feedbackmanage/searchFeedback", async(req, res) =>{
    const searchInput = req.query.bookName;
    const result = await dbHandler.searchObjectbyName("Feedback", searchInput)
    res.render("feedbackmanage", {feedback: result})
});


//neu request la: /admin
router.get('/', async (req, res) => {
// //     const client = await MongoClient.connect(url);   
// //     const dbo = client.db("Test");
// //     const allProducts = await dbo.collection("Book").find({}).toArray();
// // });
    if (req.query.sortBy == "today") { //if user choose today
        res.redirect("/admin/today");
    } else if (req.query.sortBy == 'week') { //if user choose week
        res.redirect("/admin/week");
    } else {
        const customerOrder = await dbHandler.getAll("CustomerOrder") //get all database in Customer order and set is customerOrder
        // customerOrder.forEach((element) => { //use loop in Customer Order 
        //     element.date = element.date; //convert time to vietnam
        //     element.itemString = ""; //tao bien itemString de hien thi cac phan tu trong element (them item va amount)
        //     element.book.forEach(e => { //use loop in books in customerorder
        //         element.itemString += e.name + " - (" + e.quantity + ")"; //display name + qty 
        //     })
        // });
        res.render('homeAdmin', {
            customerOrder: customerOrder,//truyen vao adminPage giá trị của customerorder
            user: req.session.user//
        })
    // }
}})

router.get("/:sortBy", async (req, res, next) => { //sortby same tham số
    let result = await dbHandler.getAll("CustomerOrder");
    const today = new Date();
    if (req.params.sortBy === "today") {
        result = result.filter((e) => {
            return new Date(e.date).toDateString() === today.toDateString();
        });
        res.render("homeAdmin", {
            customerOrder: result,
            user: req.session.user,
        });
    } else if (req.params.sortBy === "week") {
        const queryTimeDay = new Date(today.setDate(today.getDate() - 7));
        result = result.filter((e) => new Date(e.date) > queryTimeDay);
        res.render("homeAdmin", {
            customerOrder: result,
            user: req.session.user,
        });
        
    }
    else if (req.params.sortBy === "delete") {//tham số sortby là delete
        await dbHandler.deleteOne("CustomerOrder", req.query.id);
        res.redirect("/admin");
    }
    else {
        next("route");
    }
});
module.exports = router;