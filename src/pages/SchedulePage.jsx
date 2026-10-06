import { useEffect } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import HeaderBike from "../components/HeaderBike";
import HeritageMap from "../components/HeritageMap";
import Icon from "../components/Icon";
import { SITES } from "../data";

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function SchedulePage() {
  useScrollReveal();

  return (
    <div className="schedule-page">
      <header className="schedule-hero">
        <HeaderBike />
        <div className="schedule-hero-inner">
          <p className="schedule-eyebrow">GABORONE · BOTSWANA</p>
          <h1>Ride schedule</h1>
          <p>Choose your ride, find a time that works, and meet us at Main Mall.</p>
        </div>
      </header>

      <main className="schedule-content">
        <section className="schedule-options reveal">
          <div className="schedule-section-heading">
            <div><p className="schedule-section-kicker">CHOOSE YOUR PACE</p><h2>When would you like to ride?</h2></div>
            <p>Choose a guided weekday tour or join the easygoing Saturday ride with friends and family.</p>
          </div>
          <div className="schedule-card-grid">
            <article className="schedule-option-card schedule-option-featured">
              <div className="schedule-option-topline"><span>THE HERITAGE CITY RIDE</span><span className="schedule-status-pill">GUIDED · MAX 10</span></div>
              <h3>Heritage City<br />Ride</h3>
              <div className="schedule-option-time">◷ <strong>9:00 AM or 2:00 PM</strong></div>
              <p>Ride with a local guide through Gaborone's heritage sites and hear the stories behind each landmark.</p>
              <div className="schedule-option-bottom"><span>Wednesday–Friday · Groups up to 10</span><Link to="/book">Reserve a place ↗</Link></div>
            </article>
            <article className="schedule-option-card">
              <div className="schedule-option-topline"><span>COME AS YOU ARE</span><span className="schedule-status-pill schedule-status-request">CASUAL · ALL WELCOME</span></div>
              <h3>Casual<br />Saturday</h3>
              <div className="schedule-option-time">◷ <strong>Relaxed & flexible</strong> <span>No rigid schedule</span></div>
              <p>A fun, easygoing ride for friends, families, and anyone who wants to join. Cycling lessons are included for kids and adults.</p>
              <div className="schedule-option-bottom"><span>Lessons included · Main Mall</span><Link to="/book">Join the ride ↗</Link></div>
            </article>
          </div>
        </section>

        <section className="schedule-week reveal">
          <div className="schedule-section-heading"><div><p className="schedule-section-kicker">PLAN AHEAD</p><h2>Our week, at a glance.</h2></div></div>
          <div className="schedule-week-grid">
            {[
              { day: "Mon", label: "Closed", active: false },
              { day: "Tue", label: "Closed", active: false },
              { day: "Wed", label: "9am & 2pm\nGuided ride", active: true, color: "#C1440E" },
              { day: "Thu", label: "9am & 2pm\nGuided ride", active: true, color: "#C1440E" },
              { day: "Fri", label: "9am & 2pm\nGuided ride", active: true, color: "#C1440E" },
              { day: "Sat", label: "Casual ride\nLessons included", active: true, color: "#1A3A2A" },
              { day: "Sun", label: "Closed", active: false },
            ].map(({ day, label, active, color }) => (
              <div
                key={day}
                className={`schedule-day ${active ? "schedule-day-active" : ""}`}
                style={{
                  "--day-accent": active ? color : "#A7A99F",
                }}
              >
                <div>{day}</div><span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="schedule-meeting-point reveal">
          <span className="schedule-meeting-icon">↗</span>
          <div>
            <div className="schedule-section-kicker">MEETING POINT · EVERY RIDE</div>
            <strong>Main Mall, Gaborone City Centre</strong>
            <p>Look for the orange City Bike Tours flag at the main entrance.</p>
          </div>
        </div>

        <section className="schedule-map-feature reveal">
          <div className="schedule-map-copy">
            <p className="schedule-section-kicker">YOUR RIDE, AT A GLANCE</p>
            <h2>Gaborone is better<br />seen by bike.</h2>
            <p className="schedule-map-description">
              A relaxed loop through the landmarks, people, and moments that shaped Botswana. Tap a pin to explore a stop.
            </p>
            <div className="schedule-stats">
              <div><strong>~12 km</strong><span>Scenic city loop</span></div>
              <div><strong>6 stops</strong><span>Stories of Botswana</span></div>
              <div><strong>1–1.5 hrs</strong><span>Easy guided pace</span></div>
            </div>
            <div className="schedule-map-meet">
              <span aria-hidden="true">●</span>
              <div><strong>Start & finish</strong><span>Main Mall, Gaborone City Centre</span></div>
            </div>
            <Link to="/book" className="schedule-primary-button">Find your ride <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="schedule-live-map" aria-label="Interactive map of the Gaborone heritage ride">
            <div className="schedule-map-label"><span className="schedule-live-dot" /> HERITAGE LOOP <span>GABORONE, BW</span></div>
            <HeritageMap height="560px" routeId="complete" />
          </div>
        </section>

        <section className="schedule-highlights reveal">
          <div className="schedule-section-heading">
            <div><p className="schedule-section-kicker">A FEW PLACES ALONG THE WAY</p><h2>Stories worth stopping for.</h2></div>
            <p>Six landmarks, each with a different piece of Botswana's story.</p>
          </div>
          <div className="schedule-photo-grid">
            {SITES.filter((site) => ["monument", "museum", "archives"].includes(site.id)).map((site, index) => (
              <article className="schedule-photo-card" key={site.id}>
                <img src={site.imgs[0]} alt={site.name} loading="lazy" />
                <div className="schedule-photo-shade" />
                <span className="schedule-photo-number">0{index + 1} / 06</span>
                <div className="schedule-photo-caption"><Icon name={site.icon} size={20} /><h3>{site.name}</h3><p>{site.short}</p></div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="schedule-cta reveal">
          <div><p className="schedule-section-kicker">THE CITY IS WAITING</p><h2>Let’s go find a story.</h2></div>
          <Link to="/book" className="schedule-primary-button">Book your ride <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
