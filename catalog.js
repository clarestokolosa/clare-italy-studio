const searchText=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function matchesSearch(artwork,query){
 const text=searchText(query).trim();
 if(!text)return true;
 const sku=searchText(artwork.sku).replace(/[^a-z0-9]/g,'');
 const compact=text.replace(/[^a-z0-9]/g,'');
 if(compact&&sku.includes(compact))return true;
 const haystack=searchText(artwork.title+' '+artwork.sku);
 return text.split(/\s+/).every(term=>haystack.includes(term));
}

const cleanTitle=title=>String(title??'').replace(/\.(?:jpe?g|png|gif|webp|tiff?|bmp|svg|avif)\b/gi,'').trim();
const compareSKU=(a,b)=>a.sku.localeCompare(b.sku,'en',{numeric:true,sensitivity:'base'});
function unframedArea(size){
 const match=String(size??'').trim().match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:inches|in|")?$/i);
 if(!match)return null;
 const area=Number(match[1])*Number(match[2]);
 return Number.isFinite(area)&&area>0?area:null;
}
function compareValues(a,b,direction){
 const missingA=a===null||!Number.isFinite(a),missingB=b===null||!Number.isFinite(b);
 if(missingA||missingB)return Number(missingA)-Number(missingB);
 return direction*(a-b);
}
function sortArtworks(rows,mode){
 const result=[...rows];
 if(mode==='original')return result;
 return result.sort((a,b)=>{
  if(mode==='sku')return compareSKU(a,b);
  if(mode==='title')return cleanTitle(a.title).localeCompare(cleanTitle(b.title),'en',{sensitivity:'base'})||compareSKU(a,b);
  if(mode==='price-asc'||mode==='price-desc')return compareValues(a.price_eur,b.price_eur,mode==='price-asc'?1:-1)||compareSKU(a,b);
  if(mode==='area-asc'||mode==='area-desc')return compareValues(unframedArea(a.size_unframed),unframedArea(b.size_unframed),mode==='area-asc'?1:-1)||compareSKU(a,b);
  return 0;
 });
}
const money=n=>n===null||n===''?'Price on request':new Intl.NumberFormat('en-US',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(Number(n));const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const url=s=>{try{let u=new URL(s,document.baseURI);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};let artworks=[],shown=[];function render(){shown=sortArtworks(artworks.filter(r=>r.visible==='yes'),document.querySelector('#catalog-sort').value);const query=document.querySelector('#catalog-search').value;const results=shown.filter(r=>matchesSearch(r,query));document.querySelector('#search-status').textContent=query.trim()?results.length+' of '+shown.length+' artworks':shown.length+' artworks';document.querySelector('#grid').innerHTML=results.map(r=>`<article class="art">${url(r.image_url)?`<img draggable="false" loading="lazy" src="${e(url(r.image_url))}" alt="${e(r.title)}" onerror="this.replaceWith(Object.assign(document.createElement('p'),{textContent:'Image unavailable'}))">`:'<p>Image to follow</p>'}<h2>${e(r.title||r.sku)}</h2><p class="meta">${e(r.sku)} · ${e(r.medium)}<br>${e(r.size_unframed)}${r.size_unframed?' inches, unframed':''}${r.size_framed?'<br>'+e(r.size_framed)+' inches, framed':''}</p><p class="price">${money(r.price_eur)} EUR</p>${url(r.product_url)?`<a href="${e(url(r.product_url))}">View artwork on Clare’s website ↗</a>`:''}</article>`).join('')||'<p class="no-results">No artworks match your search. Try a title or SKU.</p>';}
async function printList(){
 const w=window.open('','_blank');
 if(!w){alert('Allow pop-ups to open the printable price list.');return;}
 // Resolve from the current site and request a fresh image each time.
 const qrURL=new URL('./clareItalyCatalogueQRCode.png',window.location.href);
 qrURL.searchParams.set('v',Date.now().toString());
 const style=`
 @page{size:A4 portrait;margin:12mm}
 *{box-sizing:border-box}body{margin:0;background:#eeeae3;color:#26362d;font:12pt/1 Arial,sans-serif}
 .print-page{width:186mm;min-height:272mm;margin:12mm auto;padding:0;background:white;display:flex;flex-direction:column;break-after:page}
 .print-page:last-child{break-after:auto}.print-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:8mm;margin-bottom:4mm;break-inside:avoid}
 h1{font:24pt Georgia,serif;margin:0 0 2mm}p{margin:0}.subtitle{font-size:12pt;color:#526254}.qr-block{margin:0;flex:none}.qr-block img{display:block;width:28mm;height:28mm}
 .continuation{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #9aa79c;padding-bottom:3mm;margin-bottom:3mm}.continuation strong{font:15pt Georgia,serif}.continuation span{font-size:12pt;color:#526254}
 table{border-collapse:collapse;table-layout:fixed;width:100%}thead{display:table-header-group}th{text-align:left;font-size:12pt;letter-spacing:.02em;color:#4d6152;background:#eef1eb;border-bottom:1px solid #a9b5a9;padding:5px 4px}
 tbody tr{height:10mm}td{padding:2px 4px;border-bottom:1px solid #dce1d8;vertical-align:middle;overflow-wrap:break-word}tr{break-inside:avoid}tbody tr:nth-child(even){background:#f6f7f3}
 .sku{width:9%;white-space:nowrap;font-weight:bold}.title{width:45%}.medium{width:6%}.size{width:13%}.price{width:14%;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
 .page-footer{display:flex;justify-content:space-between;margin-top:auto;padding-top:3mm;color:#526254;font-size:12pt}.print-status{color:#9b3025;padding:4mm}
 @media print{body{background:white}.print-page{margin:0;width:100%;box-shadow:none}th,tbody tr:nth-child(even){-webkit-print-color-adjust:exact;print-color-adjust:exact}}
 `;
 const sorted=[...shown].sort(compareSKU);
 // Reserve extra room for the QR header on page one; keep every artwork together.
 const pages=[];
 for(let offset=0;offset<sorted.length;){const count=offset===0?22:24;pages.push(sorted.slice(offset,offset+count));offset+=count;}
 const tableHead='<thead><tr><th class="sku">SKU</th><th class="title">Artwork</th><th class="medium">Med</th><th class="size">Unframed</th><th class="size">Framed</th><th class="price">EUR</th></tr></thead>';
 const sections=pages.map((page,index)=>{
  const heading=index===0?'<div class="print-heading"><div><h1>Clare Stokolosa</h1><p class="subtitle">Italy studio · Original prices in EUR<br>Dimensions in inches · Listed by SKU</p></div><figure class="qr-block"><img id="catalog-qr" src="'+e(qrURL.href)+'" alt="Scan to view the Italy studio catalog"></figure></div>':'<div class="continuation"><strong>Clare Stokolosa · Italy studio</strong><span>Dimensions in inches · EUR</span></div>';
  const rows=page.map(r=>'<tr><td class="sku">'+e(r.sku)+'</td><td>'+e(r.title)+'</td><td>'+e(({Watercolor:'WC',Oil:'O','Watercolor and Ink':'WC/I'})[r.medium]||r.medium)+'</td><td>'+e(r.size_unframed)+'</td><td>'+e(/special order/i.test(r.size_framed)?'Special order':r.size_framed||'—')+'</td><td class="price">'+money(r.price_eur)+'</td></tr>').join('');
  return '<section class="print-page">'+heading+'<table>'+tableHead+'<tbody>'+rows+'</tbody></table><footer class="page-footer"><span>WC: watercolor · O: oil · WC/I: watercolor & ink<br>clarestokolosa.com</span><span>'+e(page[0].sku)+' – '+e(page[page.length-1].sku)+' · Page '+(index+1)+' of '+pages.length+'</span></footer></section>';
 }).join('');
 w.document.write('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Clare Stokolosa — Price list</title><style>'+style+'</style><p class="print-status" id="print-status" role="status">Loading QR code…</p>'+sections+'</html>');
 w.document.close();
 const image=w.document.querySelector('#catalog-qr');
 const status=w.document.querySelector('#print-status');
 try{
  await Promise.race([image.decode(),new Promise((_,reject)=>setTimeout(()=>reject(Error('QR image timed out')),15000))]);
  if(w.closed)return;
  status.remove();
  w.focus();
  w.print();
 }catch(error){
  if(!w.closed)status.textContent='QR code could not load. Close this tab and try Print price list again. Printing has been paused to avoid a missing QR.';
 }
}
async function loadCatalog(){
 const grid=document.querySelector('#grid');
 grid.textContent='Loading artworks…';
 try{
  const response=await fetch('./artworks.json',{cache:'no-store'});
  if(!response.ok)throw Error('Could not load artwork list.');
  const rows=await response.json();
  if(!Array.isArray(rows)||rows.some(r=>typeof r.sku!=='string'||typeof r.title!=='string'||!['yes','no'].includes(r.visible)||!['price_usd','price_eur'].every(key=>r[key]===null||typeof r[key]==='number'&&Number.isFinite(r[key])&&r[key]>=0)))throw Error('Please check artwork data.');
  if(new Set(rows.map(r=>r.sku.toUpperCase())).size!==rows.length)throw Error('Duplicate artwork SKU.');
  artworks=rows.map(r=>({...r,title:cleanTitle(r.title)}));render();document.querySelector('#print-button').disabled=false;document.querySelector('#catalog-sort').disabled=false;document.querySelector('#catalog-search').disabled=false;
 }catch(error){grid.textContent='Artwork list unavailable. Please try again shortly.';console.error(error)}
}
document.querySelector('#print-button').addEventListener('click',printList);
document.querySelector('#catalog-sort').addEventListener('change',render);
document.querySelector('#catalog-search').addEventListener('input',render);
loadCatalog();

// Discourage casual image saving without blocking selection or menus elsewhere.
for(const eventName of ['contextmenu','dragstart']){
 document.querySelector('#grid').addEventListener(eventName,event=>{
  if(event.target.closest('.art img'))event.preventDefault();
 });
}
