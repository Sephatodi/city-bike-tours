import { useState } from "react";
import Footer from "../components/Footer";
import HeaderBike from "../components/HeaderBike";
import Icon from "../components/Icon";
import { SITES } from "../data";
import { useLiveData } from "../hooks/LiveDataContext";

function ContentCard({ item }) {
  return (
    <article className="overflow-hidden rounded-sm" style={{ backgroundColor: "#0F0B06", border: "1px solid rgba(245,237,217,0.1)" }}>
      {item.contentType === "picture" && item.mediaUrl && (
        <img src={item.mediaUrl} alt={item.title} loading="lazy" className="w-full object-cover" style={{ maxHeight: 360 }} />
      )}
      {item.contentType === "video" && item.mediaUrl && (
        <div className="p-6">
          <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="font-semibold underline" style={{ color: "#D4A017" }}>
            Watch video: {item.title}
          </a>
        </div>
      )}
      <div className="p-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#D4A017" }}>{item.contentType}</p>
        <h2 className="font-display font-bold text-xl" style={{ color: "#F5EDD9" }}>{item.title}</h2>
        {item.bodyText && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "rgba(245,237,217,0.7)" }}>{item.bodyText}</p>}
      </div>
    </article>
  );
}

export default function GalleryPage() {
  const { content, errors } = useLiveData();
  const [activeSite, setActiveSite] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const site = SITES[activeSite];

  return (
    <main style={{ backgroundColor: "#0D0805", minHeight: "100vh" }}>
      <div className="relative overflow-hidden pt-32 pb-16 tribal-pattern" style={{ backgroundColor: "#0F0B06" }}>
        <HeaderBike />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#D4A017" }}>— Stories from the road</p>
          <h1 className="font-display font-bold" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "#F5EDD9" }}>Gallery & stories</h1>
          <p className="mt-4 max-w-lg text-base" style={{ color: "rgba(245,237,217,0.65)" }}>Photos, videos and updates from City Bike Tours.</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <section aria-labelledby="site-gallery-heading">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Photo Gallery</p>
            <h2 id="site-gallery-heading" className="font-display font-bold" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#F5EDD9" }}>See the Sites</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10" aria-label="Choose a heritage site">
            {SITES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSite(index)}
                aria-pressed={index === activeSite}
                className="gallery-tab px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all"
                style={{
                  backgroundColor: index === activeSite ? "#C1440E" : "rgba(245,237,217,0.08)",
                  color: index === activeSite ? "#F5EDD9" : "rgba(245,237,217,0.6)",
                  border: `1px solid ${index === activeSite ? "#C1440E" : "rgba(245,237,217,0.1)"}`,
                }}
              >
                {item.name.split(" ").slice(-1)[0]}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="flex items-center gap-2 font-display font-bold text-2xl" style={{ color: "#D4A017" }}>
              <Icon name={site.icon} size={23} /> {site.name}
            </h3>
            <p className="text-sm mt-1 italic" style={{ color: "rgba(245,237,217,0.55)" }}>{site.short}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {site.imgs.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setLightbox(src)}
                aria-label={`View photo ${index + 1} of ${site.name}`}
                className="overflow-hidden rounded-sm cursor-pointer group text-left"
                style={{ aspectRatio: index % 5 === 0 ? "16/9" : "4/3", backgroundColor: "#1A3A2A" }}
              >
                <img src={src} alt={`${site.name} — photo ${index + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="gallery-stories-heading">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Stories from the road</p>
            <h2 id="gallery-stories-heading" className="font-display font-bold text-3xl" style={{ color: "#F5EDD9" }}>Gallery stories</h2>
          </div>
          {errors.content ? (
            <p role="alert" style={{ color: "#F5A58D" }}>Gallery content could not be loaded. Please try again later.</p>
          ) : content.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {content.map((item) => <ContentCard key={item.id} item={item} />)}
            </div>
          ) : (
            <p style={{ color: "rgba(245,237,217,0.65)" }}>New gallery stories are coming soon.</p>
          )}
        </section>
      </div>
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${site.name} photo`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt={site.name} className="max-w-full max-h-full rounded-sm object-contain" />
          <button
            type="button"
            aria-label="Close photo"
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}
            onClick={() => setLightbox(null)}
          >×</button>
        </div>
      )}
      <Footer />
    </main>
  );
}
