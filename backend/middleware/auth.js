import admin from "../config/firebase.js";

const verifyToken = async (req, res, next) => { 
  const token = req.headers.authorization?.split(" ")[1];
  if(!token){
    return res.status(401).send("Unauthorized");
  }
  try{
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  }catch(error){
    res.status().send("Invalid token");
  }
}

export default verifyToken;