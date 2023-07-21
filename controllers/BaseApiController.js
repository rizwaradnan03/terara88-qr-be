const axios = require('axios');
require('dotenv').config()
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const BaseResponse = require('./BaseResponseController');

const baseUrl = process.env.ERP_URL
const headerSuper = {
    Authorization: `token ${process.env.API_KEY_SUPER}:${process.env.API_SECRET_SUPER}`,
};
const headerCashier = {
    Accept: 'application/json',
    Authorization: `token ${process.env.API_KEY_CASHIER}:${process.env.API_SECRET_CASHIER}`,
};

const listMenu = async (req, res) => {
    try {
        const hitApi = await axios.post(
            `${baseUrl}/method/erpnext.selling.page.point_of_sale.point_of_sale.get_items`,
            {
                start: '0',
                page_length: '50',
                price_list: 'Standard Selling',
                item_group: 'All Item Groups',
                search_term: '',
                pos_profile: 'Default',
            },
            {
                headers: headerSuper,
            }
        );

        const hitResult = hitApi.data.message.items;

        const datas = hitResult
            .filter(
                (item) =>
                    item.item_code !== 'BKS HLS' &&
                    item.item_code !== 'BKS HLS 1/2' &&
                    item.item_code !== 'BKS MZR' &&
                    item.item_code !== 'BKS TLR' &&
                    item.item_code !== 'BKS URT' &&
                    item.item_code !== 'ES BATU' &&
                    item.item_code !== 'INV-1'
            )
            .map((item) => ({
                kode: item.item_code,
                nama: item.item_name,
                harga: new Intl.NumberFormat('en-US').format(item.price_list_rate),
            }));

        const response = BaseResponse(200, 'Data Found', datas);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
    }
};

