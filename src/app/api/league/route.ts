import { NextRequest, NextResponse } from "next/server";
import { getCompleteLeagueData } from "@/lib/sleeper";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leagueId = searchParams.get("id") || "1365771765128663040";

  try {
    const data = await getCompleteLeagueData(leagueId);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load league data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
