import express from "express";
import handler from "../controllers/chat.controller.js";
import temphandler from "../controllers/chat2.controller.js";
var router = express.Router();

router.post("/chat", handler );

router.post("/chat2", temphandler );

// ---------------
// Testing route
// ---------------

// router.get("/chat",(req,res)=>{
//   res.send('Dont use GET method')
// } );

export default router
