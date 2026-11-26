/* BOC demo, round 3: every business type, B2B terms, tax paperwork, delivery modes, public web page,
   plans and ads, plus wiring to the admin console through BOCStore (shared.js). Loaded after the main
   script in index.html; it extends the same globals (S, BIZ, render, cardHTML, docState, renderSheet, act). */
(function(){
"use strict";

/* ---------- 1. business archetypes ---------- */
Object.assign(BIZ.st,{kind:"wholesale",turnover:32000000,key:"st"});
Object.assign(BIZ.am,{kind:"batch",key:"am"});
Object.assign(BIZ.kc,{kind:"project",key:"kc"});
Object.assign(BIZ.ms,{kind:"retail",key:"ms"});
Object.assign(BIZ.qd,{kind:"retail",key:"qd"});
const nb=(k,o)=>{BIZ[k]={key:k,lv:{phone:1,kyc:1,bank:1},...o}};
nb("ld",{name:"Ludhiana Hosiery Distributors",color:"#4A5D23",kind:"wholesale",cat:"Hosiery and knitwear · distributor",city:"Ludhiana, Punjab",legal:"Ludhiana Hosiery Distributors",gstin:"03AAKFL2290M1ZP",since:"February 2025",orders:2890,rating:4.6,reviews:410,reply:"Usually replies within an hour",disputes:"0.3% of orders disputed",returns:"Returns within 3 days for defects",ships:"Truck and courier across North India",hours:"Mon–Sat, 9:30–19:30",lv:{phone:1,gst:1,kyc:1,bank:1}});
nb("pm",{name:"Rajkot Precision Castings",color:"#5B4A8C",kind:"manufacturer",cat:"Machine parts manufacturer",city:"Rajkot, Gujarat",legal:"Rajkot Precision Castings Pvt Ltd",gstin:"24AAHCR7781K1Z2",since:"November 2024",orders:640,rating:4.7,reviews:88,reply:"Usually replies within 3 hours",disputes:"0.2% of orders disputed",returns:"Replacement for manufacturing defects",ships:"Truck freight across India",hours:"Mon–Sat, 9:00–18:00",turnover:84000000,lv:{phone:1,gst:1,kyc:1,bank:1}});
nb("gs",{name:"Glow Studio Salon",color:"#8A3FA0",kind:"service",cat:"Salon and bridal makeup",city:"Pune, Maharashtra",legal:"Glow Studio",udyam:"UDYAM-MH-26-0201455",since:"April 2025",orders:1180,rating:4.8,reviews:356,reply:"Usually replies within 20 minutes",disputes:"None",returns:"Deposit refunded if you cancel 24 hours ahead",ships:"At the salon, Koregaon Park",hours:"Tue–Sun, 10:00–20:00",lv:{phone:1,udyam:1,kyc:1,bank:1}});
nb("ix",{name:"Nest Interiors",color:"#C0562A",kind:"project",cat:"Home interiors, design and build",city:"Bengaluru, Karnataka",legal:"Nest Interiors LLP",gstin:"29AAPFN4410E1ZK",since:"July 2024",orders:142,rating:4.6,reviews:61,reply:"Usually replies within 2 hours",disputes:"1.1% of projects disputed",returns:"Each stage is paid only after you approve it",ships:"Bengaluru and Mysuru",hours:"Mon–Sat, 10:00–19:00",lv:{phone:1,gst:1,kyc:1,bank:1}});
nb("dm",{name:"Amul Nagar Dairy",color:"#0F7C86",kind:"subscription",cat:"Milk and curd, daily delivery",city:"Anand, Gujarat",legal:"Amul Nagar Dairy",udyam:"UDYAM-GJ-01-0099120",since:"September 2025",orders:9400,rating:4.7,reviews:204,reply:"Usually replies within an hour",disputes:"None",returns:"Missed delivery is not billed",ships:"Doorstep by 7 am",hours:"Daily, 5:00–21:00",lv:{phone:1,udyam:1,kyc:1,bank:1}});
nb("tt",{name:"Rajputana Tent House",color:"#9A6B12",kind:"rental",cat:"Tents, chairs and event rentals",city:"Jaipur, Rajasthan",legal:"Rajputana Tent House",gstin:"08AAJFR3320B1Z1",since:"December 2024",orders:520,rating:4.5,reviews:133,reply:"Usually replies within an hour",disputes:"0.8% of rentals disputed",returns:"Deposit refunded after return check",ships:"Delivered and set up in Jaipur",hours:"Daily, 8:00–22:00",lv:{phone:1,gst:1,kyc:1,bank:1}});
window.KINDS=["retail","wholesale","manufacturer","service","project","subscription","rental","batch"];

const SERVICES={gs:[{id:"s1",name:"Haircut and styling",price:800,dur:"45 min"},{id:"s2",name:"Bridal makeup trial",price:3500,dur:"2 hours"},{id:"s3",name:"Hair spa",price:1500,dur:"1 hour"}]};
const RENTALS={tt:[{id:"r1",name:"Shamiana 40×60 ft with setup",rate:12000,deposit:10000},{id:"r2",name:"100 banquet chairs",rate:2500,deposit:3000}]};
const SUBPLANS={dm:[{id:"m1",name:"Cow milk 1 L",rate:60},{id:"m2",name:"Curd 500 g",rate:35}]};
const PHARMA=[{id:"ph1",name:"Paracetamol 650, strip of 15",code:"PC 650",price:32,color:"#0F7C86",batches:[{no:"B2405",exp:"2026-10-31",qty:40},{no:"B2411",exp:"2027-03-31",qty:120},{no:"B2502",exp:"2027-08-31",qty:200}]}];
window.SERVICES=SERVICES;window.RENTALS=RENTALS;window.SUBPLANS=SUBPLANS;window.PHARMA=PHARMA;

chat({id:"y1",name:"Meera Nair",kind:"customer",biz:"gs",cp:"me",custOnly:true,color:PARTY[5],msgs:[M("biz","Hi Meera! Book any service below. A small deposit holds your slot.","Mon"),M("biz",{type:"services",biz:"gs"},"Mon")],unreadC:1});
chat({id:"y2",name:"Meera Nair",kind:"customer",biz:"ix",cp:"me",custOnly:true,color:PARTY[5],msgs:[M("cp","We want the kitchen and wardrobes done in our 2BHK. Budget around ₹6 lakh.","Sat"),M("biz","Site visit done, thank you. Sending the project quote in stages, you pay each stage only after you approve the work.","Sat")]});
chat({id:"y3",name:"Meera Nair",kind:"customer",biz:"dm",cp:"me",custOnly:true,color:PARTY[5],msgs:[M("biz","Fresh milk at your door by 7 am. Pick a plan and we bill once a month for what was delivered.","Sun"),M("biz",{type:"subplans",biz:"dm"},"Sun")]});
chat({id:"y4",name:"Meera Nair",kind:"customer",biz:"tt",cp:"me",custOnly:true,color:PARTY[5],msgs:[M("cp","Need a shamiana and 100 chairs for my brother's engagement in Jaipur, 14–15 Dec.","Fri"),M("biz",{type:"rentals",biz:"tt"},"Fri")]});
const x2=C("x2");x2.msgs.push(M("biz",{type:"batchitem",pid:"ph1"},"Mon"));
/* B2B seats for the owner (Shree Textiles is a wholesaler and also buys from a manufacturer) */
chat({id:"c10",name:"Lakshmi Silks & Sarees",kind:"b2b",labels:["Wholesale","Net 15"],color:PARTY[0],acct:"Business · GST verified · Madurai",msgs:[M("cp","Please send 60 dupattas and 12 kurta sets for Pongal stock. Usual credit terms.","8:50 am")],unread:1});
chat({id:"c11",name:"Rajkot Precision Castings",kind:"supplier",labels:["Supplier"],color:"#5B4A8C",acct:"Business · GST verified · Rajkot · e-invoicing",msgs:[M("cp","Loom spare parts dispatched by truck. LR and e-way bill attached.","Tue")]});
addDoc({id:"INV-0139",kind:"invoice",chat:"c10",items:[{pid:"p4",qty:40,price:1940}],disc:0,terms:"Net 15",due:dayPlus(-6),dueTs:Date.now()-6*864e5,status:"unpaid"});
C("c10").msgs.unshift(M("biz",{type:"doc",ref:"INV-0139"},"2 Nov"));
addDoc({id:"BILL-0070",kind:"bill",chat:"c11",amount:184000,ref:"PO-0142",due:dayPlus(20),status:"unpaid",irn:"8f1c 22ab 90de 47c1 0b9e",ewb:"3410 9921 7783",lr:"RJK 88213"});
C("c11").msgs.push(M("cp",{type:"doc",ref:"BILL-0070"},"Tue"));
S.buyers={c2:{list:"distributor",terms:"Net 30",limit:500000,used:0,tds:true},c10:{list:"retailer",terms:"Net 15",limit:150000,used:0,tds:false},c7:{list:"retailer",terms:"Net 15",limit:200000,used:0,tds:false}};
S.buyers.c2.used=Math.round(docTotal(D("INV-0148")));S.buyers.c10.used=Math.round(docTotal(D("INV-0139")));
S.plan="business";S.frame="android";S.webBiz="st";S.seenBc=[];

/* ---------- 2. B2B: price lists, slabs, MOQ, credit, part payments, due dates ---------- */
const LISTS={distributor:"Distributor",retailer:"Retailer",public:"Public"};
window.priceFor=function(p,cid,qty=1){const b=S.buyers&&S.buyers[cid],c=C(cid);
  const base=b?(b.list==="distributor"?p.whole:b.list==="retailer"?Math.round(p.whole*1.05):p.price):(c&&c.kind==="b2b"?p.whole:p.price);
  return Math.round(base*(qty>=50?0.94:qty>=10?0.97:1))};
window.moqFor=p=>["roll","box"].includes(p.unit)?5:10;
window.checkMoq=function(items,cid){const c=C(cid);if(!c||c.kind!=="b2b")return null;
  for(const i of items){const p=P(i.pid);if(p&&i.qty<moqFor(p))return `Minimum order for ${p.name} is ${moqFor(p)} ${p.unit}`}return null};
window.creditCheck=function(cid,amount){const b=S.buyers&&S.buyers[cid];if(!b||!/^Net/.test(b.terms))return{ok:true};
  const over=b.used+amount-b.limit;return over>0?{ok:false,msg:`Over credit limit by ${money(over)}. Limit ${money(b.limit)}, already owed ${money(b.used)}.`}:{ok:true}};
window.dueDate=function(d){const m=/Net (\d+)/.exec(d.terms||"");return m?dayPlus(+m[1]):"on receipt"};
const balance=d=>Math.max(0,Math.round(docTotal(d)-(d.paid||0)-(d.cn||0)));
window.balance=balance;
window.recordPayment=function(id,amount){const d=D(id);d.paid=(d.paid||0)+amount;
  const b=S.buyers&&S.buyers[d.chat];if(b)b.used=Math.max(0,b.used-amount);
  post(d.chat,"cp",{type:"payment",amount,ref:d.id,how:"Bank transfer (part)",dir:"in"});
  if(balance(d)<=0){d.status="paid";d.paidHow="Bank transfer"}else d.status="part"};
const overdueDays=d=>d.dueTs&&d.status!=="paid"?Math.floor((Date.now()-d.dueTs)/864e5):0;
/* full payments charge only what is still owed and free the buyer's credit */
const freeCredit=(d,amt)=>{const b=S.buyers&&S.buyers[d.chat];if(b&&d.kind==="invoice")b.used=Math.max(0,b.used-amt)};
window.payDoc=payDoc=function(d,how){const amt=d.kind==="invoice"?balance(d):docTotal(d);d.status="paid";d.paidHow=how;
  post(d.chat,"cp",{type:"payment",amount:amt,ref:d.id,how,dir:"in"});S.months[5][1]+=amt;S.payout.settled+=amt;freeCredit(d,amt)};
act.markpaid=e=>{const d=D(e.dataset.id),amt=balance(d);d.status="paid";d.paidHow="cash";S.months[5][1]+=amt;freeCredit(d,amt);
  post(d.chat,"sys",{type:"sys",text:`Cash payment of ${money(amt)} recorded for ${code(d.id)}`});render()};

/* ---------- 3. tax paperwork ---------- */
window.needsEwb=d=>(d.kind==="order"||d.kind==="invoice")&&d.items&&d.items.some(i=>i.pid)&&docTotal(d)>50000;
window.hasIrn=key=>(BIZ[key]&&BIZ[key].turnover||0)>50000000;
window.issueCreditNote=function(invId,amount,reason){const inv=D(invId);inv.cn=(inv.cn||0)+amount;
  const cn=addDoc({id:nid("CN"),kind:"cn",chat:inv.chat,ref:invId,amount,reason,status:"issued"});
  const b=S.buyers&&S.buyers[inv.chat];if(b)b.used=Math.max(0,b.used-amount);
  if(balance(inv)<=0)inv.status="paid";post(inv.chat,"biz",{type:"doc",ref:cn.id});return cn};
window.genEwb=function(o){const e=addDoc({id:nid("EWB"),kind:"ewb",chat:o.chat,ref:o.id,amount:docTotal(o),no:String(Math.floor(1e11+Math.random()*9e11)).replace(/(\d{4})(?=\d)/g,"$1 "),valid:dayPlus(3),status:"active"});
  o.ewb=e.id;post(o.chat,"biz",{type:"doc",ref:e.id});return e};

/* ---------- 4. delivery modes ---------- */
COURIERS.push({id:"transport",name:"Transporter · truck with LR",eta:"3–6 days",fee:0},{id:"staff",name:"Own delivery staff · OTP at door",eta:"Today",fee:0},{id:"pickup",name:"Buyer picks up from the shop",eta:"When ready",fee:0});
const _bizShip=bizShip;
window.bizShip=bizShip=function(o,opt){const mode=opt.courier||"std";
  if(mode==="staff"||mode==="pickup"){const otp=String(1000+Math.floor(Math.random()*9000));
    o.status="shipped";o.ship={courier:mode==="staff"?"Deepak (your delivery staff)":"Pickup at 42 Town Hall Road, Coimbatore",awb:"OTP-"+o.id.slice(4),stage:3,eta:mode==="staff"?"Today":"When you visit",times:[now(),now(),now(),now()],mode,otp};
    post(o.chat,"sys",{type:"sys",text:mode==="staff"?`${code(o.id)} out for delivery with Deepak. Share OTP ${otp} only when you have the parcel.`:`${code(o.id)} is ready for pickup. Show OTP ${otp} at the counter.`});return}
  _bizShip(o,opt);
  if(mode==="transport"){const lr=addDoc({id:nid("LR"),kind:"lr",chat:o.chat,ref:o.id,transporter:"Coastal Cargo Movers",no:"CCM "+(10000+Math.floor(Math.random()*89999)),status:"in transit"});o.ship.lr=lr.id;o.ship.awb=lr.no;post(o.chat,"biz",{type:"doc",ref:lr.id})}};
window.handover=function(id,otp){const o=D(id);if(!o.ship||String(otp)!==o.ship.otp)return false;
  o.ship.stage=4;o.ship.times[4]=now();o.status="delivered";
  if(o.pay==="cod"){o.pay="released";S.months[5][1]+=docTotal(o);const inv=D(o.invoice);if(inv){inv.status="paid";inv.paidHow="cash on delivery"}}
  post(o.chat,"sys",{type:"sys",text:`${code(o.id)} handed over after OTP check`});return true};

/* ---------- 5. other ways of selling ---------- */
const pay=(cid,ref,amount,how,by="cp")=>post(cid,by,{type:"payment",amount,ref,how,dir:"in"});
window.book=function(cid,serviceId,slot,deposit){const c=C(cid),s=SERVICES[c.biz].find(x=>x.id===serviceId);
  const d=addDoc({id:nid("BKG"),kind:"bkg",chat:cid,service:s.name,price:s.price,dur:s.dur,slot,deposit,status:"booked"});
  post(cid,"cp",{type:"doc",ref:d.id});pay(cid,d.id,deposit,"UPI · deposit");post(cid,"sys",{type:"sys",text:`Reminder set: ${s.name}, ${slot}. You can cancel free up to 24 hours before.`});return d};
window.markDone=function(id){const b=D(id);b.status="done";
  const inv=addDoc({id:nid("INV"),kind:"paylink",chat:b.chat,amount:b.price-b.deposit,note:`${b.service}: ${money(b.price)} less deposit ${money(b.deposit)}`,status:"unpaid",for:id});
  b.invoice=inv.id;post(b.chat,"biz",{type:"doc",ref:inv.id});return inv};
window.milestoneQuote=function(cid,total,stages){const sum=stages.reduce((a,s)=>a+s.pct,0);if(sum!==100)throw new Error("Stages must add up to 100%, these add up to "+sum+"%");
  const d=addDoc({id:nid("MS"),kind:"ms",chat:cid,total,stages:stages.map((s,i)=>({...s,status:i===0?"due":"locked"})),status:"sent"});post(cid,"biz",{type:"doc",ref:d.id});return d};
window.payStage=function(id){const d=D(id),i=d.stages.findIndex(s=>s.status==="due");if(i<0)return;const st=d.stages[i];st.status="paid";
  pay(d.chat,d.id,Math.round(d.total*st.pct/100),"UPI · "+st.name);d.status=d.stages.every(s=>s.status==="paid")?"completed":"in progress"};
window.approveStage=function(id){const d=D(id),i=d.stages.findIndex(s=>s.status==="paid"&&!s.ok);if(i<0)return;d.stages[i].ok=true;if(d.stages[i+1])d.stages[i+1].status="due"};
window.subscribe=function(cid,planId,freq){const c=C(cid),p=SUBPLANS[c.biz].find(x=>x.id===planId);
  const d=addDoc({id:nid("SUB"),kind:"sub",chat:cid,item:p.name,rate:p.rate,freq,log:[],status:"active"});post(cid,"cp",{type:"doc",ref:d.id});return d};
window.addDelivery=function(id,n=1){const d=D(id);for(let k=0;k<n;k++)d.log.push(now())};
window.monthBill=function(id){const d=D(id);const amt=d.log.length*d.rate;
  const b=addDoc({id:nid("INV"),kind:"paylink",chat:d.chat,amount:amt,note:`${d.item}, ${d.log.length} deliveries × ${money(d.rate)} (GST exempt)`,status:"unpaid",for:id});post(d.chat,"biz",{type:"doc",ref:b.id});return b};
window.rent=function(cid,itemId,from,to,deposit,days=2){const c=C(cid),r=RENTALS[c.biz].find(x=>x.id===itemId);
  const d=addDoc({id:nid("RNT"),kind:"rnt",chat:cid,item:r.name,from,to,days,amount:r.rate*days,deposit:deposit??r.deposit,status:"booked"});
  post(cid,"cp",{type:"doc",ref:d.id});pay(cid,d.id,d.amount+d.deposit,"UPI · rent + deposit");return d};
window.returnRental=function(id,damage=0){const d=D(id);d.status="returned";d.damage=damage;d.refund=Math.max(0,d.deposit-damage);
  post(d.chat,"biz",{type:"payment",amount:d.refund,ref:d.id,how:"Deposit refund"+(damage?` (less ${money(damage)} damage)`:""),dir:"out"});return d.refund};
window.pickBatch=function(pid,qty,today=new Date().toISOString().slice(0,10)){const p=PHARMA.find(x=>x.id===pid);
  const ok=p.batches.filter(b=>b.exp>today&&b.qty>=qty).sort((a,b)=>a.exp.localeCompare(b.exp));return ok[0]||null};

/* ---------- 6. plans, fees, limits (admin overrides win) ---------- */
const ADM=()=>{const s=BOCStore.load();return(s&&s.admin)||SEED.admin};
window.ADM=ADM;
const admBiz=k=>ADM().businesses.find(b=>b.key===k);
window.planOf=k=>{const b=admBiz(k);return k==="st"?S.plan:(b?b.plan:"free")};
window.limitFor=function(k,key){const o=(ADM().flags||{})[k];if(o&&o[key]!=null)return o[key];return SEED.plans[planOf(k)].limits[key]};
window.feeFor=(method,protect)=>(SEED.fees[method]??0)+(protect?SEED.fees.protect:0);
window.isSuspended=k=>{const b=admBiz(k);return!!b&&b.status==="suspended"};
window.setPlan=function(p){S.plan=p;BOCStore.patch("admin",a=>{const b=a.businesses.find(x=>x.key==="st");if(b)b.plan=p;return a})};
window.createAd=function(slot,model,budget){if(!verified(BIZ.st))return null;const ad={id:"AD-0"+(14+Math.floor(Math.random()*900)),biz:BIZ.st.name,slot,model,budget,spent:0,clicks:0,status:"pending",text:"Kanjivaram and Chanderi, wholesale and retail."};
  BOCStore.patch("admin",a=>{a.ads.push(ad);return a});return ad};
window.reportTicket=function(o,reason){const c=C(o.chat);const t={id:"TK-"+(1043+Math.floor(Math.random()*900)),from:isBiz()?BIZ.st.name:"Meera Nair",about:o.chat,biz:c.biz||"st",subject:`${reason} · ${code(o.id)}`,cat:"Order problem",status:"open",access:true,at:now(),notes:[]};
  BOCStore.patch("admin",a=>{a.tickets.unshift(t);return a});return t};

/* ---------- 7. doc states and cards for the new kinds ---------- */
Object.assign(KIND,{bkg:"Booking",ms:"Project in stages",sub:"Subscription",rnt:"Rental",cn:"Credit note",ewb:"E-way bill",lr:"Transport receipt (LR)"});
const _docState=docState;
window.docState=docState=function(d,sd){const me=sd||side();
  switch(d.kind){
    case "bkg":return{booked:me==="cp"?["tint","Booked · "+d.slot]:["wait","Booked · mark done after"],done:d.invoice&&D(d.invoice).status==="paid"?["good","Done · paid"]:(me==="cp"?["wait","Done · pay balance"]:["tint","Done · balance due"]),cancelled:["bad","Cancelled"]}[d.status];
    case "ms":{const due=d.stages.find(s=>s.status==="due"),toOk=d.stages.find(s=>s.status==="paid"&&!s.ok);
      if(d.status==="completed"&&!toOk)return["good","All stages paid"];if(toOk)return me==="cp"?["wait","Approve "+toOk.name]:["tint","Waiting for approval"];
      return due?(me==="cp"?["wait","Pay "+due.name]:["tint","Awaiting "+due.name]):["tint","In progress"]}
    case "sub":return d.status==="active"?["good","Active · "+d.log.length+" delivered"]:["mute","Paused"];
    case "rnt":return{booked:me==="cp"?["tint","Booked · "+d.from]:["wait","Deliver and set up"],returned:["good","Returned · deposit refunded"]}[d.status];
    case "cn":return["good","Credit note issued"];
    case "ewb":return["good","E-way bill active"];
    case "lr":return["tint","Truck in transit"];
    case "invoice":if(d.status==="part")return me==="cp"?["wait","Part paid · pay "+money(balance(d))]:["tint","Part paid · "+money(balance(d))+" due"];
      if(d.status!=="paid"&&overdueDays(d)>0)return["bad","Overdue "+overdueDays(d)+" days"];
  }
  return _docState(d,sd)};
const row=(l,v)=>`<div class="li"><span>${l}</span><span class="${/^[−-]?₹|^[+\d]/.test(String(v))?"num":""}" style="text-align:right">${v}</span></div>`;
const head=(d,t,l)=>`<div class="ch t-${t}"><span class="code">${code(d.id)}</span><small>${esc(l)}</small></div>`;
const acts=b=>b?`<div class="acts">${b}</div>`:"";
const _cardHTML=cardHTML;
window.cardHTML=cardHTML=function(m,c){
  if(m.type==="services"){const sv=SERVICES[m.biz];return `<div class="cd"><div class="ttl">Services</div>${sv.map(s=>row(esc(s.name)+" · "+s.dur,money(s.price))).join("")}<div class="meta">Deposit of 20% holds your slot. Example pricing.</div></div>`+(side()==="cp"?acts(A("bookopen",c.id,"Book a slot","pri")):"")}
  if(m.type==="subplans"){const sv=SUBPLANS[m.biz];return `<div class="cd"><div class="ttl">Daily delivery plans</div>${sv.map(s=>row(esc(s.name),money(s.rate)+" a day")).join("")}<div class="meta">Billed monthly for what was delivered. Example pricing.</div></div>`+(side()==="cp"?acts(A("subopen",c.id,"Start a plan","pri")):"")}
  if(m.type==="rentals"){const sv=RENTALS[m.biz];return `<div class="cd"><div class="ttl">Rental quote</div>${sv.map(s=>row(esc(s.name),money(s.rate)+" a day")).join("")}<div class="meta">Refundable deposit collected with rent. Example pricing.</div></div>`+(side()==="cp"?acts(A("rentopen",c.id,"Book these dates","pri")):"")}
  if(m.type==="batchitem"){const p=PHARMA.find(x=>x.id===m.pid),b=pickBatch(p.id,1);return `<div class="pblock" style="background:${p.color}"><span class="code">${p.code}</span><small>${p.batches.reduce((a,x)=>a+x.qty,0)} in stock</small></div><div class="cd"><div class="ttl">${esc(p.name)}</div>${row("Price",money(p.price))}<div class="meta">Ships from batch ${b?b.no+", expires "+b.exp:"none in date"}. Earliest expiry goes first; expired batches can't be sold.</div></div>`}
  const d=m.ref&&D(m.ref);
  if(d&&["bkg","ms","sub","rnt","cn","ewb","lr"].includes(d.kind)){const[t,l]=docState(d),me=side();let body="",foot="";
    switch(d.kind){
      case "bkg":body=row(esc(d.service)+" · "+d.dur,money(d.price))+row("Deposit paid",money(d.deposit))+`<div class="meta">${esc(d.slot)}</div>`;
        if(d.status==="booked"&&me==="biz")foot=A("bkdone",d.id,"Mark done","pri");if(d.status==="done"&&d.invoice&&D(d.invoice).status!=="paid"&&me==="cp")foot=A("paysheet",d.invoice,"Pay balance "+money(D(d.invoice).amount),"wait");break;
      case "ms":body=d.stages.map(s=>row(esc(s.name)+` · ${s.pct}%`+(s.ok?" ✓":s.status==="paid"?" · paid":s.status==="locked"?" · locked":""),money(d.total*s.pct/100))).join("")+row("Project total",money(d.total))+`<div class="meta">Pay a stage, the work is done, you approve it, then the next stage opens.</div>`;
        {const due=d.stages.find(s=>s.status==="due"),toOk=d.stages.find(s=>s.status==="paid"&&!s.ok);if(me==="cp"&&toOk)foot=A("msok",d.id,"Approve "+toOk.name,"pri");else if(me==="cp"&&due)foot=A("mspay",d.id,"Pay "+money(d.total*due.pct/100),"wait")}break;
      case "sub":body=row(esc(d.item)+" · "+d.freq,money(d.rate))+row("Delivered this month",d.log.length)+row("Running bill",money(d.log.length*d.rate));
        if(me==="cp")foot=A("subbill",d.id,"See month-end bill");break;
      case "rnt":body=row(esc(d.item),money(d.amount))+row("Dates",esc(d.from+" to "+d.to))+row("Deposit",money(d.deposit))+(d.status==="returned"?row("Refunded",money(d.refund)):"");
        if(d.status==="booked"&&me==="cp")foot=A("rentret",d.id,"Return items");break;
      case "cn":body=row("Against "+code(d.ref),"−"+money(d.amount))+`<div class="meta">${esc(d.reason)}. Lowers what is owed on the invoice.</div>`;break;
      case "ewb":body=row("EWB number",d.no)+row("Goods value",money(d.amount))+row("Valid until",d.valid)+`<div class="meta">Required for goods over ₹50,000 moving by road. Example number.</div>`;break;
      case "lr":body=row("Transporter",esc(d.transporter))+row("LR number",d.no)+`<div class="meta">For ${code(d.ref)}. Keep this to claim the goods at the depot.</div>`;break;
    }
    return head(d,t,l)+`<div class="cd"><div class="k">${KIND[d.kind]}</div>${body}</div>`+acts(foot)}
  let h=_cardHTML(m,c);
  if(d&&d.kind==="invoice"){const b=S.buyers&&S.buyers[d.chat];let extra="";
    if(d.paid||d.cn)extra+=row("Paid so far",money(d.paid||0))+(d.cn?row("Credit notes","−"+money(d.cn)):"")+row("Balance",money(balance(d)));
    if(b&&b.tds&&isBiz())extra+=row("TDS 0.1% the buyer deducts",money(docTotal(d)*0.001));
    if(hasIrn("st"))extra+=row("IRN","on file");
    if(extra)h+=`<div class="cd" style="padding-top:0">${extra}</div>`;
    if(!isBiz()&&d.status==="part")h+=acts(A("paysheet",d.id,"Pay balance "+money(balance(d)),"wait"));
    if(isBiz()&&d.status!=="paid")h+=acts(A("recpay",d.id,"Record a part payment")+A("cnopen",d.id,"Credit note"))}
  if(d&&d.kind==="bill"&&d.irn)h+=`<div class="cd" style="padding-top:0">${row("IRN (e-invoice)",d.irn)}${row("E-way bill",d.ewb)}${row("LR",d.lr)}</div>`;
  if(d&&d.kind==="order"&&d.ship&&(d.ship.mode==="staff"||d.ship.mode==="pickup")&&d.status==="shipped")h+=(side()==="cp"?`<div class="cd" style="padding-top:0"><div class="meta">Your handover OTP: <b class="num">${d.ship.otp}</b></div></div>`:acts(A("handopen",d.id,"Enter OTP to hand over","pri")));
  return h};

/* ---------- 8. sheets ---------- */
const _renderSheet=renderSheet;
window.renderSheet=renderSheet=function(){const sh=S.sheet,c=sh.chat?C(sh.chat):null;
  const ch=(key,opts,label)=>`<div class="lab">${label}</div><div class="wchips">${opts.map(([v,l])=>`<button class="fc ${sh[key]===v?"on":""}" data-act="sset" data-k="${key}" data-v="${v}">${l}</button>`).join("")}</div>`;
  const err=sh.err?`<div class="banner warn" style="margin:0 0 12px">${ic("alert")}<span><b>Can't send this</b>${esc(sh.err)}</span></div>`:"";
  switch(sh.type){
    case "booking":{const sv=SERVICES[c.biz],s=sv.find(x=>x.id===sh.svc)||sv[0];
      return sheetWrap("Book at "+esc(BIZ[c.biz].name),ch("svc",sv.map(x=>[x.id,x.name]),"Service")+ch("slot",[["Sat 11:00 am","Sat 11:00 am"],["Sat 4:30 pm","Sat 4:30 pm"],["Sun 12:00 pm","Sun 12:00 pm"]],"Slot")+`<div class="li"><span>Deposit now (20%)</span><span class="num">${money(s.price*0.2)}</span></div>`,`<button class="btn" data-act="dobook">Pay deposit and book</button>`)}
    case "subplan":{const sv=SUBPLANS[c.biz];return sheetWrap("Start a delivery plan",ch("plan",sv.map(x=>[x.id,x.name+" · "+money(x.rate)]),"Plan")+ch("freq",[["daily","Every day"],["alternate","Alternate days"]],"How often"),`<button class="btn" data-act="dosub">Start plan</button>`)}
    case "rental":{const sv=RENTALS[c.biz],r=sv.find(x=>x.id===sh.item)||sv[0];return sheetWrap("Book rental",ch("item",sv.map(x=>[x.id,x.name]),"Item")+`<div class="li"><span>14–15 Dec, 2 days</span><span class="num">${money(r.rate*2)}</span></div><div class="li"><span>Refundable deposit</span><span class="num">${money(r.deposit)}</span></div>`,`<button class="btn" data-act="dorent">Pay ${money(r.rate*2+r.deposit)}</button>`)}
    case "recpay":{const d=D(sh.doc);return sheetWrap("Record payment for "+code(d.id),`<div class="li"><span>Balance</span><span class="num">${money(balance(d))}</span></div>`+ch("amt",[[String(Math.round(balance(d)/2)),"Half · "+money(balance(d)/2)],[String(balance(d)),"Full · "+money(balance(d))]],"Amount received"),`<button class="btn" data-act="dorecpay">Record payment</button>`)}
    case "cn":{const d=D(sh.doc);return sheetWrap("Credit note on "+code(d.id),ch("reason",[["Goods returned","Goods returned"],["Rate difference","Rate difference"],["Damaged in transit","Damaged in transit"]],"Reason")+ch("amt",[["1000","₹1,000"],["5000","₹5,000"]],"Amount"),`<button class="btn" data-act="docn">Issue credit note</button>`)}
    case "handover":return sheetWrap("Hand over "+code(sh.doc),`<div class="lab">OTP from the buyer</div><input class="in" id="otpin" inputmode="numeric" maxlength="4" placeholder="4 digits" style="width:100%;font:inherit;padding:12px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)">${sh.err?`<p style="color:var(--bad);margin:8px 0 0">${esc(sh.err)}</p>`:""}`,`<button class="btn" data-act="dohand">Confirm handover</button>`);
    case "upgrade":return sheetWrap("Upgrade to add more",`<p style="margin:0 0 12px">${esc(sh.reason)}</p>${["pro","business"].map(k=>{const p=SEED.plans[k];return `<div class="li"><span><b>${p.name}</b> · ${p.limits.users} users, ${p.limits.items===Infinity?"unlimited":p.limits.items} items</span><span class="num">${money(p.price)}/month</span></div>`}).join("")}<div class="meta">Example pricing.</div>`,`<button class="btn" data-act="planset" data-v="pro">Upgrade to Pro</button>`);
    case "promote":return sheetWrap("Promote your shop",ch("slot",[["explore","Explore feed"],["search","Search results"]],"Where")+ch("model",[["day","₹199 a day"],["cpc","₹5 a click"]],"Pay")+ch("budget",[["1393","₹1,393 (7 days)"],["2000","₹2,000"]],"Budget")+`<div class="meta">Ads show only in Explore and search, never inside chats. BOC reviews each ad first. Example pricing.</div>`,`<button class="btn" data-act="doad">Send for review</button>`);
    case "webotp":return sheetWrap("Order from "+esc(BIZ[sh.biz].name),sh.step==="otp"?`<p>Enter the OTP sent to 98470 •••36 (example: 482913).</p><div class="otp">${"482913".split("").map(n=>`<span class="num">${n}</span>`).join("")}</div>`:`<div class="lab">Your phone number</div><div class="li"><span class="num">+91 98470 •••36</span><span></span></div><div class="meta">No app or password needed. This creates a personal account; you can install BOC later and your chats will be there.</div>`,sh.step==="otp"?`<button class="btn" data-act="webdone">Verify and continue</button>`:`<button class="btn" data-act="webotp2">Send OTP</button>`);
  }
  let h=_renderSheet();
  if(sh.type==="ship"){const o=D(sh.order);if(needsEwb(o)&&!o.ewb)h=h.replace('<div class="sb">',`<div class="sb"><div class="banner warn" style="margin:0 0 12px">${ic("file")}<span><b>E-way bill needed</b>Goods worth ${money(docTotal(o))} need an e-way bill before they move. <button class="btn sm" data-act="genewb" data-id="${o.id}" style="margin-top:8px">Generate e-way bill</button></span></div>`)}
  if(err)h=h.replace('<div class="sb">','<div class="sb">'+err);
  if((sh.type==="quote"||sh.type==="invoice")&&c&&S.buyers&&S.buyers[c.id]){const b=S.buyers[c.id];h=h.replace('<div class="sb">',`<div class="sb"><div class="meta" style="margin:0 0 10px">${LISTS[b.list]} price list · ${b.terms} · credit ${money(b.used)} of ${money(b.limit)} used</div>`)}
  return h};

/* B2B checks before the original submit, then stamp terms and credit on what it created */
const _submit=submitSheet;
window.submitSheet=submitSheet=function(){const sh=S.sheet,c=sh.chat&&C(sh.chat);
  if(c&&(sh.type==="quote"||sh.type==="invoice")){const pk=c.kind==="b2b"?"whole":"price",items=selItems(sh,pk);
    const e1=checkMoq(items,c.id);if(e1){sh.err=e1;render();return}
    if(sh.type==="invoice"&&/^Net/.test(sh.terms||"")){const cc=creditCheck(c.id,totals(items,sh.disc||0).total);if(!cc.ok){sh.err=cc.msg;render();return}}
    const before=new Set(Object.keys(S.docs));_submit();
    Object.values(S.docs).filter(d=>!before.has(d.id)).forEach(d=>{const b=S.buyers&&S.buyers[c.id];
      if(d.kind==="invoice"&&/^Net/.test(d.terms||"")){d.dueTs=Date.now()+(+/\d+/.exec(d.terms)[0])*864e5;if(b)b.used+=Math.round(docTotal(d))}});return}
  _submit()};

/* ---------- 9. actions ---------- */
/* which business an action touches: the doc's chat, the chat id passed in, the open chat, or Shree Textiles for its own products */
const bizOfChat=c=>c?(c.biz||c.party||"st"):null;
function bizOfAction(e){const id=e&&e.dataset&&e.dataset.id;const d=id&&D(id);if(d)return bizOfChat(C(d.chat||(d.suppliers&&d.suppliers[0])));
  if(id&&C(id))return bizOfChat(C(id));if(id&&P(id))return"st";if(cur().name==="chat")return bizOfChat(C(cur().id));if(S.sheet&&S.sheet.chat)return bizOfChat(C(S.sheet.chat));return"st"}
const guardSusp=(fn)=>e=>{const k=bizOfAction(e);if(k&&isSuspended(k)){toast(`${BIZ[k]?BIZ[k].name:"This business"} is suspended by BOC. Ordering and payments are paused.`);return}return fn(e)};
C("c11").party="pm";
const GUARDED=["cporder","placeorder","paysheet","dopay","bookopen","dobook","subopen","dosub","rentopen","dorent","mspay","cpaccept","paybill","reorder"];
Object.assign(act,{
  bookopen:guardSusp(e=>{S.sheet={type:"booking",chat:e.dataset.id,svc:"s1",slot:"Sat 11:00 am"};render()}),
  dobook:()=>{const sh=S.sheet,s=SERVICES[C(sh.chat).biz].find(x=>x.id===sh.svc);const d=book(sh.chat,sh.svc,sh.slot,s.price*0.2);S.sheet=null;
    sim(sh.chat,1600,()=>{post(sh.chat,"biz","Booked! See you then. We'll send the bill for the balance after your appointment.");sim(sh.chat,2200,()=>markDone(d.id))});render()},
  bkdone:e=>{markDone(e.dataset.id);render()},
  subopen:guardSusp(e=>{S.sheet={type:"subplan",chat:e.dataset.id,plan:"m1",freq:"daily"};render()}),
  dosub:()=>{const sh=S.sheet,d=subscribe(sh.chat,sh.plan,sh.freq);addDelivery(d.id,26);S.sheet=null;post(sh.chat,"sys",{type:"sys",text:"Example: 26 deliveries logged this month, one tick each morning by the delivery person."});render()},
  subbill:e=>{monthBill(e.dataset.id);render()},
  rentopen:guardSusp(e=>{S.sheet={type:"rental",chat:e.dataset.id,item:"r1"};render()}),
  dorent:()=>{const sh=S.sheet,d=rent(sh.chat,sh.item,"14 Dec","15 Dec");S.sheet=null;sim(sh.chat,1500,()=>post(sh.chat,"biz","Confirmed. Our team sets it up on the 13th evening."));render()},
  rentret:e=>{const d=D(e.dataset.id);sim(d.chat,900,()=>{returnRental(d.id,800);post(d.chat,"biz","Checked everything. One chair was broken, ₹800 kept from the deposit, rest refunded.")});toast("Return requested");render()},
  mspay:e=>{const d=D(e.dataset.id);payStage(d.id);sim(d.chat,1800,()=>post(d.chat,"biz","Payment received. Work on this stage is done, photos above. Please approve when you're happy."));render()},
  msok:e=>{approveStage(e.dataset.id);render()},
  recpay:e=>{S.sheet={type:"recpay",doc:e.dataset.id,amt:String(Math.round(balance(D(e.dataset.id))/2))};render()},
  dorecpay:()=>{recordPayment(S.sheet.doc,+S.sheet.amt);S.sheet=null;toast("Payment recorded");render()},
  cnopen:e=>{S.sheet={type:"cn",doc:e.dataset.id,reason:"Goods returned",amt:"1000"};render()},
  docn:()=>{issueCreditNote(S.sheet.doc,+S.sheet.amt,S.sheet.reason);S.sheet=null;render()},
  genewb:e=>{genEwb(D(e.dataset.id));render()},
  handopen:e=>{S.sheet={type:"handover",doc:e.dataset.id};render()},
  dohand:()=>{const v=(document.getElementById("otpin")||{}).value;if(handover(S.sheet.doc,v)){S.sheet=null;toast("Handed over")}else S.sheet.err="That OTP doesn't match. Ask the buyer to read it from their chat.";render()},
  planset:e=>{setPlan(e.dataset.v);S.sheet=null;toast("Plan changed to "+SEED.plans[e.dataset.v].name+" (example)");render()},
  promote:()=>{if(!verified(BIZ.st)){toast("Only verified businesses can advertise");return}S.sheet={type:"promote",slot:"explore",model:"day",budget:"1393"};render()},
  doad:()=>{createAd(S.sheet.slot,S.sheet.model,+S.sheet.budget);S.sheet=null;toast("Sent to BOC for review");render()},
  frame:e=>{S.frame=e.dataset.v;if(e.dataset.v!=="web")S.os=e.dataset.v;render()},
  webbiz:e=>{S.webBiz=e.dataset.v;render()},
  weborder:e=>{if(isSuspended(S.webBiz)){toast("This business is suspended by BOC. Ordering is paused.");return}S.sheet={type:"webotp",biz:S.webBiz,step:"phone"};render()},
  webotp2:()=>{S.sheet.step="otp";render()},
  webdone:()=>{const k=S.sheet.biz;S.sheet=null;S.frame="android";S.os="android";const c=S.chats.find(x=>x.custOnly?x.biz===k:k==="st"&&x.id==="c1");setView("customer");if(c)openChat(c.id);toast("Signed in with your phone number")},
  resetdemo:()=>{BOCStore.reset();location.reload()}
});
GUARDED.forEach(k=>{if(act[k])act[k]=guardSusp(act[k])});
const _doship=act.doship;act.doship=()=>{const o=D(S.sheet.order);if(needsEwb(o)&&!o.ewb){S.sheet.err="Generate the e-way bill before booking the pickup.";render();return}
  if(S.sheet.courier==="staff"||S.sheet.courier==="pickup"){bizShip(o,S.sheet);S.sheet=null;toast(o.ship.mode==="staff"?"Out with Deepak. Buyer has the OTP.":"Marked ready for pickup");render();return}_doship()};
const _doissue=act.doissue;act.doissue=e=>{const o=D(e.dataset.id);_doissue(e);reportTicket(o,e.dataset.v)};
const _save=act.saveproduct;act.saveproduct=e=>{const lim=limitFor("st","items");if(S.products.length>=lim){S.sheet={type:"upgrade",reason:`The ${SEED.plans[planOf("st")].name} plan holds ${lim} products. You have ${S.products.length}.`};render();return}_save(e)};

/* ---------- 10. new screens ---------- */
Object.assign(screens,{
  plan:()=>{const p=SEED.plans[planOf("st")],f=SEED.fees;
    return status()+hdr("Plan and billing",{sub:"Example pricing"})+`<div class="body"><div class="sec"><div class="tile"><div class="l">Your plan</div><div class="v">${p.name} <span class="num" style="font-size:14px;color:var(--ink2)">${money(p.price)}/month</span></div></div></div>
    <div class="sec"><div class="lab">Change plan</div>${Object.entries(SEED.plans).map(([k,x])=>`<button class="row" data-act="planset" data-v="${k}"><div class="mid"><div class="t">${x.name} · ${money(x.price)}/month</div><div class="s">${x.limits.users} users · ${x.limits.items===Infinity?"unlimited":x.limits.items} products · ${x.limits.msgs.toLocaleString("en-IN")} broadcast messages</div></div>${planOf("st")===k?ic("check"):ic("chevr")}</button>`).join("")}</div>
    <div class="sec"><div class="lab">Add-ons</div>${Object.values(SEED.addons).map(a=>row(a.name,money(a.price)+" a "+a.per)).join("")}</div>
    <div class="sec"><div class="lab">Payment fees</div>${row("UPI",f.upi+"%")}${row("Cards and net banking",f.card+"%")}${row("Fee on a ₹10,000 card order with Protect",money(10000*feeFor("card",true)/100))}</div>
    <div class="sec"><button class="btn" data-act="promote">Promote your shop</button></div></div>`},
  credit:()=>{const rows=Object.entries(S.buyers).map(([cid,b])=>{const inv=Object.values(S.docs).filter(d=>d.kind==="invoice"&&d.chat===cid&&d.status!=="paid");const od=inv.filter(d=>overdueDays(d)>0);
      return `<button class="row" data-act="open" data-id="${cid}"><div class="mid"><div class="t">${esc(C(cid).name)}</div><div class="s">${LISTS[b.list]} prices · ${b.terms} · ${money(b.used)} of ${money(b.limit)} used${od.length?` · <span style="color:var(--bad)">${od.length} overdue</span>`:""}</div></div>${ic("chevr")}</button>`}).join("");
    return status()+hdr("Credit and dues",{sub:"Who owes you, on what terms"})+`<div class="body"><div class="sec">${rows}</div><div class="sec"><div class="meta">Ageing: invoices past their Net date turn red and BOC sends a polite reminder in the chat. Example data.</div></div></div>`},
  web:()=>webView(S.webBiz)
});
if(!act.open)act.open=e=>openChat(e.dataset.id);
const _more=moreView;
window.moreView=moreView=function(){const r=(go,icon,t,s)=>`<button class="row" data-act="go" data-s="${go}"><span class="mini" style="background:var(--tint-soft);color:var(--tint)">${ic(icon)}</span><div class="mid"><div class="t">${t}</div><div class="s">${s}</div></div>${ic("chevr")}</button>`;
  return _more().replace('<div class="body">','<div class="body">'+r("plan","card","Plan and billing",SEED.plans[planOf("st")].name+" · add-ons, fees, promote")+r("credit","wallet","Credit and dues","Terms, limits and overdue invoices"))};
const _explore=exploreView;
window.exploreView=exploreView=function(){const live=ADM().ads.filter(a=>a.status==="live");
  const ads=live.map(a=>`<div class="banner ok" style="margin:0 16px 10px"><span><b>${esc(a.biz)} <small style="font-weight:500;color:var(--ink2)">· Sponsored</small></b>${esc(a.text||"Verified business on BOC")}</span></div>`).join("");
  return _explore().replace('<div class="body">','<div class="body">'+ads)};

/* ---------- home dashboard (calm ledger structure): total, category treemap, health score, money due ---------- */
const TMAP=["#6FA3D6","#F0D46A","#C9B48F","#7FCB8A","#B9B1E8","#E9A98B"];
function salesByCat(){const m={};Object.values(S.docs).filter(d=>d.kind==="invoice"||d.kind==="order").forEach(d=>(d.items||[]).forEach(i=>{const p=i.pid&&P(i.pid);if(p)m[p.cat]=(m[p.cat]||0)+i.qty*i.price}));
  return Object.entries(m).sort((a,b)=>b[1]-a[1])}
function treemap(list){const total=list.reduce((a,x)=>a+x[1],0)||1,[first,...rest]=list,pct=v=>Math.round(v/total*100);
  if(!first)return"";const cell=([k,v],i)=>`<div style="background:${TMAP[i%TMAP.length]}"><b>${esc(k)}</b><span>${pct(v)}%</span><span class="num">${money(v)}</span></div>`;
  const left=rest.slice(0,Math.ceil(rest.length/2)),right=rest.slice(Math.ceil(rest.length/2));
  return `<div class="tmap" style="grid-template-columns:${Math.max(38,pct(first[1]))}fr ${100-Math.max(38,pct(first[1]))}fr">${cell(first,0)}<div style="display:grid;gap:3px;padding:0;background:none;grid-template-rows:repeat(${Math.max(1,left.length+(right.length?1:0))},1fr)">${left.map((x,i)=>cell(x,i+1)).join("")}${right.length?`<div style="display:grid;gap:3px;padding:0;background:none;grid-template-columns:repeat(${right.length},1fr)">${right.map((x,i)=>cell(x,i+1+left.length)).join("")}</div>`:""}</div></div>`}
window.healthOf=function(){const p=pending(),od=Object.values(S.docs).filter(d=>d.kind==="invoice"&&overdueDays(d)>0);
  const issues=[...od.map(d=>({t:"Overdue payment",s:`${C(d.chat).name} · ${code(d.id)} · ${overdueDays(d)} days late`,bad:true,go:()=>openDoc(d.id),id:d.id})),
    ...p.low.map(x=>({t:"Running low",s:`${x.name} · ${x.stock} left`,go:null})),
    ...(role()==="owner"?p.approvals.map(d=>({t:"Waiting for your approval",s:code(d.id),go:()=>openDoc(d.id),id:d.id})):[]),
    ...p.sign.map(d=>({t:"Contract to sign",s:code(d.id),go:()=>openDoc(d.id),id:d.id}))];
  const score=Math.max(1,Math.round((10-issues.length*0.8)*10)/10),grade=score>=9?"A":score>=8?"A-":score>=7?"B+":score>=6?"B":score>=5?"C+":"C";
  return{score,grade,issues}};
window.bizView=bizView=function(){const yr=S.months.reduce((a,m)=>a+m[1],0),cats=salesByCat(),h=healthOf(),p=pending();
  const dues=[...p.collect.map(d=>({d,dir:"in"})),...p.pay.map(d=>({d,dir:"out"}))].slice(0,5);
  const days=Array.from({length:6},(_,i)=>{const dt=new Date();dt.setDate(dt.getDate()+i*3-3);return dt});
  const sec=(t,s)=>`<div class="secttl"><h3>${t}</h3><span>${s||""}</span></div>`;
  return status()+big("Business",`<button class="fc" data-act="go" data-s="assistant">${ic("spark","s")} AI assistant</button>`)+`<div class="body">
  <div class="dash-tabs"><button class="on">Sales</button><button data-act="go" data-s="purchases">Purchases</button><button data-act="go" data-s="team">Team</button></div>
  <div class="dash-total" style="margin-top:12px"><div class="l">Sales this year · ${cats.length} categories</div><div class="v num">${money(yr)}</div></div>
  ${treemap(cats)}
  <div class="dash-actions"><button data-act="go" data-s="catalog">${ic("plus","s")} Add product</button><button data-act="go" data-s="orders">${ic("box","s")} My orders</button></div>
  <div class="score"><div><div class="l">Business health</div><h3>${h.issues.length?`You're close to ${h.score>=7?"A":"B+"}: ${h.issues.length} ${h.issues.length===1?"thing":"things"} left`:"Everything is in order"}</h3></div><div class="grade">${h.grade}</div>
    <div class="miss">${h.issues.length?"Needs you: "+[...new Set(h.issues.map(i=>i.t.toLowerCase()))].slice(0,3).join(", "):"Nothing waiting on you"}</div>
    <button data-act="tab" data-t="pending">Open what's waiting ${ic("chevr","s")}</button></div>
  ${sec("Money due",dues.length+" payments")}
  <div class="duestrip">${days.map((dt,i)=>`<div class="d ${i===1?"on":""} ${i===0&&Object.values(S.docs).some(d=>overdueDays(d)>0)?"late":""}"><span>${dt.toLocaleDateString("en-IN",{month:"short"})}</span><b class="num">${dt.getDate()}</b></div>`).join("")}</div>
  <div class="duelist">${dues.map(({d,dir})=>`<div class="grp"><span>${dir==="in"?"To collect":"To pay"}</span><span>${esc(C(d.chat).name)}</span></div><button class="it" data-act="dopen" data-id="${d.id}" style="width:100%;border:0;border-top:1px solid var(--line);background:none;text-align:left;font:inherit;color:inherit">${av(C(d.chat).name,C(d.chat).color,32)}<div class="mid"><div>${code(d.id)}</div><div class="small" style="color:${overdueDays(d)>0?"var(--bad)":"var(--ink2)"};font-size:12px">${overdueDays(d)>0?"Overdue "+overdueDays(d)+" days":"Due "+esc(d.due||dueDate(d))}</div></div><span class="amt num">${money(d.kind==="invoice"?balance(d):docTotal(d))}</span></button>`).join("")||`<div class="grp"><span>Nothing due</span></div>`}</div>
  ${sec("Analytics")}
  <div class="stat2"><div><div class="l">Collected online</div><div class="v num">${money(S.payout.held)}</div></div><div><div class="l">Open orders</div><div class="v num">${Object.values(S.docs).filter(x=>x.kind==="order"&&!x.ext&&!["completed","cancelled"].includes(x.status)).length} <small>of ${Object.values(S.docs).filter(x=>x.kind==="order").length}</small></div></div></div>
  <div class="problems">${h.issues.slice(0,4).map((x,i)=>`<button ${x.id?`data-act="dopen" data-id="${x.id}"`:`data-act="tab" data-t="pending"`}>${ic(x.bad?"alert":"info","s")}<span style="flex:1"><b class="${x.bad?"bad":""}">${esc(x.t)}</b><small>${esc(x.s)}</small></span>${ic("chevr","s")}</button>`).join("")}</div>
  ${sec("All tools")}
  <div class="grid4" style="grid-template-columns:repeat(3,minmax(0,1fr));margin:0 16px 20px">${[["catalog","tag","Products"],["orders","box","Orders"],["money","wallet","Money"],["customers","users","Customers"],["purchases","cart","Purchases"],["contracts","pen","Contracts"],["assistant","spark","AI assistant"],["broadcast","mega","Broadcasts"],["credit","wallet","Credit and dues"]].map(([g,i,l])=>`<button class="tool" data-act="go" data-s="${g}"><span class="ti">${ic(i)}</span>${l}</button>`).join("")}</div>
  </div>`+nav()};
act.dopen=e=>openDoc(e.dataset.id);if(!act.tab)act.tab=e=>{S.stack=[{name:"tab"}];S.tab=e.dataset.t;render()};

/* public web page for a number or QR */
window.webView=function(k){const b=BIZ[k],susp=isSuspended(k);
  const prods=k==="st"?S.products.filter(p=>p.vis==="Everyone"):[];
  const items=k==="gs"?SERVICES.gs.map(s=>row(esc(s.name),money(s.price))).join(""):k==="tt"?RENTALS.tt.map(s=>row(esc(s.name),money(s.rate)+"/day")).join(""):k==="dm"?SUBPLANS.dm.map(s=>row(esc(s.name),money(s.rate)+"/day")).join(""):"";
  return `<div class="status"><span class="num">9:41</span><span>5G</span></div><div class="hdr" style="background:var(--sunk)"><div class="ttl"><div class="sub num">boc.in/${b.name.toLowerCase().replace(/[^a-z]+/g,"")}</div></div></div>
  <div class="body"><div style="background:${b.color};color:#fff;padding:22px 16px"><div style="font-size:22px;font-weight:700">${esc(b.name)}</div><div style="opacity:.9">${esc(b.cat)} · ${esc(b.city)}</div></div>
  ${susp?`<div class="banner warn" style="margin:12px 16px">${ic("alert")}<span><b>Suspended by BOC</b>Orders and payments to this business are paused while BOC reviews it.</span></div>`:verified(b)?`<div class="banner ok" style="margin:12px 16px">${ic("shield")}<span><b>Verified business</b>${b.gstin?"GST "+b.gstin:"Udyam registered"} · on BOC since ${b.since} · ${b.rating}★ (${b.reviews})</span></div>`:`<div class="banner warn" style="margin:12px 16px">${ic("alert")}<span><b>Not a verified business</b>Only the phone number is verified. Pay only through BOC.</span></div>`}
  <div class="sec">${row("Replies",esc(b.reply.replace("Usually ","")))}${row("Hours",esc(b.hours))}${row("Delivery",esc(b.ships))}${row("Returns",esc(b.returns))}</div>
  ${prods.length?`<div class="sec"><div class="lab">Products, public prices</div>${prods.map(p=>row(esc(p.name),money(p.price))).join("")}<div class="meta">Wholesale prices are shown only to approved business buyers.</div></div>`:""}
  ${items?`<div class="sec"><div class="lab">What we offer</div>${items}</div>`:""}
  <div class="sec" style="display:grid;gap:8px"><button class="btn" data-act="weborder" ${susp?"disabled":""}>Order or book</button><button class="btn ghost" data-act="weborder" ${susp?"disabled":""}>Chat on BOC</button><div class="meta">Opened from a phone number or QR code. No app needed. Example page.</div></div>
  <div class="sec"><div class="lab">See another business's page</div><div class="wchips">${Object.keys(BIZ).map(x=>`<button class="fc ${x===k?"on":""}" data-act="webbiz" data-v="${x}">${esc(BIZ[x].name.split(" ")[0])}</button>`).join("")}</div></div></div>`};

/* ---------- 11. admin effects in the chat: suspension banner, BOC broadcasts ---------- */
const _chatView=chatView;
window.chatView=chatView=function(v){let h=_chatView(v);const c=C(v.id);
  if(c&&c.biz&&isSuspended(c.biz)&&!isBiz())h=h.replace('<div class="chat">',`<div class="chat"><div class="banner warn">${ic("alert")}<span><b>Suspended by BOC</b>Ordering and payments with ${esc(BIZ[c.biz].name)} are paused. Your held payments stay safe.</span></div>`);
  return h};
function syncBroadcasts(){const a=ADM();if(!S.seenBc)S.seenBc=[];
  const me={model:isBiz()?"B2B":"D2C",city:isBiz()?"Coimbatore":"Kochi",plan:isBiz()?planOf("st"):"",verified:isBiz()?"yes":""};
  const match=s=>(!s.model||(s.model==="B2B"?isBiz():!isBiz()))&&(!s.city||s.city===me.city)&&(!s.plan||s.plan===me.plan)&&(!s.verified||(s.verified==="yes")===isBiz())&&(!s.list||s.list.includes(isBiz()?"st":"meera"));
  a.broadcasts.filter(b=>b.status==="sent"&&match(b.seg||{})&&!S.seenBc.includes(b.id+":"+S.view)).forEach(b=>{
    let c=S.chats.find(x=>x.id==="bz");if(!c){chat({id:"bz",name:"BOC updates",kind:"team",labels:["BOC"],color:"#2B3A8C",acct:"Official messages from BOC",biz:"st",msgs:[]});c=C("bz")}
    c.msgs.push(M("sys",`From BOC · ${b.title}: ${b.body}`,b.at||now()));if(isBiz())c.unread++;else c.unreadC++;S.seenBc.push(b.id+":"+S.view)})}

/* ---------- 12. render: frames, guide controls, persistence ---------- */
const TRANSIENT=["stack","sheet","toast","typing","q"];
function snapshot(){const o={};for(const k in S)if(!TRANSIENT.includes(k))o[k]=S[k];o.seq=SEQ;return o}
window.saveApp=()=>BOCStore.patch("app",()=>snapshot());
const _render=render;let rendering=false;
window.render=render=function(){if(rendering)return;rendering=true;try{syncBroadcasts();
  if(S.frame==="web"){root.className="os-android";root.innerHTML=webView(S.webBiz)+(S.sheet?renderSheet():"")+(S.toast?`<div class="toast" role="status">${esc(S.toast)}</div>`:"");
    document.getElementById("seg-view").innerHTML="";}
  else _render();
  document.getElementById("seg-os").innerHTML=[["android","Android"],["ios","iPhone"],["web","Web page"]].map(([k,l])=>{const on=S.frame==="web"?k==="web":S.os===k&&k!=="web";return `<button class="${on?"on":""}" data-act="frame" data-v="${k}" aria-pressed="${on}">${l}</button>`}).join("");
  if(!window.__testing&&!window.__shot&&!remote)saveApp()}finally{rendering=false}};
document.getElementById("lo").textContent="Show it on";

/* ---------- 13. guide flows for every business type ---------- */
GUIDE.push(
  {t:"Wholesale on credit with limits",d:"Lakshmi Silks wants Pongal stock on Net 15, but one invoice is already overdue. Price list, minimum order and credit limit all apply.",icon:"wallet",color:"#7A2E5C",run:()=>{setView("owner");openChat("c10")}},
  {t:"Buy from a manufacturer by truck",d:"Rajkot Precision Castings bills ₹1,84,000 with an e-invoice number, e-way bill and lorry receipt.",icon:"truck",color:"#5B4A8C",run:()=>{setView("owner");openChat("c11")}},
  {t:"Book a salon appointment",d:"Meera picks a service and slot, pays a 20% deposit, gets a reminder, and pays the balance after.",icon:"clock",color:"#8A3FA0",run:()=>{setView("customer");openChat("y1")}},
  {t:"Interior project paid in stages",d:"Nest Interiors quotes ₹6 lakh in stages. Meera pays one stage, approves the work, and the next one opens.",icon:"home",color:"#C0562A",run:()=>{setView("customer");openChat("y2");const ex=Object.values(S.docs).find(d=>d.kind==="ms"&&d.chat==="y2");if(!ex)milestoneQuote("y2",600000,[{name:"Design and booking",pct:10},{name:"Materials",pct:40},{name:"Installation",pct:40},{name:"Handover",pct:10}]);render()}},
  {t:"Daily milk on a monthly bill",d:"Start a delivery plan. Each delivery is logged, and the month-end bill counts only what came.",icon:"box",color:"#0F7C86",run:()=>{setView("customer");openChat("y3")}},
  {t:"Rent a tent with a deposit",d:"Book dates, pay rent and deposit together, return the items and get the deposit back less any damage.",icon:"store",color:"#9A6B12",run:()=>{setView("customer");openChat("y4")}},
  {t:"Medicine by batch and expiry",d:"Annapurna Medicals sells the earliest-expiry batch first and can't sell expired stock.",icon:"shield",color:"#0F7C86",run:()=>{setView("customer");openChat("x2")}},
  {t:"Own delivery, transport or pickup",d:"Ship Rohan's order with your own staff: the buyer gets an OTP and you enter it at the door.",icon:"pin",color:"#4A5D23",run:()=>{setView("owner");openChat("c9")}},
  {t:"A buyer finds you from your number",d:"The public page anyone sees from your number or QR, with no app. Ordering asks only for phone and OTP.",icon:"compass",color:"#2B3A8C",run:()=>{S.frame="web";S.webBiz="st";S.sheet=null;render()}},
  {t:"Plans, fees and ads",d:"Free, Pro and Business plans, add-ons and payment fees. Promote the shop; BOC reviews the ad first.",icon:"card",color:"#2E7D4F",run:()=>{setView("owner");S.frame="android";S.tab="more";S.stack=[{name:"tab"},{name:"plan"}];render()}}
);
const _setView=setView;window.setView=setView=function(v,keep){if(S.frame==="web"){S.frame=S.os}_setView(v,keep)};
document.getElementById("flows").innerHTML=GUIDE.map((g,i)=>`<button class="flow" data-act="guide" data-i="${i}"><span class="ft" style="background:${g.color}">${ic(g.icon)}</span><span><h3>${g.t}</h3><p>${g.d}</p></span>${ic("chevr")}</button>`).join("");
{const f=document.querySelector(".guide .foot");if(f)f.insertAdjacentHTML("beforeend",` <button class="btn sm ghost" data-act="resetdemo" style="margin-top:8px">Reset demo</button> <a href="admin.html" style="margin-left:8px">Open the BOC admin console</a>`)}

/* ---------- 14. boot: restore saved demo, follow admin changes ---------- */
if(!window.__testing&&!new URLSearchParams(location.search).get("shot")){const saved=BOCStore.load();if(saved&&saved.app){Object.assign(S,saved.app);if(saved.app.seq)SEQ=saved.app.seq}}
/* another tab changed storage: redraw from the admin data without writing this tab's state back (avoids two tabs ping-ponging);
   a cleared store means someone pressed Reset demo, so start over */
let remote=false;
BOCStore.subscribe(s=>{if(!s&&!window.__testing){location.reload();return}remote=true;try{render()}finally{remote=false}});
render();
})();
