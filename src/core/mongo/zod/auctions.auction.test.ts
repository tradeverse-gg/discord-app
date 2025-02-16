/* THIS FILE WAS GENERATED AUTOMATICALLY BY Tradeverse CRM BACKEND. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
/* TO REGENERATE RUN: `yarn sync` FROM THE mongo PACKAGE */

import { assertType } from 'vitest';

import type { IAuctionZodSchema, IPartialAuctionZodSchema } from './auctions.dto.ts';
import type { CompatibleType } from '../MongooseCompatibleType';
import type { IAuction } from '../schemas/auctions.schema.ts';

type CompatibleAuction = CompatibleType<IAuction>;
type PartialCompatibleAuction = Partial<CompatibleAuction>;

declare const auction: CompatibleAuction;
declare const auctionDto: IAuctionZodSchema;
declare const partialAuction: PartialCompatibleAuction;
declare const partialAuctionDto: IPartialAuctionZodSchema;

describe('AuctionDto', () => {
	test('It should match the mongodb AuctionSchema type', () => {
		assertType<IAuctionZodSchema>(auction);
	});

	test('It should match the zod AuctionZodSchema type', () => {
		assertType<CompatibleAuction>(auctionDto);
	});

	test('It should match the mongodb PartialAuctionSchema type', () => {
		assertType<IPartialAuctionZodSchema>(partialAuction);
	});

	test('It should match the zod PartialAuctionZodSchema type', () => {
		assertType<PartialCompatibleAuction>(partialAuctionDto);
	});
});
