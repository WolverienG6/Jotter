const express = require('express')
const router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "Gautamissexy";


//ROUTE 1: Registering a user \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
router.post('/createuser', [ 

    //applying validators
    body('name','Enter a valid name').isLength({min: 3}),
    body('email' , 'Enter a valid Email').isEmail(),
    body('password' , 'Password must be atleast 5 characters long').isLength({ min: 5 })
] ,
async (req,res)=>{
   let success = false;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }

    try{
      //check for already existing user
      let user = await User.findOne({email: req.body.email});
      if(user) {
          return res.status(400).json({success,error: "Email already registered!"})
      }

      //converting password into strong hash using bcrypt package
      const salt = await bcrypt.genSalt(10);
      securePassword = await bcrypt.hash(req.body.password,salt);

      //if user does not alredy exist i.e. New User
      user = await User.create({
          name: req.body.name,
          password: securePassword,
          email: req.body.email
        })
      
        const data = {
          user: {
            id: user.id
          }
        }

      const authToken = jwt.sign(data,JWT_SECRET);
      success = true;
      res.json({success,authToken});
    }
    catch(error){
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
})


//ROUTE 2 : Authentication an existing user \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
router.post('/login', [
  //applying validators
  body('email' , 'Enter a valid Email').isEmail(),
  body('password' , 'Insert Password').exists()
  ],

  async(req,res) => {

    let success = false;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email,password} = req.body;

    try{
      let user = await User.findOne({email});
      if(!user) {
        return res.status(400).json({success,error: "Please try to login with correct credentials"});
      }

      const passwordCompare = await bcrypt.compare(password,user.password);

      if(!passwordCompare) {
        return res.status(400).json({success,error: "Please try to login with correct credentials"});
      }

      const data = {
        user: {
          id: user.id
        }
      }

      const authToken = jwt.sign(data,JWT_SECRET);
      success = true;
      res.json({success,authToken});

    }catch(error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);


//ROUTE 3 : get Loggged in User details \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router.post('/getuser', fetchuser ,
  async(req,res) => {

    try{
      userId = req.user;
      console.log(req.user);
      const user = await User.findById(userId).select("-password");
      res.send(user);
    }catch(error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);



module.exports = router