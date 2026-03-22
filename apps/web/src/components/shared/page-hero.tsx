import { Card, CardContent } from "@/components/ui/card";
import { getUiNamespace } from "@openpolis/ui/namespaces";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <Card
      className="overflow-hidden border-none bg-card/90 shadow-sm"
      data-ui={getUiNamespace("hero", "page-hero")}
    >
      <CardContent className="surface-grid flex flex-col gap-4 p-6 sm:p-8">
        <div className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {eyebrow}
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
