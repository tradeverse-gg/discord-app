/* THIS FILE WAS GENERATED AUTOMATICALLY BY Tradeverse CRM BACKEND. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
/* TO REGENERATE RUN: `yarn sync` FROM THE mongo PACKAGE */

import { z, type TypeOf } from 'zod';

export const AuctionZodSchema = z.object({
	auctionId: z.string(),
	sellerId: z.string(),
	channelId: z.string(),
	cardMessageId: z.string(),
	cardImage: z.string(),
	cardEmbed: z.object({
		type: z.string(),
		description: z.string(),
		color: z.number(),
		image: z.object({ url: z.string(), proxy_url: z.string(), width: z.number(), height: z.number() }),
		thumbnail: z.object({
			url: z.string(),
			proxy_url: z.string(),
			width: z.number(),
			height: z.number(),
			flags: z.number(),
		}),
	}),
	currency: z.string(),
	startingBid: z.number().nullable().optional(),
	currentBid: z.number().nullable().optional(),
	increment: z.number().nullable().optional(),
	bidders: z.array(z.object({ userId: z.string().nullable().optional(), amount: z.number().nullable().optional() })),
	status: z.enum(['Active', 'Paused', 'Ended']).default('Active'),
	startTime: z.string().datetime({ offset: true }),
	endTime: z.string().datetime({ offset: true }),
	createdAt: z.string().datetime({ offset: true }),
	updatedAt: z.string().datetime({ offset: true }),
});
export const PartialAuctionZodSchema = AuctionZodSchema.partial();

export type IAuctionZodSchema = TypeOf<typeof AuctionZodSchema>;
export type IPartialAuctionZodSchema = TypeOf<typeof PartialAuctionZodSchema>;
