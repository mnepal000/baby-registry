// Baby registry data. Edit freely: add, remove, or change items here.
// Prices were checked on 2026-10-01 and may change at the store.

var REGISTRY = {
  babyName: "Vyom Nepal",
  familyName: "The Nepal Family",
  dueDate: "2027-01-09",
  dueMonthLabel: "January 2027",
  contactEmail: "hellomuku@gmail.com",
};

// Purchase-claim settings. Until these are filled in (see GOOGLE_SHEETS_SETUP.md),
// claims are saved in each visitor's own browser. Once connected, claims are shared
// with every visitor via the published sheet CSV.
var CLAIM_CONFIG = {
  formUrl: "",   // e.g. "https://docs.google.com/forms/d/e/XXXX/formResponse"
  entryIds: {
    itemId: "",  // Google Form entry id for the hidden item id
    name: "",    // entry id for buyer name
    platform: "",// entry id for store/platform
    order: "",   // entry id for order number (optional field)
    message: ""  // entry id for message to parents (optional field)
  },
  sheetCsvUrl: "" // published CSV link of the Form's response sheet
};

var ITEMS = [
  {
    id: "bravo-trio",
    name: "Chicco - Bravo Trio Travel System Camden",
    brand: "Chicco",
    category: "Travel",
    priority: "must", // "must" or "nice"
    price: "$489.99",
    store: "MacroBaby",
    url: "https://www.macrobaby.com/products/chicco-bravo-trio-travel-system-camden?variant=39714051719227",
    img: "assets/img/bravo-trio.jpg",
    blurb: "Our pick for the one-and-done travel system: stroller plus the KeyFit 30 infant seat, with a one-hand quick fold for the car.",
  },
  {
    id: "ergobaby-omni",
    name: "Ergobaby(TM) Omni Classic Baby Carrier, Mesh, Gray",
    brand: "Pottery Barn Kids",
    category: "Travel",
    priority: "nice", // "must" or "nice"
    price: "$179",
    store: "Pottery Barn Kids",
    url: "https://www.potterybarnkids.com/products/ergobaby-360-omni-carrier/?catalogId=10&sku=8934615&cm_ven=organicsocial&cm_cat=InstagramFacebook&cm_pla=shoppable&cm_ite=skuname%2F",
    img: "assets/img/ergobaby-omni.jpg",
    blurb: "Keeps baby close on walks and errands, with lumbar support for longer carries.",
  },
  {
    id: "hatch-rest",
    name: "Hatch Rest + 2nd Gen Sound Machine & Nightlight with Battery",
    brand: null,
    category: "Nursery",
    priority: "nice", // "must" or "nice"
    price: "$99.99",
    store: "Name Dropper Kids",
    url: "https://namedropperkids.com/products/hatch-rest-2nd-gen-sound-machine-nightlight-with-battery?variant=46142805573875",
    img: "assets/img/hatch-rest.jpg",
    blurb: "White noise, night light, and wake-up cues in one, controlled from a phone.",
  },
  {
    id: "swaddles",
    name: "aden + anais essentials 4pk Cotton Muslin Swaddle Blankets - Sage Woodland",
    brand: "aden + anais essentials",
    category: "Nursery",
    priority: "must", // "must" or "nice"
    price: "$39.99",
    store: "Target",
    url: "https://www.target.com/p/aden-by-aden-anais-essentials-muslin-swaddle-blankets-woodland-4pk/-/A-92407763",
    img: "assets/img/swaddles.jpg",
    blurb: "Soft, breathable muslin blankets for swaddling, burping, and everything in between.",
  },
  {
    id: "spectra-s1",
    name: "S1 Hospital Grade Double Electric Breast Pump With Rechargeable Battery",
    brand: null,
    category: "Feeding",
    priority: "must", // "must" or "nice"
    price: "$216",
    store: "Anawiz",
    url: "https://www.anawiz.com/products/spectra-s1-hospital-grade-double-electric-breast-pump-with-rechargeable-battery-sps100?variant=32129930428548",
    img: "assets/img/spectra-s1.jpg",
    blurb: "Hospital-grade double electric pump with a rechargeable battery for pumping anywhere.",
  },
  {
    id: "boppy",
    name: "Boppy Nursing Pillow in Green Animal Sketches | 100% Polyester",
    brand: "Boppy",
    category: "Feeding",
    priority: "must", // "must" or "nice"
    price: "$49.99",
    store: "Babylist",
    url: "https://www.babylist.com/gp/boppy-nursing-pillow/70620/2351358",
    img: "assets/img/boppy.jpg",
    blurb: "The classic nursing pillow: supportive positioning for feeding time.",
  },
  {
    id: "avent-bottles",
    name: "Philips Avent Natural Baby Bottle Newborn Starter Gift Set",
    brand: "Philips AVENT",
    category: "Feeding",
    priority: "must", // "must" or "nice"
    price: "$48.19",
    store: "Babylist",
    url: "https://www.babylist.com/gp/philips-avent-natural-baby-bottle-newborn-starter-gift-set/24134/1006494",
    img: "assets/img/avent-bottles.jpg",
    blurb: "Newborn starter set with anti-colic nipples, easy to clean and assemble.",
  },
  {
    id: "graco-highchair",
    name: "Ready2Dine\u00ae 4-in-1 Highchair",
    brand: "Graco",
    category: "Feeding",
    priority: "nice", // "must" or "nice"
    price: "$99.99",
    store: "Graco",
    url: "https://www.gracobaby.com/shop/home-and-gear/high-chairs/ready2dine-4-in-1-highchair/SAP_2224047.html",
    img: "assets/img/graco-highchair.jpg",
    blurb: "Grows from infant recline to toddler booster, one chair for every stage.",
  },
  {
    id: "ubbi-pail",
    name: "Ubbi Stainless Steel Diaper Pail - Grey",
    brand: "Ubbi",
    category: "Diapering",
    priority: "must", // "must" or "nice"
    price: "$79.99",
    store: "Albee Baby",
    url: "https://www.albeebaby.com/products/ubbi-diaper-pail-grey?variant=49935523315943",
    img: "assets/img/ubbi-pail.jpg",
    blurb: "Steel body locks in odors and uses regular trash bags, no pricey refills.",
  },
  {
    id: "huggies-wipes",
    name: "Huggies Natural Care Refreshing Baby Wipes - Scented, 17 Pack/1088 ct",
    brand: "Huggies",
    category: "Diapering",
    priority: "must", // "must" or "nice"
    price: "$26.99",
    store: "BJ's Wholesale Club",
    url: "https://www.bjs.com/product/huggies-natural-care-refreshing-baby-wipes---scented-17-pk1088-ct/3000000000002312253/?trc=pdso%7Cfbad%7Cdpa%7Comni%7Coeg%7Cbaby%7Cfb_%7B%7Bcampaign.id%7D%7D_%7B%7Badset.id%7D%7D_%7B%7Bad.id%7D%7D%7Cna.",
    img: "assets/img/huggies-wipes.jpg",
    blurb: "A bulk box of gentle wipes to get us through the first months.",
  },
  {
    id: "keekaroo",
    name: "Keekaroo Peanut Changer",
    brand: "Keekaroo",
    category: "Diapering",
    priority: "nice", // "must" or "nice"
    price: "$149.95",
    store: "Babinski's",
    url: "https://babinskis.com/products/keekaroo-peanut-changer?variant=40962353594429",
    img: "assets/img/keekaroo.jpg",
    blurb: "Waterproof, wipeable changer, no extra covers or laundry needed.",
  },
  {
    id: "fp-tub",
    name: "Fisher-Price 4-in-1 Sling 'n Seat Tub | by Fleet Farm",
    brand: "Fisher-Price",
    category: "Bath & Health",
    priority: "must", // "must" or "nice"
    price: "$29.10",
    store: "Fleet Farm",
    url: "https://www.fleetfarm.com/detail/fisher-price-4-in-1-sling-n-seat-tub/0000101801891?Ntt=101801891",
    img: "assets/img/fp-tub.jpg",
    blurb: "Four stages from newborn sling to toddler tub in one compact footprint.",
  },
  {
    id: "burts-towels",
    name: "Burt's Bees Baby Organic Hooded Towels (2-Pack) in Little Ducks",
    brand: "Burt's Bees Baby",
    category: "Bath & Health",
    priority: "nice", // "must" or "nice"
    price: "$29.95",
    store: "Babylist",
    url: "https://www.babylist.com/gp/burt-s-bees-baby-organic-hooded-towels-2-pack/14450/230642",
    img: "assets/img/burts-towels.jpg",
    blurb: "Organic cotton hooded towels, soft and absorbent after bath time.",
  },
  {
    id: "frida-thermometer",
    name: "Frida Baby 3-in-1 Ear and Forehead Infrared Thermometer",
    brand: "Frida",
    category: "Bath & Health",
    priority: "must", // "must" or "nice"
    price: "$31.99",
    store: "Target",
    url: "https://www.target.com/p/frida-baby-3-in-1-ear-and-forehead-infrared-thermometer/-/A-80562700",
    img: "assets/img/frida-thermometer.jpg",
    blurb: "Quick ear, forehead, and touchless readings for middle-of-the-night checks.",
  },
  {
    id: "carters-onesies",
    name: "Carter's Baby Unisex 5-Pack Bodysuits",
    brand: "Carter's",
    category: "Clothing",
    priority: "must", // "must" or "nice"
    price: "$24.99",
    store: "CookiesKids",
    url: "https://www.cookieskids.com/Product.aspx?l=00170062006102200000&p=CTR07100&c=WHI&s=0006M&a=FacebookFeed",
    img: "assets/img/carters-onesies.jpg",
    blurb: "Everyday bodysuits in soft cotton, the unofficial newborn uniform.",
  },
  {
    id: "fp-gym",
    name: "Fisher Price - Glow & Grow Kick & Play Gym, Blue",
    brand: null,
    category: "Play",
    priority: "nice", // "must" or "nice"
    price: "$59.99",
    store: "MacroBaby",
    url: "https://www.macrobaby.com/products/fisher-price-glow-grow-kick-play-gym-blue?variant=43094643867707",
    img: "assets/img/fp-gym.jpg",
    blurb: "Kick-and-play piano gym for tummy time, batting practice, and first music lessons.",
  },
  {
    id: "bed-rail",
    name: "Regalo Swing down Bed Guard Rail XL - White",
    brand: "Regalo",
    category: "Nursery",
    priority: "must", // "must" or "nice"
    price: "$34.99",
    store: "Target",
    url: "https://www.target.com/p/regalo-swing-down-bed-guard-rail-xl-white/-/A-94919917",
    img: "assets/img/bed-rail.jpg",
    blurb: "Extra-long swing-down rail for the bed, so Vyom can sleep safely right beside us.",
  },
  {
    id: "nursing-glider",
    name: "daVinci Piper Recliner and Swivel Glider - Pine Green",
    brand: "DaVinci",
    category: "Nursery",
    priority: "must", // "must" or "nice"
    price: "$349",
    store: "Target",
    url: "https://www.target.com/p/davinci-piper-recliner-and-swivel-glider-pine-green/-/A-1007124742",
    img: "assets/img/nursing-glider.jpg",
    blurb: "A proper reclining glider for late-night feeds, with smooth swivel and lumbar support.",
  },
  {
    id: "video-monitor",
    name: "Infant Optics Digital Video Monitor DXR-8 Pro",
    brand: "Infant Optics",
    category: "Nursery",
    priority: "must", // "must" or "nice"
    price: "$199.99",
    store: "Target",
    url: "https://www.target.com/p/infant-optics-digital-video-monitor-dxr-8-pro/-/A-80641472",
    img: "assets/img/video-monitor.jpg",
    blurb: "A dedicated video monitor with a 5-inch screen, no WiFi or app needed.",
  },
  {
    id: "big-playpen",
    name: "SKYSHALO Extra Large Baby Playpen, 78.7 x 70.3 in.",
    brand: "SKYSHALO",
    category: "Play",
    priority: "nice", // "must" or "nice"
    price: "$65.99",
    store: "Home Depot",
    url: "https://www.homedepot.com/p/SKYSHALO-Baby-Playpen-78-7-x-70-3-in-Extra-Large-Playpen-for-Babies-Toddlers-Indoor-Outdoor-Baby-Fence-Play-Yard-YYEWSHLBYYEWGT104001V0-250915/338697786",
    img: "assets/img/big-playpen.jpg",
    blurb: "Extra-large foldable play yard, roomy enough for Vyom to crawl around and for a parent to climb in too.",
  },
  {
    id: "bottle-washer",
    name: "Momcozy KleanPal Pro Baby Bottle Washer and Sterilizer in Sage",
    brand: "Momcozy",
    category: "Feeding",
    priority: "nice", // "must" or "nice"
    price: "$299.99",
    store: "Babylist",
    url: "https://www.babylist.com/gp/momcozy-kleanpal-pro-baby-bottle-washer-and-sterilizer-1730408600/66759/2233069",
    img: "assets/img/bottle-washer.jpg",
    blurb: "Washes, sterilizes, and dries bottles and pump parts in one go, a real time saver.",
  },
  {
    id: "washer-detergent",
    name: "Washing Block for KleanPal Pro Bottle Washer, 120 Tablets",
    brand: "Momcozy",
    category: "Feeding",
    priority: "must", // "must" or "nice"
    price: "$19.99",
    store: "Momcozy",
    url: "https://momcozy.com/products/washing-block-for-kleanpal-pro-bottle-washer-120-tablets?variant=44586759880902",
    img: "assets/img/washer-detergent.jpg",
    blurb: "The matching cleaning tablets that keep the bottle washer running.",
  },
  {
    id: "pampers-newborn",
    name: "Pampers Swaddlers Diapers, Size N, 84 ct | CVS",
    brand: "Pampers",
    category: "Diapering",
    priority: "must", // "must" or "nice"
    price: "$39.59",
    store: "CVS",
    url: "https://www.cvs.com/shop/pampers-swaddlers-diapers-prodid-1010438?cid=sm_fos_feed",
    img: "assets/img/pampers-newborn.jpg",
    blurb: "A big box of newborn diapers to start the stash. Sizes 1 and up are welcome too.",
  },
  {
    id: "sudocrem",
    name: "Sudocrem Antiseptic Healing Cream 250g",
    brand: "Sudocrem",
    category: "Diapering",
    priority: "must", // "must" or "nice"
    price: "$18.99",
    store: "Taste of Britain",
    url: "https://www.tasteofbritain.com/products/sudocrem-250g?variant=40455298449463",
    img: "assets/img/sudocrem.jpg",
    blurb: "Your pick over Desitin: the classic antiseptic healing cream for diaper rash and irritated skin.",
  },
  {
    id: "nosefrida-kit",
    name: "NoseFrida Nasal Aspirator Saline Kit",
    brand: null,
    category: "Bath & Health",
    priority: "must", // "must" or "nice"
    price: "$20.99",
    store: "Crib & Kids",
    url: "https://cribandkids.com/products/fridababy-nosefrida-saline-kit?variant=31833033834582",
    img: "assets/img/nosefrida-kit.jpg",
    blurb: "Clears tiny congested noses fast, with saline spray included.",
  },
  {
    id: "diaper-bag",
    name: "Skip Hop Forma Backpack Diaper Bag - Navy",
    brand: "Skip Hop",
    category: "Travel",
    priority: "must", // "must" or "nice"
    price: "$79",
    store: "Carter's",
    url: "https://www.carters.com/p/forma-backpack-diaper-bag-navy/194133669187",
    img: "assets/img/diaper-bag.jpg",
    blurb: "A backpack-style bag that fits bottles, diapers, and a change of clothes.",
  },
  {
    id: "milk-bags",
    name: "Lansinoh - Milk Storage Bag, 25Ct",
    brand: "Lansinoh",
    category: "Feeding",
    priority: "nice", // "must" or "nice"
    price: "$8.99",
    store: "MacroBaby",
    url: "https://www.macrobaby.com/products/lansinoh-milk-storage-bags-25-count?variant=39711940608059",
    img: "assets/img/milk-bags.jpg",
    blurb: "Leak-proof bags for pumped milk, a perfect partner to the Spectra pump.",
  },
  {
    id: "humidifier",
    name: "MistAire\u2122 Studio Ultrasonic Cool Mist Humidifier",
    brand: "Pure Enrichment",
    category: "Nursery",
    priority: "nice", // "must" or "nice"
    price: "$32.99",
    store: "Pure Enrichment",
    url: "https://pureenrichment.com/products/mistaire-studio-ultrasonic-cool-mist-humidifier-for-small-rooms?variant=14891559944244",
    img: "assets/img/humidifier.jpg",
    blurb: "Gentle cool mist for dry winter air, quiet enough for the nursery.",
  },
  {
    id: "car-mirror",
    name: "Back Seat Baby Car Mirror Ladybug",
    brand: null,
    category: "Travel",
    priority: "nice", // "must" or "nice"
    price: "$19.99",
    store: "LulyBoo",
    url: "https://lulyboo.com/products/back-seat-baby-car-mirror-ladybug?variant=49905080664301",
    img: "assets/img/car-mirror.jpg",
    blurb: "Lets the driver see Vyom in his rear-facing seat at a glance.",
  },
  {
    id: "halo-sleepsack",
    name: "Halo SleepSack Swaddle Cotton in Forest Friends Size Newborn | 100% Cotton",
    brand: "HALO",
    category: "Nursery",
    priority: "must", // "must" or "nice"
    price: "$34.95",
    store: "Babylist",
    url: "https://www.babylist.com/gp/halo-sleepsack-swaddle-cotton/2204/1699370",
    img: "assets/img/halo-sleepsack.jpg",
    blurb: "A wearable blanket that keeps Vyom snug and safe without loose blankets in the bed.",
  },
  {
    id: "lanolin",
    name: "Lansinoh Lanolin Nipple Ointment",
    brand: null,
    category: "Feeding",
    priority: "nice", // "must" or "nice"
    price: "$10.99",
    store: "Simply Birth",
    url: "https://simplybirth.com/products/lansinoh-nipple-lanolin?variant=1238136956",
    img: "assets/img/lanolin.jpg",
    blurb: "Soothes and protects sore nipples in the early breastfeeding days.",
  },
  {
    id: "giftcard-amazon",
    name: "Amazon Gift Card",
    brand: null,
    category: "Gift Cards",
    priority: "nice", // "must" or "nice"
    price: "Any amount",
    store: "Amazon",
    url: "https://www.amazon.com/gift-cards/",
    giftCard: true,
    blurb: "Any amount from $5 up, delivered by email. Lets us pick exactly what Vyom needs, when he needs it.",
  },
  {
    id: "giftcard-target",
    name: "Target Gift Card",
    brand: null,
    category: "Gift Cards",
    priority: "nice", // "must" or "nice"
    price: "Any amount",
    store: "Target",
    url: "https://www.target.com/c/gift-cards/-/N-5xsxu?type=products",
    giftCard: true,
    blurb: "Any amount from $5 up. Perfect for diapers, wipes, and all the little things that add up.",
  },
  {
    id: "giftcard-walmart",
    name: "Walmart Gift Card",
    brand: null,
    category: "Gift Cards",
    priority: "nice", // "must" or "nice"
    price: "Any amount",
    store: "Walmart",
    url: "https://www.walmart.com/cp/gift-cards/96835",
    giftCard: true,
    blurb: "Any amount, usable in store and online. Great for everyday baby essentials at low prices.",
  },
  {
    id: "giftcard-doordash",
    name: "DoorDash Gift Card",
    brand: null,
    category: "Gift Cards",
    priority: "nice", // "must" or "nice"
    price: "Any amount",
    store: "DoorDash",
    url: "https://www.doordash.com/gift-cards/",
    giftCard: true,
    blurb: "Food delivery for the beautiful, exhausting first weeks. They even have a baby shower design.",
  },
];
