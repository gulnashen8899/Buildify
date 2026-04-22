

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
    console.log(`⚠️ Webhook signature verification failed.`, err.message);
    return response.sendStatus(400);
  }

  switch (event.type) {

    
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const metadata = session.metadata as {
        transactionId?: string;
        appId?: string;
      };

      if (metadata?.appId === 'ai-site-builder' && metadata?.transactionId) {

        const transaction = await prisma.transaction.update({
          where: { id: metadata.transactionId },
          data: { isPaid: true },
        });

        await prisma.user.update({
          where: { id: transaction.userId },
          data: {
            credits: {
              increment: transaction.credits,
            },
          },
        });
      }

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
};