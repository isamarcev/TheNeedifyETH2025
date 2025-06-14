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

    await DBService.applyTask(taskId, user_address);
    return NextResponse.json({ message: "Task applied successfully" });
  } catch (error) {
    console.error("Error applying task:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to apply task" },
      { status: 500 }
    );
  }
} 