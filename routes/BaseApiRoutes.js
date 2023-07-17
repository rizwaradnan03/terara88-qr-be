const express = require('express')
const {
    listMenu,
    getMeja,
    ajukanPesanan,
    getBukti,
    listOrder,
    updateKonfirmasi,
    updatePengiriman,
    customerVerifikasiPembayaran,
    confirmSelesai,
} = require('../controllers/BaseApiController')

const router = express.Router()

router.get('/listMenu', listMenu)
router.get('/getMeja/:id', getMeja)
router.get('/getBukti/:id', getBukti)
router.post('/ajukanPesanan', ajukanPesanan)
router.get('/listOrder', listOrder)
router.patch('/updateKonfirmasi/:id', updateKonfirmasi)
router.patch('/updatePengiriman/:id', updatePengiriman)
router.get('/customerVerifikasiPembayaran/:id', customerVerifikasiPembayaran)
router.patch('/confirmSelesai/:id', confirmSelesai)

module.exports = router