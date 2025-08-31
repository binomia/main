import { z } from 'zod'

export class UserJoiSchema {
    static user = z.object({
        id: z.number(),
        fullName: z.string(),
        username: z.string(),
        dniNumber: z.string(),
        phone: z.string().length(10),
        email: z.string().email(),
        profileImageUrl: z.string().nullish().transform(v => v ?? ""),
        userAgreementSigned: z.boolean().default(false),
        idFrontUrl: z.string().url(),
        idBackUrl: z.string().url(),
        faceVideoUrl: z.string().url(),
        address: z.string(),
        createdAt: z.string(),
        updatedAt: z.string()
    }).partial().nullable().default(null)

    static createUser = z.object({
        fullName: z.string(),
        username: z.string(),
        phone: z.string().length(10),
        email: z.string().email(),
        password: z.string().min(6),
        profileImageUrl: z.string().url().optional().nullable().default(null),
        userAgreementSigned: z.boolean().default(false),
        idFrontUrl: z.string().url(),
        idBackUrl: z.string().url(),
        faceVideoUrl: z.string().url(),
        address: z.string(),

        dniNumber: z.string().regex(/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/),
        dob: z.string(),
        dniExpiration: z.string(),
        occupation: z.string().optional().nullable().default(null),
        gender: z.string().optional().nullable().default(null),
        maritalStatus: z.string().optional().nullable().default(null),
        bloodType: z.string().optional().nullable().default(null)
    })

    static updateUser = z.object({
        fullName: z.string().nullish().optional(),
        username: z.string().nullish().optional(),
        phone: z.string().length(10).nullish().optional(),
        email: z.string().email().nullish().optional(),
        profileImageUrl: z.string().url().nullish().optional(),
        userAgreementSigned: z.boolean().nullish().optional(),
        idFrontUrl: z.string().url().nullish().optional(),
        idBackUrl: z.string().url().nullish().optional(),
        faceVideoUrl: z.string().url().nullish().optional(),
        address: z.string().nullish().optional(),
        dob: z.string().nullish().optional(),
        dniExpiration: z.string().nullish().optional(),
        occupation: z.string().optional().nullish().optional(),
        gender: z.string().optional().nullish().optional(),
        maritalStatus: z.string().optional().nullish().optional(),
        bloodType: z.string().optional().nullish().optional()
    }).refine(data => Object.values(data).some(value => value !== undefined && value !== null), {
        message: "At least one property must be provided"
    });


    static login = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })


    static updateUserPassword = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })
}
