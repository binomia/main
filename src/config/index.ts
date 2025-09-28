import { Sequelize } from "sequelize";


export const db = new Sequelize({
    dialect: "postgres",
    database: "postgres",
    host: "postgres",
    port: 5432,
    username: "postgres",
    password: "postgres",
    logging: false
})

// postgres://postgres:postgres@postgres:5432/postgres
export const dbConnection = async () => {
    try {
        db.authenticate({ logging: false })
        db.sync()
        // console.log('\nDatabase connection has been established successfully.');
    } catch (error) {
        console.log('\nUnable to connect to the database:', error);
    }
}