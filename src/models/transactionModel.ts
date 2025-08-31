import { STRING, JSONB, DECIMAL, BOOLEAN, TEXT } from "sequelize"
import { db } from "@/config"
import short from "short-uuid"


const TransactionsModel = db.define('transactions', {
	transactionId: {
		type: STRING,
		defaultValue: () => `${short.generate()}${short.generate()}`
	},
	amount: {
		type: DECIMAL,
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
	transactionType: {
		type: STRING,
		allowNull: false
	},
	currency: {
		type: STRING,
		allowNull: false
	},
	status: {
		type: STRING,
		allowNull: false,
		defaultValue: "pending"
	},
	location: {
		type: JSONB,
		allowNull: false
	},
	senderFullName: {
		type: STRING,
		allowNull: false
	},
	receiverFullName: {
		type: STRING,
		allowNull: false
	},
	signature: {
		type: TEXT,
		allowNull: false
	},
	deviceId: {
		type: STRING,
		allowNull: false
	},
	ipAddress: {
		type: STRING,
		allowNull: false
	},
	isRecurring: {
		type: BOOLEAN,
		allowNull: false
	},
	platform: {
		type: STRING,
		allowNull: false
	},
	sessionId: {
		type: STRING,
		allowNull: false
	},

	previousBalance: {
		type: DECIMAL,
		allowNull: false
	},
	fraudScore: {
		type: DECIMAL,
		allowNull: false,
		defaultValue: 0
	},
	speed: {
		type: DECIMAL,
		allowNull: false
	},
	distance: {
		type: DECIMAL,
		allowNull: false
	},
	features: {
		type: STRING
	}
})



export default TransactionsModel
