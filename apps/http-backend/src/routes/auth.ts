import express, { Router } from "express";

const router: Router = Router();

router.post("/register", (req, res) => {
    res.json({ message: "signup page"});
})

router.post("/signin", (req, res)=>{
    res.json({ message: "signin page"});
})

router.post("/logout", (req,res) => {

})



export default router;