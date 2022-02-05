-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL,
    "albumCover" TEXT,
    "spotifyUrl" TEXT,
    "discogsUrl" TEXT,
    "genres" TEXT[],

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtistToRelease" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToRelease_AB_unique" ON "_ArtistToRelease"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToRelease_B_index" ON "_ArtistToRelease"("B");

-- AddForeignKey
ALTER TABLE "_ArtistToRelease" ADD FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToRelease" ADD FOREIGN KEY ("B") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
