import Footer from "../components/Footer";
import HeaderBike from "../components/HeaderBike";
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
        {errors.content ? (
          <p role="alert" style={{ color: "#F5A58D" }}>Gallery content could not be loaded. Please try again later.</p>
        ) : content.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {content.map((item) => <ContentCard key={item.id} item={item} />)}
          </div>
        ) : (
          <p style={{ color: "rgba(245,237,217,0.65)" }}>New gallery stories are coming soon.</p>
        )}
      </div>
      <Footer />
    </main>
  );
}
