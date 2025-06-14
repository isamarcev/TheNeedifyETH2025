import { DBService } from "@/app/db/dbService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_address = searchParams.get('user_address');

    if (!user_address) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    const tasks = await DBService.getMarketTasks(user_address);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching market tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch market tasks" },
      { status: 500 }
    );
  }
} 