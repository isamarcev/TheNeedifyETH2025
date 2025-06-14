import { DBService } from "@/app/db/dbService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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