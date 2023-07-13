const express = require('express')
const {
    listMenu,
    getMeja,
    ajukanPesanan,
    getBukti,
    listOrder,
    updateKonfirmasi
} = require('../controllers/BaseApiController')

const router = express.Router()

router.get('/listMenu', listMenu)
router.get('/getMeja/:id', getMeja)
router.get('/getBukti/:id', getBukti)
router.post('/ajukanPesanan', ajukanPesanan)
router.get('/listOrder', listOrder)
router.patch('/updateKonfirmasi/:id', updateKonfirmasi)

module.exports = router