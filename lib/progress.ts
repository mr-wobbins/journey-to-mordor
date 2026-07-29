import { prisma } from "@/lib/db";
import { getJourneyProgress } from "@/lib/journey";

export async function getUserTotalMiles(userId: string): Promise<number> {
  const result = await prisma.activity.aggregate({
    where: { userId },
    _sum: { distanceMiles: true },
  });
  return result._sum.distanceMiles ?? 0;
}

export async function getUserJourney(userId: string) {
  const totalMiles = await getUserTotalMiles(userId);
  return getJourneyProgress(totalMiles);
}
