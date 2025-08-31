import { BOOLEAN, TEXT, STRING } from "sequelize"
import { db } from "@/config"

const CardsModel = db.define('cards', {
    data: TEXT,
    last4Number: STRING,
    brand: STRING,
    alias: STRING,
    isPrimary: {
        type: BOOLEAN,
        defaultValue: false
    },
    hash: TEXT
})



export default CardsModel
