import { GlobalZodSchema, UserJoiSchema } from '@/auth';
import { AccountModel, kycModel, SessionModel, TopUpCompanyModel, TransactionsModel, UsersModel } from '@/models';
import { faker } from '@faker-js/faker';
import { Op } from 'sequelize';
import short, { generate } from 'short-uuid';
import bcrypt from 'bcrypt';
import { ZERO_ENCRYPTION_KEY } from '@/constants';
import jwt from 'jsonwebtoken';

const createUsers = async () => {
    const users = [
        {
            "email": "brayhandeaza@gmail.com"
        },
        {
            "email": "lpmrloki@gmail.com"
        }
    ]
    for (let i = 0; i < 2; i++) {
        await UsersModel.create({
            fullName: faker.person.fullName(),
            username: faker.internet.userName(),
            "phone":    `829180907${i}`,
            "userAgreementSigned": true,
            email: users[i].email,
            "password": "123456",
            profileImageUrl: faker.image.avatar(),
            "dniNumber": `000-000000${i}-${i}`,
            sex: faker.person.sex(),
            address: faker.location.streetAddress(),
            dob: faker.date.birthdate(),
            dniExpiration: faker.date.future(),
            "gender": null,
            "bloodType": null,
            "occupation": null,
            "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
            "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
            "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
        })
    }
    await createBinomiaUser()
}


const createTransactions = async () => {
    for (let i = 0; i < 1; i++) {
        const amount = faker.number.int({ min: 1, max: 1000 })
        await TransactionsModel.create({
            amount,
            deliveredAmount: amount,
            balanceAfterTransaction: amount,
            balanceBeforeTransaction: amount,
            voidedAmount: 0,
            refundedAmount: 0,
            transactionType: 'debit',
            currency: 'USD',
            description: faker.lorem.sentence(),
            status: 'success',
            location: {
                latitude: faker.location.latitude(),
                longitude: faker.location.longitude()
            },
            signature: faker.database.mongodbObjectId(),
            senderId: 1,
            receiverId: 2
        })
    }
}

const createTopUpCompany = async () => {
    const companies: any[] = [
        {
            status: "active",
            name: "Claro",
            logo: "https://res.cloudinary.com/brayhandeaza/image/upload/v1737338468/r4vnvrtwkj7ylrsm3qd7.png"
        },
        {
            status: "active",
            name: "Viva",
            logo: "https://res.cloudinary.com/brayhandeaza/image/upload/v1737339046/qm6jgueig8bn9m05y108.png"
        },
        {
            status: "active",
            name: "Artice",
            logo: "https://res.cloudinary.com/brayhandeaza/image/upload/v1737338894/cgs9z445pxjumqs8xyiq.png"
        },
    ]

    companies.forEach(async (company) => {
        await TopUpCompanyModel.create(company)
    })

}

const createBinomiaUser = async () => {
    try {
        const data = {
            "fullName": "binomia",
            "username": "$binomia",
            "phone": "8297809087",
            "userAgreementSigned": true,
            "email": "brayhan.market@gmail.com",
            "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
            "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
            "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
            "dniNumber": "000-0000000-0",
            "gender": null,
            "bloodType": null,
            "occupation": null,
            "profileImageUrl": null,
            "address": "test",
            "dob": "2025-01-01T00:00:00.000Z",
            "dniExpiration": "2023-01-10T00:00:00.000Z",
            "password": "123456"
        }

        const validatedData = await UserJoiSchema.createUser.parseAsync(data)
        const registerHeader = await GlobalZodSchema.registerHeader.parseAsync({
            "session-auth-identifier": "00000000000fb36cc0bde8cb00923b2ba6a7a6665cc6b7dde6f8d8c256976030",
            device: "{}"
        })

        const regexPattern = new RegExp('^\\d{3}-\\d{7}-\\d{1}');

        if (!regexPattern.test(validatedData.dniNumber)) {
            console.log("Invalid dni number: " + validatedData.dniNumber);
            return
        }


        const userExists = await UsersModel.findOne({
            where: {
                [Op.or]: [
                    { email: validatedData.email },
                    { username: validatedData.username }
                ]
            },
            attributes: ["email", "username", "dniNumber"]
        })

        if (userExists?.toJSON().email === validatedData.email) {
            console.log("A user with email: " + validatedData.email + " already exists");
            return
        }

        if (userExists?.toJSON().username === validatedData.username) {
            console.log("A user with username: " + validatedData.username + " already exists");
            return
        }


        const kycExists = await kycModel.findOne({
            where: {
                dniNumber: validatedData.dniNumber
            }
        })

        if (kycExists) {
            console.log("A user with dni: " + validatedData.dniNumber + " already exists");
            return
        }



        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(validatedData.password, salt);

        const user = await UsersModel.create(Object.assign({}, validatedData, {
            password: hashedPassword
        }))

        const userData = user.toJSON()

        const account = await AccountModel.create({
            username: user.dataValues.username,
            currency: "DOP",
        })

        const kyc = await kycModel.create({
            userId: userData.id,
            dniNumber: validatedData.dniNumber,
            dob: validatedData.dob,
            status: "validated",
            expiration: validatedData.dniExpiration,
            occupation: validatedData.occupation,
            gender: validatedData.gender,
            maritalStatus: validatedData.maritalStatus,
            bloodType: validatedData.bloodType
        })

        const sid = `${generate()}${generate()}${generate()}`
        const token = jwt.sign({
            userId: userData.id,
            sid
        }, ZERO_ENCRYPTION_KEY);

        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24) // 1 day

        await SessionModel.create({
            sid,
            deviceId: registerHeader['deviceid'],
            jwt: token,
            userId: user.dataValues.id,
            expires,
            data: registerHeader.device || {}
        })

        return {
            ...userData,
            accounts: [account.toJSON()],
            kyc: kyc.toJSON(),
            token
        }

    } catch (error: any) {
        console.log(error);
    }
}


// 9Gud3MqryACQ3mD4pKyStB9Gud3MqryACQ3mD4pKyStB


export const seedDatabase = async () => {
    // await createBinomiaUser()
    // await createUsers()
    await createTopUpCompany()
    // await createTransactions()
}