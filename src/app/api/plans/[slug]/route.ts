import { NextResponse } from "next/server";
import { getDestinationBySlugFromRepository } from "@/lib/data/repository";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const destination = await getDestinationBySlugFromRepository(slug);

  if (!destination) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json({
    destination: destination.name,
    fitScore: destination.fitScore,
    itinerary: destination.itinerary,
    planB: destination.planB,
    lodging: destination.lodging,
  });
}
