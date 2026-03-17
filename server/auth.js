import jwt from "jsonwebtoken";
import db from "./db.js";

const SECRET = process.env.JWT_SECRET || "my_secret_key";

export function register(req,res){

  const {username,password} = req.body;

  db.run(
    "INSERT INTO users(username,password) VALUES (?,?)",
    [username,password],
    function(err){

      if(err){
        return res.status(400).json({error:"username already exists"});
      }

      res.json({success:true});

    }
  )

}

export function login(req,res){

  const {username,password} = req.body;

  db.get(
    "SELECT * FROM users WHERE username=?",
    [username],
    (err,user)=>{

      if(!user || user.password!==password){
        return res.status(401).json({error:"invalid credentials"});
      }

      const token = jwt.sign(
        {id:user.id,username:user.username},
        SECRET
      );

      res.json({
        token,
        username:user.username
      });

    }
  )

}

export function authMiddleware(req,res,next){

  const header = req.headers.authorization;

  if(!header){
    return res.status(401).json({error:"no token"});
  }

  const token = header.split(" ")[1];

  try{

    const decoded = jwt.verify(token,SECRET);

    req.user = decoded;

    next();

  }catch(err){

    return res.status(401).json({error:"invalid token"});

  }

}