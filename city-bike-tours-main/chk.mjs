import { transformSync } from "esbuild";
import fs from "fs"; import path from "path";
let bad=0;
function walk(d){ for(const f of fs.readdirSync(d,{withFileTypes:true})){ if(f.name==='node_modules'||f.name==='.next') continue; const p=path.join(d,f.name); if(f.isDirectory()) walk(p); else if(/\.(js|jsx)$/.test(f.name)){ try{ transformSync(fs.readFileSync(p,'utf8'),{loader:'jsx',format:'esm'});}catch(e){bad++;console.log("ERR",p,e.message.split("\n")[0]);} } } }
walk(process.argv[2]); console.log("done, errors:",bad);
