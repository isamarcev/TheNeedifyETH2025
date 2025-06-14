import { DBService } from "@/app/db/dbService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { taskId, user_address } = await request.json();

    if (!taskId || !user_address) {
      return NextResponse.json(
        { error: "Task ID and user address are required" },
        { status: 400 }
      );
    }

    await DBService.approveTask(taskId, user_address);
    return NextResponse.json({ message: "Task approved successfully" });
  } catch (error) {
    console.error("Error approving task:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to approve task" },
      { status: 500 }
    );
  }
} 