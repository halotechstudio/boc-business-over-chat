/* BOC usability fixes from the 2026-11-26 persona test (P0 and P1).
   P0: bills send from the paperclip · shopper prices include GST · Hindi and Tamil
   P1: phone formats + phone contacts · chats above the fold · "Bill" first · real-shop invoice builder · bigger text
   Loaded last. */
(function(){
"use strict";

/* ---------- P0-1: document menu always knows its chat; "Bill" leads the paperclip ---------- */
const _plus=act.plus;
act.plus=e=>{const id=(e&&e.dataset&&e.dataset.id)||(cur().name==="chat"?cur().id:null);S.sheet={type:"plus",chat:id};render()};
act.ckbill=()=>{const c=C(cur().id);S.sheet={type:"invoice",chat:c.id,sel:{},disc:0,terms:(S.buyers&&S.buyers[c.id]&&S.buyers[c.id].terms)||"Advance",px:{},custom:[],q:""};render()};
act.ckpayreq=()=>{S.sheet={type:"plus",chat:cur().id};render();const b=document.querySelector('[data-act="s-paylink"]');b&&b.click()};

/* ---------- P0-2: shoppers see GST-inclusive prices, with a breakdown before paying ---------- */
const GST=0.05;
window.shopPrice=p=>Math.round(p.price*(1+GST));
function inclusify(h,ps){(ps||S.products).forEach(p=>{h=h.split(money(p.price)).join(money(shopPrice(p)))});return h}
const _pc=productCard;
window.productCard=productCard=function(p,c){let h=_pc(p,c);if(side()==="cp"&&!(c&&c.kind==="b2b"))h=inclusify(h,[p]).replace(" GST extra."," Includes GST.");return h};
const _pd=screens.pdetail;
screens.pdetail=v=>{let h=_pd(v);if(isBiz())return h;const p=P(v.id);return inclusify(h,[p]).replace("GST extra · you pay the business directly","Includes GST · you pay the business directly")};
const _shop=screens.shop;
screens.shop=v=>{let h=_shop(v);return isBiz()?h:inclusify(h)};
const _web=webView;
window.webView=webView=k=>inclusify(_web(k)).replace("Products, public prices","Products, prices include GST");
const _rsA=renderSheet;
window.renderSheet=renderSheet=function(){const sh=S.sheet;let h=_rsA();
  if(sh.type==="ckstatus"){const s=S.statuses.find(x=>x.biz===sh.biz),it=s&&s.items[sh.i];if(it&&it.pid&&!isBiz())h=inclusify(h,[P(it.pid)])}
  if(sh.type==="order"){const p=P(sh.pid),fee=sh.ship==="exp"?142:78,t=totals([{qty:sh.qty,price:p.price}],0,fee);
    h=inclusify(h,[p]);
    const brk=`<div class="px-brk" aria-label="Price breakdown"><div><span>${esc(p.name)} × ${sh.qty}</span><span class="num">${money(shopPrice(p)*sh.qty)}</span></div><div class="sub"><span>Includes GST 5%</span><span class="num">${money(t.tax)}</span></div><div><span>Delivery</span><span class="num">${money(fee)}</span></div><div class="tot"><span>You pay</span><span class="num">${money(shopPrice(p)*sh.qty+fee)}</span></div></div>`;
    h=h.replace('<div class="sf">',brk+'<div class="sf">')}
  return h};

/* ---------- P1: invoice and quote builder that fits a real shop ---------- */
window.itemPicker=itemPicker=function(sh,pk){sh.px=sh.px||{};sh.custom=sh.custom||[];const q=(sh.q||"").toLowerCase();
  const list=S.products.filter(p=>!q||(p.name+" "+p.code+" "+p.cat).toLowerCase().includes(q));
  return `<div class="ib-search">${ic("search","s")}<input id="isearch" placeholder="Search ${S.products.length} products" value="${esc(sh.q||"")}" aria-label="Search products"></div>
  ${list.map(p=>{const n=sh.sel[p.id]||0,price=sh.px[p.id]??p[pk];return `<div class="ib-item ${n?"on":""}"><span class="pg-sw" style="background:${p.color};width:36px;height:36px"></span><span class="ib-m"><b>${esc(p.name)}</b><small>${p.stock} ${p.unit} in stock</small></span>
    <label class="ib-px"><span>₹</span><input inputmode="numeric" id="px_${p.id}" value="${price}" aria-label="Price for ${esc(p.name)}"></label>
    <span class="ib-q"><button data-act="qty" data-p="${p.id}" data-d="-1" aria-label="Fewer">−</button><input inputmode="numeric" id="q_${p.id}" value="${n}" aria-label="Quantity of ${esc(p.name)}"><button data-act="qty" data-p="${p.id}" data-d="1" aria-label="More">+</button></span></div>`}).join("")||`<p class="muted" style="margin:10px 2px">No product matches. Add it by hand below.</p>`}
  ${sh.type!=="po"?`<div class="lab" style="margin-top:12px">Add an item by hand</div>${sh.custom.map((c,i)=>`<div class="ib-item on"><span class="ib-m"><b>${esc(c.name)}</b><small>${c.qty} × ${money(c.price)}</small></span><button class="ck-ib" data-act="ibdel" data-i="${i}" aria-label="Remove ${esc(c.name)}">${ic("close","s")}</button></div>`).join("")}
  <div class="ib-add"><input id="cname_i" placeholder="e.g. Stitching charges" aria-label="Item name"><input id="cprice_i" inputmode="numeric" placeholder="₹ price" aria-label="Item price"><button class="btn sm" data-act="ibadd">Add</button></div>`:""}`};
const lineItems=sh=>{const pk=sh.type==="po"?"cost":(C(sh.chat)&&C(sh.chat).kind==="b2b"?"whole":"price");
  return [...Object.entries(sh.sel).filter(([,q])=>q>0).map(([pid,qty])=>({pid,qty,price:(sh.px&&sh.px[pid]!=null)?+sh.px[pid]:P(pid)[pk]})),...(sh.custom||[]).map(c=>({pid:null,name:c.name,qty:c.qty,price:c.price}))]};
window.lineItems=lineItems;
const _rsB=renderSheet;
window.renderSheet=renderSheet=function(){const sh=S.sheet;let h=_rsB();
  if(["invoice","quote","po"].includes(sh.type)){const its=lineItems(sh),t=totals(its,sh.disc||0);
    h=h.replace(/<div class="sum">[\s\S]*?<\/b><\/div><button class="btn" data-act="submit"[^>]*>/,`<div class="sum"><div class="meta" style="margin:0">${its.length} ${its.length===1?"item":"items"}</div><b class="num">${money(t.total)}</b></div><button class="btn" data-act="submit" ${its.length?"":"disabled"}>`);
    h=h.replace(/>Send invoice</,">Send bill<").replace(/aria-label="New invoice"/,'aria-label="New bill"').replace("<h3>New invoice</h3>","<h3>New bill</h3>").replace(/>Advance</,">Pay now<").replace(/>Net 15</,">In 15 days<").replace(/>Net 30</,">In 30 days<")}
  return h};
/* typed quantity, typed price, search, hand-typed lines */
document.addEventListener("input",e=>{const t=e.target,sh=S.sheet;if(!sh)return;
  if(t.id==="isearch"){sh.q=t.value;render();return}
  if(t.id&&t.id.startsWith("q_")){const pid=t.id.slice(2),p=P(pid);let v=Math.max(0,parseInt(t.value.replace(/\D/g,""))||0);if(["quote","invoice"].includes(sh.type)&&v>p.stock){v=p.stock;toast(`Only ${p.stock} ${p.unit} in stock`)}sh.sel[pid]=v;render();return}
  if(t.id&&t.id.startsWith("px_")){const v=parseInt(t.value.replace(/\D/g,""));sh.px[t.id.slice(3)]=isNaN(v)?0:v;render()}});
Object.assign(act,{
  ibadd:()=>{const n=((document.getElementById("cname_i")||{}).value||"").trim(),p=parseInt(((document.getElementById("cprice_i")||{}).value||"").replace(/\D/g,""));
    if(!n||!p){toast("Type the item name and its price");return}S.sheet.custom.push({name:n,qty:1,price:p});render()},
  ibdel:e=>{S.sheet.custom.splice(+e.dataset.i,1);render()}});
/* apply typed prices and hand-typed lines to what gets sent; keep credit in step */
const _sub=submitSheet;
window.submitSheet=submitSheet=function(){const sh=S.sheet;if(!sh||!["invoice","quote","po"].includes(sh.type))return _sub();
  const custom=sh.custom||[],px=sh.px||{};const before=new Set(Object.keys(S.docs));
  if(!Object.values(sh.sel).some(q=>q>0)&&custom.length){/* bill with only hand-typed items */
    const c=C(sh.chat);const d=addDoc({id:nid(sh.type==="quote"?"QT":"INV"),kind:sh.type==="quote"?"quote":"invoice",chat:c.id,items:custom.map(x=>({pid:null,name:x.name,qty:x.qty,price:x.price})),disc:sh.disc||0,terms:sh.terms,due:sh.terms==="Advance"?"on receipt":dueDate({terms:sh.terms}),status:sh.type==="quote"?"sent":"unpaid"});
    S.sheet=null;post(c.id,"biz",{type:"doc",ref:d.id});if(sh.terms==="Advance"&&d.kind==="invoice")sim(c.id,1500,()=>{payDoc(d,"UPI");post(c.id,"cp","Paid. Thank you!")});render();return}
  _sub();
  Object.values(S.docs).filter(d=>!before.has(d.id)&&d.items).forEach(d=>{const t0=docTotal(d);
    d.items.forEach(i=>{if(i.pid&&px[i.pid]!=null)i.price=+px[i.pid]});custom.forEach(x=>d.items.push({pid:null,name:x.name,qty:x.qty,price:x.price}));
    const b=S.buyers&&S.buyers[d.chat];if(b&&d.kind==="invoice"&&/^Net/.test(d.terms||""))b.used+=Math.round(docTotal(d)-t0)});
  render()};

/* ---------- P1: phone numbers the way people type them, Enter submits, phone contacts ---------- */
const _cwn=chatWithNumber;
window.chatWithNumber=raw=>_cwn(String(raw).replace(/\D/g,"").replace(/^0+(?=\d{10}$)/,"").replace(/^91(?=\d{10}$)/,""));
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="cknum"){e.preventDefault();act.cknumgo()}
  if(e.key==="Enter"&&e.target.id==="cprice_i"){e.preventDefault();act.ibadd()}});
