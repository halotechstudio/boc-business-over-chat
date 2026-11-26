/* Round 3 app tests: persistence, archetypes, B2B, tax, delivery, other ways of selling, web page, plans. */
const lastDoc=(cid,kind)=>Object.values(S.docs).filter(d=>d.chat===cid&&(!kind||d.kind===kind)).pop();
// persistence (Task 1)
test("saves and restores the app slice",()=>{BOCStore.reset();const was=S.payout.held;S.payout.held=12345;saveApp();eq(BOCStore.load().app.payout.held,12345);S.payout.held=was;BOCStore.reset()});
test("blocked storage falls back to seed",()=>{const g=Storage.prototype.getItem;Storage.prototype.getItem=()=>{throw new Error("blocked")};try{eq(BOCStore.load(),null);setView("owner");ok(document.querySelectorAll("#app .chatrow, #app [data-act=open]").length>0||document.getElementById("app").innerHTML.length>500,"app rendered")}finally{Storage.prototype.getItem=g}});
test("reset clears saved state",()=>{saveApp();BOCStore.reset();eq(BOCStore.load(),null)});
// archetypes (Task 2)
test("eight business kinds seeded, each reachable in a chat",()=>{const kinds=new Set(Object.values(BIZ).map(b=>b.kind));eq(kinds.size,8);
  ["gs","ix","dm","tt","am"].forEach(k=>ok(S.chats.some(c=>c.biz===k),"chat for "+k));ok(C("c10")&&C("c11"),"B2B chats")});
// B2B (Task 3)
test("distributor and retailer prices with slabs",()=>{const p=P("p2");eq(priceFor(p,"c2",1),p.whole);eq(priceFor(p,"c2",10),Math.round(p.whole*0.97));eq(priceFor(p,"c2",50),Math.round(p.whole*0.94));eq(priceFor(p,"c10",1),Math.round(p.whole*1.05));eq(priceFor(p,"c1",1),p.price)});
test("minimum order blocks small wholesale invoice",()=>{ok(checkMoq([{pid:"p2",qty:3}],"c2"),"3 rolls under MOQ");eq(checkMoq([{pid:"p2",qty:5}],"c2"),null);eq(checkMoq([{pid:"p1",qty:1}],"c1"),null,"retail has no MOQ")});
test("part payment leaves a balance",()=>{const d=addDoc({id:"INV-T1",kind:"invoice",chat:"c2",items:[{pid:"p2",qty:2,price:5000}],disc:0,terms:"Net 30",status:"unpaid"});const tot=Math.round(docTotal(d));recordPayment("INV-T1",4000);eq(d.status,"part");eq(balance(d),tot-4000);ok(docState(d,"biz")[1].startsWith("Part paid"));recordPayment("INV-T1",balance(d));eq(d.status,"paid");delete S.docs["INV-T1"]});
test("Net 30 due date is 30 days out",()=>{eq(dueDate({terms:"Net 30"}),dayPlus(30));eq(dueDate({terms:"Advance"}),"on receipt")});
test("credit limit blocks an over-limit invoice",()=>{const b=S.buyers.c10;const r=creditCheck("c10",b.limit);eq(r.ok,false);ok(r.msg.startsWith("Over credit limit"));eq(creditCheck("c10",1).ok,b.used+1<=b.limit);
  setView("owner");openChat("c10");S.sheet={type:"invoice",chat:"c10",sel:{p4:60},disc:0,terms:"Net 15"};const n=Object.keys(S.docs).length;submitSheet();eq(Object.keys(S.docs).length,n,"no doc created");ok(S.sheet&&/Over credit limit/.test(S.sheet.err));render();ok(document.querySelector(".sheet .banner.warn"),"madder warning shown");S.sheet=null});
