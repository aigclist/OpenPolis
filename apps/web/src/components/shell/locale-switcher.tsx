"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@openpolis/i18n/navigation";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("shell.locale");

  return (
    <div className="flex items-center gap-1">
      <Link
        className={cn(
          buttonVariants({
            size: "sm",
            variant: locale === "en" ? "default" : "ghost"
          })
        )}
        href={pathname}
        locale="en"
      >
        {t("en")}
      </Link>
      <Link
        className={cn(
          buttonVariants({
            size: "sm",
            variant: locale === "zh-CN" ? "default" : "ghost"
          })
        )}
        href={pathname}
        locale="zh-CN"
      >
        {t("zh-CN")}
      </Link>
    </div>
  );
}