const listOrder = async (req, res) => {
    try {
        const dataMenungguKonfirmasi = await prisma.$queryRawUnsafe(`SELECT "order"."id" as id, "order"."namaPembeli" as "namaPembeli", "order"."catatanPembeli" as "catatanPembeli", "meja"."nomorMeja" as meja, "order"."totalBayar" as "totalBayar", "order".pesanan as pesanan, "order"."isDone" as "isDone" FROM "order" INNER JOIN "meja" ON "meja".id = "order"."mejaId" WHERE "order"."isDone" = 0 ORDER BY "order"."createdAt"`)
        const dataMenungguPengiriman = await prisma.$queryRawUnsafe(`SELECT "order"."id" as id, "order"."namaPembeli" as "namaPembeli", "order"."catatanPembeli" as "catatanPembeli", "meja"."nomorMeja" as meja, "order"."totalBayar" as "totalBayar", "order".pesanan as pesanan, "order"."isDone" as "isDone" FROM "order" INNER JOIN "meja" ON "meja".id = "order"."mejaId" WHERE "order"."isDone" = 1 ORDER BY "order"."createdAt"`)
        const dataMenungguSelesai = await prisma.$queryRawUnsafe(`SELECT "order"."id" as id, "order"."namaPembeli" as "namaPembeli", "order"."catatanPembeli" as "catatanPembeli", "meja"."nomorMeja" as meja, "order"."totalBayar" as "totalBayar", "order".pesanan as pesanan, "order"."isDone" as "isDone" FROM "order" INNER JOIN "meja" ON "meja".id = "order"."mejaId" WHERE "order"."isDone" = 2 ORDER BY "order"."createdAt"`)

        const datas = {
            'dataMenungguKonfirmasi': dataMenungguKonfirmasi,
            'dataMenungguPengiriman': dataMenungguPengiriman,
            'dataMenungguSelesai': dataMenungguSelesai
        }
        const response = BaseResponse(200, 'Data Found', datas)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
}

const getMeja = async (req, res) => {
    try {
        const { id } = req.params
        const datas = await prisma.meja.findUnique({
            where: {
                id: id
            }
        })

        if (!datas || datas === null) {
            return res.status(200).json(BaseResponse(400, 'Data Not Found', []))
        }
        const response = BaseResponse(200, 'Data Found', datas)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
}

const ajukanPesanan = async (req, res) => {
    try {
        const { namaPembeli, catatanPembeli, mejaId, totalBayar, pesanan } = req.body
        console.log(req.body)
        const datas = await prisma.order.create({
            data: {
                namaPembeli: namaPembeli,
                catatanPembeli: catatanPembeli,
                mejaId: mejaId,
                totalBayar: totalBayar,
                pesanan: pesanan,
            }
        })

        if (!datas || req.body === null || req.body === []) {
            return res.status(200).json(BaseResponse(400, 'Failed To Create', []))
        }

        const response = BaseResponse(200, 'Data Success Created', datas)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
}

const getBukti = async (req, res) => {
    try {
        const { id } = req.params
        const hitApi = await prisma.$queryRawUnsafe(`SELECT "order".id as id, "order"."namaPembeli" as "namaPembeli", "order"."catatanPembeli" as "catatanPembeli", "meja"."nomorMeja" as "nomorMeja", "order".pesanan as pesanan, "order"."isDone" as "isDone" FROM "order" INNER JOIN "meja" ON "meja".id = "order"."mejaId" WHERE "order".id = '${id}'`)

        const hitResult = hitApi[0]

        const datas = {
            'pembeli': hitResult,
            'listItem': hitResult.pesanan,
        }

        if (!datas || datas.length === 0) {
            return res.status(200).json(BaseResponse(400, 'Not Found', []))
        }
        const response = BaseResponse(200, 'Data Found', datas)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
}

const updateKonfirmasi = async (req, res) => {
    try {
        const { id } = req.params
        const { jenisPembayaran } = req.body
        const datas = await prisma.order.update({
            where: {
                id: id
            },
            data: {
                isDone: 1,
                jenisPembayaran: jenisPembayaran
            }
        })

        const response = BaseResponse(200, 'Success Update', datas)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
}

const updatePengiriman = async (req, res) => {
    try {
        const { id } = req.params
        const { jenisPembayaran } = req.body
        const datas = await prisma.order.update({
            where: {
                id: id
            },
            data: {
                isDone: 2,
                jenisPembayaran: jenisPembayaran
            }
        })

        const response = BaseResponse(200, 'Success Update', datas)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
}

const customerVerifikasiPembayaran = async (req, res) => {
    try {
        const { id } = req.params
        const hitApi = await prisma.$queryRawUnsafe(`SELECT "order".id as id, "order"."namaPembeli" as "namaPembeli", "order"."catatanPembeli" as "catatanPembeli", "meja"."nomorMeja" as "nomorMeja", "order".pesanan as pesanan, "order"."isDone" as "isDone", "order"."totalBayar" as "totalBayar" FROM "order" INNER JOIN "meja" ON "meja".id = "order"."mejaId" WHERE "order".id = '${id}'`)

        const hitResult = hitApi[0]

        if (!hitResult || hitResult.length === 0) {
            return res.status(200).json(BaseResponse(400, 'Not Found', []))
        }
        const datas = {
            'pembeli': hitResult,
            'listItem': hitResult.pesanan,
        }
        const response = BaseResponse(200, 'Data Found', datas)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
}

const confirmSelesai = async (req, res) => {
    try {

        const { id } = req.params
        const { jenisPembayaran } = req.body
        await prisma.order.update({
            where: {
                id: id
            },
            data: {
                isDone: 3,
                jenisPembayaran: jenisPembayaran
            }
        })

        const searchCustomer = await prisma.order.findUnique({
            where: {
                id: id
            }
        })
        console.log(searchCustomer.pesanan.length)
        let dataErp = [];
        for (let i = 0; i < searchCustomer.pesanan.length; i++) {
            dataErp.push({
                'item_code': searchCustomer.pesanan[i].kode,
                'qty': searchCustomer.pesanan[i].jumlah.toString(),
                'rate': parseInt(searchCustomer.pesanan[i].harga.replace(',', '')),
            });
        }

        const currentDate = new Date();
        const year = currentDate.getFullYear(); // Tahun saat ini
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Bulan saat ini (dalam format 2 digit)
        const day = String(currentDate.getDate()).padStart(2, '0'); // Tanggal saat ini (dalam format 2 digit)

        const formattedDate = `${year}-${month}-${day}`;

        // const datas = {
        //     'doctype': 'POS Invoice',
        //     'naming_series': formattedDate.replaceAll('-', '') + '-',
        //     'customer': 'Dine In',
        //     'posting_date': formattedDate,
        //     'company': 'Teras Nusantara 88',
        //     'items': dataErp,
        //     'payments': [{
        //         'mode_of_payment': searchCustomer.jenisPembayaran,
        //         'amount': parseInt(searchCustomer.totalBayar),
        //         'type': searchCustomer.jenisPembayaran == 'Cash' ? 'Cash' : 'Bank'
        //     }],
        //     'status': 'Paid'
        // }

        // await axios.post(`${baseUrl}/resource/POS%20Invoice`, {
        //     data: datas
        // }, {
        //     headers: headerCashier
        // })

        const response = BaseResponse(200, 'Success Create', 1)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    listMenu,
    getMeja,
    ajukanPesanan,
    getBukti,
    listOrder,
    updateKonfirmasi,
    updatePengiriman,
    customerVerifikasiPembayaran,
    confirmSelesai,
};
