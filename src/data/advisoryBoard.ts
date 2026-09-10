export interface AdvisoryMember {
  name: string;
  role: string;
  image: string;
  country: string;
}

export const advisoryBoard: AdvisoryMember[] = [
  // Ghana Advisory Board
  { name: "Rev Abaidoo", role: "Member", image: "/images/team/adv-rev-abaidoo.png", country: "Ghana" },
  { name: "Dr. Laud Basing", role: "Member", image: "/images/team/adv-laud-basing.png", country: "Ghana" },
  { name: "Desmond Bredu", role: "Member", image: "/images/team/adv-desmond-breda.png", country: "Ghana" },
  { name: "Anita Okorie", role: "Member", image: "/images/team/adv-anita-okorie.png", country: "Ghana" },
  { name: "Nicholas Lenin Agyei Esq.", role: "Member", image: "/images/team/adv-nicholas-agyei.png", country: "Ghana" },
  { name: "Precious Bonso Kodo", role: "Member", image: "/images/team/adv-precious-bonso.png", country: "Ghana" },
  // US Advisory Board
  { name: "Timothy Welbeck", role: "Member", image: "/images/team/adv-timothy-welbeck.png", country: "United States" },
  { name: "Sampson Adotey", role: "Member", image: "/images/team/adv-sampson-adotey.png", country: "United States" },
  { name: "Markus Greene", role: "Member", image: "/images/team/adv-markus-greene.png", country: "United States" },
  { name: "Lucy Atapsare", role: "Member", image: "/images/team/adv-lucy-atapsare.png", country: "United States" },
  { name: "Darnielle Marck", role: "Member", image: "/images/team/adv-darnielle-marck.png", country: "United States" },
  { name: "Charles Wartemberg", role: "Member", image: "/images/team/adv-charles-wartemberg.png", country: "United States" },
];

export const advisoryCountries = ["All", "Ghana", "United States"];
