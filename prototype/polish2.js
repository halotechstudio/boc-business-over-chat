/* BOC usability fixes, round 2 (P2, P3 and the field gaps from the 2026-11-26 test).
   Create order from a message · labelled header actions · no cut-off names · calmer unsaved banner ·
   card options off the status · pending by urgency with "remind all" · honest product placeholders,
   own categories and HSN help · choose delivery address · app lock · print or share bills ·
   quick counter bill · offline notice. Loaded after polish.js. */
(function(){
"use strict";

/* ---------- create an order or quote from a buyer's message ---------- */
const WORDS=[[/kanji|kanchi|saree|sari/,"p1"],[/cotton/,"p2"],[/linen/,"p3"],[/dupatta/,"p4"],[/kurta/,"p5"],[/thread|cone/,"p6"]];
window.parseOrder=function(text){const sel={};const re=/(\d+)\s*(?:rolls?|pcs?|pieces?|sets?|box(?:es)?|nos?|units?)?\s*(?:of\s+)?([a-z ]{3,40}?)(?=[,.;]|\s+and\s|\s+for\s|$)/gi;let m;
  while((m=re.exec(text))){const q=+m[1],w=m[2].toLowerCase();const hit=WORDS.find(([r])=>r.test(w));if(hit&&q>0)sel[hit[1]]=(sel[hit[1]]||0)+q}
  return sel};
act.ckmkorder=()=>{const c=C(cur().id),m=c.msgs[S.sheet.i],sel=parseOrder(m.text||"");const b2b=c.kind==="b2b";
  S.sheet={type:b2b?"quote":"invoice",chat:c.id,sel,disc:0,terms:(S.buyers&&S.buyers[c.id]&&S.buyers[c.id].terms)||"Advance",px:{},custom:[],q:"",from:m.text};render();
  toast(Object.keys(sel).length?"Items filled in from the message. Check and send.":"Couldn't read items from this message. Pick them below.")};

/* ---------- sheets: menu rows, message menu, order address, quick bill ---------- */
const ADDR=["Meera Nair, 14 Marine Drive, Kochi 682031","Meera Nair (office), 3rd floor, Infopark Phase 1, Kakkanad, Kochi 682042"];
const _rs=renderSheet;
window.renderSheet=renderSheet=function(){const sh=S.sheet;
  if(sh.type==="applock")return `<div class="pin-lock" role="dialog" aria-label="App locked"><span class="wm"><i>B</i>BOC</span><h2>Enter your PIN</h2><p>Money and business screens are locked. Example PIN: 1234</p><div class="pin-dots">${[0,1,2,3].map(i=>`<i class="${(sh.pin||"").length>i?"on":""}"></i>`).join("")}</div>${sh.err?`<p class="ck-err" style="color:#FF8A80">${esc(sh.err)}</p>`:""}<div class="pin-pad">${[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map(k=>k===""?"<span></span>":`<button data-act="pinkey" data-k="${k}" aria-label="${k==="⌫"?"Delete":k}">${k}</button>`).join("")}</div><button class="linkbtn" data-act="pinback" style="color:#B6B7BC">Back to chats</button></div>`;
  let h=_rs();
  if(sh.type==="ckmsg"&&isBiz()){const c=C(cur().id),m=c&&c.msgs[sh.i];if(m&&m.by!==side()&&m.type==="text"&&["customer","b2b"].includes(c.kind))h=h.replace('<div class="ck-rows">',`<div class="ck-rows"><button class="ck-row" data-act="ckmkorder">${ic("box","s")}<span>${c.kind==="b2b"?"Make a quote from this":"Make a bill from this"}</span></button>`)}
  if(sh.type==="ckmenu")h=h.replace('<div class="ck-rows">',`<div class="ck-rows"><button class="ck-row ck-vrow" data-act="ckcall" data-v="video">${ic("video","s")}<span>Video call</span></button>`);
  if((sh.type==="invoice"||sh.type==="quote")&&sh.from)h=h.replace('<div class="sb">',`<div class="sb"><div class="ib-from">${ic("chat","s")}<span>From the message: “${esc(sh.from.slice(0,90))}${sh.from.length>90?"…":""}”</span></div>`);
  if(sh.type==="order"){const a=S.addr||0;h=h.replace(/(<div class="lab">Deliver to<\/div>)<div class="opt on">[\s\S]*?<\/div><\/div>/,`$1${ADDR.map((x,i)=>`<button class="opt ${a===i?"on":""}" data-act="addrpick" data-i="${i}"><span class="mini" style="background:var(--tint-soft);color:var(--tint)">${ic(i?"store":"home")}</span><div class="mid"><b>${i?"Office":"Home"}</b><span>${esc(x.split(", ").slice(1).join(", "))}</span></div></button>`).join("")}<button class="linkbtn" data-act="addrnew" style="margin:2px 0 6px">+ Add a new address</button>`)}
  if(sh.type==="invoice"&&sh.counter)h=h.replace("<h3>New bill</h3>","<h3>Counter bill</h3>").replace(/>Send bill</,">Save and mark paid in cash<");
  return h};
act.addrpick=e=>{S.addr=+e.dataset.i;render()};
act.addrnew=()=>toast("New addresses are added from You → Delivery address (simulated)");
const _place=placeOrder;
window.placeOrder=placeOrder=function(cid,items,pm,fee){const o=_place(cid,items,pm,fee);if(!isBiz()&&S.addr)o.addr=ADDR[S.addr];return o};

/* ---------- labelled header actions, no cut-off names ---------- */
const relabel=h=>h.replace(/<button class="ai ([^"]*)" data-act="aitoggle"([^>]*)>([\s\S]*?)<\/button>/,(m,c,a,inner)=>`<button class="ai lbl ${c}" data-act="aitoggle"${a}>${inner}<span>${S.aiOpen?"Close":"Ask AI"}</span></button>`)
  .replace(/<button class="ib" data-act="go" data-s="customers" aria-label="Contacts and CRM">[\s\S]*?<\/button>/,`<button class="hdr-pill" data-act="go" data-s="customers">${ic("users","s")}<span>Contacts</span></button>`);
["chatList","pendingView","bizView","moreView"].forEach(n=>{const f=window[n];window[n]=function(){return relabel(f.apply(this,arguments))}});
chatList=window.chatList;pendingView=window.pendingView;bizView=window.bizView;moreView=window.moreView;

/* ---------- calmer unsaved-number banner, quick bill/print in chat ---------- */
const _cv=chatView;
window.chatView=chatView=function(v){let h=_cv(v);const c=C(v.id);if(!c)return h;
  if(isBiz()&&c.unsaved){const started=c.msgs.find(m=>m.by!=="sys");const mine=started&&started.by===side();const any=c.msgs.some(m=>m.by===side());
    h=h.replace(/<div class="ck-unsaved">[\s\S]*?<\/div><\/div>/,`<div class="ck-unsaved slim">${ic("user","s")}<span>${mine?"This number isn't saved":"New number, not in your contacts"}</span><button data-act="cksave">Save</button>${any?"":`<button data-act="ckblock" class="b">Block</button>`}</div>`)}
  return h};
const _card=cardHTML;
window.cardHTML=cardHTML=function(m,c){let h=_card(m,c);const d=m.ref&&D(m.ref);
  if(d&&d.kind==="invoice"&&isBiz())h+=`<div class="acts"><button data-act="billpdf" data-id="${d.id}">${ic("file","s")} Share PDF</button><button data-act="billprint" data-id="${d.id}">${ic("box","s")} Print</button></div>`;
  return h};
act.billpdf=e=>toast(`${code(e.dataset.id)}.pdf ready to share on any app (simulated)`);
act.billprint=e=>toast(`Sent ${code(e.dataset.id)} to the Bluetooth receipt printer (simulated)`);

/* ---------- pending: most urgent first, remind everyone overdue in one tap ---------- */
const _ny=needsYou;
window.needsYou=needsYou=function(){const rank=x=>x.bad?0:/Follow up|Reply in person/.test(x.t)?1:/Sign|Approve|Accept|Ship/.test(x.t)?2:3;return _ny().map((x,i)=>({x,i})).sort((a,b)=>rank(a.x)-rank(b.x)||a.i-b.i).map(o=>o.x)};
const overdue=()=>Object.values(S.docs).filter(d=>d.kind==="invoice"&&d.status!=="paid"&&d.dueTs&&d.dueTs<Date.now());
const _pv=pendingView;
window.pendingView=pendingView=function(){let h=_pv();const od=overdue();if(!od.length)return h;
  return h.replace(/(<div class="stat2"[\s\S]*?<\/div><\/div><\/div>)/,`$1<button class="remind-all" data-act="remindall">${ic("bell","s")}<span><b>Remind ${od.length} overdue ${od.length===1?"buyer":"buyers"}</b><small>A polite message with the amount and a pay link, in each chat</small></span>${ic("chevr","s")}</button>`)};
act.remindall=()=>{const od=overdue();od.forEach(d=>post(d.chat,"biz",`Gentle reminder: ${code(d.id)} for ${money(balance(d))} was due on ${d.due}. You can pay from the bill above. Thank you!`));toast(`Reminders sent to ${od.length} ${od.length===1?"buyer":"buyers"}`);render()};

/* ---------- add product: honest placeholders, own categories, HSN help ---------- */
const _ap=screens.addproduct;
screens.addproduct=v=>{let h=_ap(v);const f=S.np||{};
  h=h.replace('placeholder="18500"','placeholder="e.g. 1,200"').replace('placeholder="15200"','placeholder="optional"').replace('placeholder="5007"','placeholder="optional"').replace('placeholder="10"','placeholder="e.g. 20"')
   .replace("Sets the GST rate on invoices","Not sure? Leave it blank: BOC picks it from the category and sets the GST rate.");
  const cats=[...new Set(["Sarees","Fabric","Dupattas","Apparel","Supplies",...(S.cats||[]),...S.products.map(p=>p.cat)])];
  h=h.replace(/(<div class="lab">Category<\/div><div class="wchips">)[\s\S]*?(<\/div><div style="height:14px">)/,`$1${cats.map(x=>`<button class="fc ${f.cat===x?"on":""}" data-act="npset" data-k="cat" data-v="${esc(x)}">${esc(x)}</button>`).join("")}<button class="fc" data-act="newcat">+ New category</button>$2`);
  if(S.newcat)h=h.replace(/(<div class="lab">Category<\/div>)/,`$1<div class="ib-add" style="margin-bottom:8px"><input id="newcat_i" placeholder="e.g. Skincare" aria-label="New category"><button class="btn sm" data-act="newcatgo">Add</button></div>`);
  return h};
act.newcat=()=>{S.newcat=true;render();const el=document.getElementById("newcat_i");el&&el.focus()};
act.newcatgo=()=>{const v=((document.getElementById("newcat_i")||{}).value||"").trim();if(!v){toast("Type a category name");return}S.cats=[...(S.cats||[]),v];S.np=S.np||{};S.np.cat=v;S.newcat=false;render()};
const _save=act.saveproduct;
act.saveproduct=e=>{const f=S.np||{};if(f.price&&!f.whole)f.whole=String(Math.round(+f.price*0.85));if(!f.hsn)f.hsn=({Sarees:"5007",Fabric:"5208",Dupattas:"5007",Apparel:"6211",Supplies:"5004"})[f.cat]||"9999";return _save(e)};

/* ---------- quick counter bill (walk-in, cash) ---------- */
act.counterbill=()=>{if(!C("walkin"))chat({id:"walkin",name:"Walk-in customer",kind:"customer",labels:[],color:"#566366",acct:"Counter sales, no phone needed",msgs:[],ts:Date.now()});
  S.sheet={type:"invoice",chat:"walkin",sel:{},disc:0,terms:"Cash",px:{},custom:[],q:"",counter:true};render()};
const _sub=submitSheet;
window.submitSheet=submitSheet=function(){const sh=S.sheet;if(!(sh&&sh.counter))return _sub();const before=new Set(Object.keys(S.docs));_sub();
  Object.values(S.docs).filter(d=>!before.has(d.id)&&d.kind==="invoice").forEach(d=>{d.status="paid";d.paidHow="Cash at counter";S.months[5][1]+=docTotal(d)});S.sheet=null;toast("Counter bill saved, paid in cash");render()};
const _biz2=bizView;
window.bizView=bizView=function(){return _biz2().replace('<div class="dash-actions">',`<button class="pg-btn" data-act="counterbill" style="width:calc(100% - 32px);margin:12px 16px 0">Quick counter bill${ic("chevr","s")}</button><div class="dash-actions">`)};

/* ---------- app lock for money screens ---------- */
S.lock=S.lock||false;let unlocked=false;
const guarded=()=>isBiz()&&S.lock&&!unlocked&&(S.tab==="biz"&&cur().name==="tab"||["money","credit","plan","orders"].includes(cur().name));
act.pinkey=e=>{const sh=S.sheet,k=e.dataset.k;if(k==="⌫")sh.pin=(sh.pin||"").slice(0,-1);else sh.pin=(sh.pin||"")+k;sh.err="";
  if(sh.pin.length===4){if(sh.pin==="1234"){unlocked=true;S.sheet=null}else{sh.err="Wrong PIN. Try again.";sh.pin=""}}render()};
act.pinback=()=>{S.sheet=null;S.stack=[{name:"tab"}];S.tab="chats";render()};
act.locktoggle=()=>{S.lock=!S.lock;unlocked=!S.lock?false:true;toast(S.lock?"App lock on. PIN asked for money and business screens.":"App lock off");render()};
const _more=moreView;
window.moreView=moreView=function(){return _more().replace('<div class="body">',`<div class="body"><button class="row" data-act="locktoggle"><span class="mini" style="background:var(--tint-soft);color:var(--tint)">${ic("lock")}</span><div class="mid"><div class="t">App lock</div><div class="s">${S.lock?"On · PIN for money and business screens":"Off · ask for a PIN on shared phones"}</div></div><span class="sw ${S.lock?"on":""}" aria-hidden="true"></span></button>`)};

/* ---------- offline notice ---------- */
let offline=!navigator.onLine;
addEventListener("online",()=>{offline=false;render();toast("Back online. Queued messages sent.")});
addEventListener("offline",()=>{offline=true;render()});

/* ---------- render hook: lock screen and offline bar ---------- */
const _render=render;
window.render=render=function(){if(guarded()&&!(S.sheet&&S.sheet.type==="applock"))S.sheet={type:"applock",pin:""};_render();
  if(S.tab==="pending"&&cur().name==="tab"){const hs=[...document.querySelectorAll("#app .secttl")],od=hs.find(x=>/overdue/i.test(x.textContent)),first=hs[0];if(od&&first&&od!==first){const list=od.nextElementSibling;first.parentNode.insertBefore(od,first);first.parentNode.insertBefore(list,first)}}
  if(offline){const app=document.getElementById("app");app&&app.insertAdjacentHTML("afterbegin",`<div class="offline-bar" role="status">${ic("alert","s")}You're offline. Messages and bills will send when you're back.</div>`)}};
render();
})();
