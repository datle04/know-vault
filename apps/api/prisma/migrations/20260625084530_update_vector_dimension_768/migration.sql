-- This is an empty migration.
ALTER TABLE "ArticleChunk" ALTER COLUMN "embedding" TYPE vector(768);
ALTER TABLE "Concept" ALTER COLUMN "embedding" TYPE vector(768);
ALTER TABLE "Note" ALTER COLUMN "embedding" TYPE vector(768);

