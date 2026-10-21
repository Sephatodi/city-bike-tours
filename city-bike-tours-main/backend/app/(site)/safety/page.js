import Link from "next/link";
import { MEETUP } from "@/lib/data";

export const metadata = { title: "Safety — Kgale Cycles" };

const TIPS = [
  {
    num: "01",
    title: "Beat the heat and traffic",
    body: "Rides run 05:00–08:00 or from 17:00 — outside both the midday heat and the busiest arterial traffic.",
  },
  {
    num: "02",
    title: "Stick to the built corridor",
    body: "All three routes use wide tarred service lanes and sidepaths connecting the CBD, Museum and Riverwalk, not fast traffic lanes.",
  },
  {
    num: "03",
    title: "Want off-road instead?",
    body: "Ask your guide about the singletrack at Kgale Hill or the trails at Mokolodi Nature Reserve, just outside the city loop.",
  },
];

export default function SafetyPage() {
  return (
    <>
      <header className="page-header">
        <div className="wrap">
          <div className="section-eyebrow">Before you ride</div>
          <h1>Riding Gaborone safely.</h1>
          <p className="lede" style={{ marginTop: 16 }}>
            Every guided ride includes a helmet, a bike check and a safety briefing before you
            set off, starting at the <strong>{MEETUP.name}</strong>, {MEETUP.note}. Here&rsquo;s
            what to know beforehand.
          </p>
        </div>
      </header>

      <section className="block" style={{ borderTop: "none" }}>
        <div className="wrap">
          <div className="safety-grid">
            {TIPS.map((tip) => (
              <div className="safety-item" key={tip.num}>
                <div className="num">{tip.num}</div>
                <h3>{tip.title}</h3>
                <p>{tip.body}</p>
              </div>
            ))}
          </div>
          <div className="hero-cta">
            <Link href="/book" className="btn btn-primary">
              Book a ride
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
