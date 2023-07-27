import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import db from "../database/database.connection.js"
import { ObjectId } from "mongodb"
import jwt from 'jsonwebtoken';

export async function signUp(req, res) {
    const { name, email, password, photo } = req.body

    try {
        const user = await db.collection("users").findOne({ email })
        if (user) return res.status(409).send("E-mail já foi cadastrado!")

        const hash = bcrypt.hashSync(password, 10)

        await db.collection("users").insertOne({ name, email, password: hash, photo })
        res.sendStatus(201)

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function signIn(req, res){
    const { email, password } = req.body

    try {
        const user = await db.collection("users").findOne({ email })
        if (!user) return res.status(404).send("E-mail não cadastrado!")

        const isPasswordCorrect = bcrypt.compareSync(password, user.password)
        if (!isPasswordCorrect) return res.status(401).send("Senha incorreta! Tente novamente")
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(req.body, secret);
        console.log(token);
        await db.collection("sessions").insertOne({ token, userId: user._id })

        res.send({ token, userName: user.name, photo: user.photo})

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function logout(req, res) {
    const token = res.locals.session.token

    try {
        await db.collection("sessions").deleteOne({ token })
        res.sendStatus(200)//succefully logout
    } catch (err) {
        res.status(500).send(err.message)
    }
}



export async function getUserInfo(req, res) {
    const authorization = req.headers.authorization;

    if(!authorization) return res.sendStatus(404);

    try {
        const userId = await db.collection("sessions").findOne({ token:authorization });
        const user = await db.collection('users').findOne({_id:userId.userId});
        const products = await db.collection('shoppingCart').find({userId:userId.userId}).toArray();
        const amountOfProducts = (await db.collection('products').find().toArray()).length;
        const myProducts = [];

        
        if(products.length > 0)
        {
            let i = 0;
            do{
                const product = products[i];
                myProducts.push(await db.collection('products').findOne({_id: new ObjectId(product.idProduct)}));
                i++;
            } while(i < products.length);

            for (let i = 0; i < products.length; i++) {
               if(myProducts[i])
               {
                    myProducts[i].quantity = products[i].quantity;
               }
            }
        }
        
        return res.status(200).send({user:{token:authorization,userName:user.name,photo:user.photo},items:myProducts,amountOfProducts});
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message)
    }
}
