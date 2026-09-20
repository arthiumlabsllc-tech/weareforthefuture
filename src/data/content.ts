export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  highlights: string[];
}

export const timeline: TimelineEvent[] = [
  {
    year: "2016",
    title: "The Beginning",
    description:
      "FTF began its charity journey in Ghana in collaboration with I Was Here, supporting children at Jay Nii Orphanage in Jamestown with essentials, love, and care.",
    highlights: [
      "First outreach at Jay Nii Orphanage",
      "Partnership with I Was Here",
      "Community presence in Jamestown",
    ],
  },
  {
    year: "2017",
    title: "Growing Impact",
    description:
      "Organized hygiene education outreach for children in Jamestown. Renovated Mamprobi South 4 Basic School, donating learning materials and furniture under the Caridad project. Hosted Felirati - a Christmas celebration for children facing disadvantage in Chorkor.",
    highlights: [
      "Hygiene education outreach",
      "Mamprobi South 4 Basic School renovation",
      "Felirati Christmas celebration",
    ],
  },
  {
    year: "2018",
    title: "Expanding Reach",
    description:
      "Opened a Takoradi branch. Launched outreach at Mampong M/A Basic School educating students on hygiene, drug abuse, and peer pressure. Visited the National Orthopaedic Centre to support individuals with disabilities.",
    highlights: [
      "Takoradi branch opened",
      "Mampong M/A Basic School outreach",
      "National Orthopaedic Centre visit",
    ],
  },
  {
    year: "2019",
    title: "Empowering Kayayos",
    description:
      "Turned attention to Kayayos (female head porters) through Donaport, providing aid and educating them on hygiene and the importance of free education.",
    highlights: [
      "Donaport initiative for Kayayos",
      "Hygiene and education advocacy",
      "Community empowerment programs",
    ],
  },
  {
    year: "2020",
    title: "COVID-19 Response",
    description:
      "Collaborated with Flood-gates Foundation to distribute COVID-19 relief items to vulnerable families in Mamobi, sponsored by Unilever Ghana and the general public.",
    highlights: [
      "COVID-19 relief distribution",
      "Partnership with Flood-gates Foundation",
      "Sponsored by Unilever Ghana",
    ],
  },
  {
    year: "2021",
    title: "S.T.E.P Launch",
    description:
      "Initiated the Student Training and Education Project (S.T.E.P) to sponsor the holistic education of vulnerable children, covering tuition, materials, and mentorship.",
    highlights: [
      "S.T.E.P project launched",
      "School sponsorship program",
      "Mentorship framework established",
    ],
  },
  {
    year: "2022",
    title: "Global Partnerships",
    description:
      "Partnered with Chess in Slums as first Global Ambassador. Launched Empower Her, Period initiative to combat period poverty and support girls' education.",
    highlights: [
      "Chess in Slums partnership",
      "Empower Her, Period launched",
      "Menstrual health advocacy",
    ],
  },
  {
    year: "2024",
    title: "Digital Empowerment",
    description:
      "Launched Click4Change in collaboration with Jambo Spaces - a free photography and digital skills training program for underserved youth.",
    highlights: [
      "Click4Change launched",
      "Jambo Spaces collaboration",
      "Digital skills training",
    ],
  },
  {
    year: "2025",
    title: "Going Global",
    description:
      "Expanded to Nigeria and the United States as a 501(c)(3) organization. Launched Future Pathways and Project Momentum. Began construction planning for FTF Village.",
    highlights: [
      "Nigeria & US chapters launched",
      "501(c)(3) status obtained",
      "Future Pathways & Momentum",
      "FTF Village planning begins",
    ],
  },
];

export const sdgGoals = [
  {
    number: 1,
    title: "No Poverty",
    description:
      "Working to end poverty in all its forms through education and economic empowerment programs.",
  },
  {
    number: 4,
    title: "Quality Education",
    description:
      "Ensuring inclusive and equitable quality education for vulnerable children of all ages.",
  },
  {
    number: 5,
    title: "Gender Equality",
    description:
      "Empowering girls through menstrual health education and equal access to learning opportunities.",
  },
  {
    number: 10,
    title: "Reduced Inequalities",
    description:
      "Bridging the gap between advantaged and disadvantaged communities through targeted interventions.",
  },
  {
    number: 13,
    title: "Climate Action",
    description:
      "Fostering environmental awareness and promoting sustainable practices in communities.",
  },
];
