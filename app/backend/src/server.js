import app from "./app.js"
import dotenv from 'dotenv'
import './dbs/init.mssql.js'

dotenv.config()

const PORT = process.env.PORT || 3056

const server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`)
    console.log(`✅ http://localhost:${PORT}`)
})

process.on('SIGINT', () => {
    server.close(() => {
        console.log('\n❌ Server closed via SIGINT (Ctrl+C)')
    })
})