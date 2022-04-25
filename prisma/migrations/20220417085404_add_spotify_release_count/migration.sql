-- AlterTable
ALTER TABLE "Artist" RENAME COLUMN "releaseCount" TO "discogsReleaseCount";

ALTER TABLE "Artist"
ADD COLUMN "spotifyReleaseCount" INTEGER NOT NULL DEFAULT 0;
