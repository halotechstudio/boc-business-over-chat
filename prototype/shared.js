/* BOC demo: shared state store and seed data for the app (index.html) and the admin console (admin.html).
   Everything here is example data. Storage can be blocked (private windows, previews): every access is guarded
   and both pages fall back to the seed. */
(function(){
  const KEY="beasy.demo.v3";
  const subs=[];
  const BOCStore={
    KEY,
    load(){try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null}catch(e){return null}},
    save(state){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}},
    reset(){try{localStorage.removeItem(KEY)}catch(e){}},
    subscribe(fn){subs.push(fn)},
    /* read-modify-write one slice so app and admin never overwrite each other's parts */
    patch(slice,fn){const s=BOCStore.load()||{};s[slice]=fn(s[slice]??structuredClone(SEED[slice]??null));BOCStore.save(s);return s[slice]}
  };
  try{window.addEventListener("storage",e=>{if(e.key===KEY){const s=BOCStore.load();subs.forEach(f=>f(s))}})}catch(e){}

  const PLANS={
    free:{name:"Starter",price:99,year:891,limits:{users:1,items:Infinity,msgs:100,ai:20,conns:1,locations:1},who:"Selling on your own through chats and statuses",features:["Sell in chats and statuses with payment links","Unlimited products and GST invoices","Your UPI plus one app","100 broadcasts, 20 AI replies a month"]},
    basic:{name:"Basic",price:399,year:3588,limits:{users:2,items:Infinity,msgs:500,ai:100,conns:99,locations:1},who:"A small shop getting organised",features:["Everything in Starter","Web shop page from your number or QR","Khata, labels and CRM, groups","All apps: gateway, courier, Tally, Zoho","2 staff accounts"]},
    pro:{name:"Grow",price:999,year:8988,limits:{users:5,items:Infinity,msgs:2000,ai:1000,conns:99,locations:2},who:"A growing business with a team",features:["Everything in Basic","5 staff accounts with roles and approvals","Credit terms, purchasing, contracts","2,000 broadcasts and 1,000 AI replies a month","Up to 2 shops or warehouses"]},
    business:{name:"Advanced",price:2499,year:22488,limits:{users:15,items:Infinity,msgs:10000,ai:5000,conns:99,locations:5},who:"Wholesalers and distributors at scale",features:["Everything in Grow","15 staff accounts, up to 5 locations","Price lists per buyer, e-invoice and e-way bill","Custom reports, API and webhooks","Priority support"]},
    plus:{name:"Plus",price:null,year:null,custom:"From ₹15,000/month",limits:{users:Infinity,items:Infinity,msgs:Infinity,ai:Infinity,conns:99,locations:Infinity},who:"Brands and distributors with dealer networks",features:["Everything in Advanced, without limits","Your dealers and retailers on BOC under your brand","Dedicated success manager","Custom contracts and SLAs"]}
  };
  const ADDONS={seat:{name:"Extra staff account",price:149,per:"month"},broadcast:{name:"Extra broadcasts",price:0.15,per:"message"},ai:{name:"Extra AI replies",price:99,per:"1,000 replies"},esign:{name:"E-signature",price:15,per:"contract"}};
  /* BOC takes no cut of payments: buyers pay sellers directly through the seller's own gateway */
  const FEES={upi:0,card:0,netbanking:0,protect:0};
  const ADPRICE={cpc:5,day:199};

  /* Admin-side records. Businesses mirror the app's BIZ keys. */
  const businesses=[
    {key:"st",name:"Shree Textiles",phone:"98430 •••21",gstin:"33ABHFS4821K1Z6",city:"Coimbatore",cat:"Textiles",kind:"wholesale",model:"B2B + D2C",plan:"business",verified:true,status:"active",gmv:913000,joined:"Mar 2024"},
    {key:"qd",name:"Quick Deals Store",phone:"98•••••210",gstin:"",city:"Not shared",cat:"Phone accessories",kind:"retail",model:"D2C",plan:"free",verified:false,status:"active",gmv:0,joined:"9 days ago",flags:["New account pushing off-app UPI payments","3 buyer reports this week"]},
    {key:"am",name:"Annapurna Medicals",phone:"94470 •••88",gstin:"32AAGFA1123L1Z9",city:"Kochi",cat:"Pharmacy",kind:"batch",model:"D2C",plan:"pro",verified:true,status:"active",gmv:388000,joined:"Jan 2025"},
    {key:"ms",name:"Malabar Spice House",phone:"94950 •••40",gstin:"32AKLPM7781C1ZQ",city:"Kozhikode",cat:"Food",kind:"retail",model:"D2C",plan:"pro",verified:true,status:"active",gmv:241000,joined:"Jun 2024"},
    {key:"kc",name:"Kochi Cake Studio",phone:"90370 •••12",gstin:"",city:"Kochi",cat:"Food",kind:"project",model:"D2C",plan:"free",verified:true,status:"active",gmv:62000,joined:"Aug 2025"},
    {key:"ld",name:"Ludhiana Hosiery Distributors",phone:"98140 •••77",gstin:"03AAKFL2290M1ZP",city:"Ludhiana",cat:"Textiles",kind:"wholesale",model:"B2B",plan:"free",verified:true,status:"active",gmv:1240000,joined:"Feb 2025"},
    {key:"pm",name:"Rajkot Precision Castings",phone:"98250 •••03",gstin:"24AAHCR7781K1Z2",city:"Rajkot",cat:"Manufacturing",kind:"manufacturer",model:"B2B",plan:"business",verified:true,status:"active",gmv:6420000,joined:"Nov 2024",turnover:84000000},
    {key:"gs",name:"Glow Studio Salon",phone:"98220 •••56",gstin:"",city:"Pune",cat:"Salon",kind:"service",model:"D2C",plan:"pro",verified:true,status:"active",gmv:96000,joined:"Apr 2025"},
    {key:"ix",name:"Nest Interiors",phone:"99000 •••31",gstin:"29AAPFN4410E1ZK",city:"Bengaluru",cat:"Interiors",kind:"project",model:"D2C",plan:"business",verified:true,status:"active",gmv:1820000,joined:"Jul 2024"},
    {key:"dm",name:"Amul Nagar Dairy",phone:"97240 •••09",gstin:"",city:"Anand",cat:"Dairy",kind:"subscription",model:"D2C",plan:"free",verified:true,status:"active",gmv:54000,joined:"Sep 2025"},
    {key:"tt",name:"Rajputana Tent House",phone:"94140 •••64",gstin:"08AAJFR3320B1Z1",city:"Jaipur",cat:"Rentals",kind:"rental",model:"B2B + D2C",plan:"pro",verified:true,status:"active",gmv:310000,joined:"Dec 2024"}
  ];
  const people=[
    {key:"meera",name:"Meera Nair",phone:"98470 •••36",city:"Kochi",type:"Personal",status:"active",orders:3,joined:"Oct 2025"},
    {key:"rohan",name:"Rohan Mehta",phone:"98200 •••14",city:"Mumbai",type:"Personal",status:"active",orders:1,joined:"Nov 2025"}
  ];
  const verifyQueue=[
    {id:"VQ-0091",biz:"Sai Krupa Kirana",check:"GSTIN",reason:"Name on GST registry does not match the business name entered",city:"Nagpur",at:"Today 9:12 am",status:"open"},
    {id:"VQ-0092",biz:"Hanuman Auto Parts",check:"Bank",reason:"₹1 test deposit returned by the bank",city:"Indore",at:"Today 10:40 am",status:"open"},
    {id:"VQ-0093",biz:"Fresh Fold Laundry",check:"Aadhaar e-KYC",reason:"Owner photo match below threshold",city:"Hyderabad",at:"Yesterday",status:"open"}
  ];
  const tickets=[
    {id:"TK-1041",from:"Meera Nair",about:"x1",biz:"qd",subject:"Seller asked me to pay outside BOC",cat:"Fraud report",status:"open",access:false,at:"Yesterday",notes:[]},
    {id:"TK-1042",from:"Arjun Retail Pvt Ltd",about:"c2",biz:"st",subject:"GST invoice shows wrong HSN",cat:"Billing",status:"open",access:true,at:"Today 11:05 am",notes:[]}
  ];
  const disputes=[
    {id:"DP-0031",order:"ORD 0177",buyer:"Kavya S",seller:"Malabar Spice House",amount:2400,reason:"Item missing: 1 of 3 packs",status:"open"}
  ];
  const ads=[
    {id:"AD-0012",biz:"Malabar Spice House",slot:"explore",model:"day",budget:1393,spent:597,clicks:212,status:"live"},
    {id:"AD-0013",biz:"Glow Studio Salon",slot:"search",model:"cpc",budget:2000,spent:0,clicks:0,status:"pending",text:"Bridal makeup, Pune. Book a trial."}
  ];
  const broadcasts=[
    {id:"BC-0007",title:"GST filing reminder",body:"GSTR-1 for November is due on 11 December. Your BOC GST report is ready to download.",seg:{model:"",city:"",plan:"",verified:"yes"},channel:"In-app",sent:9,read:7,status:"sent",at:"1 Dec"}
  ];
  const billing=[
    {biz:"Shree Textiles",plan:"Business",amount:999,renews:"1 Dec",status:"paid"},
    {biz:"Rajkot Precision Castings",plan:"Business",amount:999,renews:"28 Nov",status:"failed"},
    {biz:"Glow Studio Salon",plan:"Pro",amount:299,renews:"3 Dec",status:"paid"}
  ];
  const coupons=[{code:"LUDHIANA90",what:"3 months of Pro free",used:41,limit:200}];
  const moderation=[
    {id:"MD-0201",biz:"Annapurna Medicals",item:"Alprazolam 0.5 mg, strip of 10",reason:"Schedule H1 medicine: needs a prescription upload flow before listing",status:"open"},
    {id:"MD-0202",biz:"Quick Deals Store",item:"Wireless earbuds, 80% off",reason:"Price far below market from an unverified seller",status:"open"}
  ];
  const legal=[
    {id:"LR-0004",type:"Data deletion request",from:"Personal user · Chennai",due:"In 24 days",status:"open"}
  ];
  const staff=[
    {name:"Priya",role:"Super admin"},{name:"Arun",role:"Super admin"},{name:"Imran",role:"Support agent"},{name:"Sneha",role:"Verification officer"},{name:"Vikram",role:"Finance"},{name:"Tanvi",role:"Marketing"}
  ];
  /* reviews: only from verified purchases; every new review waits for BOC before it shows */
  const reviews=[
    {id:"RV-0301",biz:"st",pid:"p4",author:"Rohan Mehta",order:"ORD 0201",stars:5,text:"Dupattas exactly like the photos, well packed, arrived in 3 days.",status:"published",at:"20 Nov"},
    {id:"RV-0298",biz:"st",pid:"p1",author:"Ananya R",order:"ORD 0172",stars:5,text:"The Kanjivaram is stunning. They sent a video before shipping.",status:"published",at:"14 Nov"},
    {id:"RV-0290",biz:"st",pid:null,author:"Arjun Retail Pvt Ltd",order:"INV 0131",stars:4,text:"Reliable wholesale partner. Linen rolls were a day late this time.",status:"published",at:"2 Nov"},
    {id:"RV-0310",biz:"ms",pid:null,author:"Kavya S",order:"ORD 0177",stars:2,text:"One of three packs was missing and the box was torn.",status:"pending",at:"Today"},
    {id:"RV-0311",biz:"am",pid:null,author:"Meera Nair",order:"ORD 0187",stars:5,text:"Delivered in an hour, sealed strips, good expiry dates.",status:"published",at:"Mon"},
    {id:"RV-0312",biz:"gs",pid:null,author:"Sneha P",order:"BKG 0119",stars:5,text:"Bridal trial was calm and on time. Booking in chat was easy.",status:"published",at:"Sun"}
  ];
  const SEED={plans:PLANS,addons:ADDONS,fees:FEES,adprice:ADPRICE,
    admin:{reviews,businesses,people,verifyQueue,tickets,disputes,ads,broadcasts,billing,coupons,moderation,legal,staff,audit:[],flags:{},escrow:{held:18500,paidOut:243600,fees:{payments:41200,subscriptions:28900,ads:6300,shipping:9800}}}};
  window.BOCStore=BOCStore;window.SEED=SEED;
})();
