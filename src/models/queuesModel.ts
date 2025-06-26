import { STRING, JSONB, TEXT, INTEGER } from "sequelize"
import { db } from "@/config"

const QueuesModel = db.define('queues', {
	jobId: {
		type: STRING
	},
	repeatJobKey: {
		type: STRING
	},
	jobName: {
		type: STRING
	},
	queueType: {
		type: STRING
	},
	jobTime: {
		type: STRING
	},
	amount: {
		type: INTEGER,
		allowNull: false
	},
	status: {
		type: STRING,
		allowNull: false,
		defaultValue: "created"
	},
	repeatedCount: {
		type: INTEGER,
		allowNull: false
	},
	data: {
		type: TEXT,
		allowNull: false
	},
	referenceData: {
		type: JSONB,
		allowNull: true
	},
	signature: {
		type: TEXT,
		allowNull: false
	}
})



export default QueuesModel
