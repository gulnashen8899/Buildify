

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

    case 'payment_intent.succeeded': {

      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log("PAYMENT INTENT RECEIVED:", paymentIntent.id);

      const sessionList = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      const session = sessionList.data[0];

      if (!session) {
        console.log("❌ No checkout session found");
        break;
      }

      const metadata = session.metadata as {
        transactionId?: string;
        appId?: string;
      };

      console.log("SESSION METADATA:", metadata);

      if (!metadata?.transactionId) {
        console.log("❌ transactionId missing");
        break;
      }

      const transaction = await prisma.transaction.findUnique({
        where: { id: metadata.transactionId },
      });

      if (!transaction) {
        console.log("❌ Transaction not found");
        break;
      }

      await prisma.transaction.update({
        where: { id: metadata.transactionId },
        data: { isPaid: true },
      });

      console.log("✅ Transaction marked paid");

      const user = await prisma.user.findUnique({
        where: { id: transaction.userId },
      });

      if (!user) {
        console.log("❌ User not found");
        break;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: {
            increment: transaction.credits,
          },
        },
      });

      console.log("✅ Credits updated successfully");

      break;
    }

    default:
      console.log("Unhandled event:", event.type);
  }

  return response.json({ received: true });
};