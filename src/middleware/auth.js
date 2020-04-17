const User = require('../models/User');
const jwt = require("jsonwebtoken");

const Auth = async (req, res, next ) => {

    // login ဝင်ထားတဲ့ user ကနေ request လုပ်တဲ့ request header မှာပါတဲ့ Authorization token ကို decode လုပ်, real user ဆိုရင် profile information ကို access လုပ်ခွင့်ပေး

    /**
     * 1 --> decode the authorization token with the secrete key
     * 2 --> find the user having the right authorization with the id got from decoded information
     * 3 --> add property to the middleware req argument with this user to be able to accesss from the request handler
     */

     try {
        const token = req.header("Authorization").replace("Bearer ", "");
        // (1)
        const decoded = await jwt.verify( token , process.env.JWT_SECRET_KEY);
   
        // (2)
        const user = await User.findOne( { _id: decoded._id , "tokens.token" : token } );

        if( !user ) {
            throw new Error();
        }
   
        // (3) now the request handler can access 'user' and 'token' properties via req object  
        
        req.user = user;
        req.token = token;
        
        next();

     } catch (error) {
         res.status(401).send( { error: "Please authenticate!" } );
     }
    
}

module.exports  = Auth;