import { db } from "../database/database.connection.js";
import dayjs from "dayjs";


export async function getCustomers(req, res){
    const { cpf } = req.query

    try{
        let customers 
        if(cpf){
            customers = await db.query(`SELECT * FROM customers WHERE customers.cpf LIKE '${cpf}%';`);  
        }else{
            customers = await db.query("SELECT * FROM customers;");
        }
            
        const t = customers.rows.map(c => {
            const b = dayjs(c.birthday).format('YYYY-MM-DD')
            delete c.birthday
            return {
                ...c, birthday: b
            }
        })
        res.send(t);
    }catch(err){
        res.status(500).send(err.message);
    }
    
}

export async function getCustomer(req, res){
    const { id } = req.params;

    try{
        const customer = await db.query(`SELECT * FROM customers WHERE id = $1;`,
        [id])

        if(customer.rowCount === 0) return res.sendStatus(404)

        const b = dayjs(customer.rows[0].birthday).format('YYYY-MM-DD')

        delete customer.rows[0].birthday

        res.send({...customer.rows[0], birthday: b})

    }catch(err){
        res.status(500).send(err.message)
    }
}

export async function postCustomer(req, res){

    const {name, phone, cpf, birthday} = req.body;

    try{
        const customerExist = await db.query(`SELECT * FROM customers WHERE cpf = $1;`,
        [cpf])

        if(customerExist.rowCount > 0) return res.sendStatus(409);

        await db.query(`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`,
        [name, phone, cpf, birthday])

        res.sendStatus(201);

    }catch(err){
        res.status(500).send(err.message)
    }
}

export async function putCustomer(req, res){
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;

    try{
        const customersExist = await db.query(`SELECT * FROM customers WHERE id=$1;`,
        [id])

        if(customersExist.rowCount === 0) return res.sendStatus(404);

        const cpfDB = customersExist.rows[0].cpf;

        if(cpf === cpfDB){
            await db.query(`
            UPDATE customers SET name = $1, phone = $2, birthday = $3 WHERE id = $4;
            `, [name, phone, birthday, id])
        }else{
            const CPFExist = await db.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf])
            if(CPFExist.rowCount > 0) return res.sendStatus(409);

            await db.query(`
            UPDATE customers SET name = $1, phone = $2, birthday = $3, cpf = $4 WHERE id = $5;
            `, [name, phone, birthday,cpf, id])
        }

        res.sendStatus(200)

    }catch(err){
        res.status(500).send(err.message)
    }  
}