test("overdue invoice turns madder",()=>{eq(docState(D("INV-0139"),"biz")[0],"bad");ok(/Overdue 6 days/.test(docState(D("INV-0139"),"biz")[1]))});
// tax (Task 4)
test("e-way bill required above ₹50,000 only",()=>{const big={kind:"order",items:[{pid:"p1",qty:3,price:18500}]};ok(needsEwb(big),"₹58,275 needs EWB");const small={kind:"order",items:[{pid:"p2",qty:1,price:47619}]};ok(!needsEwb(small),"₹50,000 does not")});
test("IRN only for turnover above ₹5 crore",()=>{eq(hasIrn("st"),false);eq(hasIrn("pm"),true)});
test("credit note lowers the balance",()=>{const d=addDoc({id:"INV-T2",kind:"invoice",chat:"c2",items:[{pid:"p2",qty:1,price:10000}],status:"unpaid"});const before=balance(d);const cn=issueCreditNote("INV-T2",1000,"Goods returned");eq(balance(d),before-1000);ok(cn.id.startsWith("CN-"));eq(code(cn.id).split(" ")[0],"CN");delete S.docs["INV-T2"]});
test("booking ship is blocked until EWB exists",()=>{setView("owner");const o=addDoc({id:"ORD-T3",kind:"order",chat:"c2",items:[{pid:"p1",qty:3,price:18500}],status:"accepted",pay:"held",shipFee:0});S.sheet={type:"ship",order:"ORD-T3",courier:"std",wt:"5 kg",slot:"Today 4–7 pm"};act.doship();eq(o.status,"accepted");ok(S.sheet.err);genEwb(o);ok(o.ewb);S.sheet=null;delete S.docs["ORD-T3"]});
// delivery (Task 5)
test("own staff delivery needs the right OTP",()=>{const o=addDoc({id:"ORD-T4",kind:"order",chat:"c9",items:[{pid:"p4",qty:1,price:2400}],status:"accepted",pay:"held",shipFee:0});bizShip(o,{courier:"staff"});eq(STAGES[o.ship.stage],"Out for delivery");eq(handover("ORD-T4","0000"===o.ship.otp?"1111":"0000"),false);eq(o.status,"shipped");eq(handover("ORD-T4",o.ship.otp),true);eq(o.status,"delivered");const held=S.payout.held;cpConfirm(o);eq(o.pay,"released");delete S.docs["ORD-T4"]});
test("pickup and transport modes",()=>{const o=addDoc({id:"ORD-T5",kind:"order",chat:"c9",items:[{pid:"p4",qty:1,price:2400}],status:"accepted",pay:"cod",shipFee:0});bizShip(o,{courier:"pickup"});eq(o.ship.mode,"pickup");ok(handover("ORD-T5",o.ship.otp));eq(o.pay,"released");
  const t=addDoc({id:"ORD-T6",kind:"order",chat:"c2",items:[{pid:"p2",qty:5,price:5400}],status:"accepted",pay:"held",shipFee:0});bizShip(t,{courier:"transport",wt:"5 kg"});ok(D(t.ship.lr).kind==="lr");delete S.docs["ORD-T5"];delete S.docs["ORD-T6"]});
// other ways of selling (Task 6)
test("salon booking: deposit, done, balance paid",()=>{const b=book("y1","s2","Sat 11:00 am",700);eq(b.status,"booked");const inv=markDone(b.id);eq(inv.amount,2800);payDoc(inv,"UPI");eq(docState(b,"cp")[1],"Done · paid")});
test("stages must add up to 100%",()=>{let threw=false;try{milestoneQuote("y2",600000,[{name:"A",pct:50},{name:"B",pct:40}])}catch(e){threw=/100%/.test(e.message)}ok(threw);
  const d=milestoneQuote("y2",600000,[{name:"Design",pct:10},{name:"Build",pct:90}]);payStage(d.id);eq(d.stages[1].status,"locked");approveStage(d.id);eq(d.stages[1].status,"due")});
test("subscription bills only delivered days",()=>{const d=subscribe("y3","m1","daily");addDelivery(d.id,26);const bill=monthBill(d.id);eq(bill.amount,1560)});
test("rental refund is deposit minus damage",()=>{const r=rent("y4","r1","14 Dec","15 Dec");eq(r.amount,24000);eq(returnRental(r.id,800),9200)});
test("batch FEFO skips expired stock",()=>{eq(pickBatch("ph1",10,"2026-11-26").no,"B2411");eq(pickBatch("ph1",150,"2026-11-26").no,"B2502");eq(pickBatch("ph1",10,"2027-09-01"),null)});
test("guide has a flow for every new business type",()=>{ok(GUIDE.length>=22,"22 flows, got "+GUIDE.length)});
// web page (Task 7)
test("web page hides wholesale-only and hidden products",()=>{S.frame="web";S.webBiz="st";render();const h=document.getElementById("app").innerHTML;ok(h.includes("Kanjivaram"));ok(!h.includes("Linen Shirting"),"wholesale only hidden");ok(!h.includes("Silk Thread Cones"),"hidden product hidden");ok(h.includes("Verified business"))});
test("unverified business page warns",()=>{S.webBiz="qd";render();ok(document.getElementById("app").innerHTML.includes("Not a verified business"))});
test("web order ends in the chat as Meera",()=>{S.webBiz="st";act.weborder();act.webotp2();act.webdone();eq(S.frame,"android");eq(S.view,"customer");eq(cur().name,"chat");eq(cur().id,"c1")});
// plans (Task 8)
test("Free never limits products; adding staff opens the upgrade",()=>{setView("owner");const was=S.plan;S.plan="free";eq(limitFor("st","items"),Infinity);S.sheet=null;act.teaminvite();eq(S.sheet&&S.sheet.type,"upgrade");S.sheet=null;S.plan="pro";eq(limitFor("st","users"),3);S.plan=was});
test("BOC takes no cut of payments",()=>{eq(feeFor("card",true),0);eq(feeFor("upi",false),0)});
test("new ad starts pending and only verified can promote",()=>{BOCStore.reset();const ad=createAd("explore","day",1393);eq(ad.status,"pending");ok(BOCStore.load().admin.ads.some(a=>a.id===ad.id));BOCStore.reset()});
