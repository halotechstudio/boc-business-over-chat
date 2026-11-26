/* Final-review fixes (app side). */
test("paying a part-paid invoice charges only the balance and frees credit",()=>{const b=S.buyers.c10,used0=b.used;const d=D("INV-0139");const tot=Math.round(docTotal(d));
  recordPayment("INV-0139",10000);eq(b.used,used0-10000);const bal=balance(d);payDoc(d,"UPI");eq(d.status,"paid");eq(b.used,used0-tot);
  const last=C("c10").msgs.filter(m=>m.type==="payment").pop();eq(last.amount,bal)});
test("cash mark-paid frees credit",()=>{const d=addDoc({id:"INV-T9",kind:"invoice",chat:"c2",items:[{pid:"p2",qty:1,price:10000}],terms:"Net 30",status:"unpaid"});const b=S.buyers.c2;b.used+=Math.round(docTotal(d));const u=b.used;act.markpaid({dataset:{id:"INV-T9"}});eq(b.used,u-Math.round(docTotal(d)));delete S.docs["INV-T9"]});
test("buyer can pay the balance of a part-paid invoice",()=>{const d=addDoc({id:"INV-T8",kind:"invoice",chat:"c2",items:[{pid:"p2",qty:1,price:10000}],terms:"Net 30",status:"unpaid"});recordPayment("INV-T8",2000);
  const h=cardHTML({type:"doc",ref:"INV-T8"},C("c2"));S.view="customer";const hc=cardHTML({type:"doc",ref:"INV-T8"},C("c2"));S.view="owner";ok(/data-act="paysheet"[^>]*data-id="INV-T8"/.test(hc),"pay button for buyer");delete S.docs["INV-T8"]});
test("suspension blocks actions outside the chat too",()=>{BOCStore.patch("admin",a=>{a=a||structuredClone(SEED.admin);a.businesses.find(b=>b.key==="ix").status="suspended";a.businesses.find(b=>b.key==="st").status="suspended";return a});
  setView("customer");S.stack=[{name:"tab"},{name:"pdetail",id:"p1"}];S.sheet=null;act.cporder({dataset:{id:"p1"}});eq(S.sheet,null,"order from product screen blocked");
  const ms=milestoneQuote("y2",100000,[{name:"A",pct:100}]);S.stack=[{name:"tab"}];act.mspay({dataset:{id:ms.id}});eq(ms.stages[0].status,"due","stage pay blocked");BOCStore.reset();S.stack=[{name:"tab"}]});
test("a change from another tab does not re-save this tab's state",async()=>{BOCStore.reset();window.__testing=false;const s={admin:structuredClone(SEED.admin)};localStorage.setItem(BOCStore.KEY,JSON.stringify(s));
  window.dispatchEvent(new StorageEvent("storage",{key:BOCStore.KEY}));await wait(20);window.__testing=true;ok(!BOCStore.load().app,"app slice not written back");BOCStore.reset()});
