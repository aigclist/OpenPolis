import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUiNamespace } from "@openpolis/ui/namespaces";

export type RecordDetailSection = {
  id: string;
  title: string;
  fields: Array<{
    label: string;
    value: string;
    href?: string;
  }>;
};

export type RecordDetailItem = {
  title: string;
  summary: string;
  badges: string[];
  description: string;
  sections: RecordDetailSection[];
};

type RecordDetailCardProps = {
  title: string;
  description: string;
  item: RecordDetailItem;
};

export function RecordDetailCard({
  title,
  description,
  item
}: RecordDetailCardProps) {
  return (
    <Card
      className="border-border/70 bg-card/90 shadow-sm"
      data-ui={getUiNamespace("recordDetail", "record-detail-card")}
    >
      <CardHeader>
        <div className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {title}
        </div>
        <CardTitle className="text-xl">{item.title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="flex flex-wrap gap-2">
          {item.badges.map((badge) => (
            <Badge key={badge} variant="secondary">
              {badge}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
        {item.sections.map((section, index) => (
          <div key={section.id} className="flex flex-col gap-3">
            {index > 0 ? <Separator /> : null}
            <div className="text-sm font-medium">{section.title}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div key={`${section.id}-${field.label}`} className="space-y-1">
                  <div className="text-xs text-muted-foreground">{field.label}</div>
                  {field.href ? (
                    <Link
                      className="text-sm underline-offset-4 hover:underline"
                      href={field.href}
                    >
                      {field.value}
                    </Link>
                  ) : (
                    <div className="text-sm">{field.value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
