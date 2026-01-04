const mongoose =require('mongoose');
const product=require('./models/product')
mongoose.connect("mongodb+srv://mern-stack-26:yNKy9sayAtYL70y5@nodejsproject.kfov0sa.mongodb.net/mern_products_test?appName=nodejsproject").then(()=>{
    console.log("Connected to database");
}).catch(()=>{
    console.log("Connection failed!")
})
const createProduct=async (req,res,next)=>{
    const createdProduct=new product({
        name:req.body.name,
        price:req.body.price
    })
    const result=await createdProduct.save();
    c
    res.json(result)
}
const getProducts=async(req,res,next)=>{
    const products=await product.find();
    res.json(products)
}
exports.createProduct=createProduct;
exports.getProducts=getProducts;