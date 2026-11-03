# Reviews and gallery: what to do after deploying

1. Run the database migrations on production (new columns and tables):
   `cd backend && NEON_DATABASE_URL="<connection string>" npm run db:migrate`
   The journaled migrations include review details, votes, rider-upload limits and media type, and rider photo visibility. They are registered in `backend/db/migrations/meta/_journal.json` and are safe to run twice.
2. Review photos, public admin media, and new rider uploads use `BLOB_READ_WRITE_TOKEN` on the backend (Render), from a Vercel Blob store configured for **Public** access. Rider uploads are listed in the gallery only after staff approval; public download permission is controlled separately by moderation. `BLOB_PRIVATE_READ_WRITE_TOKEN` is retained only for media uploaded to the legacy private rider store.
3. "Verified rider" appears only when the reviewer's phone number matches a booking that staff checked in.
   Nothing on the reviews page is hard-coded: the average, bars, percentages and counts are worked out from approved reviews.
4. To show more pictures or videos on a site page, edit that site in `src/data.js`:
   `imgs: [...]` for photos and `videos: [{ title, src }]` for YouTube links or video files.
   Optional `established` and `legacy` fields on a site are shown on the gallery if you add them.
