import { Link } from "react-router";
import Footer from "../components/Footer";

// Set VITE_CONTACT_EMAIL in .env to show an email address on these pages. Without it, people are pointed to
// the site's message form and WhatsApp, which already exist.
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "";
const UPDATED = "24 October 2026";

function Contact() {
  return (
    <p>
      Contact us through the <Link to="/messages">message form</Link> on this website, on WhatsApp, or at Main Mall, Gaborone
      {CONTACT_EMAIL ? <>, or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></> : null}.
    </p>
  );
}

const PAGES = {
  privacy: {
    kicker: "YOUR INFORMATION",
    title: "Privacy Policy",
    body: (
      <>
        <p>City Bike Tours runs guided and casual bicycle rides in Gaborone, Botswana. This page explains what we collect when you use this website, why, and what your choices are.</p>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Account details:</strong> your name, email address, profile picture and phone number, when you create an account or sign in with Google, Facebook or Apple, or with a phone number or WhatsApp code.</li>
          <li><strong>Bookings:</strong> the ride, date, group size, and the contact details you give us to confirm it.</li>
          <li><strong>Messages, reviews and photos</strong> you choose to post or send to our team.</li>
          <li><strong>Technical data</strong> needed to keep the site working and secure, such as a sign-in token stored in your browser.</li>
        </ul>
        <p>When you sign in with Google or Facebook we only receive the basic profile and email address those services share with us. We never receive your password and we never post to your account.</p>
        <h2>How we use it</h2>
        <ul>
          <li>To create your account and keep you signed in.</li>
          <li>To confirm bookings and send ride passes, reminders and one-time login codes by SMS, WhatsApp or email.</li>
          <li>To reply to your messages and show reviews and photos you decided to share.</li>
        </ul>
        <p>We do not sell your information and we do not use it for advertising.</p>
        <h2>Who handles it for us</h2>
        <p>Your data is stored in a database hosted by Neon. Text and WhatsApp messages are delivered by Twilio, and sign-in is provided by Neon Auth, Google, Facebook and Apple. These providers process data only to provide those services.</p>
        <h2>Keeping and deleting your data</h2>
        <p>We keep your account and booking records for as long as your account exists. You can ask us to delete them at any time, see <Link to="/data-deletion">how to delete your data</Link>.</p>
        <h2>Your rights</h2>
        <p>You can ask to see, correct or delete the information we hold about you.</p>
        <h2>Contact</h2>
        <Contact />
        <p className="legal-updated">Last updated {UPDATED}.</p>
      </>
    ),
  },
  terms: {
    kicker: "THE SMALL PRINT",
    title: "Terms of Service",
    body: (
      <>
        <p>By using this website and joining our rides you agree to these terms.</p>
        <h2>Bookings and rides</h2>
        <ul>
          <li>Guided Heritage City Rides run Wednesday to Friday at 9:00 AM and 2:00 PM, with up to 10 riders. The Saturday ride is casual and relaxed.</li>
          <li>A booking request is confirmed only when our team confirms it to you.</li>
          <li>Ride times, routes and availability can change because of weather, safety or other circumstances. We will tell you as early as we can.</li>
        </ul>
        <h2>Rider safety</h2>
        <p>Follow your guide's instructions and local road rules, and ride within your ability. Helmets are strongly recommended. Riders under 18 should be accompanied by a responsible adult.</p>
        <h2>Your account</h2>
        <p>Keep your sign-in details private and give us accurate information. We may suspend accounts that are used to harass others or to misuse the site.</p>
        <h2>Content you post</h2>
        <p>You are responsible for the reviews, messages and photos you post, and you confirm you have the right to share them. You allow us to display them on this website. We may remove content that is unlawful, abusive or misleading.</p>
        <h2>Liability</h2>
        <p>Cycling carries some risk. To the extent the law allows, City Bike Tours is not liable for loss or injury that results from a rider ignoring safety instructions. Nothing here limits rights you have under Botswana law.</p>
        <h2>Changes and contact</h2>
        <p>We may update these terms and will change the date below when we do.</p>
        <Contact />
        <p className="legal-updated">Last updated {UPDATED}.</p>
      </>
    ),
  },
  "data-deletion": {
    kicker: "YOUR CHOICE",
    title: "Delete your data",
    body: (
      <>
        <p>You can ask us to delete your City Bike Tours account and the personal information linked to it at any time. This includes accounts created with Google, Facebook, Apple, a phone number or WhatsApp.</p>
        <h2>How to ask</h2>
        <ol>
          <li>Send us a message from the <Link to="/messages">message form</Link>, or by WhatsApp, saying <strong>"Delete my data"</strong>. Include the name and the email address or phone number you signed in with.</li>
          {CONTACT_EMAIL ? <li>Or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the subject "Delete my data".</li> : null}
          <li>We will confirm that the request is really from you, because we must not delete someone else's account by mistake.</li>
        </ol>
        <h2>What happens next</h2>
        <ul>
          <li>We delete your profile, contact details, messages, reviews and uploaded photos within 30 days.</li>
          <li>If you signed in with Facebook, you can also remove City Bike Tours in Facebook under Settings, then Apps and Websites. That stops Facebook sharing anything further with us.</li>
          <li>We may keep a record of past bookings for as long as the law requires for accounting.</li>
        </ul>
        <p className="legal-updated">Last updated {UPDATED}.</p>
      </>
    ),
  },
};

export default function LegalPage({ page }) {
  const { kicker, title, body } = PAGES[page];
  return (
    <main className="legal-page">
      <header className="page-hero">
        <p className="schedule-section-kicker">{kicker}</p>
        <h1 className="font-display font-bold" style={{ color: "#F5EDD9", fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>{title}</h1>
      </header>
      <article className="legal-body glass">{body}</article>
      <Footer />
    </main>
  );
}
