import { img } from "@/lib/imageUrl";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  impact: string;
  description: string;
  badge?: string;
}

export const products: Product[] = [
  {
    id: "school-supplies",
    name: "School Supplies Kit",
    price: 150,
    image: img("/images/store/school-supplies.png"),
    category: "Education",
    impact: "Provides notebooks, pencils & learning materials for 1 child for a full term",
    description: "A complete set of notebooks, pencils, erasers, crayons, and a ruler - everything a child needs to excel in class.",
    badge: "Best Seller",
  },
  {
    id: "school-uniform",
    name: "School Uniform Set",
    price: 220,
    image: img("/images/store/school-uniform.png"),
    category: "Essentials",
    impact: "Gives 1 child a proper uniform & shoes so they can attend school with dignity",
    description: "Brand new shirt, trousers/skirt, and a pair of school shoes. Because every child deserves to feel confident.",
  },
  {
    id: "book-set",
    name: "Children's Book Collection",
    price: 120,
    image: img("/images/store/book-set.png"),
    category: "Education",
    impact: "Opens the world of reading for 1 child with 5 age-appropriate books",
    description: "A curated set of 5 colorful storybooks and educational reads that spark imagination and build literacy skills.",
  },
  {
    id: "hygiene-kit",
    name: "Hygiene & Health Kit",
    price: 100,
    image: img("/images/store/hygiene-kit.png"),
    category: "Health",
    impact: "Keeps 1 child healthy & clean for 3 months with essential hygiene products",
    description: "Toothbrush, toothpaste, soap, comb, and sanitizer in a reusable pouch. Health is the foundation of learning.",
    badge: "Most Needed",
  },
  {
    id: "meal-pack",
    name: "Nutrition Care Package",
    price: 180,
    image: img("/images/store/meal-pack.png"),
    category: "Health",
    impact: "Feeds 1 child nutritious meals for an entire month",
    description: "Rice, milk, cooking oil, and canned foods - a month of proper nutrition to fuel a child's growth and focus.",
  },
  {
    id: "ftf-tshirt",
    name: "FTF Supporter Tee",
    price: 150,
    image: img("/images/store/ftf-tshirt.png"),
    category: "Merchandise",
    impact: "100% of proceeds directly fund FTF programs for vulnerable children",
    description: "Premium navy cotton tee with the FTF gold emblem. Wear your support and spark conversations that matter.",
  },
  {
    id: "ftf-tote",
    name: "FTF Canvas Tote",
    price: 100,
    image: img("/images/store/ftf-tote-bag.png"),
    category: "Merchandise",
    impact: "Funds school materials for 1 child while giving you a stylish everyday bag",
    description: "Durable natural canvas tote with the FTF heart emblem. Sustainable, spacious, and purposeful.",
  },
  {
    id: "gift-hamper",
    name: "Impact Gift Hamper",
    price: 450,
    image: img("/images/store/gift-hamper.png"),
    category: "Gifts",
    impact: "A complete care package: toys, books, blanket & snacks for 1 child's full semester",
    description: "Our most generous package - a wicker basket filled with toys, storybooks, crayons, a warm blanket, and healthy snacks. The perfect gift that gives twice.",
    badge: "Premium",
  },
];

export const storeCategories = ["All", "Education", "Essentials", "Health", "Merchandise", "Gifts"];
