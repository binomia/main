import Joi from 'joi'


export class EmailJoiSchema {
    static sendEmail = Joi.object({
        subject: Joi.string().required(),
        message: Joi.string().required(),
        html: Joi.string().optional()
    })
}
