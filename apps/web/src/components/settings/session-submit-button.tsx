"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type SessionSubmitButtonProps = {
  label: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
};

export function SessionSubmitButton({
  label,
  variant = "default"
}: SessionSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant={variant}>
      {pending ? <Spinner className="mr-1" /> : null}
      {label}
    </Button>
  );
}
