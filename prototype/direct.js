/* BOC without escrow + connections to each business's own tools.
   Buyers pay the business directly through the business's own gateway or UPI; BOC never holds money
   and takes no cut. Businesses connect their payment gateway, couriers, accounting and store tools.
   Loaded last. */
(function(){
"use strict";
/* ---------- the tools a business can connect (names are partners a business might already use; logos are letter marks) ---------- */
const CX=[
 {cat:"Payments",note:"Buyers pay straight into your account. BOC never holds the money or takes a cut.",items:[
  {id:"upi",n:"Your UPI ID",i:"UPI",c:"#1E9E45",d:"shreetextiles@kbank · free, instant"},
  {id:"razorpay",n:"Razorpay",i:"RZ",c:"#2F6FB0",d:"Cards, UPI, net banking, EMI · their fees apply"},
  {id:"cashfree",n:"Cashfree Payments",i:"CF",c:"#6B4FB3",d:"Payment links and payouts"},
  {id:"phonepe",n:"PhonePe Payment Gateway",i:"PP",c:"#5B3A8C",d:"UPI-first checkout"},
  {id:"paytm",n:"Paytm for Business",i:"PT",c:"#0F7C86",d:"QR, soundbox and gateway"},
  {id:"payu",n:"PayU",i:"PU",c:"#B97A06",d:"Cards and EMI"}]},
 {cat:"Shipping",note:"Book pickups and track parcels from the chat with your own courier accounts and rates.",items:[
  {id:"shiprocket",n:"Shiprocket",i:"SR",c:"#6B4FB3",d:"25+ couriers through one account"},
  {id:"delhivery",n:"Delhivery",i:"DL",c:"#B3261E",d:"Surface and express"},
  {id:"bluedart",n:"Blue Dart",i:"BD",c:"#2F6FB0",d:"Express air"},
  {id:"indiapost",n:"India Post",i:"IP",c:"#B3261E",d:"Speed Post with tracking"},
  {id:"porter",n:"Porter",i:"PO",c:"#2F6FB0",d:"Same-day local delivery"},
  {id:"owncourier",n:"Your own transporters",i:"TR",c:"#566366",d:"Add LR numbers by hand"}]},
 {cat:"Accounting and GST",note:"Invoices, payments and purchase bills sync both ways, so your accountant works where they already do.",items:[
  {id:"tally",n:"Tally",i:"TL",c:"#1E9E45",d:"Two-way voucher sync"},
  {id:"zoho",n:"Zoho Books",i:"ZB",c:"#B3261E",d:"Invoices, bills and contacts"},
  {id:"vyapar",n:"Vyapar",i:"VY",c:"#2F6FB0",d:"Billing and stock"},
  {id:"busy",n:"Busy",i:"BS",c:"#0F7C86",d:"Inventory and GST"},
  {id:"gstfile",n:"GST filing partner",i:"GST",c:"#566366",d:"GSTR-1 from your BOC invoices"}]},
 {cat:"Store and catalog",note:"Keep one catalog. Prices and stock stay the same everywhere you sell.",items:[
  {id:"shopify",n:"Shopify",i:"SH",c:"#1E9E45",d:"Products, stock and orders"},
  {id:"woo",n:"WooCommerce",i:"WC",c:"#6B4FB3",d:"Products and orders"},
  {id:"sheets",n:"Google Sheets",i:"GS",c:"#1E9E45",d:"Import or export your catalog"},
  {id:"csv",n:"CSV upload",i:"CSV",c:"#566366",d:"Bulk add products from a file"}]},
 {cat:"Other tools",note:"For bookings, your own systems and anything else.",items:[
  {id:"gcal",n:"Google Calendar",i:"GC",c:"#2F6FB0",d:"Bookings appear on your calendar"},
  {id:"api",n:"API and webhooks",i:"API",c:"#111214",d:"Send BOC events to your own software"}]}];
window.CX=CX;
const all=()=>CX.flatMap(g=>g.items.map(x=>({...x,cat:g.cat})));
S.conns=S.conns||{upi:true,razorpay:true,shiprocket:true,tally:false};
S.payGw=S.payGw||"razorpay";
const name=id=>(all().find(x=>x.id===id)||{}).n||id;
window.gatewayName=()=>name(S.payGw);
window.connLimit=()=>(SEED.plans[planOf("st")]||SEED.plans.free).limits.conns;

/* ---------- payments go straight to the seller ---------- */
if(S.payout&&S.payout.bank)S.payout.bank=S.payout.bank;
Object.values(S.docs).forEach(d=>{if(d.pay==="held"){d.pay="paid";d.method=(d.method||"UPI")+" via "+gatewayName()}});
const _place=placeOrder;
window.placeOrder=placeOrder=function(cid,items,payMethod,shipFee){const o=_place(cid,items,payMethod,shipFee);
  if(o.pay==="held"){o.pay="paid";const c=C(cid);const m=[...c.msgs].reverse().find(x=>x.type==="payment"&&x.ref===o.id);const gw=(C(cid).biz||"st")==="st"?gatewayName():"the seller's gateway";
    if(m){m.held=false;m.how=o.method+" via "+gw+" · paid to "+BIZ[c.biz||"st"].name}o.method+=" via "+gw}
  return o};
const _accept=bizAccept;
window.bizAccept=bizAccept=function(o){_accept(o);const inv=D(o.invoice);if(inv&&o.pay==="paid"){inv.status="paid";inv.paidHow=o.method}};

/* ---------- Connections screen ---------- */
screens.connections=()=>{const n=Object.entries(S.conns).filter(([k,v])=>v&&k!=="upi").length,lim=connLimit();
  return PG.page({title:"Connections",sub:"Use the tools you already have",
    hero:PG.hero("Connected",`${n} <small>${lim>50?"tools plus your UPI":"of "+lim+" on Free, plus your UPI"}</small>`,`Payments go to ${esc(gatewayName())} · BOC takes no cut`),
    body:CX.map(g=>PG.group(g.cat,g.items.map(x=>PG.item({lead:`<span class="cx-logo" style="background:${x.c}">${x.i}</span>`,t:esc(x.n)+(g.cat==="Payments"&&S.payGw===x.id?' <span class="pg-spon">Default</span>':""),s:esc(x.d),vl:S.conns[x.id]?"Connected":"Connect",tone:S.conns[x.id]?"good":"",act:"cx",data:`data-v="${x.id}"`})).join(""))+`<p class="pg-p" style="margin:6px 2px 0;font-size:12.5px">${esc(g.note)}</p>`).join(""),
    cta:`<button class="pg-btn ghost" data-act="cx" data-v="api">Don't see your tool? Use the API${ic("chevr","s")}</button>`})};
const _rs=renderSheet;
window.renderSheet=renderSheet=function(){const sh=S.sheet;if(sh.type!=="cx")return _rs();const x=all().find(y=>y.id===sh.v),on=S.conns[x.id];
  const steps=x.id==="upi"?["Enter the UPI ID in your bank or UPI app's name.","BOC checks the name matches your business.","Payment links and QR codes in chats point to it."]:x.cat==="Payments"?[`You're sent to ${x.n} to sign in and approve BOC.`,"BOC gets permission to create payment links only. It can't move money.",`Buyers pay into your ${x.n} account; their fees apply, BOC adds none.`]:[`You're sent to ${x.n} to sign in and approve BOC.`,"BOC never sees your password.",x.cat==="Shipping"?"Book pickups and get tracking in the chat at your own rates.":x.cat==="Accounting and GST"?"Invoices, payments and bills sync both ways every few minutes.":"Products, prices and stock stay in sync."];
  return sheetWrap(esc(x.n),`<div class="pg-i" style="padding:0 0 12px"><span class="cx-logo" style="background:${x.c}">${x.i}</span><span class="pg-m"><b>${esc(x.n)}</b><small>${esc(x.cat)} · ${esc(x.d)}</small></span></div>
    <ol class="cx-steps">${steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>${sh.err?`<p class="ck-err">${esc(sh.err)}</p>`:""}
    ${on&&x.cat==="Payments"&&S.payGw!==x.id?`<button class="pg-btn ghost" data-act="cxdefault" data-v="${x.id}" style="margin-top:10px">Use for new payment links</button>`:""}`,
    on?`<button class="btn ghost" data-act="cxoff" data-v="${x.id}" style="color:var(--bad)">Disconnect</button>`:`<button class="btn" data-act="cxgo" data-v="${x.id}">Connect ${esc(x.n)}</button>`)};
Object.assign(act,{
  cx:e=>{S.sheet={type:"cx",v:e.dataset.v};render()},
  cxgo:e=>{const n=Object.entries(S.conns).filter(([k,v])=>v&&k!=="upi").length;if(e.dataset.v!=="upi"&&n>=connLimit()){S.sheet.err=`Your ${SEED.plans[planOf("st")].name} plan includes ${connLimit()} connection${connLimit()>1?"s":""}. Dukaan and above connect every app.`;render();return}
    S.conns[e.dataset.v]=true;S.sheet=null;toast(name(e.dataset.v)+" connected (simulated)");render()},
  cxoff:e=>{const id=e.dataset.v;if(S.payGw===id){const alt=all().find(x=>x.cat==="Payments"&&S.conns[x.id]&&x.id!==id);if(!alt){S.sheet.err="Keep at least one way to get paid connected.";render();return}S.payGw=alt.id}S.conns[id]=false;S.sheet=null;toast(name(id)+" disconnected");render()},
  cxdefault:e=>{S.payGw=e.dataset.v;S.sheet=null;toast("New payment links use "+name(e.dataset.v));render()}
});

/* ---------- plans: no transaction fee, monthly or yearly ---------- */
screens.plan=()=>{const cur=planOf("st"),yr=S.planYear;
  return PG.page({title:"Plan and billing",sub:"BOC takes no cut of your sales",
    hero:PG.hero("Your plan",`${SEED.plans[cur].name} <small>${SEED.plans[cur].custom||money(yr?SEED.plans[cur].year:SEED.plans[cur].price)+"/"+(yr?"year":"month")}</small>`,"Payments go straight to your own account through your own gateway"),
    tabs:`<p class="pg-p" style="margin:0 18px 10px">14 days free on any plan, then ₹49 a month for your first 3 months. Every plan has everything you need to sell; plans differ by team size, locations and volume.</p><div class="pg-seg" style="grid-template-columns:1fr 1fr"><button class="${yr?"":"on"}" data-act="planyr" data-v="0">Monthly</button><button class="${yr?"on":""}" data-act="planyr" data-v="1">Yearly · save 25%</button></div>`,
    body:Object.entries(SEED.plans).map(([k,p])=>`<section class="pg-g"><div class="pl-card ${k===cur?"on":""}"><div class="pl-h"><span><b>${p.name}</b><small class="pl-who">${esc(p.who)}</small></span><span class="num">${p.custom?`<small style="font-size:15px;color:var(--ink)">${p.custom}</small>`:money(yr?p.year:p.price)+`<small>/${yr?"year":"month"}</small>`}</span></div><ul>${p.features.map(f=>`<li>${ic("check","s")}${esc(f)}</li>`).join("")}</ul>${k===cur?`<div class="pl-cur">Current plan</div>`:(p.custom?`<button class="pg-btn ghost" data-act="plustalk">Talk to BOC about Empire</button>`:`<button class="pg-btn ${k==="pro"?"":"ghost"}" data-act="planset" data-v="${k}">${(SEED.plans[k].price||0)>(SEED.plans[cur].price||0)?"Upgrade":"Switch"} to ${p.name}</button>`)}</div></section>`).join("")+
      PG.group("Add-ons",Object.values(SEED.addons).map(a=>PG.item({lead:PG.ico("plus"),t:a.name,v:money(a.price),vl:"per "+a.per})).join(""))+
      PG.group("Payments",PG.item({lead:PG.ico("card"),t:"Buyers pay you directly",s:`Through ${esc(gatewayName())} and your UPI ID. Your gateway's own fees apply; BOC adds none.`,act:"go",data:'data-s="connections"'})),
    cta:`<button class="pg-btn" data-act="promote">Promote your shop${ic("chevr","s")}</button>`})};
act.plustalk=()=>toast("BOC will call you back within a day (simulated)");act.planyr=e=>{S.planYear=e.dataset.v==="1";render()};

/* ---------- entry points ---------- */
const _more=moreView;
window.moreView=moreView=function(){return _more().replace('<div class="body">',`<div class="body"><button class="row" data-act="go" data-s="connections"><span class="mini" style="background:var(--tint-soft);color:var(--tint)">${ic("link")}</span><div class="mid"><div class="t">Connections</div><div class="s">Your gateway, couriers, Tally, Zoho, Shopify</div></div>${ic("chevr")}</button>`)};
const _biz=bizView;
window.bizView=bizView=function(){return _biz().replace('<button class="tool" data-act="go" data-s="credit">',`<button class="tool" data-act="go" data-s="connections"><span class="ti">${ic("link")}</span>Connections</button><button class="tool" data-act="go" data-s="credit">`)};
render();
})();
