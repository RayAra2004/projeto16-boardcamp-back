import { db } from "../database/database.connection.js";

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

        if(game.rows[0].stockTotal >= rentals.rowCount) return res.sendStatus(400)

    }catch(err){
        res.status(500).send(err.message)
    }
}