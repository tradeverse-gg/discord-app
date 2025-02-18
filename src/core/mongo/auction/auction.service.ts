import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AuctionSchemaName, type IAuction } from '#mongoose/schemas/auctions.schema';

import { MongoBaseService } from '../MongoBaseService';

import type { Model } from 'mongoose';


@Injectable()
export class MongoAuctionService extends MongoBaseService<IAuction> {
	public constructor(
		@InjectModel(AuctionSchemaName, 'tradeverse')
		protected override readonly model: Model<IAuction>,
	) {
		super(model);
	}
}
