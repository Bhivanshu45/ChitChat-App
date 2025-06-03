const jwt = require('jsonwebtoken');

exports.authUser = (req, res, next) => {
    try{
            // fetch token 
            // console.log("Request Body : ",req.body);
            // console.log("YES Yes Yes Yes")
            const token = (req.header("Authorization") &&
                req.header("Authorization").replace("Bearer ", ""));
    
            // validate token
            // console.log("Token : ",token);

            if(!token){
                return res.status(401).json(
                    {
                        success:false,
                        message:"Token Missing"
                    }
                )
            }
    
            // verify and get data from token
            try{
                const payload = jwt.verify(token,process.env.JWT_SECRET);
    
                // send payload data to next middleware inside request
                
                req.user = payload;
                
    
            }catch(err){
                return res.status(401).json(
                    {
                        success:false,
                        message:"Token is Invalid"
                    }
                )
            }
    
            // next middleware
            // console.log("Req : ",req.user);
            next();
    
        }catch(err){
            console.log(err);
            res.status(500).json({
                success:false,
                message:"Something went Wrong"
            })
    }
}