/* App <-> admin wiring through BOCStore. */
const adminSet=fn=>BOCStore.patch("admin",a=>{a=a||structuredClone(SEED.admin);fn(a);return a});
test("suspended business: banner, no ordering, web page disabled",()=>{BOCStore.reset();adminSet(a=>{a.businesses.find(b=>b.key==="qd").status="suspended"});
  setView("customer");openChat("x1");const h=document.getElementById("app").innerHTML;ok(h.includes("Suspended by BOC"),"chat banner");
  S.sheet=null;act.subopen&&0;const before=S.sheet;addDoc({id:"PR-T1",kind:"paylink",chat:"x1",amount:999,status:"unpaid"});act.paysheet({dataset:{id:"PR-T1"}});delete S.docs["PR-T1"];eq(S.sheet,before,"pay blocked in suspended chat");
  S.frame="web";S.webBiz="qd";render();ok(document.querySelector("#app [data-act=weborder]").disabled,"web order disabled");act.weborder();ok(!S.sheet||S.sheet.type!=="webotp");S.frame="android";BOCStore.reset()});
test("admin override beats the plan limit",()=>{BOCStore.reset();const was=S.plan;S.plan="free";BOCStore.patch("admin",a=>{a=a||structuredClone(SEED.admin);a.flags={st:{users:10}};return a});eq(limitFor("st","users"),10);setView("owner");S.sheet=null;act.teaminvite();ok(!S.sheet||S.sheet.type!=="upgrade","no upgrade prompt");S.plan=was;BOCStore.reset()});
test("Report a problem creates an admin ticket",()=>{BOCStore.reset();setView("customer");openChat("c1");const o=placeOrder("c1",[{pid:"p4",qty:1,price:2400}],"upi",78);act.doissue({dataset:{id:o.id,v:"Item damaged"}});
  const t=BOCStore.load().admin.tickets[0];ok(t.subject.startsWith("Item damaged"));eq(t.access,true);BOCStore.reset()});
test("approved ad shows in Explore, never in chats",()=>{BOCStore.reset();adminSet(a=>{a.ads.find(x=>x.id==="AD-0013").status="live"});setView("customer");S.tab="explore";render();ok(document.getElementById("app").innerHTML.includes("Glow Studio Salon"));ok(document.getElementById("app").innerHTML.includes("Sponsored"));
  openChat("c1");ok(!document.getElementById("app").innerHTML.includes("Sponsored"),"no ads in chat");BOCStore.reset()});
test("BOC broadcast reaches only matching users",()=>{BOCStore.reset();S.seenBc=[];adminSet(a=>{a.broadcasts=[{id:"BC-T1",title:"B2B only",body:"For sellers.",seg:{model:"B2B"},status:"sent",channel:"In-app",at:"today",sent:1,read:0}]});
  setView("customer");ok(!C("bz")||!C("bz").msgs.some(m=>m.text.includes("B2B only")),"customer did not get it");setView("owner");ok(C("bz")&&C("bz").msgs.some(m=>m.text.includes("B2B only")),"owner got it");BOCStore.reset()});
