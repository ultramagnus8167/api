import express from "express";
import handler from "../controllers/chat.controller.js";
var router = express.Router();

router.post("/chat", handler );

// ---------------
// Testing route
// ---------------

// router.get("/chat",(req,res)=>{
//   res.send('Dont use GET method')
// } );

export default router
