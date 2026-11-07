const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[character]));

const line = (label, value) => value ? `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>` : "";
const link = (label, value) => value ? `<p><a href="${escapeHtml(value)}">${escapeHtml(label)}</a></p>` : "";

const templates = {
  welcome: (d) => ({
    subject: "Welcome to City Bike Tours",
    heading: `Welcome, ${d.name || "rider"}!`,
    paragraphs: ["Your rider account is ready. Sign in to book a ride, message our team and share your stories."],
    links: [{ label: "Visit your dashboard", url: d.dashboardUrl }],
  }),
  bookingReceived: (d) => ({
    subject: `We received your ride request · ${d.date || ""}`.trim(),
    heading: `Thanks, ${d.name || "rider"}!`,
    paragraphs: [
      "We received your booking request and will contact you after our team reviews it.",
      line("Ride", d.routeName), line("Date", d.date), line("Riders", d.guests),
      line("Booking code", d.confirmationCode),
      d.shareUrl ? `After your ride, share your photos at ${escapeHtml(d.shareUrl)} with your booking code.` : "After your ride, share your photos with your booking code.",
    ],
  }),
  bookingConfirmed: (d) => ({
    subject: `Your City Bike Tours ride is confirmed · ${d.date || ""}`.trim(),
    heading: `Your ride is confirmed, ${d.name || "rider"}!`,
    paragraphs: [
      line("Ride", d.routeName), line("Date", d.date), line("Time", d.time),
      line("Riders", d.guests), line("Total", d.total ? `P${d.total} · payable on the day` : "Payable on the day"),
      line("Meeting point", d.meetingPoint), line("Please arrive", d.arriveEarlyNote),
      line("Confirmation code", d.confirmationCode),
      d.shareUrl ? `After your ride, share your photos at ${escapeHtml(d.shareUrl)} with your booking code.` : "After your ride, share your photos with your booking code.",
    ],
    links: [{ label: "Open your ride pass", url: d.link }],
  }),
  bookingDeclined: (d) => ({
    subject: "An update about your ride request",
    heading: `Hello ${d.name || "rider"},`,
    paragraphs: ["Unfortunately we could not accommodate this request. Please contact our team to choose another date."],
  }),
  bookingCancelled: (d) => ({
    subject: "Your City Bike Tours booking was cancelled",
    heading: "Booking cancelled",
    paragraphs: [`Hello ${d.name || "rider"},`, line("Date", d.date), d.reason ? line("Reason", d.reason) : ""],
  }),
  bookingReminder: (d) => ({
    subject: "Your City Bike Tours ride is tomorrow",
    heading: `See you tomorrow, ${d.name || "rider"}!`,
    paragraphs: [
      line("Ride", d.routeName), line("Date", d.date), line("Time", d.time),
      line("Meeting point", d.meetingPoint), line("Please arrive", d.arriveEarlyNote),
    ],
    links: [{ label: "Open your ride pass", url: d.link }, { label: "Manage your booking", url: d.cancelUrl }],
  }),
  adminActivation: (d) => ({
    subject: "Activate your City Bike Tours admin account",
    heading: `Activate your account, ${d.name || "there"}`,
    paragraphs: [
      "Use this code to activate your admin account and set your password.",
      `<p style="font-size:28px;letter-spacing:.18em;font-weight:700;color:#174a34">${escapeHtml(d.code || "")}</p>`,
      d.expiresAt ? `This code expires around ${escapeHtml(d.expiresAt)} (Gaborone time).` : "This code expires soon.",
      "If you didn't expect this, you can ignore it.",
    ],
    links: d.loginUrl ? [{ label: "Open admin sign in", url: d.loginUrl }] : [],
  }),
  passwordReset: (d) => ({
    subject: "Reset your City Bike Tours password",
    heading: "Reset your password",
    paragraphs: ["We received a request to reset the password for your rider account. This link expires in 30 minutes and can only be used once."],
    links: [{ label: "Choose a new password", url: d.resetUrl }],
  }),
  passwordResetSocial: (d) => ({
    subject: "How to sign in to City Bike Tours",
    heading: "Use your connected sign-in method",
    paragraphs: [`Your City Bike Tours account uses ${d.provider || "a social sign-in"} rather than a password. Choose that sign-in method on the login page.`],
    links: [{ label: "Open sign in", url: d.loginUrl }],
  }),
  reviewReplied: (d) => ({
    subject: "City Bike Tours replied to your review",
    heading: "A reply to your review",
    paragraphs: [`Hello ${d.name || "rider"},`, line("Your review", d.comment), line("Our reply", d.reply)],
    links: [{ label: "Read reviews", url: d.reviewsUrl }],
  }),
  photoApproved: (d) => ({
    subject: "Your City Bike Tours photo is approved",
    heading: "Your photo is ready to share",
    paragraphs: [`Hello ${d.name || "rider"},`, line("Photo", d.title)],
    links: [{ label: "View the gallery", url: d.galleryUrl }],
  }),
};

