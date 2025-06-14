import { DBService } from "@/app/db/dbService";
import { NextResponse } from "next/server";
import { UserMetadata } from "@/app/db/types";
import { fetchUserMetadataFromForecaster } from "@/app/db/forecasterMock";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await DBService.getUser(address);
    
    if (user) {
      return NextResponse.json(user);
    }

    // If user doesn't exist, fetch metadata from Farcaster and create user
    const metadata = await fetchUserMetadataFromForecaster(address);
    const newUser = await DBService.getOrCreateUser(address, metadata);
    
    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { address, metadata } = await request.json();
    
    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    if (!metadata || !isValidMetadata(metadata)) {
      return NextResponse.json(
        { error: "Valid metadata is required" },
        { status: 400 }
      );
    }

    const user = await DBService.getOrCreateUser(address, metadata);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

function isValidMetadata(metadata: any): metadata is UserMetadata {
  return (
    typeof metadata === 'object' &&
    typeof metadata.full_name === 'string' &&
    typeof metadata.avatar === 'string' &&
    typeof metadata.forecaster_id === 'string' &&
    typeof metadata.forecaster_nickname === 'string'
  );
}
