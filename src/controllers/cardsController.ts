import {checkForProtectedRequests, getQueryResponseFields} from '@/helpers'
import {CardsModel, UsersModel} from '@/models'
import {GraphQLError} from 'graphql';
import {CardModelType} from '@/types';
import {CardAuthSchema} from '@/auth';
import {Op} from 'sequelize';
import cardValidator from 'card-validator';
import {AES, HASH} from 'cryptografia';
import {ZERO_ENCRYPTION_KEY} from '@/constants';

export class CardsController {
    static card = async (_: unknown, {cardId}: { cardId: number }, {req}: { req: any }, {fieldNodes}: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);

            const fields = getQueryResponseFields(fieldNodes, 'card')
            const card = await CardsModel.findOne({
                where: {
                    [Op.and]: [
                        {userId: session.userId},
                        {id: cardId}
                    ]
                },
                include: [{
                    model: UsersModel,
                    as: 'user',
                    attributes: fields['user']
                }]
            })

            if (!card)
                throw new GraphQLError('The given user does not have a card linked');


            const decryptedCardData = await AES.decryptAsync(card?.dataValues?.data, ZERO_ENCRYPTION_KEY)
            return Object.assign({}, card.toJSON(), JSON.parse(decryptedCardData))

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static cards = async (_: unknown, __: unknown, {req}: { req: any }, {fieldNodes}: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);

            const fields = getQueryResponseFields(fieldNodes, 'cards')
            return await CardsModel.findAll({
                where: {userId: session.userId},
                attributes: fields['cards'],
                include: [{
                    model: UsersModel,
                    as: 'user',
                    attributes: fields['user']
                }]
            })

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static createCard = async (_: unknown, {data}: { data: CardModelType }, {req}: { req: any }, {fieldNodes}: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(req);
            const validatedData = await CardAuthSchema.createCard.parseAsync(data)

            // if (!IS_VALID_CARD_LENGTH(validatedData.cardNumber))
            //     throw new GraphQLError('Card inserted is not valid');

            const hash = await HASH.sha256Async(validatedData.cardNumber)
            const cardExist = await CardsModel.findOne({
                where: {
                    [Op.and]: [
                        {hash},
                        {userId: session.userId}
                    ]
                }
            })

            if (cardExist)
                throw new GraphQLError('Tarjeta ya esta vinculada');

            const encryptedCardData = await AES.encryptAsync(JSON.stringify(validatedData), ZERO_ENCRYPTION_KEY)

            if (validatedData.isPrimary)
                await CardsModel.update({isPrimary: false}, {
                    where: {
                        userId: session.userId
                    }
                })

            const cardValidated = cardValidator.number(validatedData.cardNumber)
            const card = await CardsModel.create({
                brand: cardValidated.card?.type ?? 'unknown',
                alias: validatedData.alias,
                last4Number: validatedData.cardNumber.slice(-4),
                isPrimary: validatedData.isPrimary,
                hash,
                data: encryptedCardData,
                userId: session.userId
            })

            const fields = getQueryResponseFields(fieldNodes, 'card')
            return await card.reload({
                attributes: fields['card'],
                include: [{
                    model: UsersModel,
                    as: 'user',
                    attributes: fields['user']
                }]
            })

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static updateCard = async (_: unknown, {cardId, data}: { cardId: number, data: CardModelType }, {req}: { req: any }) => {
        try {
            const session = await checkForProtectedRequests(req);
            const validatedData: CardModelType = await CardAuthSchema.updateCard.parseAsync(data)

            const card = await CardsModel.findOne({
                where: {
                    [Op.and]: [
                        {userId: session.userId},
                        {id: cardId}
                    ]
                }
            })

            if (!card)
                throw new GraphQLError('The given user does not have a card linked');

            const hash = await HASH.sha256Async(validatedData.cardNumber)
            const encryptedCardData = await AES.encryptAsync(JSON.stringify(validatedData), ZERO_ENCRYPTION_KEY)
            const cardUpdated = await card.update({
                alias: validatedData.alias,
                isPrimary: validatedData.isPrimary,
                last4Number: validatedData.cardNumber.slice(-4),
                brand: cardValidator.number(validatedData.cardNumber).card?.type ?? 'unknown',
                hash,
                data: encryptedCardData
            }, {
                where: {
                    userId: session.userId
                }
            })

            return {
                ...cardUpdated.toJSON(), user: session.user
            }

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static deleteCard = async (_: unknown, {hash}: { hash: string }, {req}: { req: any }) => {
        try {
            const session = await checkForProtectedRequests(req);
            const card = await CardsModel.findOne({
                where: {
                    [Op.and]: [
                        {userId: session.userId},
                        {hash}
                    ]
                }
            })

            if (!card)
                throw new GraphQLError('Tarjeta no vinculada');

            await card.destroy()
            return card.toJSON()

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }
}