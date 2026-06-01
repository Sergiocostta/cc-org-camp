const express = require('express')
const cors = require('cors')
require('dotenv').config()

require('./database')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/torneios', require('./routes/torneios'))

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor online: http://localhost:${process.env.PORT || 3000}`)
})
