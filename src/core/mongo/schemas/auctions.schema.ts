import { Schema, type InferSchemaType, SchemaTypes } from 'mongoose';

export const AuctionSchemaName = 'Auction';

export const AuctionSchema = new Schema(
	{
		auctionId: { type: SchemaTypes.String, required: true, unique: true },
		sellerId: { type: SchemaTypes.String, required: true },
		channelId: { type: SchemaTypes.String, required: true },
		cardMessageId: { type: SchemaTypes.String, required: true },
		cardImage: { type: SchemaTypes.String, required: true },
		cardEmbed: { type: SchemaTypes.Mixed, required: true },
		currency: { type: SchemaTypes.String, required: true },
		startingBid: { type: SchemaTypes.Number },
		currentBid: { type: SchemaTypes.Number },
		increment: { type: SchemaTypes.Number },
		bidders: { type: [{ userId: { type: SchemaTypes.String }, amount: SchemaTypes.Number }], required: false },
		status: { type: SchemaTypes.String, enum: ['Active', 'Paused', 'Ended'], default: 'Active' },
		startTime: { type: SchemaTypes.Date, required: true },
		endTime: { type: SchemaTypes.Date, required: true },
	},
	{ timestamps: true, versionKey: false },
);

export type IAuction = InferSchemaType<typeof AuctionSchema>;
export type IAuctionDoc = Omit<IAuction, 'updatedAt'>;

export const customAuctionSchemaZodTypes = {
	// Works only for Mixed types for now
	// Discord embeds with fields and everything
	cardEmbed: `z.object({type: z.string(), description: z.string(), color: z.number(), image: z.object({url: z.string(), proxy_url: z.string(), width: z.number(), height: z.number() }), thumbnail: z.object({url: z.string(), proxy_url: z.string(), width: z.number(), height: z.number(), flags: z.number() }) })`,
};
