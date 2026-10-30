import {useMemo} from "react";
import {Link} from "react-router";
import {SITES} from "../data";
export default function SiteFolders({content=[]}){const folders=useMemo(()=>SITES.map(site=>({...site,extra:content.filter(x=>x.mediaUrl&&((x.title+" "+(x.bodyText||"")).toLowerCase().includes(site.name.toLowerCase())))})),[content]);return <div className="site-folder-grid">{folders.map((site,i)=><Link className="site-folder" key={site.id} to={`/gallery/${site.id}`}><span className="site-folder-number">0{i+1}</span><span className="site-folder-copy"><strong>{site.name}</strong><small>{site.street} · {site.imgs.length+site.extra.length} photos</small></span><span className="site-folder-toggle">↗</span></Link>)}</div>}
