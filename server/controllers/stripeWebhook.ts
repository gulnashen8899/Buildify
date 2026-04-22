

import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma.js';

export const stripeWebhook = async (request: Request, response: Response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  const signature = request.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      signature,
      endpointSecret
    );
  } catch (err: any) {
    console.log('Webhook signature failed:', err.message);
    return response.sendStatus(400);
  }

  console.log("EVENT TYPE:", event.type);

  switch (event.type) {

    // ✅ HANDLE CHECKOUT SUCCESS
    case 'checkout.session.completed': {

      const session = event.data.object as Stripe.Checkout.Session;

      console.log("SESSION METADATA:", session.metadata);

      const transactionId = session.metadata?.transactionId;

      if (!transactionId) {
        console.log("❌ Missing transactionId");
        return response.sendStatus(400);
      }

      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        console.log("❌ Transaction not found");
        return response.sendStatus(400);
      }

      await prisma.transaction.update({
        where: { id: transactionId },
        data: { isPaid: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: transaction.userId },
      });

      if (!user) {
        console.log("❌ User not found");
        return response.sendStatus(400);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: Number(user.credits || 0) + Number(transaction.credits || 0),
        },
      });

      console.log("✅ Credits updated successfully");

      break;
    }

    // ✅ SAFETY: if Stripe sends payment_intent instead
    case 'payment_intent.succeeded': {
      console.log("⚠️ payment_intent.succeeded received (ignored)");
      break;
    }

    default:
      console.log("Unhandled event:", event.type);
  }

  return response.json({ received: true });
};