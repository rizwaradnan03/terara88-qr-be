-- CreateTable
CREATE TABLE "meja" (
    "id" TEXT NOT NULL,
    "nomorMeja" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "namaPembeli" TEXT NOT NULL,
    "catatanPembeli" TEXT,
    "jenisPembayaran" TEXT NOT NULL,
    "mejaId" TEXT,
    "totalBayar" TEXT,
    "pesanan" JSONB NOT NULL,
    "isDone" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_mejaId_fkey" FOREIGN KEY ("mejaId") REFERENCES "meja"("id") ON DELETE SET NULL ON UPDATE CASCADE;
