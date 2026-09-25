import Link from "next/link";
import { HOLIDAY_TABLE, MEETUP } from "@/lib/data";

export const metadata = { title: "Holiday Rides — Kgale Cycles" };

export default function HolidayRidesPage() {
  return (
    <>
      <header className="page-header">
        <div className="wrap">
          <div className="section-eyebrow">Holiday category</div>
          <h1>Public-holiday specials.</h1>
          <p className="lede" style={{ marginTop: 16 }}>
            On gazetted public holidays, roads are quietest of all — these dates get an early
            05:00 and evening 17:00 departure on every route, meeting at the{" "}
            <strong>{MEETUP.name}</strong>, {MEETUP.note}.
          </p>
        </div>
      </header>

      <section className="block" style={{ borderTop: "none" }}>
        <div className="wrap">
          <div className="sunbar" style={{ marginBottom: 28 }} />
          <div className="table-scroll">
            <table className="holiday-table mono">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Holiday</th>
                  <th>Rides</th>
                </tr>
              </thead>
              <tbody>
                {HOLIDAY_TABLE.map((row) => (
                  <tr key={row[0] + row[2]}>
                    {row.map((cell, i) => (
                      <td key={i}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="hero-cta">
            <Link href="/book" className="btn btn-primary">
              Book a holiday ride
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
