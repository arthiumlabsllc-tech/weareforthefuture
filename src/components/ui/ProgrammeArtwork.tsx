import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function ProgrammeArtwork({ image, title }: { image: string | null; title: string }) {
  if (image) {
    return <Image src={image} alt={title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />;
  }

  return (
    <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-end overflow-hidden bg-navy-900 p-7 text-text-on-primary">
      <div className="absolute -right-8 -top-8 h-52 w-52 rounded-full border-[28px] border-accent/20" />
      <ArrowUpRight className="relative mb-4 h-12 w-12 text-accent-bright" />
      <span className="relative max-w-64 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">{title}</span>
      <span className="relative mt-3 text-xs uppercase tracking-[0.2em] text-accent-bright">For The Future</span>
    </div>
  );
}
