/* ============================================================
   data.js — single source of truth for restaurant data.
   Swap this module later for API/CRM data without touching UI.
   ============================================================ */

export const RESTAURANT = {
  name: "Aashirwad Restaurant",
  nameDeva: "आशीर्वाद रेस्टोरेंट",
  type: "Pure Vegetarian Restaurant",
  tagline: "Fresh • Vegetarian • Family Dining",
  address: "Kharsia Rd, Dabhara, Chhattisgarh 495688",
  plusCode: "Q3MF+H5 Dabhara, Chhattisgarh",
  phoneDisplay: "095160 00901",
  phoneE164: "+919516000901",
  hours: { opens: "08:00", closes: "22:00" },
  hoursLabel: "08:00 AM – 10:00 PM",
  hoursShortLabel: "Closes 10:00 PM",
  priceRange: "₹200–₹400",
  timezone: "Asia/Kolkata",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Q3MF%2BH5%20Dabhara%2C%20Chhattisgarh",
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Q3MF%2BH5%20Dabhara%2C%20Chhattisgarh&z=15&output=embed",
  waUrl: "https://wa.me/919516000901",
  waTextUrl: "https://wa.me/919516000901?text=" + encodeURIComponent(
    "Hello Aashirwad Restaurant! 🙏 I found you on your website and would like to enquire."
  ),
};

/* ---------- Menu data ---------- */
/* image: real category photo | "svg:NAME": premium CSS/SVG artwork (clearly
   labelled "illustration" on the card when artwork is used) */
export const MENU_CATEGORIES = [
  { id: "all", label: "All", icon: "menu" },
  { id: "breakfast", label: "Breakfast", icon: "flame" },
  { id: "starters", label: "Starters", icon: "leaf" },
  { id: "tandoor", label: "Tandoor", icon: "flame" },
  { id: "soup", label: "Soup", icon: "cup" },
  { id: "pizza", label: "Pizza", icon: "star" },
  { id: "pasta", label: "Pasta", icon: "heart" },
  { id: "sandwich", label: "Sandwich", icon: "snow" },
  { id: "burger", label: "Burger", icon: "home" },
  { id: "drinks", label: "Drinks", icon: "cup" },
  { id: "lassi", label: "Lassi", icon: "cup" },
  { id: "mocktail", label: "Mocktail", icon: "sparkle" },
  { id: "shake", label: "Shake", icon: "star" },
];

const IMG = {
  breakfast: "assets/img/menu/breakfast.jpg",
  starters: "assets/img/menu/starters.jpg",
  tandoor: "assets/img/menu/tandoor.jpg",
  soup: "assets/img/menu/soup.jpg",
  pizza: "assets/img/menu/pizza.jpg",
  pasta: "assets/img/menu/pasta.jpg",
  sandwich: "assets/img/menu/sandwich.jpg",
  burger: "assets/img/menu/burger.jpg",
  drinks: "assets/img/menu/drinks.jpg",
  lassi: "assets/img/art/lassi.svg",
  mocktail: "assets/img/art/mocktail.svg",
  shake: "assets/img/art/shake.svg",
};

/* Beverage illustrations (artwork, not photographs) */
export const ARTWORK_IMG = {
  lassi: "assets/img/art/lassi.svg",
  mocktail: "assets/img/art/mocktail.svg",
  shake: "assets/img/art/shake.svg",
};

/* short, factual descriptions (no invented claims) */
const D = {
  breakfast: "Freshly made breakfast, served hot",
  starters: "Indo-Chinese and crispy starters",
  tandoor: "Tandoor-grilled paneer and kebabs",
  soup: "Warm soups, freshly prepared",
  pizza: "Oven-baked vegetarian pizzas",
  pasta: "Creamy and tangy pasta bowls",
  sandwich: "Grilled sandwiches and garlic bread",
  burger: "Crispy vegetarian burgers",
  drinks: "Tea, coffee and refreshments",
  lassi: "Thick, creamy sweet lassi",
  mocktail: "Chilled, refreshing mocktails",
  shake: "Thick and creamy milkshakes",
};

