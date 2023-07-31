import dayjs from "dayjs";
import { db } from "../database/database.connection.js";

export async function getRentals(req, res){
    const {customerId, gameId} = req.query
    let rentals;
    try{
        if(customerId){
            rentals = await db.query(
                `SELECT rentals.*, customers.id as "customerId", customers."name" as "customerName", games.id as "gameId", games."name" as "gameName" 
                FROM rentals
                INNER JOIN customers ON customers.id = rentals."customerId"
                INNER JOIN games ON games.id = rentals."gameId"
                WHERE customers.id = $1`, [customerId]
            )
        }else if(gameId){
            rentals = await db.query(
                `SELECT rentals.*, customers.id as "customerId", customers."name" as "customerName", games.id as "gameId", games."name" as "gameName" 
                FROM rentals
                INNER JOIN customers ON customers.id = rentals."customerId"
                INNER JOIN games ON games.id = rentals."gameId"
                WHERE games.id = $1`, [gameId]
            )
        }else{
            rentals = await db.query(
                `SELECT rentals.*, customers.id as "customerId", customers."name" as "customerName", games.id as "gameId", games."name" as "gameName" 
                FROM rentals
                INNER JOIN customers ON customers.id = rentals."customerId"
                INNER JOIN games ON games.id = rentals."gameId"`
            )
        }
        
    
        const resposta = rentals.rows.map( r => {
            const customer  = {id: r.customerId, name: r.customerName}
            const game = {id: r.gameId, name: r.gameName}
    
            const rentDate = dayjs(r.rentDate).format('YYYY-MM-DD')
    
            delete r.customerName
            delete r.gameName
    
            return {
                ...r, customer, game, rentDate
            }
        })
    
        res.send(resposta)
    }catch(err){
        res.status(500).send(err.message)
    }
    
}

export async function postRentals(req, res){
    const { customerId, gameId , daysRented } = req.body;
    try{

        const customer = await db.query(`SELECT * FROM customers WHERE id = $1;`,
        [customerId])

        if(customer.rowCount === 0) return res.sendStatus(400)

        const game = await db.query(`SELECT * FROM games WHERE id = $1;`,
        [gameId])

        if(game.rowCount === 0) return res.sendStatus(400)

        //TODO: Conferir se o aluguel deste jogo não ultrapassa os disponíveis no estoque.
        const rentals = await db.query(
            `
                SELECT * FROM rentals
                INNER JOIN games ON rentals."gameId" = games.id
            `
        )

        if(game.rows[0].stockTotal - rentals.rowCount < 1 ) return res.sendStatus(400)

        await db.query(
            `INSERT INTO rentals("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES 
            ($1, $2, $3, $4, $5, $6, $7)`, 
            [customerId, gameId , dayjs().format('YYYY-MM-DD'), daysRented, null, Number(daysRented) * Number(game.rows[0].pricePerDay), null]
        )

        res.sendStatus(201)

    }catch(err){
        res.status(500).send(err.message)
    }
}

export async function finalizeRent(req, res){
    const { id } = req.params

    try{
        const rental = await db.query(`SELECT * FROM rentals WHERE id = $1`,
        [id])

        if(rental.rowCount === 0) return res.sendStatus(404)

        if(rental.rows[0].returnDate !== null) return res.sendStatus(400)

        const game = await db.query(`SELECT * FROM games WHERE id = $1`, [rental.rows[0].gameId])


        let d = Math.round((new Date(dayjs().format("YYYY-MM-DD")) - new Date(rental.rows[0].rentDate)) / (1000 * 60 * 60 * 24)) - rental.rows[0].daysRented
        if(d < 0) d = 0
        await db.query(`UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3`,
        [dayjs().format("YYYY-MM-DD"), (d * game.rows[0].pricePerDay), id])

        res.sendStatus(200)
    }catch(err){
        res.status(500).send(err.message)
    }
}

export async function deleteRental(req, res){
    const { id } = req.params
    try{
        const rental = await db.query(`SELECT * FROM rentals WHERE id = $1`, [id])

        if(rental.rowCount === 0) return res.sendStatus(404)

        if(rental.rows[0].returnDate === null) return res.sendStatus(400)

        await db.query(`DELETE FROM rentals WHERE id = $1`, [id])

        res.sendStatus(200)

    }catch(err){
        res.status(500).send(err.message)
    } 
}