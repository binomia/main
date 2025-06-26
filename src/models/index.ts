import AccountModel from "./accountModel"
import UsersModel from "./userModel"
import SessionModel from "./sessionModel"
import CardsModel from "./cardsModel"
import TransactionsModel from "./transactionModel"
import kycModel from "./kycModel"
import BankingTransactionsModel from "./bankingTransactionModel"
import QueuesModel from "./queuesModel"
import SugestedUsers from "./SugestedUsers"
import TopUpsModel from "./topups/topUpModel"
import TopUpCompanyModel from "./topups/topUpCompanyModel"
import TopUpPhonesModel from "./topups/topUpPhonesModel"


UsersModel.hasOne(kycModel)
kycModel.belongsTo(UsersModel)

TopUpsModel.belongsTo(TopUpPhonesModel, { foreignKey: 'phoneId', targetKey: 'id', as: 'phone' })
TopUpPhonesModel.hasMany(TopUpsModel, { as: 'topups', foreignKey: 'phoneId' })

TopUpPhonesModel.belongsTo(TopUpCompanyModel, { as: 'company', foreignKey: 'companyId' })
TopUpCompanyModel.hasMany(TopUpPhonesModel, { as: 'phones', foreignKey: 'companyId' })

TopUpPhonesModel.belongsTo(UsersModel)
UsersModel.hasMany(TopUpPhonesModel, { as: 'phones' })

TopUpsModel.belongsTo(UsersModel)
UsersModel.hasMany(TopUpsModel, { as: 'topups' })

TopUpsModel.belongsTo(TopUpCompanyModel, { foreignKey: 'companyId', targetKey: 'id', as: 'company' })
TopUpCompanyModel.hasMany(TopUpsModel, { as: 'topups', foreignKey: 'companyId' })

AccountModel.belongsTo(UsersModel, { foreignKey: 'username', targetKey: 'username', as: 'user' });
UsersModel.hasOne(AccountModel, { foreignKey: 'username', sourceKey: 'username', as: 'account' });


SessionModel.belongsTo(UsersModel)
UsersModel.hasMany(SessionModel)

CardsModel.belongsTo(UsersModel)
UsersModel.hasMany(CardsModel)

TransactionsModel.belongsTo(AccountModel, { foreignKey: 'fromAccount', targetKey: 'id', as: 'from' })
TransactionsModel.belongsTo(AccountModel, { foreignKey: 'toAccount', targetKey: 'id', as: 'to' })

QueuesModel.belongsTo(UsersModel)
UsersModel.hasMany(QueuesModel)

AccountModel.hasMany(TransactionsModel, { foreignKey: 'fromAccount', sourceKey: 'id', as: 'incomingTransactions' })
AccountModel.hasMany(TransactionsModel, { foreignKey: 'toAccount', sourceKey: 'id', as: 'outgoingTransactions' })

SugestedUsers.belongsTo(UsersModel, { foreignKey: 'ownerId', targetKey: 'id', as: 'owner' });
UsersModel.hasMany(SugestedUsers, { foreignKey: 'userId', sourceKey: 'id', as: 'user' });

BankingTransactionsModel.belongsTo(CardsModel)
CardsModel.hasMany(BankingTransactionsModel)

BankingTransactionsModel.belongsTo(AccountModel)
AccountModel.hasMany(BankingTransactionsModel)

export {
	QueuesModel,
	TopUpPhonesModel,
	SugestedUsers,
	UsersModel,
	BankingTransactionsModel,
	SessionModel,
	TransactionsModel,
	AccountModel,
	CardsModel,
	kycModel,
	TopUpsModel,
	TopUpCompanyModel
}