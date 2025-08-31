import { DATE, STRING } from "sequelize"
import { db } from "@/config"


const KYCModel = db.define('kyc', {
    dniNumber: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    dob: {
        type: DATE,
        allowNull: false
    },
    status: {
        type: STRING,
        allowNull: false
    },
    expiration: {
        type: DATE,
        allowNull: false
    },
    occupation: {
        type: STRING,
        allowNull: true
    },
    gender: {
        type: STRING,
        allowNull: true
    },
    maritalStatus: {
        type: STRING,
        allowNull: true
    },
    bloodType: {
        type: STRING,
        allowNull: true
    }
})



export default KYCModel
