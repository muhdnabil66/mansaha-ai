import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

const plans = {
  Student: { priceId: process.env.STRIPE_STUDENT_PRICE_ID, amount: 899 },
  Pro: { priceId: process.env.STRIPE_PRO_PRICE_ID, amount: 7999 },
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  const planData = plans[plan as keyof typeof plans];
  if (!planData)
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { data: userData } = await supabase
    .from("users")
    .select("email, stripe_customer_id")
    .eq("clerk_id", userId)
    .single();

  let customerId = userData?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData?.email,
      metadata: { clerk_id: userId },
    });
    customerId = customer.id;
    await supabase
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("clerk_id", userId);
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL;
  const successUrl = `${origin}/dashboard?success=true`;
  const cancelUrl = `${origin}/pricing?canceled=true`;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: planData.priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return NextResponse.json({ url: session.url });
}
