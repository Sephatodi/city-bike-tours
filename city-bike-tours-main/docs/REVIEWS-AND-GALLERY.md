# Reviews and gallery

## Public reviews

The public reviews API is `GET /api/reviews`. It returns approved reviews only, a rating summary calculated from the approved review set, rating distribution, and helpful-vote counts. Review submissions are stored as pending until staff moderation approves them.

The website's reviews surface supports rating filters and sorting by recency, rating or helpful votes. Signed-in customers can toggle a helpful vote through `POST /api/customer/reviews/:id/helpful`.

A review is labelled **Verified rider** only when the review author's stored phone number matches a phone number on a checked-in booking. The label is not based solely on a self-reported ride date or review text.

## Customer review submissions

Customer reviews are submitted through `POST /api/customer/reviews`. Supported fields include rating, comment, optional ride date, tour, rider origin, stop list and an optional HTTPS photo URL. Submission rate limits and customer authentication are enforced by the backend.

The current website form accepts a photo URL; it does not provide a direct local-file upload control.

## Gallery

The main gallery is available at `/gallery`; each heritage stop has a dedicated route at `/gallery/:siteId`. Community photo uploads are moderated before publication. The `community_photos.site_id` column associates a rider photograph with a heritage stop.

The Complete collection is opt-in per photo. Staff independently approve whether a photo is included in that collection and whether signed-in riders may download it. Only published team pictures or approved rider photos with both settings enabled appear there. Rider photos must first be approved before either setting can be enabled. These flags are stored as `include_in_collection` and `downloadable`; apply migration `0020_complete_collection_approvals` before deploying this behavior.
