import { DBService } from "@/app/db/dbService";
import { NextResponse } from "next/server";

export async function POST_getOrCreateUser(request: Request) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const user = await DBService.getOrCreateUser(address);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function POST_createTask(request: Request) {
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

export async function GET_getMarketTasks(request: Request) {
  try {
    const { user_address } = await request.json();

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

export async function GET_getUserTasks(request: Request) {
  try {
    const { user_address } = await request.json();

    if (!user_address) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    const tasks = await DBService.getUserTasks(user_address);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch user tasks" },
      { status: 500 }
    );
  }
}

export async function POST_applyTask(request: Request) {
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

export async function POST_approveTask(request: Request) {
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