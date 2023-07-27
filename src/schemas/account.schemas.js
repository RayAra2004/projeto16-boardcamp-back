import joi from 'joi';

export const SignUpSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(), 
    password: joi.string().min(3).required(),
    photo: joi.string().required(),
})

export const SignInSchema = joi.object({
    email: joi.string().email().required(), 
    password: joi.string().min(3).required(),
})