const adminTemplates = {
  newBooking: ["New booking request", "/admin/bookings"],
  cancelledBooking: ["Booking cancelled by a customer", "/admin/bookings"],
  newMessage: ["New customer message", "/admin/inbox"],
  newReview: ["New customer review", "/admin/reviews"],
  newRiderUpload: ["New rider upload", "/admin/community"],
  newEnquiry: ["New website enquiry", "/admin/enquiries"],
};

for (const [key, [title, path]] of Object.entries(adminTemplates)) {
  templates[key] = (data) => ({
    subject: title,
    heading: title,
    paragraphs: Object.entries(data)
      .filter(([name, value]) => value && !["adminUrl", "id"].includes(name))
      .map(([name, value]) => line(name.replace(/([A-Z])/g, " $1"), value)),
    links: [{ label: "Open in admin", url: data.adminUrl ? new URL(path, data.adminUrl).toString() : path }],
  });
}

export function renderEmailTemplate(template, data = {}, settings = {}) {
  const create = templates[template];
  if (!create) throw new Error(`Unknown email template: ${template}`);
  const content = create(data);
  const siteName = escapeHtml(settings.siteName || "City Bike Tours");
  const contactEmail = settings.contactEmail
    ? `<a href="mailto:${escapeHtml(settings.contactEmail)}">${escapeHtml(settings.contactEmail)}</a>`
    : "";
  const contactPhone = settings.contactPhone ? escapeHtml(settings.contactPhone) : "";
  const paragraphs = content.paragraphs.filter(Boolean).join("");
  const links = (content.links || []).map(({ label, url }) => link(label, url)).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f5edd9;color:#183a2b;font-family:Arial,sans-serif;line-height:1.6"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fffdf6;border-top:6px solid #d4a017"><tr><td style="padding:28px"><p style="color:#174a34;font-weight:bold;font-size:20px;margin:0 0 24px">${siteName}</p><h1 style="font-size:24px;color:#174a34">${escapeHtml(content.heading)}</h1>${paragraphs}${links}<hr style="border:0;border-top:1px solid #e8dfc7;margin:28px 0"><p style="font-size:13px;color:#66746a">City Bike Tours · Gaborone${contactEmail ? ` · ${contactEmail}` : ""}${contactPhone ? ` · ${contactPhone}` : ""}</p></td></tr></table></td></tr></table></body></html>`;
  const plain = [
    content.heading,
    ...content.paragraphs.filter(Boolean).map((value) => value.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")),
    ...(content.links || []).filter(({ url }) => url).map(({ label, url }) => `${label}: ${url}`),
    "",
    `${settings.siteName || "City Bike Tours"} · Gaborone`,
    settings.contactEmail || "",
    settings.contactPhone || "",
  ].filter(Boolean).join("\n");
  return { subject: content.subject, html, text: plain };
}

export { escapeHtml };
