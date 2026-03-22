"use client";

import { useFormStatus } from "react-dom";
import { getUiNamespace } from "@openpolis/ui/namespaces";

import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type TextField = {
  kind: "text" | "textarea";
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
};

type SelectField = {
  kind: "select";
  name: string;
  label: string;
  defaultValue: string;
  options: Array<{
    value: string;
    label: string;
  }>;
};

export type WorkflowCommandField = TextField | SelectField;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? <Spinner className="mr-1" /> : null}
      {label}
    </Button>
  );
}

type WorkflowCommandCardProps = {
  action: (formData: FormData) => Promise<void>;
  status?: "created" | "error";
  errorAlert?: {
    title: string;
    description: string;
  };
  title: string;
  description: string;
  fields: WorkflowCommandField[];
  submitLabel: string;
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription: string;
};

export function WorkflowCommandCard({
  action,
  status,
  errorAlert,
  title,
  description,
  fields,
  submitLabel,
  successTitle,
  successDescription,
  errorTitle,
  errorDescription
}: WorkflowCommandCardProps) {
  const resolvedErrorTitle = errorAlert?.title ?? errorTitle;
  const resolvedErrorDescription = errorAlert?.description ?? errorDescription;

  return (
    <Card
      className="border-border/70 bg-card/90 shadow-sm"
      data-ui={getUiNamespace("module", "workflow-command-card")}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {status === "created" ? (
          <Alert>
            <AlertTitle>{successTitle}</AlertTitle>
            <AlertDescription>{successDescription}</AlertDescription>
          </Alert>
        ) : null}
        {status === "error" ? (
          <Alert variant="destructive">
            <AlertTitle>{resolvedErrorTitle}</AlertTitle>
            <AlertDescription>{resolvedErrorDescription}</AlertDescription>
          </Alert>
        ) : null}
        <form action={action} className="grid gap-4">
          {fields.map((field, index) => {
            const fieldId = `${field.name}-${index}`;

            return (
              <div key={fieldId} className="grid gap-2">
                <label className="text-sm font-medium" htmlFor={fieldId}>
                  {field.label}
                </label>
                {field.kind === "textarea" ? (
                  <Textarea
                    aria-label={field.label}
                    defaultValue={field.defaultValue}
                    id={fieldId}
                    name={field.name}
                    placeholder={field.placeholder}
                    required
                  />
                ) : null}
                {field.kind === "text" ? (
                  <Input
                    aria-label={field.label}
                    defaultValue={field.defaultValue}
                    id={fieldId}
                    name={field.name}
                    placeholder={field.placeholder}
                    required
                  />
                ) : null}
                {field.kind === "select" ? (
                  <Select defaultValue={field.defaultValue} name={field.name}>
                    <SelectTrigger
                      aria-label={field.label}
                      className="w-full"
                      id={fieldId}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            );
          })}
          <div className="flex justify-end">
            <SubmitButton label={submitLabel} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
