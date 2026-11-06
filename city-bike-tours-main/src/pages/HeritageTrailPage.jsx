import Footer from "../components/Footer";
import HeritageMap from "../components/HeritageMap";
import PricingSection from "../components/PricingSection";
import SiteFolders from "../components/SiteFolders";
import BookingSection from "../components/BookingSection";

export default function HeritageTrailPage() {
  return (
    <main className="heritage-trail-page">
      <header className="trail-hero">
        <p className="trail-eyebrow">GABORONE · SIX LANDMARKS · ONE SHARED STORY</p>
        <h1>Choose an authentic<br /><span>heritage experience.</span></h1>
        <p className="trail-hero-lede">
          From the civic heart of the city to the places that hold Botswana’s memory, take the long way through stories worth knowing.
        </p>
        <div className="trail-hero-facts" aria-label="Trail details">
          <span><strong>6</strong> heritage sites</span>
          <span><strong>~8.8 km</strong> by bicycle</span>
          <span><strong>Main Mall</strong> start and finish</span>
        </div>
      </header>

      <section className="trail-map-section" aria-labelledby="trail-map-heading">
        <div className="trail-section-heading">
          <div>
            <p className="trail-eyebrow">THE ROUTE</p>
            <h2 id="trail-map-heading">A city-sized story.</h2>
          </div>
          <p>Explore the six stops on the map. Select a marker or a site name to bring that place into focus.</p>
        </div>
        <div className="trail-map-frame">
          <HeritageMap height="min(64vh, 600px)" trail />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <PricingSection />
      </div>

      <section className="trail-sites-section" aria-labelledby="trail-sites-heading">
        <div className="trail-section-heading trail-sites-heading">
          <div>
            <p className="trail-eyebrow">THE NATION’S STORY</p>
            <h2 id="trail-sites-heading">Six stops. Six perspectives.</h2>
          </div>
          <p>Each landmark marks a different chapter in the making of modern Botswana. Open a folder to see its photos, story and videos.</p>
        </div>
        <SiteFolders />
      </section>

      <section className="trail-booking-cta" aria-labelledby="trail-booking-heading">
        <div>
          <p className="trail-eyebrow">THE CITY IS WAITING</p>
          <h2 id="trail-booking-heading">Let’s go find a story.</h2>
          <p>Choose your pace, see the live price, and meet us at Main Mall. Pay on the day; no deposit is needed.</p>
        </div>
        <a href="#trail-book" className="trail-booking-button">
          Choose your ride <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section id="trail-book" className="max-w-7xl mx-auto px-6 py-14">
        <div className="trail-section-heading">
          <div>
            <p className="trail-eyebrow">BOOK YOUR RIDE</p>
            <h2>Reserve your place</h2>
          </div>
          <p>Create an account to book, leave a review, comment, and upload or download photos (with admin approval).</p>
        </div>
        <BookingSection />
      </section>

      <Footer />
    </main>
  );
}
