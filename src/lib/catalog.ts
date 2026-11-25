export type Product = {
  id: string;
  name: string;
  category: string;
  cuisine: string;
  description: string;
  price: number;
  pack: string;
  weightGrams: number;
  vegetarian: boolean;
  frozen: boolean;
  badge?: string;
  image: string;
  imagePosition?: string;
  ingredients?: string | null;
  nutrition?: {
    caloriesKcal: number;
    proteinGrams: number;
    carbohydratesGrams: number;
    fatGrams: number;
  } | null;
};

export const products: Product[] = [
  {
    id: "haryali-kebab",
    name: "Haryali kebab",
    category: "Kebabs",
    cuisine: "House special",
    description: "Herbs, a little char, and a lot of green goodness.",
    price: 325,
    pack: "500 g",
    weightGrams: 500,
    vegetarian: true,
    frozen: false,
    badge: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "chicken-tikka-chapata",
    name: "Chicken tikka chapata",
    category: "Kebabs",
    cuisine: "Mughlai",
    description: "Smoky, tender chicken tikka with a proper tandoori kick.",
    price: 500,
    pack: "500 g",
    weightGrams: 500,
    vegetarian: false,
    frozen: false,
    badge: "Customer favourite",
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "awadhi-shammi",
    name: "Awadhi shammi mutton",
    category: "Kebabs",
    cuisine: "Lucknowi",
    description: "A classic Lucknowi-style kebab, soft in the middle and rich in flavour.",
    price: 900,
    pack: "500 g",
    weightGrams: 500,
    vegetarian: false,
    frozen: true,
    badge: "Freezer favourite",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "mini-veg-cutlets",
    name: "Mini veg cutlets",
    category: "Snacks",
    cuisine: "House special",
    description: "Crisp, bite-sized snacks made for sharing (or not).",
    price: 300,
    pack: "500 g",
    weightGrams: 500,
    vegetarian: true,
    frozen: true,
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "andhra-chicken-marinade",
    name: "Andhra chicken marinade",
    category: "Marinades",
    cuisine: "Andhra",
    description: "A bold, warming marinade with the unmistakable taste of Andhra.",
    price: 350,
    pack: "500 g",
    weightGrams: 500,
    vegetarian: false,
    frozen: false,
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "mughlai-chicken-curry",
    name: "Mughlai chicken curry",
    category: "Curries",
    cuisine: "Mughlai",
    description: "A comforting, slow-simmered favourite for the dinner table.",
    price: 475,
    pack: "500 g",
    weightGrams: 500,
    vegetarian: false,
    frozen: false,
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "bhutta-kebab",
    name: "Bhutta kebab",
    category: "Kebabs",
    cuisine: "House special",
    description: "Sweet corn, warm spices and a golden, satisfying bite.",
    price: 325,
    pack: "500 g",
    weightGrams: 500,
    vegetarian: true,
    frozen: true,
    image:
      "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "rustic-chicken-seekh",
    name: "Rustic chicken seekh",
    category: "Kebabs",
    cuisine: "House special",
    description: "Rustic seekh-style kebabs, ready for a quick pan or grill.",
    price: 650,
    pack: "500 g",
    weightGrams: 500,
    vegetarian: false,
    frozen: true,
    image:
      "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=85",
  },
];

export const categories = ["All", "Kebabs", "Marinades", "Curries", "Snacks"] as const;
export const minimumOrderGrams = 1000;
export const advanceOrderHours = 48;
export const whatsappNumber = "919599944745";

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
