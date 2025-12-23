const { MongoClient } = require('mongodb');
const url="mongodb+srv://mern-stack-26:yNKy9sayAtYL70y5@nodejsproject.kfov0sa.mongodb.net/mern_products_test?appName=nodejsproject"
const createProduct=async(req,res,next)=>{
const newProduct={
    name:req.body.name,
    price:req.body.price
}
const client=new MongoClient(url)
try {
    await client.connect()
 const db = client.db('mern_products_test')
    const result=await db.collection('products').insertOne(newProduct)
} catch (error) {
    return res.json({message:"Could not store data"})
}
await client.close();
res.json(newProduct)
}
const getProducts=async(req,res,next)=>{
const client=new MongoClient(url);
try {
    await client.connect();
    const db=client.db('mern_products_test')
    const products=await db.collection("products").find().toArray();
  res.status(200).json(products)
} catch (error) {
       return res.json({message:"Could not store data"})
}
}
exports.createProduct=createProduct;
exports.getProducts=getProducts;