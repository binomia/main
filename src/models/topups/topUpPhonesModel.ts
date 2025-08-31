import { DATE, STRING } from "sequelize"
import { db } from "@/config"

const TopUpPhonesModel = db.define('topups-phones', {
    fullName: STRING,
    phone: STRING,
    lastUpdated: DATE
})



export default TopUpPhonesModel
