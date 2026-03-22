import { DashboardCommandHero } from "@/components/dashboard/dashboard-command-hero";
import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import { DashboardSignalCard } from "@/components/dashboard/dashboard-signal-card";
import { getDashboardViewModel } from "@/server/view-models";

type DashboardPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const viewModel = await getDashboardViewModel(locale);
  const [primaryMetric, reviewMetric, blockedMetric, feedbackMetric] =
    viewModel.metrics;

  return (
    <div className="flex flex-col gap-6">
      <DashboardCommandHero
        description={viewModel.description}
        eyebrow={viewModel.eyebrow}
        heroBadges={viewModel.heroBadges}
        priority={viewModel.priorities.items[0]}
        priorityLabel={viewModel.priorities.title}
        region={viewModel.regions.items[0]}
        regionLabel={viewModel.regions.title}
        review={viewModel.reviews.items[0]}
        reviewLabel={viewModel.reviews.title}
        title={viewModel.title}
      />
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
        <DashboardMetricCard
          className="lg:row-span-2"
          detail={viewModel.priorities.items[0]?.title ?? viewModel.priorities.description}
          label={primaryMetric.label}
          tone="primary"
          value={primaryMetric.value}
        />
        <DashboardMetricCard
          detail={viewModel.reviews.items[0]?.title ?? viewModel.reviews.description}
          label={reviewMetric.label}
          tone="support"
          value={reviewMetric.value}
        />
        <DashboardMetricCard
          detail={viewModel.feedback.items[0]?.title ?? viewModel.feedback.description}
          label={blockedMetric.label}
          tone="alert"
          value={blockedMetric.value}
        />
        <DashboardMetricCard
          detail={viewModel.regions.items[0]?.title ?? viewModel.regions.description}
          label={feedbackMetric.label}
          tone="support"
          value={feedbackMetric.value}
        />
      </section>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.28fr)_minmax(320px,0.92fr)] xl:items-start">
        <DashboardSignalCard
          description={viewModel.priorities.description}
          items={viewModel.priorities.items}
          title={viewModel.priorities.title}
          variant="primary"
        />
        <div className="flex flex-col gap-5">
          <DashboardSignalCard
            description={viewModel.regions.description}
            items={viewModel.regions.items}
            limit={3}
            title={viewModel.regions.title}
            variant="rail"
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
            <DashboardSignalCard
              description={viewModel.feedback.description}
              items={viewModel.feedback.items}
              limit={2}
              title={viewModel.feedback.title}
              variant="compact"
            />
            <DashboardSignalCard
              description={viewModel.reviews.description}
              items={viewModel.reviews.items}
              limit={2}
              title={viewModel.reviews.title}
              variant="compact"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
