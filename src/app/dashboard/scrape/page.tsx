import { ScrapeForm } from "@/components/app/scrape-form";
import { PageHead } from "@/components/app/ui";

export default async function ScrapePage({ searchParams }: PageProps<"/dashboard/scrape">) {
  const q = await searchParams;
  return (
    <>
      <PageHead title="New scrape" sub="Pull every metric for posts, reels or whole profiles. Results land in Runs and stay there." />
      <ScrapeForm initialUrls={typeof q.url === "string" ? q.url : ""} />
    </>
  );
}
