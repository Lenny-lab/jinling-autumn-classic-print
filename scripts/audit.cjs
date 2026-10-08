const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>['node_modules','.git'].includes(e.name)?[]:e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files=walk(root).sort(),errors=[];let total=0,largest={bytes:0,file:''};
for(const f of files){const rel=path.relative(root,f).replaceAll('\\','/'),n=fs.statSync(f).size;total+=n;if(n>largest.bytes)largest={bytes:n,file:rel};if(n>=100*1024*1024)errors.push('Oversize '+rel);
if(/\.(md|json|yaml|svg|cjs|txt)$/.test(f)){const b=fs.readFileSync(f,'utf8');if(/[A-Z]:[\\/]Users[\\/]/i.test(b))errors.push('Private path '+rel);if(/sk-[A-Za-z0-9_-]{32,}/.test(b))errors.push('Possible key '+rel);
if(f.endsWith('.md'))for(const m of b.matchAll(/\]\(([^)]+)\)/g)){const t=m[1].split('#')[0];if(t&&!/^(https?:|mailto:)/.test(t)&&!fs.existsSync(path.resolve(path.dirname(f),decodeURIComponent(t))))errors.push('Broken link '+rel+' -> '+t);}}
if(/\.(ttf|otf|woff2?|jpg|jpeg)$/i.test(f))errors.push('Unexpected font/photo '+rel);
}
const manifest=files.filter(f=>path.basename(f)!=='CHECKSUMS.sha256').map(f=>`${crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')}  ${path.relative(root,f).replaceAll('\\','/')}`).join('\n')+'\n';
if(process.argv.includes('--write-checksums'))fs.writeFileSync(path.join(root,'CHECKSUMS.sha256'),manifest);else if(!fs.existsSync(path.join(root,'CHECKSUMS.sha256'))||fs.readFileSync(path.join(root,'CHECKSUMS.sha256'),'utf8')!==manifest)errors.push('Missing/stale checksums');
console.log(JSON.stringify({fileCount:files.length,totalMiB:+(total/1048576).toFixed(2),largest,errors,publicationPending:['Repository license selection','Confirm reference-use and generated-artwork sharing rights']},null,2));if(errors.length)process.exitCode=1;
