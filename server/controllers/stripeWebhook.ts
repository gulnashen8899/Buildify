

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

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("SESSION RECEIVED:", session.id);
      console.log("METADATA:", session.metadata);

      const transactionId = session.metadata?.transactionId;

      if (!transactionId) {
        console.log("❌ transactionId missing in metadata");
        return response.sendStatus(400);
      }

      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        console.log("❌ Transaction not found:", transactionId);
        return response.sendStatus(400);
      }

      await prisma.transaction.update({
        where: { id: transactionId },
        data: { isPaid: true },
      });

      console.log("✅ Transaction marked paid");

      const user = await prisma.user.findUnique({
        where: { id: transaction.userId },
      });

      if (!user) {
        console.log("❌ User not found:", transaction.userId);
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

    default:
      console.log("Unhandled event:", event.type);
  }

  return response.json({ received: true });
};