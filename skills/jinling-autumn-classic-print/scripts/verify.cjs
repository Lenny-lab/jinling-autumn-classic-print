const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{const errors=[],results=[];
for(const name of fs.readdirSync(path.join(root,'assets/designs')).sort()){
 const dir=path.join(root,'assets/designs',name),j=JSON.parse(fs.readFileSync(path.join(dir,'design.json'),'utf8'));let svg=fs.readFileSync(path.join(dir,'layout.svg'),'utf8');
 for(const im of j.images){const f=path.resolve(dir,im.file);if(!f.startsWith(dir+path.sep)||!fs.existsSync(f)){errors.push('Missing or unsafe asset '+name);continue}if(hash(fs.readFileSync(f))!==im.sha256)errors.push('Asset checksum '+name+'/'+im.id);}
 svg=svg.replace(/href="(elements\/[^"<>]+\.png)"/g,(_,rel)=>`href="data:image/png;base64,${fs.readFileSync(path.join(dir,rel)).toString('base64')}"`);
 const final=fs.readFileSync(path.join(root,'assets/final-designs',name+'.svg'),'utf8');if(svg!==final)errors.push('Source/final mismatch '+name);
 if(!svg.includes('<text ')||!svg.includes('inkscape:groupmode="layer"'))errors.push('Editable layers missing '+name);
 if(/制作样张|尚待实拍核验|>风格定位</.test(svg))errors.push('Obsolete label '+name);
 const m=await sharp(path.join(root,'assets/final-designs',name+'.png')).metadata();if(m.width!==j.canvas[0]||m.height!==j.canvas[1])errors.push('Canvas mismatch '+name);
 if(name.startsWith('00_')&&(!svg.includes('>秋天的金陵城</text>')||!svg.includes('>大概是这个样子的</text>')||svg.includes('当我问AI')))errors.push('Example cover title mismatch');
 results.push({name,width:m.width,height:m.height,images:j.images.length});
}
console.log(JSON.stringify({results,errors},null,2));if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1});
