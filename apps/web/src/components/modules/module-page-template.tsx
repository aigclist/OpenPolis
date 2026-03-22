import type { ReactNode } from "react";

import {
  PaginationControls,
  type PaginationControlsProps
} from "@/components/shared/pagination-controls";
import { PageHero } from "@/components/shared/page-hero";
import {
  RecordDetailCard,
  type RecordDetailItem
} from "@/components/shared/record-detail-card";
import {
  RecordListCard,
  type RecordListItem
} from "@/components/shared/record-list-card";
import { SummaryCard } from "@/components/shared/summary-card";

type ModulePageTemplateProps = {
  eyebrow: string;
  title: string;
  description: string;
  summaryCards: Array<{
    label: string;
    value: string;
  }>;
  sectionTitle: string;
  sectionDescription: string;
  items: RecordListItem[];
  pagination?: PaginationControlsProps;
  detailTitle?: string;
  detailDescription?: string;
  detailItem?: RecordDetailItem;
  topContent?: ReactNode;
};

export function ModulePageTemplate({
  eyebrow,
  title,
  description,
  summaryCards,
  sectionTitle,
  sectionDescription,
  items,
  pagination,
  detailTitle,
  detailDescription,
  detailItem,
  topContent
}: ModulePageTemplateProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} label={card.label} value={card.value} />
        ))}
      </section>
      {topContent}
      {detailItem && detailTitle && detailDescription ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] xl:items-start">
          <div className="flex flex-col gap-4">
            <RecordListCard
              description={sectionDescription}
              items={items}
              title={sectionTitle}
            />
            {pagination ? <PaginationControls {...pagination} /> : null}
          </div>
          <RecordDetailCard
            description={detailDescription}
            item={detailItem}
            title={detailTitle}
          />
        </section>
      ) : (
        <div className="flex flex-col gap-4">
          <RecordListCard
            description={sectionDescription}
            items={items}
            title={sectionTitle}
          />
          {pagination ? <PaginationControls {...pagination} /> : null}
        </div>
      )}
    </>
  );
}