const PHONEBOOK=[["Anand Tailors","9843055501"],["Kavitha Akka","9944012233"],["Murugan Transport","9842098765"],["Sathya (Instagram)","7010023456"]];
act.ckpb=async()=>{try{if(navigator.contacts&&navigator.contacts.select){const r=await navigator.contacts.select(["name","tel"],{multiple:false});if(r&&r[0]&&r[0].tel&&r[0].tel[0]){const x=chatWithNumber(r[0].tel[0]);if(x.id){if(isBiz()&&r[0].name&&r[0].name[0])saveContact(x.id,r[0].name[0]);S.sheet=null;openChat(x.id)}}return}}catch(err){}
  S.sheet={type:"ckpb"};render()};
act.ckpbpick=e=>{const [n,num]=PHONEBOOK[+e.dataset.i];const x=chatWithNumber(num);if(x.id){if(isBiz())saveContact(x.id,n);S.sheet=null;openChat(x.id)}};
const _rsC=renderSheet;
window.renderSheet=renderSheet=function(){const sh=S.sheet;
  if(sh.type==="ckpb")return sheetWrap("Phone contacts",`<p class="muted" style="margin:0 0 10px">From your phone's address book (example contacts in this demo).</p><div class="ck-rows">${PHONEBOOK.map(([n,num],i)=>`<button class="ck-row" data-act="ckpbpick" data-i="${i}">${av(n,"#566366",32)}<span>${esc(n)}<small style="display:block;color:var(--ink2)" class="num">+91 ${num.slice(0,5)} ${num.slice(5)}</small></span></button>`).join("")}</div>`);
  let h=_rsC();
  if(sh.type==="newchat")h=h.replace('<div class="ck-rows">',`<div class="ck-rows" style="margin-bottom:10px"><button class="ck-row" data-act="ckpb">${ic("users","s")}<span>Pick from phone contacts</span></button></div><div class="ck-rows">`).replace(/<input id="cknum"/,'<input id="cknum" enterkeyhint="go"');
  if(sh.type==="ckattach")h=h.replace('<div class="ck-ats">',`<div class="ck-ats">${isBiz()?`<button class="ck-at" data-act="ckbill"><span style="background:#111214">${ic("file")}</span>Bill</button><button class="ck-at" data-act="ckpayreq"><span style="background:#1E9E45">${ic("wallet")}</span>Ask for payment</button>`:""}`).replace(/<button class="ck-at" data-act="plus"><span style="background:#111214">[\s\S]*?<\/button>/,`<button class="ck-at" data-act="plus"><span style="background:#111214">${ic("card")}</span>More documents</button>`);
  if(sh.type==="plus"){const c=C(sh.chat);if(c&&c.kind==="customer")h=h.replace(/<button class="tool" data-act="s-po">[\s\S]*?<\/button>/,"").replace(/<button class="tool" data-act="s-rfq">[\s\S]*?<\/button>/,"");h=h.replace(/(data-act="s-invoice">[\s\S]*?)Invoice/,"$1Bill")}
  return h};

