import {TopUpCompanyModel} from '@/models';
import {UsersController} from '@/controllers';


const createUsers = async (req: any) => {
    try {
        const users = [
            {
                "fullName": "Binomia",
                "username": "$binomia",
                "phone": "8098027291",
                "userAgreementSigned": true,
                "email": "brayhandeaza@gmail.com",
                "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "dniNumber": "000-0000000-0",
                "gender": null,
                "bloodType": null,
                "occupation": null,
                "profileImageUrl": null,
                "address": "Calle 2 #13, Las Palmeras, Guaricano, Santo Domingo Norte ",
                "dob": "2023-01-10T00:00:00.000Z",
                "dniExpiration": "2023-01-10T00:00:00.000Z",
                "password": "123456",
                "maritalStatus": null
            },
            {
                "fullName": "Brayhan De Aza",
                "username": "brayhandeaza",
                "phone": "8098027291",
                "userAgreementSigned": true,
                "email": "lpmrloki@gmail.com",
                "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "dniNumber": "000-0000000-1",
                "gender": null,
                "bloodType": null,
                "occupation": null,
                "profileImageUrl": null,
                "address": "Calle 2 #13, Las Palmeras, Guaricano, Santo Domingo Norte ",
                "dob": "2023-01-10T00:00:00.000Z",
                "dniExpiration": "2023-01-10T00:00:00.000Z",
                "password": "123456",
                "maritalStatus": null
            },
            {
                "fullName": "Top-Ups",
                "username": "$binomia_topups",
                "phone": "8098027291",
                "userAgreementSigned": true,
                "email": "topups@gmail.com",
                "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "dniNumber": "000-0000000-2",
                "gender": null,
                "bloodType": null,
                "occupation": null,
                "profileImageUrl": null,
                "address": "Calle 2 #13, Las Palmeras, Guaricano, Santo Domingo Norte ",
                "dob": "2023-01-10T00:00:00.000Z",
                "dniExpiration": "2023-01-10T00:00:00.000Z",
                "password": "123456",
                "maritalStatus": null
            },
            {
                "fullName": "Reserve",
                "username": "$binomia_reserve",
                "phone": "8098027291",
                "userAgreementSigned": true,
                "email": "reserve@gmail.com",
                "idFrontUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "idBackUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "faceVideoUrl": "https://res.cloudinary.com/brayhandeaza/image/upload/v1727570912/dinero/cedulas/1727570911329.jpg",
                "dniNumber": "000-0000000-3",
                "gender": null,
                "bloodType": null,
                "occupation": null,
                "profileImageUrl": null,
                "address": "Calle 2 #13, Las Palmeras, Guaricano, Santo Domingo Norte ",
                "dob": "2023-01-10T00:00:00.000Z",
                "dniExpiration": "2023-01-10T00:00:00.000Z",
                "password": "123456",
                "maritalStatus": null
            }
        ]

        for (const data of users) {
            await UsersController.createUser(null, {data}, {__: {}, req})
        }

    } catch (error) {
        console.log({createUsers: error})
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

export const seedDatabase = async (req: any) => {
    await createUsers(req)
    await createTopUpCompany()
}