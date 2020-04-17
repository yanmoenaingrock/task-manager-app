const express = require('express');
require('./db/mongoose');
const app = express();
const port = process.env.PORT;
const userRouter = require("./router/user");
const taskRouter = require("./router/task");

/** ------- Things to remember -----
 * generate token when we signup or login
 * we sent it to the client ( the client has access to this token )
 * save the token in the database 
 */

app.use(express.json())
app.use( userRouter );
app.use( taskRouter );

const multer = require("multer");
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb ) {
        if( !file.originalname.match(/\.(doc|docx)$/) ) {
            cb( new Error("Please upload a document file") );
        }

        cb(undefined, true);
    }
})


app.post("/upload", upload.single("upload"), ( req, res ) => {
    res.send();
}, (error, req, res, next) => {
    res.status(400).send( { error: error.message } );
})


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})