/* ---------- P1: chats above the fold ---------- */
const _cl=chatList;
window.chatList=chatList=function(){let h=_cl();if(!isBiz())return h;const ny=needsYou();
  return h.replace(/<section class="needs"[\s\S]*?<\/section>/,ny.length?`<button class="needs-bar" data-act="tab" data-t="pending"><span class="nb-c num">${ny.length}</span><span><b>${ny.length===1?"1 thing needs you":ny.length+" things need you"}</b><small>${esc(ny.slice(0,2).map(x=>x.t+" · "+x.who.split(" ")[0]).join(", "))}</small></span>${ic("chevr","s")}</button>`:"")};

/* ---------- P0-3: Indian languages for the app chrome ---------- */
const L={
 hi:{"Chats":"चैट","Pending":"बाकी काम","Business":"कारोबार","More":"और","Explore":"खोजें","Orders":"ऑर्डर","You":"आप","Search names, labels, messages":"नाम, लेबल, मैसेज खोजें","All":"सभी","Unread":"न पढ़े","Follow up":"फ़ॉलो अप","Customers":"ग्राहक","Wholesale":"थोक","Suppliers":"सप्लायर","Team":"टीम","See all":"सब देखें","My status":"मेरा स्टेटस","Add":"जोड़ें","Send":"भेजें","Bill":"बिल","Ask for payment":"भुगतान माँगें","More documents":"और दस्तावेज़","Photo":"फ़ोटो","Document":"दस्तावेज़","Location":"लोकेशन","Contact":"संपर्क","Poll":"पोल","Voice note":"वॉइस नोट","Product":"प्रोडक्ट","New chat":"नई चैट","New group":"नया ग्रुप","New broadcast":"नया ब्रॉडकास्ट","Pick from phone contacts":"फ़ोन संपर्कों से चुनें","Chat":"चैट करें","Save contact":"संपर्क सेव करें","Block":"ब्लॉक","To collect":"लेना है","To pay":"देना है","Send bill":"बिल भेजें","New bill":"नया बिल","Pay now":"अभी भुगतान","In 15 days":"15 दिन में","In 30 days":"30 दिन में","Discount":"छूट","Payment terms":"भुगतान की शर्तें","Add an item by hand":"हाथ से आइटम जोड़ें","Send reminder":"याद दिलाएँ","Record cash payment":"नकद भुगतान दर्ज करें","Record a part payment":"आंशिक भुगतान दर्ज करें","Credit note":"क्रेडिट नोट","Products":"प्रोडक्ट","Money":"पैसा","Contacts":"संपर्क","Language":"भाषा","Help and how-tos":"मदद और तरीके","Connections":"कनेक्शन","Plan and billing":"प्लान और बिलिंग","Sales":"बिक्री","Purchases":"खरीद","Add product":"प्रोडक्ट जोड़ें","My orders":"मेरे ऑर्डर","Deliver to":"यहाँ भेजें","Delivery":"डिलीवरी","Pay":"भुगतान","You pay":"आप देंगे","Includes GST 5%":"GST 5% शामिल","Message":"मैसेज","Reply":"जवाब","Forward":"फ़ॉरवर्ड","Star":"स्टार","Copy":"कॉपी","Delete for me":"मेरे लिए हटाएँ","Delete for everyone":"सबके लिए हटाएँ","Waiting on you":"आपका इंतज़ार"},
 ta:{"Chats":"அரட்டைகள்","Pending":"நிலுவை","Business":"வணிகம்","More":"மேலும்","Explore":"தேடு","Orders":"ஆர்டர்கள்","You":"நீங்கள்","Search names, labels, messages":"பெயர், லேபிள், செய்தி தேடு","All":"அனைத்தும்","Unread":"படிக்காதவை","Follow up":"பின்தொடர்","Customers":"வாடிக்கையாளர்கள்","Wholesale":"மொத்த விற்பனை","Suppliers":"சப்ளையர்கள்","Team":"குழு","See all":"அனைத்தும் பார்","My status":"என் நிலை","Add":"சேர்","Send":"அனுப்பு","Bill":"பில்","Ask for payment":"பணம் கேள்","More documents":"மேலும் ஆவணங்கள்","Photo":"புகைப்படம்","Document":"ஆவணம்","Location":"இருப்பிடம்","Contact":"தொடர்பு","Poll":"வாக்கெடுப்பு","Voice note":"குரல் செய்தி","Product":"பொருள்","New chat":"புதிய அரட்டை","New group":"புதிய குழு","New broadcast":"புதிய ஒளிபரப்பு","Pick from phone contacts":"தொலைபேசி தொடர்புகளிலிருந்து","Chat":"அரட்டை","Save contact":"தொடர்பைச் சேமி","Block":"தடு","To collect":"வர வேண்டியது","To pay":"கொடுக்க வேண்டியது","Send bill":"பில் அனுப்பு","New bill":"புதிய பில்","Pay now":"இப்போது செலுத்து","In 15 days":"15 நாளில்","In 30 days":"30 நாளில்","Discount":"தள்ளுபடி","Payment terms":"கட்டண விதிமுறைகள்","Add an item by hand":"கையால் பொருள் சேர்","Send reminder":"நினைவூட்டு","Record cash payment":"ரொக்கப் பணம் பதிவு","Record a part payment":"பகுதிப் பணம் பதிவு","Credit note":"கிரெடிட் நோட்","Products":"பொருட்கள்","Money":"பணம்","Contacts":"தொடர்புகள்","Language":"மொழி","Help and how-tos":"உதவி","Connections":"இணைப்புகள்","Plan and billing":"திட்டம் மற்றும் கட்டணம்","Sales":"விற்பனை","Purchases":"கொள்முதல்","Add product":"பொருள் சேர்","My orders":"என் ஆர்டர்கள்","Deliver to":"அனுப்ப வேண்டிய முகவரி","Delivery":"டெலிவரி","Pay":"செலுத்து","You pay":"நீங்கள் செலுத்துவது","Includes GST 5%":"GST 5% உட்பட","Message":"செய்தி","Reply":"பதில்","Forward":"முன்னனுப்பு","Star":"நட்சத்திரம்","Copy":"நகலெடு","Delete for me":"எனக்கு மட்டும் நீக்கு","Delete for everyone":"அனைவருக்கும் நீக்கு","Waiting on you":"உங்களுக்காக காத்திருக்கிறது"}};
