const express = require('express')
const req = require('express/lib/request')
const res = require('express/lib/response')
const async = require('hbs/lib/async')
const router = express.Router()
const {insertObject,checkUserRole,USERS_TABLE_NAME} = require('../databaseHandler')



//neu request la: /admin/register
router.get('/register',(req,res)=>{
    res.render('register')
})

//Kiem tra thong tin login
router.post('/login',async(req,res)=>{
    const name = req.body.txtName
    const pass = req.body.txtPassword
    const role = await checkUserRole(name,pass)
    if(role == "-1"){
        res.render('login')
        return
    }
    else
    {
        console.log("You are a/an: " +role)
        req.session["User"] = {
            userName: name,
            role: role
        }
        //res.render('home',{userInfo:req.session.User})
        res.redirect('/')

    }
})


router.get('/login',(req,res)=>{
    res.render('login')
})


router.post('/register',(req,res)=>{
    const name = req.body.txtName
    const role = req.body.Role
    const pass = req.body.txtPassword

    const objectToInsert = {
        userName: name,
        role:role,
        password: pass
    }

    insertObject(USERS_TABLE_NAME,objectToInsert)
    res.render('Login')
})

module.exports = router;

router.get('/product', async(req,res)=>{
    const book = await dbHandler.getAll("Book")

    res.render("Admin_Product",{book:book})
})
addbook
router.get('/addbook',async(req,res)=>{
    res.render("addBook")
})
router.post('/addbook', async(req,res)=>
{
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const image = req.body.txtImage
    const Description = req.body.txtDescription
    const Category = req.body.txtCategory
    const CategoryID = await dbHandler.getDocumentByName("Category", Category)
    const newBook = {name:nameInput,des:Description, price:Number.parseFloat(priceInput), pic:image, category:CategoryID._id}
    await dbHandler.insertObject("Book",newBook)
    res.redirect('/product')
}
)
