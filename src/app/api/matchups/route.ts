import { NextRequest, NextResponse } from "next/server";
import { getLeagueMatchups } from "@/lib/sleeper";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leagueId = searchParams.get("leagueId");
  const weekStr = searchParams.get("week");

  if (!leagueId || !weekStr) {
    return NextResponse.json(
      { error: "leagueId and week are required parameters" },
      { status: 400 }
    );
  }

  const week = parseInt(weekStr, 10);
  if (isNaN(week) || week < 1 || week > 18) {
    return NextResponse.json(
      { error: "week must be a number between 1 and 18" },
      { status: 400 }
    );
  }

  try {
    const matchups = await getLeagueMatchups(leagueId, week);
    return NextResponse.json({ matchups });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch matchups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
