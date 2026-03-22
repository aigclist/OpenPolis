import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUiNamespace } from "@openpolis/ui/namespaces";

type SummaryCardProps = {
  label: string;
  value: string;
};

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <Card
      className="border-border/70 bg-card/90 shadow-sm"
      data-ui={getUiNamespace("summary", "summary-card")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
