const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
const arg=k=>{const i=process.argv.indexOf(k);return i<0?null:process.argv[i+1]};
async function main(){
const source=path.join(root,'assets/designs'),out=path.resolve(arg('--output')||path.join(root,'assets/final-designs'));
const all=fs.readdirSync(source).filter(n=>fs.existsSync(path.join(source,n,'layout.svg'))).sort();
const selected=all.filter(n=>!arg('--only')||n===arg('--only'));if(!selected.length)throw Error('No matching design');
fs.mkdirSync(out,{recursive:true});
for(const name of selected){
 const dir=path.join(source,name);let svg=fs.readFileSync(path.join(dir,'layout.svg'),'utf8');
 svg=svg.replace(/href="(elements\/[^"<>]+\.png)"/g,(_,rel)=>{const f=path.resolve(dir,rel);if(!f.startsWith(dir+path.sep))throw Error('Unsafe asset path');return `href="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"`;});
 const w=Number(svg.match(/<svg[^>]*\bwidth="(\d+)"/)?.[1]),h=Number(svg.match(/<svg[^>]*\bheight="(\d+)"/)?.[1]);if(!w||!h)throw Error('Explicit pixel size required');
 fs.writeFileSync(path.join(out,name+'.svg'),svg);
 await sharp(Buffer.from(svg),{density:72,limitInputPixels:false}).toColourspace('srgb').png({compressionLevel:9,adaptiveFiltering:true,palette:false}).toFile(path.join(out,name+'.png'));
 const m=await sharp(path.join(out,name+'.png')).metadata();if(m.width!==w||m.height!==h)throw Error('Size mismatch');console.log(`${name}: ${w}x${h}`);
}}
main().catch(e=>{console.error(e.message);process.exitCode=1});
