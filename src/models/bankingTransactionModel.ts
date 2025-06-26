import { STRING, JSONB, DECIMAL, TEXT } from "sequelize"
import { db } from "@/config"
import short from "short-uuid"


const BankingTransactionsModel = db.define('banking_transactions', {
	transactionId: {
		type: STRING,
		defaultValue: () => `${short.generate()}${short.generate()}`
	},
	amount: {
		type: DECIMAL,
		allowNull: false
	},
	transactionType: {
		type: STRING,
		allowNull: false
	},
	deliveredAmount: {
		type: DECIMAL,
		allowNull: false,
		defaultValue: 0
	},
	voidedAmount: {
		type: DECIMAL,
		allowNull: false,
		defaultValue: 0
	},
	currency: {
		type: STRING,
		allowNull: false
	},
	status: {
		type: STRING,
		allowNull: false,
		defaultValue: "created"
	},
	location: {
		type: JSONB,
		allowNull: false
	},
	data: {
		type: JSONB,
		allowNull: false,
		defaultValue: {}
	},
	signature: {
		type: TEXT,
		allowNull: false
	}
})



export default BankingTransactionsModel
