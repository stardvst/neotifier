/*
  Warnings:

  - You are about to drop the `_ArtistToRelease` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `artistId` to the `Release` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ArtistToRelease" DROP CONSTRAINT "_ArtistToRelease_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToRelease" DROP CONSTRAINT "_ArtistToRelease_B_fkey";

-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "artistId" TEXT NOT NULL,
ADD COLUMN     "artists" TEXT[];

-- DropTable
DROP TABLE "_ArtistToRelease";
