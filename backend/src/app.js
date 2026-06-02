const express = require('express')
const cors = require('cors')
const path = require('path')
const campeonatosRoutes = require('./routes/campeonatos');
require('dotenv').config()

require('./database')

const app = express()
app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '../../frontend')))

app.use('/torneios', require('./routes/torneios'))
app.use('/usuarios',  require('./routes/usuarios'));
app.use('/campeonatos', campeonatosRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor online: http://localhost:${process.env.PORT || 3000}`)
})