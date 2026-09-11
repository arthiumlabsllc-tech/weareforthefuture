import { img } from "@/lib/imageUrl";

export interface TeamMember {
  name: string;
  role: string;
  country: string;
  category: "leadership" | "ghana" | "nigeria" | "us";
  bio?: string;
  image?: string;
}

export const teamMembers: TeamMember[] = [
  // Leadership
  {
    name: "Kezia Asiedua Sanie",
    role: "Founder & President",
    country: "Ghana",
    category: "leadership",
    bio: "A 23-year-old budding lawyer, visionary social entrepreneur, and advocate for children's rights. Kezia founded FTF in 2016 and has led the organization from a small community initiative to a global movement.",
    image: img("/images/team/exec-kezia.png")
  },
  {
    name: "Aaron Ohene Yeboah",
    role: "Vice President",
    country: "Ghana",
    category: "leadership",
    image: img("/images/team/exec-aaron.png")
  },
  {
    name: "Foluke Babatunde-Lawal",
    role: "Executive Director",
    country: "Nigeria",
    category: "leadership",
  },
  // Ghana Team
  {
    name: "Abena Oduro Osae",
    role: "General Secretary",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Obed Nyarko",
    role: "Head, Grants & Sponsorship",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Justina Bosomtwi Ayensu",
    role: "Internal Auditor",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Rosemond Acheampomaa",
    role: "Head of Procurement",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Michelle Kafui Sosu",
    role: "Head, Grants & Sponsorship Committee",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Timothy Welbeck",
    role: "Member",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Sampson Adotey",
    role: "Member",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Markus Greene",
    role: "Member",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Lucy Atapsare",
    role: "Member",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Charles Wartemberg",
    role: "Member",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Rev Abaidoo",
    role: "Member",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Dr. Laud Basing",
    role: "Member",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Desmond Bredu",
    role: "Member",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Anita Okorie",
    role: "Member",
    country: "Ghana",
    category: "ghana",
  },
  {
    name: "Nicholas Lenin Agyei",
    role: "Member",
    country: "Ghana",
    category: "ghana",
  },
  // Nigeria Team
  {
    name: "Oluwadamilola David",
    role: "Programs Manager",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Oyinbusola Igbehinadun",
    role: "Monitoring & Evaluations Officer",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Akorede Olasupo",
    role: "Community Engagement Officer",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Temituope Ometoruwa",
    role: "Public Relations Officer",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Muhsinah Sharafdeen",
    role: "Curriculum Officer",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Chika Akachukwu",
    role: "Vetting Official",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Gbolahan Agbaje",
    role: "Organizing Secretary",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Ewaoluwa Makinde",
    role: "Head of Research",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Christiana Joel",
    role: "Volunteers Coordinator",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Comfort Ayorinde",
    role: "Head, Projects Committee",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Precious Bonso Kodo",
    role: "Member",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Maris Bernard",
    role: "General Secretary",
    country: "Nigeria",
    category: "nigeria",
  },
  {
    name: "Victoria Onize",
    role: "Financial Secretary",
    country: "Nigeria",
    category: "nigeria",
  },
  // US Team
  {
    name: "Darnielle Marck",
    role: "Member",
    country: "United States",
    category: "us",
  },
];
