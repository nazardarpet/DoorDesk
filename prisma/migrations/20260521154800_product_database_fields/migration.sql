-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "productId" TEXT,
ADD COLUMN "sku" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "coreCode" TEXT,
ADD COLUMN "familyCode" TEXT,
ADD COLUMN "familyName" TEXT,
ADD COLUMN "heightCode" TEXT,
ADD COLUMN "thicknessCode" TEXT,
ADD COLUMN "widthCode" TEXT;

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_sku_idx" ON "OrderItem"("sku");

-- CreateIndex
CREATE INDEX "Product_familyCode_idx" ON "Product"("familyCode");

-- CreateIndex
CREATE INDEX "Product_familyName_idx" ON "Product"("familyName");

-- CreateIndex
CREATE INDEX "Product_heightCode_idx" ON "Product"("heightCode");

-- CreateIndex
CREATE INDEX "Product_widthCode_idx" ON "Product"("widthCode");

-- CreateIndex
CREATE INDEX "Product_coreCode_idx" ON "Product"("coreCode");

-- CreateIndex
CREATE INDEX "Product_thicknessCode_idx" ON "Product"("thicknessCode");

-- CreateIndex
CREATE INDEX "Product_height_width_core_thickness_idx" ON "Product"("height", "width", "core", "thickness");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
