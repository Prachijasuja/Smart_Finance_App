import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🟩 GET all transactions for a user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { account: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ success: false, message: "Error fetching transactions" }, { status: 500 });
  }
}

// 🟨 POST - Create a new transaction
export async function POST(req) {
  try {
    const body = await req.json();

    const { userId, accountId, type, category, amount, date, description } = body;

    if (!userId || !accountId || !amount || !category || !type) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type,
        category,
        amount: parseFloat(amount),
        date: new Date(date),
        description,
      },
    });

    // Update account balance accordingly
    if (type === "EXPENSE") {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { decrement: parseFloat(amount) } },
      });
    } else if (type === "INCOME") {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: parseFloat(amount) } },
      });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ success: false, message: "Error creating transaction" }, { status: 500 });
  }
}

// 🟧 PUT - Update existing transaction
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Transaction ID required" }, { status: 400 });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/transactions error:", error);
    return NextResponse.json({ success: false, message: "Error updating transaction" }, { status: 500 });
  }
}

// 🟥 DELETE - Delete a transaction
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing transaction ID" }, { status: 400 });
    }

    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    return NextResponse.json({ success: false, message: "Error deleting transaction" }, { status: 500 });
  }
}
