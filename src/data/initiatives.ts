import { img } from "@/lib/imageUrl";

export interface Initiative {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  country: string;
  year: number;
  image: string;
  beneficiaries: number;
  status: "active" | "completed" | "upcoming";
  highlights: string[];
}

export const initiatives: Initiative[] = [
  {
    slug: "click-4-change",
    title: "Click 4 Change",
    shortDescription:
      "A free photography and digital skills training program empowering youth with creative careers.",
    fullDescription:
      "In March 2024, FTF Ghana collaborated with Jambo Spaces to launch Click4Change, a free photography and digital skills training program. The initiative empowers underprivileged youth with professional photography, videography, and digital marketing skills, providing them with tools and mentorship to build sustainable creative careers.",
    category: "Education",
    country: "Ghana",
    year: 2024,
    image: img("/images/initiatives/click-4-change.jpg"),
    beneficiaries: 150,
    status: "active",
    highlights: [
      "Professional photography training",
      "Digital marketing workshops",
      "Mentorship from industry professionals",
      "Equipment provided to top graduates",
    ],
  },
  {
    slug: "share-aid-initiative",
    title: "Share Aid Initiative",
    shortDescription:
      "Supporting over 500 underprivileged children with essential supplies and educational resources.",
    fullDescription:
      "FTF Ghana has supported over 500 underprivileged children in Ghana over the years through the Share Aid Initiative. The program provides essential supplies including school uniforms, textbooks, hygiene products, and food packages to children in the most vulnerable communities.",
    category: "Humanitarian",
    country: "Ghana",
    year: 2020,
    image: img("/images/initiatives/share-aid.jpg"),
    beneficiaries: 500,
    status: "active",
    highlights: [
      "School supplies distribution",
      "Food and hygiene packages",
      "Community outreach programs",
      "Seasonal support campaigns",
    ],
  },
  {
    slug: "ftf-village-project",
    title: "FTF Village Project",
    shortDescription:
      "A transformative housing project to provide homes for orphans and homeless children.",
    fullDescription:
      "The FTF Village, when completed, will be a home for orphans, homeless kids, and other vulnerable children. The village will provide safe housing, education, healthcare, and mentorship - creating a nurturing environment where every child can thrive and build a brighter future.",
    category: "Infrastructure",
    country: "Ghana",
    year: 2025,
    image: img("/images/initiatives/ftf-village.jpg"),
    beneficiaries: 200,
    status: "upcoming",
    highlights: [
      "Safe housing for 200+ children",
      "On-site school and health center",
      "Skills training workshops",
      "Community garden and farm",
    ],
  },
  {
    slug: "sponsor-a-child",
    title: "Sponsor A Child Initiative",
    shortDescription:
      "Connecting sponsors with underprivileged children for holistic educational support.",
    fullDescription:
      "The Sponsor a Child Project is an initiative under the Student Training and Education Project (S.T.E.P.). It connects individual sponsors with underprivileged children, covering school fees, uniforms, books, and mentorship to ensure every child has access to quality education.",
    category: "Education",
    country: "Ghana",
    year: 2021,
    image: img("/images/initiatives/share-aid.jpg"),
    beneficiaries: 300,
    status: "active",
    highlights: [
      "Full school fee coverage",
      "Mentorship pairing",
      "Regular progress reports",
      "Holistic development support",
    ],
  },
  {
    slug: "smart-start-initiative",
    title: "Smart Start Initiative",
    shortDescription:
      "A Saturday club providing extra classes and enrichment activities for students.",
    fullDescription:
      "Smart Start Initiative is a Saturday club where students receive extra classes in core subjects, creative arts, and life skills. The program bridges the learning gap for children who need additional academic support beyond regular school hours.",
    category: "Education",
    country: "Ghana",
    year: 2019,
    image: img("/images/initiatives/smart-start.jpg"),
    beneficiaries: 250,
    status: "active",
    highlights: [
      "Weekly Saturday classes",
      "Core subject tutoring",
      "Creative arts enrichment",
      "Life skills workshops",
    ],
  },
  {
    slug: "step-project",
    title: "Student Training and Education Project",
    shortDescription:
      "A comprehensive project sponsoring the holistic education of underprivileged children.",
    fullDescription:
      "The Organization on 26th February 2021, initiated the Student Training and Education Project (S.T.E.P) to sponsor the holistic education of underprivileged children. The project covers tuition, learning materials, mentorship, and career guidance to help children reach their full potential.",
    category: "Education",
    country: "Ghana",
    year: 2021,
    image: img("/images/initiatives/smart-start.jpg"),
    beneficiaries: 400,
    status: "active",
    highlights: [
      "Tuition sponsorship",
      "Learning materials provision",
      "Career guidance sessions",
      "Leadership development",
    ],
  },
  {
    slug: "empower-her-period",
    title: "Empower Her, Period",
    shortDescription:
      "Breaking period poverty by providing menstrual health education and supplies to girls.",
    fullDescription:
      "Periods generally affect the physical and emotional wellbeing of the average girl child, and the unavailability of affordable period care makes it worse. Empower Her, Period provides menstrual health education, free sanitary products, and creates safe spaces for girls to discuss and manage their menstrual health with dignity.",
    category: "Health",
    country: "Ghana",
    year: 2022,
    image: img("/images/initiatives/empower-her.jpg"),
    beneficiaries: 1000,
    status: "active",
    highlights: [
      "Free sanitary product distribution",
      "Menstrual health workshops",
      "School education programs",
      "Community awareness campaigns",
    ],
  },
  {
    slug: "project-future-ready",
    title: "Project Future Ready",
    shortDescription:
      "Preparing youth for the future with digital literacy, coding, and 21st-century skills.",
    fullDescription:
      "Project Future Ready is our newest initiative, launched in February 2025. The program equips young people with digital literacy, basic coding skills, communication, and problem-solving abilities needed to thrive in the 21st century economy.",
    category: "Technology",
    country: "Ghana",
    year: 2025,
    image: img("/images/initiatives/future-ready.jpg"),
    beneficiaries: 200,
    status: "active",
    highlights: [
      "Digital literacy training",
      "Introduction to coding",
      "Communication skills",
      "Entrepreneurship basics",
    ],
  },
  {
    slug: "project-momentum",
    title: "Project Momentum",
    shortDescription:
      "Empowering secondary school students in underserved Nigerian communities.",
    fullDescription:
      "Project Momentum is the official launch initiative of For the Future (FTF) Nigeria, dedicated to empowering secondary school students in underserved communities. The program provides academic support, career mentorship, and leadership development to help students excel.",
    category: "Education",
    country: "Nigeria",
    year: 2025,
    image: img("/images/initiatives/project-momentum.jpg"),
    beneficiaries: 350,
    status: "active",
    highlights: [
      "Academic tutoring",
      "Career mentorship",
      "Leadership workshops",
      "University preparation",
    ],
  },
  {
    slug: "ftf-chess-in-slums",
    title: "FTF and Chess in Slums",
    shortDescription:
      "A partnership with Chess in Slums to develop critical thinking through chess.",
    fullDescription:
      "For the Future Ghana partnered with Chess in Slums, a Nigerian-based organization, as its first Global Ambassador on 9th June 2022. The partnership uses chess as a tool to develop critical thinking, strategic planning, and confidence in children from underserved communities.",
    category: "Education",
    country: "Ghana",
    year: 2022,
    image: img("/images/initiatives/chess-in-slums.jpg"),
    beneficiaries: 180,
    status: "active",
    highlights: [
      "Chess training sessions",
      "Inter-community tournaments",
      "Critical thinking development",
      "Scholarship opportunities",
    ],
  },
];

export const categories = [
  "All",
  "Education",
  "Health",
  "Technology",
  "Humanitarian",
  "Infrastructure",
];
