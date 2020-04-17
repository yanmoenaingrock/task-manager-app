const express = require("express");
const router = new express.Router();
const User = require("../models/User");
const Auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, cancelEmail } = require("../email/account");

const upload = multer( {
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb ){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error("Upload an image file") );
        }
        cb(undefined, true);
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save(); 
        sendWelcomeEmail( user.email, user.name );
        const token = await user.generateAuthToken();
        res.status(201).send( {user, token} );
    } catch (e) {
        res.status(400).send(e)
    }
    
})

/** loggin in user */
router.post("/users/login", async (req, res) => {
    try {
        
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send( {user, token} );
    } catch (error) {
        res.status(400).send( error.message );
    }
})

router.post("/users/logout", Auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter( token => token.token !== req.token );
        await req.user.save();
        res.send( req.user );
    } catch (error) {
        res.status(500).send( err.message );
    }
})

router.post("/users/logoutAll", Auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send( { error: "Unable to logout of all accounts"} );
    }
})

router.get("/users/profile", Auth, async ( req, res ) => {
    res.send( req.user );
})

router.patch("/users/profile",Auth, async(req,res) => {

    const updates = Object.keys( req.body );
    const allowedUpdates = ["name","email","age","password"];
    const isValidUpdates = updates.every( update => allowedUpdates.includes( update ) );

    if(!isValidUpdates ) {
        return res.status(400).send({ error: "Invalid updates"} );
    }

    try {

        updates.forEach( update => req.user[update] = req.body[update] );

        await req.user.save();

        res.send( req.user );

    } catch (error) {
        res.status(400).send( error.message );
    }
})

router.delete("/users/profile", Auth, async (req,res) => {
    try {
        await req.user.remove();
        cancelEmail(req.user.email, req.user.name );
        return res.send( req.user );
    } catch (error) {
        res.status(500).send( error.message );
    }
})

router.post("/users/profile/avatar", Auth, upload.single("avatar") , async ( req, res ) => {
    const avatar = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = avatar;
    await req.user.save();
    res.send();
}, (error, req, res, next ) => {
    res.status(400).send({ error: error.message } );
})

router.delete("/users/profile/avatar", Auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send( req.user );
    } catch (error) {
        res.send({ error: error.message } );
    }
})

router.get("/users/:id/avatar",async (req, res) => {
    try {
        const user = await User.findById( req.params.id );
        if(!user || !user.avatar ) {
            throw new Error();
        }
        res.set("Content-Type", "image/jpg");
        res.send( user.avatar );
    } catch (error) {
        res.send({ error: error.message } );
    }
})

module.exports = router;
