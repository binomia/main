import { DECIMAL, JSONB, STRING } from "sequelize"
import { db } from "@/config"

const TopUpsModel = db.define('topups', {
    amount: DECIMAL,
    referenceId: STRING,
    status: STRING,
    location: {
        type: JSONB,
        allowNull: false
    }
})

export default TopUpsModel
