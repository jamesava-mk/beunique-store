import museDress from "../assets/products/muse-dress.jpeg";
import motionSet from "../assets/products/motion-set.jpeg";
import pulseMini from "../assets/products/pulse-mini.jpeg";
import afterDark from "../assets/products/after-dark.jpeg";
import electricSet from "../assets/products/electric-set.jpeg";
import cityGirl from "../assets/products/city-girl.jpeg";

/*
|--------------------------------------------------------------------------
| IMAGE HELPER
|--------------------------------------------------------------------------
*/

const image = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`;

/*
|--------------------------------------------------------------------------
| PRODUCT RULE
|--------------------------------------------------------------------------
|
| ONE PRODUCT = ONE PHYSICAL ITEM.
|
| images[] contains different photographs of THAT SAME ITEM.
|
| We do NOT use:
|
|   photo A = product 1
|   photo B = product 2
|   photo C = product 3
|
| when A, B and C are actually the same garment/shoot.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| ORIGINAL BEUNIQUE PRODUCTS
|--------------------------------------------------------------------------
*/

const originalProducts = [
  {
    id: 1,
    name: "Muse Dress",
    price: 45000,
    category: "Dresses",
    subcategory: "Long",
    image: museDress,
    images: [museDress],
    sizes: ["S", "M", "L", "XL"],
    stock: 8,
    badge: "New",
    description:
      "A full-length statement dress with a clean silhouette designed to carry the look on its own.",
    details: [
      "Full-length silhouette.",
      "Designed for occasion and evening styling.",
      "Please check the size guide before ordering.",
    ],
  },

  {
    id: 2,
    name: "Motion Set",
    price: 52000,
    category: "Two Piece",
    subcategory: "Set",
    image: motionSet,
    images: [motionSet],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: "New",
    description:
      "A coordinated two-piece outfit designed to give you a complete look without overthinking the styling.",
    details: [
      "Matching two-piece design.",
      "Pieces can be styled together or separately.",
      "Please check the size guide before ordering.",
    ],
  },

  {
    id: 3,
    name: "Pulse Mini",
    price: 38000,
    category: "Dresses",
    subcategory: "Mini",
    image: pulseMini,
    images: [pulseMini],
    sizes: ["S", "M", "L", "XL"],
    stock: 0,
    badge: "Sold Out",
    description:
      "A sharp mini silhouette designed for nights out and statement styling.",
    details: [
      "Mini-length silhouette.",
      "Designed for evening and night-out styling.",
      "Currently unavailable.",
    ],
  },

  {
    id: 4,
    name: "After Dark Dress",
    price: 48000,
    category: "Dresses",
    subcategory: "Evening",
    image: afterDark,
    images: [afterDark],
    sizes: ["S", "M", "L", "XL"],
    stock: 3,
    badge: null,
    description:
      "An evening-focused dress with a confident silhouette for dinners, parties and nights out.",
    details: [
      "Evening silhouette.",
      "Designed for dressed-up occasions.",
      "Please check the size guide before ordering.",
    ],
  },

  {
    id: 5,
    name: "Electric Set",
    price: 55000,
    category: "Two Piece",
    subcategory: "Set",
    image: electricSet,
    images: [electricSet],
    sizes: ["S", "M", "L", "XL"],
    stock: 6,
    badge: "New",
    description:
      "A statement coordinated set designed to make the outfit feel complete from the moment you put it on.",
    details: [
      "Matching two-piece design.",
      "Can be styled together or separately.",
      "Please check the size guide before ordering.",
    ],
  },

  {
    id: 6,
    name: "City Girl Mini",
    price: 35000,
    category: "Dresses",
    subcategory: "Mini",
    image: cityGirl,
    images: [cityGirl],
    sizes: ["S", "M", "L", "XL"],
    stock: 0,
    badge: "Sold Out",
    description:
      "A compact everyday mini designed for city days, spontaneous plans and nights out.",
    details: [
      "Mini-length silhouette.",
      "Designed for easy everyday styling.",
      "Currently unavailable.",
    ],
  },
];

/*
|--------------------------------------------------------------------------
| VERIFIED PRODUCT GALLERY EXAMPLE
|--------------------------------------------------------------------------
|
| These are deliberately grouped as ONE product rather than being turned
| into several fake products.
|
| The important part is the data structure:
|
| images: [
|   front,
|   second angle,
|   third angle,
| ]
|
| Product.jsx automatically turns this into the gallery.
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| DRESSES
|--------------------------------------------------------------------------
*/

const dresses = [
  {
    id: 7,
    name: "Floral Long Sleeve Dress",
    price: 42000,
    category: "Dresses",
    subcategory: "Long",
    image: image(17384017),
    images: [image(17384017)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A feminine long-sleeve dress with a relaxed silhouette and an easy romantic feel.",
  },

  {
    id: 8,
    name: "Black Bodycon Dress",
    price: 39000,
    category: "Dresses",
    subcategory: "Bodycon",
    image: image(20238937),
    images: [image(20238937)],
    sizes: ["S", "M", "L", "XL"],
    stock: 4,
    badge: null,
    description:
      "A fitted black silhouette designed for a clean, confident evening look.",
  },

  {
    id: 9,
    name: "Gold Mini Dress",
    price: 46000,
    category: "Dresses",
    subcategory: "Mini",
    image: image(22686592),
    images: [image(22686592)],
    sizes: ["S", "M", "L", "XL"],
    stock: 3,
    badge: "New",
    description:
      "A statement mini designed for parties, celebrations and nights that call for something extra.",
  },

  {
    id: 10,
    name: "Wrap Dress",
    price: 41000,
    category: "Dresses",
    subcategory: "Wrap",
    image: image(16708746),
    images: [image(16708746)],
    sizes: ["S", "M", "L", "XL"],
    stock: 6,
    badge: null,
    description:
      "A versatile wrap silhouette with an effortless shape that works from day into evening.",
  },

  {
    id: 11,
    name: "Black Maxi Dress",
    price: 47000,
    category: "Dresses",
    subcategory: "Maxi",
    image: image(16182889),
    images: [image(16182889)],
    sizes: ["S", "M", "L", "XL"],
    stock: 4,
    badge: null,
    description:
      "A floor-length black silhouette for understated evening dressing.",
  },

  {
    id: 12,
    name: "Blue Maxi Dress",
    price: 45000,
    category: "Dresses",
    subcategory: "Maxi",
    image: image(14452577),
    images: [image(14452577)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A flowing maxi silhouette that brings an easy, polished finish to occasion dressing.",
  },

  {
    id: 13,
    name: "Evening Column Dress",
    price: 49000,
    category: "Dresses",
    subcategory: "Evening",
    image: image(12498324),
    images: [image(12498324)],
    sizes: ["S", "M", "L", "XL"],
    stock: 3,
    badge: "New",
    description:
      "A refined evening silhouette designed for dinners, celebrations and formal plans.",
  },

  {
    id: 14,
    name: "Blue Printed Dress",
    price: 43000,
    category: "Dresses",
    subcategory: "Midi",
    image: image(20396508),
    images: [image(20396508)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A printed dress with a relaxed fashion-forward silhouette for everyday occasions.",
  },

  {
    id: 15,
    name: "Red Dress",
    price: 44000,
    category: "Dresses",
    subcategory: "Midi",
    image: image(36167362),
    images: [image(36167362)],
    sizes: ["S", "M", "L", "XL"],
    stock: 4,
    badge: null,
    description:
      "A confident red silhouette designed to make a simple outfit feel immediately more expressive.",
  },

  {
    id: 16,
    name: "Green Dress",
    price: 42000,
    category: "Dresses",
    subcategory: "Midi",
    image: image(9927053),
    images: [image(9927053)],
    sizes: ["S", "M", "L", "XL"],
    stock: 6,
    badge: null,
    description:
      "A polished green dress designed for easy styling across casual and dressed-up occasions.",
  },
];

/*
|--------------------------------------------------------------------------
| TWO PIECE
|--------------------------------------------------------------------------
*/

const twoPiece = [
  {
    id: 17,
    name: "Printed Matching Set",
    price: 52000,
    category: "Two Piece",
    subcategory: "Set",
    image: image(33339928),
    images: [image(33339928)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: "New",
    description:
      "A coordinated printed set that gives you a complete outfit while keeping the styling effortless.",
  },

  {
    id: 18,
    name: "Black and White Co-ord",
    price: 50000,
    category: "Two Piece",
    subcategory: "Set",
    image: image(8205479),
    images: [image(8205479)],
    sizes: ["S", "M", "L", "XL"],
    stock: 4,
    badge: null,
    description:
      "A contrasting matching set designed for a sharper, more graphic wardrobe moment.",
  },

  {
    id: 19,
    name: "Blue Matching Set",
    price: 51000,
    category: "Two Piece",
    subcategory: "Set",
    image: image(16934403),
    images: [image(16934403)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A coordinated blue set designed for polished daytime dressing and easy styling.",
  },

  {
    id: 20,
    name: "Orange Matching Set",
    price: 49000,
    category: "Two Piece",
    subcategory: "Set",
    image: image(13491626),
    images: [image(13491626)],
    sizes: ["S", "M", "L", "XL"],
    stock: 4,
    badge: "New",
    description:
      "A bold coordinated set designed to bring colour and personality to the wardrobe.",
  },

  /*
   * ONE PRODUCT.
   *
   * These are kept together rather than becoming:
   *
   * Orange Set 01
   * Orange Set 02
   * Orange Set 03
   *
   * The UI will cycle through these photographs.
   */
  {
    id: 21,
    name: "Orange Two-Piece Set",
    price: 53000,
    category: "Two Piece",
    subcategory: "Set",
    image: image(15661633),
    images: [
      image(15661633),
      image(15661634),
      image(15661635),
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: "New",
    description:
      "A coordinated orange two-piece with a complete silhouette designed for confident styling.",
    details: [
      "Matching two-piece silhouette.",
      "Multiple product views available.",
      "Please check the size guide before ordering.",
    ],
  },

  {
    id: 22,
    name: "White Matching Set",
    price: 51000,
    category: "Two Piece",
    subcategory: "Set",
    image: image(20639748),
    images: [image(20639748)],
    sizes: ["S", "M", "L", "XL"],
    stock: 6,
    badge: null,
    description:
      "A clean coordinated set designed around simple, polished styling.",
  },

  {
    id: 23,
    name: "Crop Top and Skirt Set",
    price: 48000,
    category: "Two Piece",
    subcategory: "Set",
    image: image(6896429),
    images: [image(6896429)],
    sizes: ["S", "M", "L", "XL"],
    stock: 4,
    badge: null,
    description:
      "A coordinated crop-top and skirt combination designed for a confident fashion-forward look.",
  },

  {
    id: 24,
    name: "Pink Matching Set",
    price: 50000,
    category: "Two Piece",
    subcategory: "Set",
    image: image(16116787),
    images: [image(16116787)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A feminine coordinated set designed to make styling simple and expressive.",
  },
];

/*
|--------------------------------------------------------------------------
| TOPS
|--------------------------------------------------------------------------
*/

const tops = [
  {
    id: 25,
    name: "White Blouse",
    price: 22000,
    category: "Tops",
    subcategory: "Blouse",
    image: image(29090983),
    images: [image(29090983)],
    sizes: ["S", "M", "L", "XL"],
    stock: 7,
    badge: "New",
    description:
      "A clean white blouse designed to pair easily with denim, skirts and tailored bottoms.",
  },

  {
    id: 26,
    name: "Structured White Blouse",
    price: 24000,
    category: "Tops",
    subcategory: "Blouse",
    image: image(26934505),
    images: [image(26934505)],
    sizes: ["S", "M", "L", "XL"],
    stock: 6,
    badge: null,
    description:
      "A polished blouse with a structured feel for sharper everyday outfits.",
  },

  {
    id: 27,
    name: "Soft White Blouse",
    price: 21000,
    category: "Tops",
    subcategory: "Blouse",
    image: image(20240790),
    images: [image(20240790)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A simple white blouse that keeps the outfit clean and versatile.",
  },

  {
    id: 28,
    name: "Classic White Top",
    price: 19000,
    category: "Tops",
    subcategory: "Top",
    image: image(16731189),
    images: [image(16731189)],
    sizes: ["S", "M", "L", "XL"],
    stock: 8,
    badge: null,
    description:
      "An everyday white top designed to become an easy wardrobe repeat.",
  },

  {
    id: 29,
    name: "White Tailored Blouse",
    price: 23000,
    category: "Tops",
    subcategory: "Blouse",
    image: image(13515063),
    images: [image(13515063)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A refined blouse silhouette designed for clean, elevated everyday dressing.",
  },

  {
    id: 30,
    name: "Blue Blouse",
    price: 22000,
    category: "Tops",
    subcategory: "Blouse",
    image: image(18000323),
    images: [image(18000323)],
    sizes: ["S", "M", "L", "XL"],
    stock: 6,
    badge: null,
    description:
      "A blue blouse that brings colour into simple everyday outfits without overwhelming them.",
  },

  {
    id: 31,
    name: "White Relaxed Blouse",
    price: 21000,
    category: "Tops",
    subcategory: "Blouse",
    image: image(19245171),
    images: [image(19245171)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A relaxed blouse designed for easy styling with denim and tailored pieces.",
  },

  {
    id: 32,
    name: "Minimal White Blouse",
    price: 22000,
    category: "Tops",
    subcategory: "Blouse",
    image: image(34233883),
    images: [image(34233883)],
    sizes: ["S", "M", "L", "XL"],
    stock: 4,
    badge: null,
    description:
      "A minimal blouse silhouette designed around clean proportions and versatile styling.",
  },
];

/*
|--------------------------------------------------------------------------
| BOTTOMS
|--------------------------------------------------------------------------
*/

const bottoms = [
  {
    id: 33,
    name: "Black Trousers",
    price: 27000,
    category: "Bottoms",
    subcategory: "Trousers",
    image: image(3917675),
    images: [image(3917675)],
    sizes: ["S", "M", "L", "XL"],
    stock: 6,
    badge: null,
    description:
      "A clean black trouser silhouette designed for polished everyday and work-ready outfits.",
  },

  {
    id: 34,
    name: "Beige Trousers",
    price: 27000,
    category: "Bottoms",
    subcategory: "Trousers",
    image: image(27081006),
    images: [image(27081006)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A neutral trouser option designed to pair easily with lighter and darker wardrobe pieces.",
  },

  {
    id: 35,
    name: "Classic Blue Jeans",
    price: 28000,
    category: "Bottoms",
    subcategory: "Jeans",
    image: image(8182246),
    images: [image(8182246)],
    sizes: ["S", "M", "L", "XL"],
    stock: 7,
    badge: null,
    description:
      "A classic denim staple designed for everyday rotation.",
  },

  {
    id: 36,
    name: "Light Blue Jeans",
    price: 28000,
    category: "Bottoms",
    subcategory: "Jeans",
    image: image(17428639),
    images: [image(17428639)],
    sizes: ["S", "M", "L", "XL"],
    stock: 6,
    badge: null,
    description:
      "A lighter denim option for relaxed everyday styling.",
  },

  {
    id: 37,
    name: "Denim Midi Skirt",
    price: 25000,
    category: "Bottoms",
    subcategory: "Skirts",
    image: image(11599617),
    images: [image(11599617)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A denim skirt designed to bring an easy casual edge to everyday outfits.",
  },

  {
    id: 38,
    name: "Black Shorts",
    price: 20000,
    category: "Bottoms",
    subcategory: "Shorts",
    image: image(7516614),
    images: [image(7516614)],
    sizes: ["S", "M", "L", "XL"],
    stock: 6,
    badge: null,
    description:
      "A clean black shorts silhouette for warm-weather and relaxed styling.",
  },

  {
    id: 39,
    name: "Black Skirt",
    price: 24000,
    category: "Bottoms",
    subcategory: "Skirts",
    image: image(14844564),
    images: [image(14844564)],
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    badge: null,
    description:
      "A versatile black skirt designed to work with simple tops and statement pieces alike.",
  },
];

/*
|--------------------------------------------------------------------------
| BAGS
|--------------------------------------------------------------------------
*/

const bags = [
  {
    id: 40,
    name: "Black Mini Handbag",
    price: 28000,
    category: "Bags",
    subcategory: "Mini Bag",
    image: image(15320823),
    images: [image(15320823)],
    sizes: ["One Size"],
    stock: 4,
    badge: "New",
    description:
      "A compact black handbag designed for evenings and minimal everyday looks.",
  },

  {
    id: 41,
    name: "Black Handbag",
    price: 32000,
    category: "Bags",
    subcategory: "Handbag",
    image: image(22819835),
    images: [image(22819835)],
    sizes: ["One Size"],
    stock: 5,
    badge: null,
    description:
      "A classic black handbag designed to work across casual and dressed outfits.",
  },

  {
    id: 42,
    name: "Black Handbag Lagos",
    price: 34000,
    category: "Bags",
    subcategory: "Handbag",
    image: image(36508713),
    images: [image(36508713)],
    sizes: ["One Size"],
    stock: 4,
    badge: null,
    description:
      "A polished black handbag selected for versatile everyday styling.",
  },

  {
    id: 43,
    name: "Leather Handbag",
    price: 36000,
    category: "Bags",
    subcategory: "Handbag",
    image: image(29060913),
    images: [image(29060913)],
    sizes: ["One Size"],
    stock: 3,
    badge: null,
    description:
      "A leather handbag with a classic silhouette designed to anchor everyday outfits.",
  },

  {
    id: 44,
    name: "Structured Black Bag",
    price: 33000,
    category: "Bags",
    subcategory: "Handbag",
    image: image(22819862),
    images: [image(22819862)],
    sizes: ["One Size"],
    stock: 5,
    badge: null,
    description:
      "A structured black bag designed for clean, polished styling.",
  },
];

/*
|--------------------------------------------------------------------------
| ACCESSORIES
|--------------------------------------------------------------------------
*/

const accessories = [
  {
    id: 45,
    name: "Gold Statement Accessory",
    price: 12000,
    category: "Accessories",
    subcategory: "Jewellery",
    image: image(6716444),
    images: [image(6716444)],
    sizes: ["One Size"],
    stock: 7,
    badge: null,
    description:
      "A statement finishing piece designed to add a polished detail to simple outfits.",
  },

  {
    id: 46,
    name: "Gold Minimal Accessory",
    price: 10000,
    category: "Accessories",
    subcategory: "Jewellery",
    image: image(12753202),
    images: [image(12753202)],
    sizes: ["One Size"],
    stock: 8,
    badge: null,
    description:
      "A minimal accessory designed for understated everyday styling.",
  },

  {
    id: 47,
    name: "Gold Chain Detail",
    price: 11000,
    category: "Accessories",
    subcategory: "Jewellery",
    image: image(6716445),
    images: [image(6716445)],
    sizes: ["One Size"],
    stock: 6,
    badge: null,
    description:
      "A simple chain-style accessory designed to finish both casual and dressed looks.",
  },

  {
    id: 48,
    name: "Statement Fashion Accessory",
    price: 13000,
    category: "Accessories",
    subcategory: "Jewellery",
    image: image(29013500),
    images: [image(29013500)],
    sizes: ["One Size"],
    stock: 5,
    badge: null,
    description:
      "A stronger statement accessory for adding personality to a minimal outfit.",
  },

  {
    id: 49,
    name: "Classic Fashion Accessory",
    price: 10000,
    category: "Accessories",
    subcategory: "Jewellery",
    image: image(28900494),
    images: [image(28900494)],
    sizes: ["One Size"],
    stock: 7,
    badge: null,
    description:
      "A classic finishing piece designed to work across multiple outfits.",
  },
];

/*
|--------------------------------------------------------------------------
| FINAL CATALOGUE
|--------------------------------------------------------------------------
*/

export const products = [
  ...originalProducts,
  ...dresses,
  ...twoPiece,
  ...tops,
  ...bottoms,
  ...bags,
  ...accessories,
];

export const categories = [
  "All",
  "Dresses",
  "Two Piece",
  "Tops",
  "Bottoms",
  "Bags",
  "Accessories",
];

export default products;