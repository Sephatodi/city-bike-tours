import { Link, useLocation } from "react-router";
import Footer from "../components/Footer";

const pages = {
  "/privacy": {
    title: "Privacy notice",
    intro: "This notice explains how City Bike Tours handles information when you browse the website, create an account, book a ride or contact the team.",
    sections: [
      ["Information we collect", "We may process contact and account details you provide, booking and check-in information, messages, reviews and photographs you choose to submit, plus basic technical information needed to operate and protect the website."],
      ["How information is used", "Information is used to manage accounts and bookings, communicate about rides, moderate community submissions, provide customer support, and maintain website security and reliability."],
      ["Service providers", "The website uses hosting, database, authentication and communications providers to deliver its services. Those providers process information as needed to provide the relevant service."],
      ["Your choices", "You can contact the City Bike Tours team to request access to, correction of, or deletion of personal information, subject to legal and operational record-keeping requirements."],
      ["Contact", "For privacy questions or requests, contact the City Bike Tours team using the website's contact or messaging options."]
    ]
  },
  "/terms": {
    title: "Terms of use",
    intro: "By using the City Bike Tours website or submitting a ride request, you agree to use the service responsibly and provide accurate information.",
    sections: [
      ["Bookings", "A booking request is not confirmed until the City Bike Tours team has checked availability and contacted you. Prices shown online are estimates and may be confirmed by the team before the ride."],
      ["Rider responsibilities", "Riders must follow guide instructions, road-safety requirements and reasonable directions at heritage stops. Parents or guardians remain responsible for children in their care."],
      ["Community content", "Only upload photographs and stories you are entitled to share. Submissions may be reviewed before publication and may be declined or removed if they are inappropriate or infringe another person's rights."],
      ["Website availability", "We may update, suspend or change website features to maintain or improve the service. We do not guarantee uninterrupted availability."],
      ["Contact", "Please contact the City Bike Tours team through the website if you have a question about these terms."]
    ]
  },
  "/data-deletion": {
    title: "Data deletion",
    intro: "You can ask City Bike Tours to delete personal information associated with your customer account.",
    sections: [
      ["How to request deletion", "Sign in and send a deletion request to the City Bike Tours team through customer messaging, or use the contact details published on the website. Include the email address or phone number associated with your account."],
      ["What happens next", "The team will verify the request and remove or anonymise eligible account information. Some booking, financial, safety or audit records may need to be retained where required for legitimate operational or legal purposes."],
      ["Social sign-in", "If you used Google, Facebook or Apple to sign in, deleting your City Bike Tours account does not delete your account with that identity provider."],
      ["Confirmation", "The team will respond when the request has been reviewed and explain any information that must be retained."]
    ]
  }
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const page = pages[pathname] || pages["/privacy"];
  return <>
    <main className="min-h-screen px-5 pb-20 pt-32" style={{ color: "#F5EDD9" }}>
      <article className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[.25em]" style={{ color: "#D4A017" }}>City Bike Tours · Gaborone</p>
        <h1 className="font-display mb-5 text-4xl md:text-6xl">{page.title}</h1>
        <p className="mb-10 text-lg leading-8" style={{ color: "rgba(245,237,217,.72)" }}>{page.intro}</p>
        <div className="space-y-8">{page.sections.map(([heading, body]) => <section key={heading}>
          <h2 className="mb-2 font-display text-2xl" style={{ color: "#D4A017" }}>{heading}</h2>
          <p className="leading-8" style={{ color: "rgba(245,237,217,.78)" }}>{body}</p>
        </section>)}</div>
        <p className="mt-12 text-sm" style={{ color: "rgba(245,237,217,.5)" }}>Last reviewed: 1 November 2026. <Link className="underline" to="/connect">Contact the team</Link>.</p>
      </article>
    </main>
    <Footer />
  </>;
}
