
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

// POST: Create a new workspace
export async function POST(request: NextRequest) {
    try {
        // 1. Check logged-in user
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // 2. Get workspace name from request
        const body = await request.json();
        const name = body.name?.trim();

        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { success: false, message: "Workspace name is required." },
                { status: 400 }
            );
        }

        // 3. Create workspace and owner membership together
        const workspace = await prisma.workspace.create({
            data: {
                name,
                ownerId: userId,

                memberships: {
                    create: {
                        userId,
                        role: "OWNER",
                    },
                },
            },
            include: {
                memberships: true,
            },
        });

        // 4. Return successful response
        return NextResponse.json(
            {
                success: true,
                message: "Workspace created successfully.",
                workspace,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create workspace error:", error);

        return NextResponse.json(
            { success: false, message: "Something went wrong." },
            { status: 500 }
        );
    }
}

// GET: Fetch all workspaces of logged-in user
export async function GET() {
    try {
        // 1. Check logged-in user
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // 2. Find user's workspaces
        const workspaces = await prisma.workspace.findMany({
            where: {
                memberships: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                memberships: {
                    select: {
                        role: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // 3. Return workspace list
        return NextResponse.json({
            success: true,
            totalWorkspaces: workspaces.length,
            workspaces,
        });

    } catch (error) {
        console.error("Fetch workspaces error:", error);

        return NextResponse.json(
            { success: false, message: "Something went wrong." },
            { status: 500 }
        );
    }
}
