const CASHIERS = ['ARAZAS, GERBE MARK TULAGAN','PANIS, KARL HEAVEN BASISTER','ANDAYA, REINIEL DOCTOLERO','ARCILLA, VINCE KRISTAN LIHAYLIHAY','RASAY, CHIARA JOY ABUTAL','CHAVEZ, ELI MATTHEW NORDAN','TAMAYO, SHAINE LOISE BACAGAN','HABOC, LANCE GRANT EBUÑA','MANLANGIT, CHRISTIAN DEO','TAGOB, MARIA ELAINE JOY BARRAMEDA','TEJANO, RODGE MICO BELARDO'];
const ARTISTS = ['Althea Marie Bancayan','Andri James Pretista','Blase Vicenta Loraine','Iva Bagtas','Keziah Faye','Maria Edoloverio','Maria Lourdes Edoloverio','Sabina Cabiles','Sophia Mariz Lawsin'];
const STORAGE_KEY = 'artisan-sales-v1';
let sales = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentUser = sessionStorage.getItem('artisan-user') || '';
let category = 'Henna';
let pinSize = 'Small';

const $ = id => document.getElementById(id);
const money = value => `₱${Number(value || 0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const dateKey = date => new Date(date).toISOString().slice(0,10);
const dateText = date => new Date(date).toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'});
const timeText = date => new Date(date).toLocaleTimeString('en-PH',{hour:'numeric',minute:'2-digit'});
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(sales)); renderAll(); }
function toast(message){ const el=$('toast'); el.textContent=message; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2800); }
function activeSales(){ return sales.filter(s=>!s.voided); }
function totalFor(list, type){ return list.filter(s=>s.category===type).reduce((sum,s)=>sum+Number(s.price),0); }
function showView(viewId){
  document.querySelectorAll('.page-view').forEach(v=>v.classList.toggle('hidden',v.id!==viewId));
  document.querySelectorAll('.nav-link').forEach(v=>v.classList.toggle('active',v.dataset.view===viewId));
  $('pageTitle').textContent=viewId==='salesView'?'Record a sale':'Product reports';
  $('headerContext').textContent=viewId==='salesView'?'NEW SALE':'REPORTS';
  if(viewId==='reportsView') renderReports();
}
function renderAll(){ renderToday(); renderRecent(); renderReports(); }
function renderToday(){
  const today=activeSales().filter(s=>dateKey(s.createdAt)===dateKey(new Date()));
  $('todayTotal').textContent=money(today.reduce((a,s)=>a+Number(s.price),0));
  $('todayHenna').textContent=money(totalFor(today,'Henna')); $('todayPins').textContent=money(totalFor(today,'Pins'));
  $('todayDate').textContent=new Date().toLocaleDateString('en-PH',{month:'long',day:'numeric'});
}
function renderRecent(){
  const today=sales.filter(s=>dateKey(s.createdAt)===dateKey(new Date())).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  $('recentSales').innerHTML=today.length?today.map(rowHtml).join(''):'<div class="empty-state">No transactions recorded today yet.</div>';
  bindVoidButtons();
}
function rowHtml(s){
  return `<div class="transaction-row ${s.voided?'voided':''}"><span class="transaction-icon">${s.category==='Henna'?'✦':'◈'}</span><div><span class="transaction-name">${escapeHtml(s.customer)}</span><small class="transaction-sub">${s.category}${s.artist?` · ${escapeHtml(s.artist)}`:` · ${s.size} pin`}</small></div><div class="transaction-cell"><small>Recorded by</small>${escapeHtml(s.recordedBy)}</div><div class="transaction-cell"><small>Time</small>${timeText(s.createdAt)}</div><strong class="transaction-price">${money(s.price)}</strong>${s.voided?'<span class="void-button">VOIDED</span>':`<button class="void-button" data-id="${s.id}">Void sale</button>`}</div>`;
}
function renderReports(){
  const valid=activeSales(); $('reportOverall').textContent=money(valid.reduce((a,s)=>a+Number(s.price),0)); $('reportHenna').textContent=money(totalFor(valid,'Henna')); $('reportPins').textContent=money(totalFor(valid,'Pins')); $('reportCount').textContent=valid.length;
  const groups={}; sales.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).forEach(s=>(groups[dateKey(s.createdAt)]??=[]).push(s));
  $('reportGroups').innerHTML=Object.keys(groups).length?Object.keys(groups).map(day=>{const list=groups[day], validDay=list.filter(s=>!s.voided);return `<article class="report-group"><div class="report-group-header"><strong>${dateText(list[0].createdAt)}</strong><div class="group-totals"><span>Henna <b>${money(totalFor(validDay,'Henna'))}</b></span><span>Pins <b>${money(totalFor(validDay,'Pins'))}</b></span><span>Total <b>${money(validDay.reduce((a,s)=>a+Number(s.price),0))}</b></span></div></div>${list.map(rowHtml).join('')}</article>`}).join(''):'<div class="empty-state">No sales reports yet. Completed transactions will appear here by day.</div>';
  bindVoidButtons();
}
function bindVoidButtons(){ document.querySelectorAll('.void-button[data-id]').forEach(btn=>btn.onclick=()=>voidSale(btn.dataset.id)); }
function voidSale(id){ const code=prompt('Enter the void code to cancel this transaction:'); if(code===null)return; if(code!=='TPAT2026'){toast('Incorrect void code. Transaction was not changed.');return} const sale=sales.find(s=>s.id===id); if(sale){sale.voided=true;sale.voidedAt=new Date().toISOString();sale.voidedBy=currentUser;save();toast('Transaction voided and retained in reports.');} }
function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function updatePrice(){ let price=category==='Henna'?$('hennaPrice').value:(pinSize==='Custom'?$('customPrice').value:document.querySelector('.pin-option.active').dataset.price); $('saleTotal').textContent=money(price); }
function setup(){
  $('userSelect').innerHTML=CASHIERS.map(n=>`<option value="${n}">${n}</option>`).join('');
  $('artistOptions').innerHTML=ARTISTS.map(n=>`<option value="${n}">`).join('');
  if(currentUser) openApp(); else $('loginView').classList.remove('hidden');
  $('loginForm').onsubmit=e=>{e.preventDefault();currentUser=$('userSelect').value;sessionStorage.setItem('artisan-user',currentUser);openApp();};
  $('logoutButton').onclick=()=>{sessionStorage.removeItem('artisan-user');location.reload();};
  document.querySelectorAll('.nav-link').forEach(b=>b.onclick=()=>showView(b.dataset.view));
  document.querySelectorAll('[data-view-target]').forEach(b=>b.onclick=()=>showView(b.dataset.viewTarget));
  document.querySelectorAll('.category-tab').forEach(b=>b.onclick=()=>{category=b.dataset.category;document.querySelectorAll('.category-tab').forEach(x=>x.classList.toggle('active',x===b));$('hennaFields').classList.toggle('hidden',category!=='Henna');$('pinsFields').classList.toggle('hidden',category!=='Pins');$('artistName').required=category==='Henna';$('hennaPrice').required=category==='Henna';updatePrice();});
  document.querySelectorAll('.pin-option').forEach(b=>b.onclick=()=>{pinSize=b.dataset.size;document.querySelectorAll('.pin-option').forEach(x=>x.classList.toggle('active',x===b));$('customPriceField').classList.toggle('hidden',pinSize!=='Custom');$('customPrice').required=pinSize==='Custom';updatePrice();});
  ['hennaPrice','customPrice'].forEach(id=>$(id).oninput=updatePrice);
  $('saleForm').onsubmit=e=>{e.preventDefault();const price=category==='Henna'?Number($('hennaPrice').value):(pinSize==='Custom'?Number($('customPrice').value):Number(document.querySelector('.pin-option.active').dataset.price));if(!price||price<0){toast('Please enter a valid price.');return}sales.push({id:crypto.randomUUID(),category,customer:$('customerName').value.trim(),artist:category==='Henna'?$('artistName').value.trim():'',size:category==='Pins'?pinSize:'',price,recordedBy:currentUser,createdAt:new Date().toISOString(),voided:false});save();e.target.reset();pinSize='Small';document.querySelectorAll('.pin-option').forEach((x,i)=>x.classList.toggle('active',i===0));$('customPriceField').classList.add('hidden');updatePrice();toast('Sale recorded successfully.');};
  $('clearRecords').onclick=()=>{const code=prompt('Enter the records clearance code:');if(code==='TPAT2026'){sales=[];save();toast('All sales records have been cleared.')}else if(code!==null)toast('Incorrect clearance code. No records were changed.')};
  $('printReport').onclick=()=>window.print();
  $('todayLabel').textContent=new Date().toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric',year:'numeric'}); updatePrice();
}
function openApp(){$('loginView').classList.add('hidden');$('appView').classList.remove('hidden');$('currentUser').textContent=currentUser;$('userInitial').textContent=currentUser.charAt(0);renderAll();}
setup();
