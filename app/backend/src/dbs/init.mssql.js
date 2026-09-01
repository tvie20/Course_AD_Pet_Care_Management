import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import initModels from '../models/init-models.js'

dotenv.config()

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mssql',
        logging: true,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            encrypt: false,
            trustServerCertificate: true
        }
    }
)

const models = initModels(sequelize)

sequelize.authenticate()
    .then(() => console.log('✅ Connected to PetCareX successfully!'))
    .catch(err => console.error('❌ Connection failed:', err))

export { sequelize, models }
export default models
