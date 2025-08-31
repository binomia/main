import { FLOAT, STRING, JSONB } from "sequelize"
import { db } from "@/config"

// transactionId
// senderId
// receiverId

const LedgerModel = db.define('ledger', {
    amount: {
        type: FLOAT,
        allowNull: false,
    },
    currency: {
        type: STRING,
        allowNull: false,
        defaultValue: 'DOP'
    },
    anomalies: {
        type: JSONB,
        allowNull: true
    },
    type: {
        type: STRING,
        allowNull: false
    },
    transactionId: {
        type: STRING,
        allowNull: false
    },
    notes: {
        type: STRING,
        allowNull: true
    },
    status: {
        type: STRING,
        allowNull: false
    },
    fee: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 0.00
    },
    beforeBalance: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 0.00
    },
    afterBalance: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 0.00
    },
    latitude: {
        type: FLOAT,
        allowNull: true
    },
    longitude: {
        type: FLOAT,
        allowNull: true
    }
});

export default LedgerModel