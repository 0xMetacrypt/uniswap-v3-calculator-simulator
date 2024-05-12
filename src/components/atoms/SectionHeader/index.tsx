interface ISectionHeader {
  subtext: string;
  title: string;
  description?: string;
}

export function SectionHeader({ subtext, title, description }: ISectionHeader) {
  return (
    <div className="space-y-4 text-center">
      <p className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-500">
        {subtext}
      </p>
      <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {description && (
        <p className="mx-auto max-w-2xl text-base leading-6 text-slate-600 lg:text-lg lg:leading-7">{description}</p>
      )}
    </div>
  );
}
