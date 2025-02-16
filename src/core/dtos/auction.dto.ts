import { createZodDto } from '#zod';

import { AuctionZodSchema } from '../mongo/zod';

export class AuctionDto extends createZodDto(AuctionZodSchema) {}
export class AuctionsDto extends createZodDto(AuctionZodSchema.array()) {}
