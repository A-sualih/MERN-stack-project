const connectDB=require("./db/connect")
const tasks=require('./routes/task')
const express=require("express");
const notFound=require('./middleware/not-found.js')
const app=express();
require("dotenv").config()

app.use(express.json())

const PORT=3000
app.get("/hello",(req,res)=>{
res.send("Task Manager App")
})
app.use('/api/v1/tasks',tasks)
app.use(notFound)
const start=async()=>{
    try {
        await connectDB(process.env.MONGO_URL);
        app.listen(PORT,()=>{
    console.log(`Listening on Port ${PORT}`)
})
    } catch (error) {
        console.log(error)
    }
}
start()