import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlanDetailRedirect({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = toQueryString(resolvedSearchParams);
  redirect(`/destinations/${slug}${query ? `?${query}` : ""}`);
}

function toQueryString(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        search.append(key, item);
      }
    } else {
      search.append(key, value);
    }
  }
  return search.toString();
}
