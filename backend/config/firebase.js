import admin from "firebase-admin";
import serviceAccountKey from "./serviceAccountKey.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
}); 
export default admin;