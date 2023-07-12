const express = require('express')
const {
    listMenu,
    getMeja,
    ajukanPesanan,
    getBukti
} = require('../controllers/BaseApiController')

const router = express.Router()

router.get('/listMenu', listMenu)
router.get('/getMeja/:id', getMeja)
router.get('/getBukti/:id', getBukti)
router.post('/ajukanPesanan', ajukanPesanan)

module.exports = router