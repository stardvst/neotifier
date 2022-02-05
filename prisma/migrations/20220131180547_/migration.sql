/*
  Warnings:

  - The primary key for the `Release` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Release` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[A,B]` on the table `_ArtistToRelease` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `B` on the `_ArtistToRelease` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_ArtistToRelease" DROP CONSTRAINT "_ArtistToRelease_B_fkey";

-- AlterTable
ALTER TABLE "Release" DROP CONSTRAINT "Release_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Release_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_ArtistToRelease" DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToRelease_AB_unique" ON "_ArtistToRelease"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToRelease_B_index" ON "_ArtistToRelease"("B");

-- AddForeignKey
ALTER TABLE "_ArtistToRelease" ADD FOREIGN KEY ("B") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