window.LANGS={en:"English",hi:"हिन्दी",ta:"தமிழ்"};
S.lang=S.lang||"en";
function translate(){const d=L[S.lang];if(!d)return;const root=document.getElementById("app");
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const t=n.nodeValue.trim();if(t&&d[t])n.nodeValue=n.nodeValue.replace(t,d[t])}
  root.querySelectorAll("[placeholder]").forEach(el=>{const t=el.getAttribute("placeholder");if(d[t])el.setAttribute("placeholder",d[t])});
  root.querySelectorAll("[aria-label]").forEach(el=>{const t=el.getAttribute("aria-label");if(d[t])el.setAttribute("aria-label",d[t])})}
act.lang=e=>{S.lang=e.dataset.v;document.documentElement.lang=S.lang==="en"?"en":S.lang;render()};
const langRow=()=>`<div class="lang-row" role="radiogroup" aria-label="Language">${ic("chat","s")}<span>Language</span>${Object.entries(LANGS).map(([k,l])=>`<button role="radio" aria-checked="${S.lang===k}" class="${S.lang===k?"on":""}" data-act="lang" data-v="${k}" lang="${k}">${l}</button>`).join("")}</div>`;
const _more=moreView;
window.moreView=moreView=function(){return _more().replace('<div class="body">','<div class="body">'+langRow())};
const _me=meView;
window.meView=meView=function(){return _me().replace('<div class="pg-me">',langRow()+'<div class="pg-me">')};
const _obs=obScreen;
window.obScreen=obScreen=function(v){let h=_obs(v);if(v.step==="welcome"||v.step==="phone")h=h.replace('<div class="body ob">','<div class="body ob">'+langRow());return h};

/* ---------- hook: translate after every render ---------- */
const _render=render;
window.render=render=function(){_render();try{translate()}catch(e){}};
render();
})();
