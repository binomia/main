import { DATE, STRING, JSONB, TEXT, BOOLEAN } from "sequelize"
import { db } from "@/config"

const SessionModel = db.define('sessions', {
	verified: {
		type: BOOLEAN,
		defaultValue: false
	},
	sid: TEXT,
	deviceId: TEXT,
	expoNotificationToken: STRING,
	jwt: TEXT,
	expires: DATE,
	data: JSONB,
	signingKey: {
		type: TEXT,
		allowNull: false
	}
})



export default SessionModel
