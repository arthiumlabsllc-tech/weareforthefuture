export interface BoardMember {
  name: string;
  role: string;
  image: string;
  country: string;
}

export const executiveBoard: BoardMember[] = [
  // Ghana Executive Board
  { name: "Kezia Aseidua Sanie", role: "Founder / President", image: "/images/team/exec-kezia.png", country: "Ghana" },
  { name: "Aaron Ohene Yeboah", role: "Vice President", image: "/images/team/exec-aaron.png", country: "Ghana" },
  { name: "Abena Oduro Osae", role: "General Secretary", image: "/images/team/exec-abena.png", country: "Ghana" },
  { name: "Michelle Kafui Sosu", role: "Head, Grants & Sponsorship Committee", image: "/images/team/exec-michelle.png", country: "Ghana" },
  { name: "Obed Nyarko", role: "Head, Grants & Sponsorship Committee", image: "/images/team/exec-obed.png", country: "Ghana" },
  { name: "Justina Bosomtwi Ayensu", role: "Internal Auditor", image: "/images/team/exec-justina.png", country: "Ghana" },
  { name: "Rosemond Acheampomaa", role: "Head of Procurement", image: "/images/team/exec-rosemond.png", country: "Ghana" },
  // Nigeria Executive Board
  { name: "Foluke Babatunde-Lawal", role: "Executive Director", image: "/images/team/exec-foluke.png", country: "Nigeria" },
  { name: "Oluwadamilola David", role: "Programs Manager", image: "/images/team/exec-oluwadamilola.png", country: "Nigeria" },
  { name: "Victoria Onize", role: "Financial Secretary", image: "/images/team/exec-victoria.png", country: "Nigeria" },
  { name: "Maris Bernard", role: "General Secretary", image: "/images/team/exec-maris.png", country: "Nigeria" },
  { name: "Comfort Ayorinde", role: "Head, Projects Committee", image: "/images/team/exec-comfort.png", country: "Nigeria" },
  { name: "Christiana Joel", role: "Volunteers Coordinator", image: "/images/team/exec-christiana.png", country: "Nigeria" },
  { name: "Ewaoluwa Makinde", role: "Head of Research", image: "/images/team/exec-ewaoluwa.png", country: "Nigeria" },
  { name: "Gbolahan Agbaje", role: "Organizing Secretary", image: "/images/team/exec-gbolahan.png", country: "Nigeria" },
  { name: "Chika Akachukwu", role: "Vetting Official", image: "/images/team/exec-chika.png", country: "Nigeria" },
  { name: "Muhsinah Sharafdeen", role: "Curriculum Officer", image: "/images/team/exec-muhsinah.png", country: "Nigeria" },
  { name: "Temituope Ometoruwa", role: "Public Relations Officer", image: "/images/team/exec-temituope.png", country: "Nigeria" },
  { name: "Akorede Olasupo", role: "Community Engagement Officer", image: "/images/team/exec-akorede.png", country: "Nigeria" },
  { name: "Oyinbusola Igbehinadun", role: "Monitoring & Evaluations Officer", image: "/images/team/exec-oyinbusola.png", country: "Nigeria" },
];

export const executiveCountries = ["All", "Ghana", "Nigeria"];
