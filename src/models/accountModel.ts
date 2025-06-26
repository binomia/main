import { db } from "@/config";
import { STRING, FLOAT, BOOLEAN } from "sequelize";
import short from 'short-uuid';


const AccountModel = db.define('accounts', {
    balance: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    status: {
        type: STRING,
        allowNull: false,
        defaultValue: "active"
    },
    sendLimit: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 50e3
    },
    receiveLimit: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 50e3
    },
    withdrawLimit: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 50e3
    },
    depositLimit: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 50e3
    },
    hash: {
        type: STRING,
        allowNull: false,
        defaultValue: () => short.generate()
    },
    currency: {
        type: STRING,
        allowNull: false,
        defaultValue: "DOP"
    },
    allowReceive: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    allowSend: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    allowWithdraw: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    allowDeposit: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    allowRequestMe: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    allowWhatsappNotification: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    allowEmailNotification: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    allowSmsNotification: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    allowPushNotification: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
})

export default AccountModel