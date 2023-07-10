const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
dotenv.config();

const { ERROR: httpError } = require('../../helpers/httpError');
const response = require('../../helpers/wrapper');
const model = require('../model/index');
const User = model.users;

router.post('/login', login);
router.post('/register', register);
module.exports = router;

async function register(req,res) {
   try {
        let { body } = req;
        let model = {
            full_name: body.full_name,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            phone: body.phone,
            profile_pic_url: 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'
        }

        let command = await User.create(model);

        return response.wrapper_success(res, 200, `Sukses register user`, command);
   } catch (error) {
       console.log(error)
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, error);
   }
}

async function login(req, res) {
    try {
        let { body } = req
        let model = {
            email : body.email,
            password : body.password
        }
        const checkName = await User.findOne({
            raw: true,
            where: { 'email': model.email }
        })
        
        if(!checkName) {
            return res.status(204).json({"message" : "Email not found"})
        }

        console.log(checkName)
    
        if(checkName && bcrypt.compareSync(model.password, checkName.password)) {
            const token = jwt.sign({ sub: checkName.id }, process.env.SECRET_JWT);
    
            return res.status(200).json(
                { 
                    code : 200,
                    success: true,
                    message : `Sukses login`, 
                    data: {
                        id: checkName.id,
                        full_name: checkName.full_name,
                        password: checkName.password,
                        email: checkName.email,
                        phone: checkName.phone,
                        profile_pic_url: checkName.profile_pic_url,
                    }, 
                    token: token
                }
            )        
        } else {
            return res.status(403).json({ code : 403, message : "Password Incorrect" })        
        }
    } catch (error) {     
        console.log(error)   
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, error);
    }
}