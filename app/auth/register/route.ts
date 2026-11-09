
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // 1. Read registration details
        const body = await request.json();

        const { name, email, password } = body;

        // 2. Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Name, email and password are required",
                },
                { status: 400 }
            );
        }

        if (typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid input",
                },
                { status: 400 }
            );
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Enter a valid name and email address",
                },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password must be at least 8 characters",
                },
                { status: 400 }
            );
        }

        // 3. Check whether email already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email is already registered",
                },
                { status: 409 }
            );
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 5. Save user in PostgreSQL
        const user = await prisma.user.create({
            data: {
                name: normalizedName,
                email: normalizedEmail,
                passwordHash: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        // 6. Send success response
        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully",
                user,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Registration error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong during registration",
            },
            { status: 500 }
        );
    }
}
