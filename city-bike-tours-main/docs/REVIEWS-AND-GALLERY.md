# Reviews and gallery: what to do after deploying

1. Run the database migrations on production (new columns and a votes table):
   `cd backend && NEON_DATABASE_URL="<connection string>" npm run db:migrate`
   They are 0016 (review details), 0017 (helpful votes) and 0018 (rider photos can name a heritage site).
   All three are registered in `backend/db/migrations/meta/_journal.json` and are safe to run twice.
2. Review photos and rider photos need `BLOB_READ_WRITE_TOKEN` on the backend (Render).
3. "Verified rider" appears only when the reviewer's phone number matches a booking that staff checked in.
   Nothing on the reviews page is hard-coded: the average, bars, percentages and counts are worked out from approved reviews.
4. To show more pictures or videos on a site page, edit that site in `src/data.js`:
   `imgs: [...]` for photos and `videos: [{ title, src }]` for YouTube links or video files.
   Optional `established` and `legacy` fields on a site are shown on the gallery if you add them.
