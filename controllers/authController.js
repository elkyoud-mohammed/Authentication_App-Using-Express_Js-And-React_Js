const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//les donnes sont pas correct
const register = async(req,res)=>{
    const {first_name, last_name, email, password } = req.body
    if(!first_name || !last_name || !email || !password){
        return res.status(400).json({message: "all mots pas correct"});
} 
//les donnes sont correct
const foundUser = await User.findOne({email}).exec();
if(foundUser){
    return res.status(401).json({message: "user already exists"});
}
//insert anew user
const hashePassword = await bcrypt.hash(password,10)

const user = await User.create({
    first_name,
    last_name,
    email,
    password: hashePassword,
});

//token
const accessToken = jwt.sign({
    UserInfo:{
        id:user._id
    }
},process.env.ACCESS_TOKEN_SECRET , {expiresIn:"15 min"})
const refreshToken = jwt.sign({UserInfo:{
    id:user._id
},
},
process.env.REFRESH_TOKEN_SECRET , {expiresIn: "7d"});

res.cookie("jwt",refreshToken , {
    httpOnly:true, //accessible by web server
    secure: true, //https
    sameSite: "None", //tous les domaine
    maxAge:1000 * 60 * 60 * 24 * 7 //ms
});
res.json({accessToken,
    email:user.email , 
    first_name:user.first_name,
    last_name:user.last_name
});
};

const login = async(req,res)=>{
    const {email, password } = req.body
    if(!email || !password){
        res.status(400).json({message: "all mots pas correct pour login"});
} 
//les donnes sont correct
const foundUser = await User.findOne({email}).exec();
if(!foundUser){
    res.status(400).json({message: "user does not  exists"});
}
//insert anew user
const match= await bcrypt.compare(password , foundUser.password);
if(!match){
    res.status(401).json({message: "wrong password"});
}

//token
const accessToken = jwt.sign({
    UserInfo:{
        id:foundUser._id
    }
},process.env.ACCESS_TOKEN_SECRET , {expiresIn:"15 min"})
const refreshToken = jwt.sign({UserInfo:{
    id:foundUser._id
},
},
process.env.REFRESH_TOKEN_SECRET , {expiresIn: "7d"});

res.cookie("jwt",refreshToken , {
    httpOnly:true, //accessible by web server
    secure: true, //https
    sameSite: "None", //tous les domaine
    maxAge:1000 * 60 * 60 * 24 * 7, //ms
});
res.json({accessToken,
    email:foundUser.email,
});
};

const refresh = (req , res)=>{
    const cookies = req.cookies;
    if(!cookies?.jwt)  res.status(400).json({message: "Unauthorized"});
    const refreshToken = cookies.jwt;
    jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET , async(err ,decoded )=>{ 
    if(err) return res.status(403).json({message: "Forbidden"});
    const foundUser = await User.findById(decoded.UserInfo.id).exec();
    if(!foundUser) return res.status(401).json({message: "Unauthorized"});
    const accessToken = jwt.sign(
        {
        UserInfo:{
            id:foundUser._id
        }
    },
    process.env.ACCESS_TOKEN_SECRET , {expiresIn:"15 min"});
    res.json({accessToken});
        }
    );
};

const logout = (req,res)=>{
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204);  //no content
    res.clearCookie("jwt",{
        httpOnly:true,
        sameSite: "None",
        secure: true,
    });
    res.json({ message: "Cookie cleared"});
};


module.exports = {
    register,
    login,
    refresh,
    logout,
}