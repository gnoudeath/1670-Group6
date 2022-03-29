const async = require('hbs/lib/async');
const {MongoClient,ObjectId} = require('mongodb');

const URL = 'mongodb+srv://new-duong-0805:123456789td@cluster0.pbe5o.mongodb.net/test'
const DATABASE_NAME = "Test"

async function getDB()  {
    const client = await MongoClient.connect(URL);
    const dbo = client.db(DATABASE_NAME);
    return dbo;
}

async function insertObject(collectionName,objectToInsert){
    const dbo = await getDB();
    const newObject = await dbo.collection(collectionName).insertOne(objectToInsert);
    console.log("Gia tri id moi duoc insert la: ", newObject.insertedId.toHexString());
}

async function checkUserRole(nameI,passI){
    const dbo = await getDB();
    const user = await dbo.collection(USERS_TABLE_NAME).findOne({userName:nameI,password:passI});
    //Nếu không trùng use name và password
    if (user==null){
        return "-1"
    }
    else{
        console.log(user)
        //tra lai: roll cua user: admin hoac staff
        return user.role;
    }
}
async function searchObjectbyName(collectionName, name) {
    const dbo = await getdbo();
    const result = await dbo
      .collection(collectionName)
      .find({ name: { $regex: name, $options: "i" } })
      .toArray();
    return result;
}

  async function searchObjectbyPrice(collectionName, price) {
    const dbo = await getdbo();
    const result = await dbo
      .collection(collectionName)
      .find({ price: price })
      .toArray();
    return result;
}

const USERS_TABLE_NAME = "Users"

module.exports = {insertObject,checkUserRole,USERS_TABLE_NAME}