require("dotenv").config();
const express = require("express"); 
const app = express();
const conncetDB = require("./config/dbconnect")
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser")
const cors = require("cors");
const path = require("path");
const corsOption = require("./config/corsOption");
const { patch } = require("./routes/root");
const PORT = process.env.PORT || 5000;

conncetDB()

app.use(cors(corsOption));
app.use(cookieParser());
app.use(express.json());

app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));

app.all("*", (req,res) => {
    res.status(404);
    if(req.accepts("html")){
        res.sendFile(path.join(__dirname,"views","404.html"));
    }else if(req.accepts("json")){
        res.json({ message: "404 not Found"});
    }else{
        res.type("txt").send("404 not Found");
    }
});



mongoose.connection.once("open", ()=>{
    console.log("connected to mongoDB");
    app.listen(PORT , ()=>{
        console.log(`Server runing on port ${PORT}`)
    });
});
mongoose.connection.on("erroe",(err)=>{
    console.log(err);
});