const items = (cat, rows) => rows.map(([name, price]) => ({ cat, name, price, img: IMG[cat] }));

export const MENU_ITEMS = [
  ...items("breakfast", [
    ["Chhole Bhature", 100], ["Puri Bhaji", 50], ["Poha", 30], ["Rosted Chana", 70],
    ["Koliwada Chana", 90], ["French Fries", 80], ["Peri-Peri French Fries", 100],
    ["Masala French Fries", 120], ["Idli Sambhar", 50], ["Fried Idli Sambhar", 70],
    ["Idli Vada Mix Sambhar", 50], ["Sambhar Vada", 50], ["Plain Dosa", 70],
    ["Masala Dosa", 80], ["Cheese Dosa", 120], ["Rava Masala Dosa", 120], ["Uttapam", 70],
    ["Cheese Paneer Uttapam", 110], ["Pav Bhaji", 70], ["Cheese Pav Bhaji", 90],
    ["Mushroom Pav Bhaji", 100], ["Paneer Pakoda", 80], ["Extra Pav", 20],
  ]),
  ...items("starters", [
    ["Crispy Corn Chilli / Crispy Corn", 180], ["Paneer Chilli Dry", 170],
    ["Paneer Manchurian", 200], ["Paneer Crispy Finger", 220], ["Paneer 65", 240],
    ["Paneer Hot Pan", 230], ["Paneer Hot Garlic", 220], ["Paneer Shatay", 220],
    ["Veg Manchurian", 170], ["Veg Crispy", 180], ["Mushroom Chilli", 180],
    ["Baby Corn Chilli", 170], ["Veg Pop", 180], ["Veg Bullets", 170], ["Veg 65", 170],
    ["Veg Hakka Noodles", 140], ["Veg Hong-Kong Noodles", 160],
    ["Triple Schezwan Noodles", 180], ["Triple Schezwan Fried Rice", 200],
    ["Veg Fried Rice", 120], ["Maxico Fried Rice", 140], ["Veg Chinese Special Platter", 220],
    ["Gobi Manchurian", 180], ["Veg Spring Roll", 220], ["Cheese Roll", 250],
    ["Paneer Dragon Roll", 200], ["Veg Sizzler", 509],
  ]),
  ...items("tandoor", [
    ["Chef Special Tandoori Platter", 500], ["Paneer Tikka", 250],
    ["Paneer Kurkure Tikka", 200], ["Paneer Hariyali Tikka", 210],
    ["Paneer Malai Tikka", 230], ["Paneer Pahadi Kebab", 220], ["Mushroom Tikka", 190],
    ["Cheese Corn Kabab", 220], ["Dahi Kabab", 170], ["Dahi Salay Kabab", 170],
    ["Hara Bhara Kabab", 220], ["Veg Kathi Roll", 190],
  ]),
  ...items("soup", [
    ["Veg Manchow", 100], ["Soure Soup", 110], ["Lemon Coriandar", 110],
    ["Cream of Tomato", 120], ["Sweet Corn", 100],
  ]),
  ...items("pizza", [
    ["Veg Cheese Pizza", 180], ["Margrita Pizza", 200], ["Double Cheese Pizza", 220],
    ["Maxican Pizza", 180], ["Paneer Tikka Pizza", 220], ["Cheese Corn Pizza", 180],
    ["Paneer Chilli Pizza", 240],
  ]),
  ...items("pasta", [
    ["White Sauce Pasta", 120], ["Red Sauce Pasta", 140], ["Peri-Peri with Cheese Pasta", 160],
  ]),
  ...items("sandwich", [
    ["Veg Grilled Sandwich", 110], ["Cheese Corn Sandwich", 110],
    ["Mumbai Masala Sandwich", 120], ["Cheese Garlic Bread", 130],
    ["Paneer Masala Sandwich", 130],
  ]),
  ...items("burger", [
    ["Veg Burger", 80], ["Paneer Burger", 100], ["Cheese Burger", 120],
  ]),
  ...items("drinks", [
    ["Mineral Water", 20], ["Tea", 10], ["Masala Tea", 20], ["Hot Coffee", 20],
    ["Cold Coffee", 80], ["Black Coffee", 30], ["Hot Milk", 40],
  ]),
  ...items("lassi", [
    ["Sweet Lassi", 60], ["Mango Lassi", 80], ["Rose Lassi", 80], ["Dry Fruit Lassi", 120],
  ]),
  ...items("mocktail", [
    ["Mashala Coldrink", 40], ["Fresh Lemon Soda", 40], ["Mint Mojito", 80],
    ["Blue Lagoon", 80], ["Pink Lady", 80], ["Pina Colada", 100],
  ]),
  ...items("shake", [
    ["Vanila Milk Shake", 90], ["Butterscotch Milk Shake", 100], ["Oreo Shake", 120],
    ["Mango Milk Shake", 120], ["Strawberry Milk Shake", 90], ["Chocolate Milk Shake", 150],
    ["Kitkat Shake", 180],
  ]),
].map((it) => ({ ...it, desc: D[it.cat] }));

