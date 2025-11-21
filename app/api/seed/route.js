import { createTransaction } from "../../../actions/transactions";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

    const { accountId, type, category, amount, date, description } = await req.json();

    const result = await createTransaction({ userId, accountId, type, category, amount, date, description });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
