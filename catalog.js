
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
const money=n=>n===null||n===''?'Price on request':new Intl.NumberFormat('en-US',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(Number(n));const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const url=s=>{try{let u=new URL(s,document.baseURI);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};let artworks=[],shown=[];function render(){shown=sortArtworks(artworks.filter(r=>r.visible==='yes'),document.querySelector('#catalog-sort').value);document.querySelector('#grid').innerHTML=shown.map(r=>`<article class="art">${url(r.image_url)?`<img loading="lazy" src="${e(url(r.image_url))}" alt="${e(r.title)}" onerror="this.replaceWith(Object.assign(document.createElement('p'),{textContent:'Image unavailable'}))">`:'<p>Image to follow</p>'}<h2>${e(r.title||r.sku)}</h2><p class="meta">${e(r.sku)} · ${e(r.medium)}<br>${e(r.size_unframed)}${r.size_unframed?' inches, unframed':''}${r.size_framed?'<br>'+e(r.size_framed)+' inches, framed':''}</p><p class="price">${money(r.price_eur)} EUR</p>${url(r.product_url)?`<a href="${e(url(r.product_url))}">View artwork on Clare’s website ↗</a>`:''}</article>`).join('');}
async function printList(){
 const w=window.open('','_blank');
 if(!w){alert('Allow pop-ups to open the printable price list.');return;}
 // Resolve from the current site and request a fresh image each time.
 const qrURL=new URL('./clareItalyCatalogueQRCode.png',window.location.href);
 qrURL.searchParams.set('v',Date.now().toString());
 const style="body{margin:0;background:#f6f3ed;color:#29392f;font:16px system-ui}main{max-width:1100px;margin:auto;padding:40px 24px}header{border-bottom:1px solid #b6bcae;padding-bottom:28px;margin-bottom:32px}h1{font:54px Georgia;margin:8px 0}h2{font:27px Georgia}a{color:#315443}button,.button{background:#315443;color:white;border:0;border-radius:4px;padding:12px 18px;cursor:pointer;text-decoration:none}nav{display:flex;gap:12px;flex-wrap:wrap}.grid{display:grid;grid-template-columns:1fr 1fr;gap:36px}.art img{width:100%;height:360px;object-fit:contain;background:#eae6de}.art{border-bottom:1px solid #ccc;padding-bottom:24px}.meta{color:#596556}.price{font-size:21px}input,textarea,select{font:inherit;padding:8px;border:1px solid #bbb;width:100%;box-sizing:border-box}label{display:block;margin:12px 0}dialog{width:min(600px,85vw);max-height:85vh;overflow:auto}table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:10px;border-bottom:1px solid #ccc}th{font-size:13px}small{color:#596556}@media(max-width:650px){.grid{grid-template-columns:1fr}h1{font-size:39px}.art img{height:300px}}@media print{nav,.controls{display:none}main{padding:0}body{background:white;font-size:11pt}h1{font-size:26pt}tr{break-inside:avoid}thead{display:table-header-group}@page{size:A4;margin:15mm}}"+'.print-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.print-heading h1{font-size:26pt}.qr-block{margin:0;text-align:center;flex:none}.qr-block img{width:32mm;height:32mm;display:block}.qr-block figcaption{font-size:9pt;margin-top:4px}.print-heading{break-inside:avoid;margin-bottom:20px}.print-status{color:#9b3025}@media print{.print-heading img{width:32mm;height:32mm}}';
 const rows=[...shown].sort((a,b)=>a.sku.localeCompare(b.sku,'en',{numeric:true,sensitivity:'base'})).map(r=>'<tr><td>'+e(r.sku)+'</td><td>'+e(r.title)+'</td><td>'+e(r.medium)+'<br>'+e(r.size_unframed)+' unframed'+(r.size_framed?'<br>'+e(r.size_framed)+' framed':'')+'</td><td>'+money(r.price_eur)+'</td></tr>').join('');
 w.document.write('<!doctype html><html lang="en"><meta charset="utf-8"><title>Clare Stokolosa — Price list</title><style>'+style+'</style><main><div class="print-heading"><div><h1>Clare Stokolosa</h1><p>Italy studio · Original prices in EUR</p></div><figure class="qr-block"><img id="catalog-qr" src="'+e(qrURL.href)+'" alt="Scan to view the Italy studio catalog"></figure></div><p class="print-status" id="print-status" role="status">Loading QR code…</p><table><thead><tr><th>SKU</th><th>Artwork</th><th>Medium / Size (inches)</th><th>EUR</th></tr></thead><tbody>'+rows+'</tbody></table><p>clarestokolosa.com</p></main></html>');
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
  artworks=rows.map(r=>({...r,title:cleanTitle(r.title)}));render();document.querySelector('#print-button').disabled=false;document.querySelector('#catalog-sort').disabled=false;
 }catch(error){grid.textContent='Artwork list unavailable. Please try again shortly.';console.error(error)}
}
document.querySelector('#print-button').addEventListener('click',printList);
document.querySelector('#catalog-sort').addEventListener('change',render);
loadCatalog();
