# Changelog

## 2026-11-07
- Add review presentation fields: `headline` (review title), `featured` (staff-picked quote card), `show_avatar` (rider profile picture choice) on the reviews table via migration `0019_review_presentation`
- `GET /api/reviews` returns `headline`, `featured`, and `avatarUrl` (from `users.image` when `show_avatar`)
- `POST /api/customer/reviews` accepts `headline` (max 80) and `showAvatar`
- `PATCH /api/admin/reviews/[id]` accepts `featured` boolean; admin dashboard Inbox gains a "Feature this review" toggle
- `/connect` composer gains "Review title" input and "Show my profile picture" toggle; featured reviews render as up to three quote cards at the top of the feed

## 2026-11-06
- Remove site backdrop rendering; change body background to #123222
- Remove RiderIcon logo from Nav/Footer; clean up navigation
- Remove /connect route and related nav/bottom nav/dashboard links
- Remove map section from home page
- Add booking code generation on success (4 digits + 2 letters), stored in localStorage, shown on success screen
- Add booking code utilities and scaffold component
- Remove src/data .js if present
- Add docs (LIVESTREET-SETUP, STYLES, bicycle.txt) and extraction script
