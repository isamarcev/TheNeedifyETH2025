import { DBService } from "@/app/db/dbService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const input = await request.json();

    if (!input.owner || !input.title || !input.description || !input.asset || !input.amount || !input.category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const task = await DBService.createTask({
      owner: input.owner,
      title: input.title,
      description: input.description,
      asset: input.asset,
      amount: input.amount,
      category: input.category,
      deadline: input.deadline ? new Date(input.deadline) : null,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
} 