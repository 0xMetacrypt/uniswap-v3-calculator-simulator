import { SectionBackgroundBeams } from "@/components/atoms/SectionBackgrounds";
import { Container } from "@/components/layout/Container";

interface IPageHeader {
  title: [string, string];
  description?: string;
}

export function PageHeader({ title, description }: IPageHeader) {
  return (
    <section className="relative w-full">
      <SectionBackgroundBeams />
      <Container className="z-10 space-y-8 py-20 text-center">
        <div className="mx-auto max-w-4xl text-4xl font-bold tracking-tighter lg:text-6xl">
          <h1 className="text-slate-800">{title[0]}</h1>
          <h1 className="special-text">{title[1]}</h1>
        </div>
        {description && <h2 className="mx-auto max-w-2xl font-semibold text-slate-800">{description}</h2>}
      </Container>
    </section>
  );
}