/* ---------- Gallery ----------
   No real restaurant photographs were supplied, so the gallery uses
   clearly-labelled illustrative imagery only (AI-generated menu
   photography + SVG artwork) — never presented as real photos. */
export const GALLERY_ITEMS = [
  { img: "assets/img/hero-thali.jpg", title: "Vegetarian Thali", note: "Illustrative" },
  { img: "assets/img/menu/tandoor.jpg", title: "Tandoor Specials", note: "Illustrative" },
  { img: "assets/img/art/lassi.svg", title: "Sweet Lassi", note: "Illustration" },
  { img: "assets/img/menu/starters.jpg", title: "Indo-Chinese Starters", note: "Illustrative" },
  { img: "assets/img/menu/pizza.jpg", title: "Wood-Fired Pizza", note: "Illustrative" },
  { img: "assets/img/menu/breakfast.jpg", title: "Breakfast Specials", note: "Illustrative" },
  { img: "assets/img/art/mocktail.svg", title: "Mocktails", note: "Illustration" },
  { img: "assets/img/menu/sandwich.jpg", title: "Grilled Sandwiches", note: "Illustrative" },
  { img: "assets/img/art/shake.svg", title: "Milkshakes", note: "Illustration" },
];

export const HOURS_DAYS = [
  { key: 1, name: "Monday" }, { key: 2, name: "Tuesday" }, { key: 3, name: "Wednesday" },
  { key: 4, name: "Thursday" }, { key: 5, name: "Friday" }, { key: 6, name: "Saturday" },
  { key: 0, name: "Sunday" },
];

export const NAV_LINKS = [
  { id: "home", label: "Home", icon: "home" },
  { id: "about", label: "About", icon: "info" },
  { id: "menu", label: "Menu", icon: "menu" },
  { id: "gallery", label: "Gallery", icon: "image" },
  { id: "reviews", label: "Reviews", icon: "review" },
  { id: "hours", label: "Hours", icon: "clock" },
  { id: "contact", label: "Contact", icon: "call" },
  { id: "location", label: "Location", icon: "mapPin" },
];

/* Categories that carry no real photograph → artwork illustrations */
export const ARTWORK_CATS = ["lassi", "mocktail", "shake"];

/* ---------- Enquiry state (UI-only, future backend hook) ---------- */
export const enquiryState = { list: [] };

export function addEnquiry(item) {
  const existing = enquiryState.list.find((e) => e.cat === item.cat && e.name === item.name);
  if (existing) existing.qty += 1;
  else enquiryState.list.push({ cat: item.cat, name: item.name, price: item.price, qty: 1 });
}

export function clearEnquiry() { enquiryState.list.length = 0; }
