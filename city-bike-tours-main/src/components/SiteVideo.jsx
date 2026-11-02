// Videos can be a YouTube link or a direct .mp4 / .webm file. Add them to a site in src/data.js:
//   videos: [{ title: "Inside the debating chamber", src: "https://youtu.be/xxxxxxxxxxx" }]
export default function SiteVideo({ video }) {
  const youtube = video.src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (youtube) {
    return <iframe className="folder-video" src={`https://www.youtube-nocookie.com/embed/${youtube[1]}`} title={video.title} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />;
  }
  return <video className="folder-video" src={video.src} poster={video.poster} title={video.title} controls preload="none" playsInline />;
}
