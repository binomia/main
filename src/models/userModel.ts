import { BOOLEAN, STRING } from "sequelize";
import { db } from "@/config";

const UsersModel = db.define('users', {
    fullName: {
        type: STRING,
        allowNull: false
    },
    username: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    dniNumber: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: STRING,
        allowNull: false
    },
    email: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: STRING,
        allowNull: false
    },
    profileImageUrl: {
        type: STRING,
        allowNull: true
    },
    // allowWhatsappNotification: {
    //     type: BOOLEAN,
    //     allowNull: false,
    //     defaultValue: true
    // },
    // allowEmailNotification: {
    //     type: BOOLEAN,
    //     allowNull: false,
    //     defaultValue: true
    // },
    // allowSmsNotification: {
    //     type: BOOLEAN,
    //     allowNull: false,
    //     defaultValue: true
    // },
    // allowPushNotification: {
    //     type: BOOLEAN,
    //     allowNull: false,
    //     defaultValue: true
    // },
    userAgreementSigned: {
        type: BOOLEAN,
        allowNull: false
    },
    idFrontUrl: {
        type: STRING,
        allowNull: false
    },
    idBackUrl: {
        type: STRING,
        allowNull: false
    },
    faceVideoUrl: {
        type: STRING,
        allowNull: false
    },
    status: {
        type: STRING,
        allowNull: false,
        defaultValue: "active"
    },
    address: {
        type: STRING,
        allowNull: false
    }
})



export default UsersModel