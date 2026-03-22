import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUiNamespace } from "@openpolis/ui/namespaces";

export type RecordListItem = {
  id: string;
  title: string;
  summary: string;
  badges: string[];
  meta: Array<
    | string
    | {
        value: string;
        href?: string;
      }
  >;
  selectHref?: string;
  href?: string;
  actionLabel?: string;
  selected?: boolean;
};

type RecordListCardProps = {
  title: string;
  description: string;
  items: RecordListItem[];
};

export function RecordListCard({
  title,
  description,
  items
}: RecordListCardProps) {
  return (
    <Card
      className="border-border/70 bg-card/90 shadow-sm"
      data-ui={getUiNamespace("recordList", "record-list-card")}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-col gap-4">
            {index > 0 ? <Separator /> : null}
            <div
              className={`flex flex-col gap-3 rounded-lg p-3 ${
                item.selected ? "bg-muted/40" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                {item.selectHref ? (
                  <Link
                    className="flex max-w-3xl flex-col gap-1 rounded-md outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    href={item.selectHref}
                  >
                    <div className="font-medium text-base underline-offset-4 hover:underline">
                      {item.title}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.summary}
                    </p>
                  </Link>
                ) : (
                  <div className="flex max-w-3xl flex-col gap-1">
                    <div className="font-medium text-base">{item.title}</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.summary}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {item.badges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                  {item.href && item.actionLabel ? (
                    <Link
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                      href={item.href}
                    >
                      {item.actionLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {item.meta.map((entry, index) =>
                  typeof entry === "string" ? (
                    <span key={`${item.id}-meta-${index}`}>{entry}</span>
                  ) : entry.href ? (
                    <Link
                      key={`${item.id}-meta-${index}`}
                      className="underline-offset-4 hover:underline"
                      href={entry.href}
                    >
                      {entry.value}
                    </Link>
                  ) : (
                    <span key={`${item.id}-meta-${index}`}>{entry.value}</span>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
