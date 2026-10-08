// Syncs Babylist purchase status into babylist-purchased.json.
// Run via sync-babylist.sh (every 2h cron). Exits non-zero on fetch failure
// WITHOUT touching the file, so a bad run never wipes known state.
//
// How it works: Babylist's registry items load from a public JSON API
// (no login needed). Each item has is_reserved=true once fully purchased.
// We map Babylist titles to our ITEMS ids and record the purchased ones.
// The site loads babylist-purchased.json and shows those cards as purchased.

import { writeFileSync, readFileSync, existsSync } from "fs";

const REGISTRY_UUID = "FC87C487-D435-49DA-B2AA-368E40258CF2"; // Bini's Baby Registry
const API = `https://www.babylist.com/api/v3/registries/${REGISTRY_UUID}/reg_items/minimal`;

// Our ITEMS id -> exact Babylist title. newton-bassinet is intentionally absent:
// it is on our site but not on the Babylist registry.
const TITLE_MAP = {
  "washer-detergent": "Washing Block for Momcozy Bottle Washer, 120 Tablets",
  "milk-bags": "Lansinoh - Milk Storage Bag, 25Ct",
  "graco-highchair": "Ready2Dine® DLX 4-in-1 Highchair",
  "lanolin": "Lansinoh Lanolin Nipple Ointment",
  "avent-nipples": "Philips Avent Natural Response Nipples (4 Pack) - Level 1",
  "avent-bottles-4oz": "Philips Avent Natural Baby Bottle with Natural Response Nipple - Blue, 4 Oz, 4",
  "bottle-washer": "Momcozy KleanPal Pro Baby Bottle Washer and Sterilizer - Sage",
  "avent-bottles": "Philips Avent Natural Baby Bottle Newborn Starter Gift Set",
  "boppy": "Boppy Nursing Pillow - Green Animal Sketches",
  "halo-sleepsack": "Halo SleepSack Swaddle Cotton - Forest Friends, Newborn",
  "video-monitor": "Infant Optics Digital Video Monitor DXR-8 Pro",
  "swaddles": "aden + anais essentials 4pk Cotton Muslin Swaddle Blankets - Sage Woodland",
  "hatch-rest": "Hatch Rest + 2nd Gen Sound Machine & Nightlight with Battery",
  "keekaroo": "Keekaroo Peanut Changer – Babinski's Baby",
  "ubbi-pail": "Ubbi Stainless Steel Diaper Pail - Grey",
  "diaper-bag": "Forma Backpack Diaper Bag - Navy - Skip Hop | Carter's",
  "sudocrem": "Sudocrem 250g",
  "car-mirror": "Back Seat Baby Car Mirror Ladybug – Lulyboo",
  "ergobaby-omni": "Ergobaby™ Omni Classic Baby Carrier",
  "big-playpen": "SKYSHALO Baby Playpen, 78.7 x 70.3 in. Extra Large Playpen for Babies Toddlers, Indoor/Outdoor Baby Fence Play Yard YYEWSHLBYYEWGT104001V0-250915",
  "bravo-trio": "Chicco - Bravo Trio Travel System Camden",
  "humidifier": "MistAire™ Studio Ultrasonic Cool Mist Humidifier",
  "frida-thermometer": "Frida Baby 3-in-1 Ear and Forehead Infrared Thermometer",
  "nosefrida-kit": "Nosefrida Saline Kit",
  "burts-towels": "Organic Hooded Towels (2-Pack) - Little Ducks",
  "fp-tub": "4-in-1 Sling 'n Seat Tub",
  "nursing-glider": "daVinci Piper Recliner and Swivel Glider - Pine Green",
  "carters-onesies": "Carter's Baby Unisex 5-Pack Bodysuits",
  "fp-gym": "Fisher Price - Glow & Grow Kick & Play Gym, Blue",
  "bed-rail": "Regalo Swing down Bed Guard Rail XL - White",
  "giftcard-amazon": "Amazon.com Gift Cards",
  "giftcard-target": "Bullseye Trio Target GiftCard $100",
  "giftcard-costco": "Costco Shop Card | Costco",
  "drbrowns-set": "Dr. Brown's Options+ Narrow Anti-Colic Baby Bottles + Happy Paci Set (3 Pack) - 4 Oz",
  "burp-cloths": "Burt's Bees Baby Organic Burp Cloth (5 Pack) - Cow",
  "changing-table": "Delta Children Scout Changing Table - Chestnut",
  "giftcard-babylist": "Babylist Shop Gift Card",
};

// Babylist titles intentionally not on our site: no unmapped warnings for these.
// (Baby Brezza washer removed from the site on 2026-10-05, duplicate bottle
// washer; kept the Momcozy KleanPal Pro instead.)
const IGNORED_TITLES = ["Baby Brezza Bottle Washer Pro - Charcoal"];

const norm = (s) =>
  s.toLowerCase().replace(/[®™|–—]/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

async function fetchItems() {
  const items = [];
  const limit = 100;
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API}?offset=${offset}&limit=${limit}`, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36",
      },
    });
    if (!res.ok) {
      console.error(`Babylist API failed: HTTP ${res.status}`);
      process.exit(1);
    }
    const page = await res.json();
    items.push(...page);
    if (page.length < limit) break;
    offset += limit;
  }
  return items;
}

const items = await fetchItems();
const byTitle = new Map(items.map((i) => [norm(i.title), i]));

const purchased = [];
const warnings = [];
for (const [ourId, blTitle] of Object.entries(TITLE_MAP)) {
  const item = byTitle.get(norm(blTitle));
  if (!item) {
    warnings.push(`NOT FOUND on Babylist (rename or removal?): ${ourId} <- "${blTitle}"`);
    continue;
  }
  if (item.is_reserved) purchased.push(ourId);
  if (item.quantity != null && item.quantity_needed != null && item.quantity !== item.quantity_needed) {
    warnings.push(`QUANTITY CHANGED for "${item.title}": quantity=${item.quantity} needed=${item.quantity_needed}`);
  }
}
const mappedTitles = new Set(
  [...Object.values(TITLE_MAP), ...IGNORED_TITLES].map(norm)
);
for (const i of items) {
  if (!mappedTitles.has(norm(i.title))) {
    warnings.push(`UNMAPPED Babylist item (new?): "${i.title}" reserved=${i.is_reserved}`);
  }
}

const out = { updated: new Date().toISOString(), purchased: purchased.sort() };

// Only write the file (and bump the timestamp) when the purchased list
// actually changed. Otherwise a fresh `updated` timestamp would make every
// 2h cron push a no-op commit.
let prevPurchased = null;
if (existsSync("babylist-purchased.json")) {
  try {
    prevPurchased = JSON.parse(readFileSync("babylist-purchased.json", "utf8")).purchased;
  } catch {
    prevPurchased = null;
  }
}
const same =
  Array.isArray(prevPurchased) &&
  prevPurchased.length === out.purchased.length &&
  prevPurchased.every((id, i) => id === out.purchased[i]);
if (same) {
  console.log(`ok: ${items.length} registry items, ${out.purchased.length} purchased (unchanged)`);
  for (const w of warnings) console.log("WARN:", w);
  process.exit(0);
}
writeFileSync("babylist-purchased.json", JSON.stringify(out, null, 2) + "\n");
console.log(`ok: ${items.length} registry items, ${out.purchased.length} purchased (changed)`);
for (const w of warnings) console.log("WARN:", w);
