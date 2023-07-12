const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
require('dotenv').config()

const BaseApiRoutes = require('./routes/BaseApiRoutes')

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api', BaseApiRoutes)

app.get('/migrate_data', async (req, res) => {
    try {
        
        const checkData = await prisma.meja.findMany()

        if(checkData.length > 0){
            return res.status(200).json({message: 'Data Already Found'})
        }

        for (let i = 1; i <= 5; i++) {
            await prisma.meja.create({
                data: {
                    id: 'M' + i,
                    nomorMeja: 'MEJA ' + i
                }
            })
        }
        res.status(200).json('Success Migrate Data')
    } catch (error) {
        console.log(error)
    }
})

app.listen(process.env.PORT, '192.168.18.93', () => {
    console.log('Success Connected')
})