import { PageHero } from "@/components/shared/page-hero";
import {
  RecordActionCard,
  type RecordActionItem
} from "@/components/modules/record-action-card";
import {
  RecordDetailCard,
  type RecordDetailItem
} from "@/components/shared/record-detail-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { getUiNamespace } from "@openpolis/ui/namespaces";

type ModuleDetailPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  moduleHref: string;
  moduleTitle: string;
  detailTitle: string;
  detailDescription: string;
  detailItem: RecordDetailItem;
  actionCard?: {
    title: string;
    description: string;
    actions: RecordActionItem[];
  };
};

export function ModuleDetailPage({
  eyebrow,
  title,
  description,
  moduleHref,
  moduleTitle,
  detailTitle,
  detailDescription,
  detailItem,
  actionCard
}: ModuleDetailPageProps) {
  return (
    <div
      className="flex flex-col gap-6"
      data-ui={getUiNamespace("module", "module-detail-page")}
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={moduleHref}>{moduleTitle}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      {actionCard ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <RecordDetailCard
            description={detailDescription}
            item={detailItem}
            title={detailTitle}
          />
          <RecordActionCard
            actions={actionCard.actions}
            description={actionCard.description}
            title={actionCard.title}
          />
        </section>
      ) : (
        <RecordDetailCard
          description={detailDescription}
          item={detailItem}
          title={detailTitle}
        />
      )}
    </div>
  );
}
