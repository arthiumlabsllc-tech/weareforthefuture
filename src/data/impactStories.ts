import { img } from "@/lib/imageUrl";

export interface ImpactStory {
  name: string;
  title: string;
  story: string;
  image: string;
  program: string;
}

export const impactStories: ImpactStory[] = [
  {
    name: "Elizabeth",
    title: "From Abandonment to a Bright Future",
    story:
      "Elizabeth was abandoned at just 3 years old and lived in hardship with no access to school. Through FTF Ghana's Student Training and Education Project (STEP), she received a full scholarship and care. Today, she's a confident, happy child who speaks English fluently and radiates optimism for the future.",
    image: img("/images/stories/gallery-03.jpg"),
    program: "Student Training & Education Project (STEP)",
  },
  {
    name: "Prince Kojo",
    title: "Building Dreams from Scrap",
    story:
      "Prince Kojo, a 12-year-old boy with a tough upbringing, showed his brilliance by building toy cars from scraps. Recognizing his talent, FTF Ghana enrolled him in STEP and secured him a scholarship at Asustem Robotics. Now, he's pursuing his dream of becoming an engineer.",
    image: img("/images/stories/twitter-22.jpg"),
    program: "Student Training & Education Project (STEP)",
  },
];

export const galleryImages = [
  img("/images/stories/gallery-29.jpg"),
  img("/images/stories/gallery-24.jpg"),
  img("/images/stories/gallery-18.jpg"),
  img("/images/stories/gallery-21.jpg"),
  img("/images/stories/gallery-12.jpg"),
  img("/images/stories/gallery-07.jpg"),
  img("/images/stories/gallery-04.jpg"),
  img("/images/stories/gallery-28.jpg"),
  img("/images/stories/gallery-25.jpg"),
  img("/images/stories/gallery-23.jpg"),
  img("/images/stories/gallery-22.jpg"),
  img("/images/stories/gallery-20.jpg"),
  img("/images/stories/gallery-19.jpg"),
  img("/images/stories/gallery-14.jpg"),
  img("/images/stories/gallery-10.jpg"),
  img("/images/stories/gallery-09.jpg"),
  img("/images/stories/gallery-06.jpg"),
  img("/images/stories/gallery-05.jpg"),
  img("/images/stories/gallery-03.jpg"),
  img("/images/stories/gallery-02.jpg"),
  img("/images/stories/twitter-1.jpg"),
  img("/images/stories/twitter-2.jpg"),
  img("/images/stories/twitter-3.jpg"),
  img("/images/stories/twitter-4.jpg"),
  img("/images/stories/twitter-5.jpg"),
  img("/images/stories/twitter-6.jpg"),
  img("/images/stories/twitter-7.jpg"),
  img("/images/stories/twitter-8.jpg"),
  img("/images/stories/twitter-9.jpg"),
  img("/images/stories/twitter-10.jpg"),
  img("/images/stories/twitter-11.jpg"),
  img("/images/stories/twitter-12.jpg"),
  img("/images/stories/twitter-13.jpg"),
  img("/images/stories/twitter-14.jpg"),
  img("/images/stories/twitter-15.jpg"),
  img("/images/stories/twitter-16.jpg"),
  img("/images/stories/twitter-17.jpg"),
  img("/images/stories/twitter-18.jpg"),
  img("/images/stories/twitter-19.jpg"),
  img("/images/stories/twitter-20.jpg"),
  img("/images/stories/twitter-21.jpg"),
  img("/images/stories/twitter-22.jpg"),
  img("/images/stories/twitter-23.jpg"),
  img("/images/stories/twitter-24.jpg"),
];
