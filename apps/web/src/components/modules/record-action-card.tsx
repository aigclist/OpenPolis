import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { getUiNamespace } from "@openpolis/ui/namespaces";

export type RecordActionItem = {
  label: string;
  href: string;
};

type RecordActionCardProps = {
  title: string;
  description: string;
  actions: RecordActionItem[];
};

export function RecordActionCard({
  title,
  description,
  actions
}: RecordActionCardProps) {
  return (
    <Card
      className="border-border/70 bg-card/90 shadow-sm"
      data-ui={getUiNamespace("module", "record-action-card")}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            className={buttonVariants({
              className: "justify-start",
              variant: "outline"
            })}
            href={action.href}
          >
            {action.label}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
