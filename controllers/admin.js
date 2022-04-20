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

router.get('/', async (req, res) =>{
    
    // const client = await MongoClient.connect(url);   
    // const dbo = client.db("Test");
    // const allProducts = await dbo.collection("Book").find({}).toArray();
    
    if(req.query.findOrder == "today"){
        res.redirect("/admin/today");
    }else if(req.query.findOrder == "week"){
        res.redirect("/admin/week");
    }
    else{
        const orderCustomer = await dbHandler.getAllOrderCustomer();
        orderCustomer.forEach((element) => { //use loop in Customer Order 
        element.date = element.date.toLocaleString("vi"); //convert time to vietnam
        element.itemString = ""; //tao bien itemString de hien thi cac phan tu trong element (them item va amount)
        element.book.forEach(e => { //use loop in books in customerorder
        element.itemString += e.name + " - (" + e.qty + ")"; //display name + qty 
        // chay duoc roi nhe
        })
    });
    res.render('homeAdmin', {  orderCustomer:orderCustomer , user: req.session.user});   
    }

})

// router.get("/:findOrder", async (req, res, next) => { //sortby same tham số
//     let result = await dbHandler.getAllCustomerOrder();
//     if (req.params.findOrder === "today") {
//         let today = new Date().toLocaleDateString("vi");//lưu new Date.toLocaledatestring = today; today ở dạng stirng
//         result = result.filter((item) => { //dùng filter cho biến result lọc ra các phần từ có đk là dòng 53. sau đó gán lại vào result
//             item.itemString = "";
//             item.books.forEach(e => {//tao bien itemString de hien thi cac phan tu trong element (them item va amount)
//                 item.itemString += e.name + " - (" + e.qty + ")";
//             })
//             return item.time.toLocaleDateString("vi") === today
//         });
//         result.forEach((element) => { //dùng loop cho tất cả result để hiển thị time theo dang string
//             element.time = element.time.toLocaleString("vi");
//         });
//         res.render("adminPage", { customerOrder: result }); //truyền vào tất cả các result vừa được xử lý

//     } else if (req.params.findOrder === "week") {
//         let today = new Date(); //gán today bằng ngày hn
//         let week = new Date(today.setDate(today.getDate() - 7)); //week = lấy (today.getDate -7) là dạng số. sau đó setDate lại về dạng thời gian
//         result = result.filter((item) => { //item là 1 phần tử của result
//             item.itemString = "";
//             item.books.forEach(e => {//tao bien itemString de hien thi cac phan tu trong element (them item va amount)
//                 item.itemString += e.name + " - (" + e.qty + ")";
//             })
//             return item.time > week //dk ptu có điều kiện item > week
//         });
//         result.forEach((element) => {//dùng loop cho result sau đó chuyển element.time về dạng string theo keieur vn
//             element.time = element.time.toLocaleString("vi");
//         });
//         res.render("adminPage", { customerOrder: result }); //truyền vào tất cả result vừa được xử lý
//     }
//     else if (req.params.findOrder === "delete") {//tham số sortby là delete
//         let { id } = req.query; // same as: let id = req.query.id;
//         let result = await dbHandler.deleteOne("CustomerOrder", { _id: ObjectId(id) });//dùng hàm deOne để xóa 1 document trong collection customer order
//         if (result == null) { 
//            res.send("Cancel error!"); 
//         } else {
//             res.redirect("/admin");
//         }
//     }
//     else {
//         next("route");
//     }
// });

router.get("/admin", async (req, res) => {
    let result = await dbHandler.getAllCustomerOrder();
    result.forEach((element) => (element.date = element.date.toLocaleString("vi")));
    res.render("homeAdmin", { demo: result, next: true });

});

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
module.exports = router;