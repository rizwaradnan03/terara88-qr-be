const axios = require('axios');
require('dotenv').config()
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const BaseResponse = require('./BaseResponseController');

const baseUrl = process.env.ERP_URL
const headers = {
    Authorization: `token ${process.env.API_KEY}:${process.env.API_SECRET}`,
};

const listMenu = async (req, res) => {
    try {
        const hitApi = await axios.post(
            `${baseUrl}/method/erpnext.selling.page.point_of_sale.point_of_sale.get_items`,
            {
                start: '0',
                page_length: '40',
                price_list: 'Standard Selling',
                item_group: 'All Item Groups',
                search_term: '',
                pos_profile: 'Default',
            },
            {
                headers,
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
        const dataKonfirmasi = await prisma.$queryRawUnsafe(`SELECT "order"."id" as id, "order"."namaPembeli" as "namaPembeli", "order"."catatanPembeli" as "catatanPembeli", "order"."jenisPembayaran" as "jenisPembayaran", "meja"."nomorMeja" as meja, "order"."totalBayar" as "totalBayar", "order".pesanan as pesanan, "order"."isDone" as "isDone" FROM "order" INNER JOIN "meja" ON "meja".id = "order"."mejaId" WHERE "order"."isDone" = 0 ORDER BY "order"."createdAt"`)
        const dataPending = await prisma.$queryRawUnsafe(`SELECT "order"."id" as id, "order"."namaPembeli" as "namaPembeli", "order"."catatanPembeli" as "catatanPembeli", "order"."jenisPembayaran" as "jenisPembayaran", "meja"."nomorMeja" as meja, "order"."totalBayar" as "totalBayar", "order".pesanan as pesanan, "order"."isDone" as "isDone" FROM "order" INNER JOIN "meja" ON "meja".id = "order"."mejaId" WHERE "order"."isDone" = 1 ORDER BY "order"."createdAt"`)

        const datas = {
            'konfirmasi': dataKonfirmasi,
            'pending': dataPending
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
        const { namaPembeli, catatanPembeli, jenisPembayaran, mejaId, totalBayar, pesanan } = req.body
        const datas = await prisma.order.create({
            data: {
                namaPembeli: namaPembeli,
                catatanPembeli: catatanPembeli,
                jenisPembayaran: jenisPembayaran,
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
        const hitApi = await prisma.$queryRawUnsafe(`SELECT "order".id as id, "order"."namaPembeli" as "namaPembeli", "order"."catatanPembeli" as "catatanPembeli", "order"."jenisPembayaran" as "jenisPembayaran", "meja"."nomorMeja" as "nomorMeja", "order".pesanan as pesanan, "order"."isDone" as "isDone" FROM "order" INNER JOIN "meja" ON "meja".id = "order"."mejaId" WHERE "order".id = '${id}'`)

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

const updateKonfirmasi = async (req,res) => {
    try {
        const {id} = req.params
        const datas = await prisma.order.update({
            where: {
                id: id
            },
            data: {
                isDone: 1
            }
        })

        const response = BaseResponse(200,'Success Update',datas)
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
    updateKonfirmasi
};
