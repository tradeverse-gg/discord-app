import { BadRequestException } from '@nestjs/common';
import { Model, type FilterQuery, type UpdateQuery } from 'mongoose';

class MongoError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MongoError';
	}
}

type SplitString<S extends string> = S extends ''
	? []
	: S extends `${infer Head} ${infer Tail}`
		? [Head, ...SplitString<Tail>]
		: [S];

type ArrayToUnion<T extends any[]> = T[number];

type Split<S extends string> = ArrayToUnion<SplitString<S>>;

type SelectedFields<T, S extends string> = {
	[K in Split<S> & keyof T]: T[K];
};

type SelectType<T> = keyof T extends string ? string : never;

type SelectReturn<T, S extends SelectType<T>> = S extends '' ? T : SelectedFields<T, S>;

type RequiredProps<T> = {
	[K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];
type RequiredFields<T> = Pick<T, RequiredProps<T>>;

export interface IModelOperations<T> {
	aggregate: <R = any>(pipeline: object[]) => Promise<R[]>;
	count: (query: FilterQuery<T>) => Promise<number>;
	create: (data: RequiredFields<Omit<T, 'createdAt' | 'updatedAt'>> & Partial<T>) => Promise<T>;
	deleteMany: (query: FilterQuery<T>) => Promise<{
		acknowledged: boolean;
		deletedCount: number;
	}>;
	deleteOne: {
		<K extends keyof T>(query: FilterQuery<T>, select: K[]): Promise<Pick<T, K> | null>;
		<S extends SelectType<T>>(query: FilterQuery<T>, select?: S): Promise<SelectReturn<T, S> | null>;
	};
	find: {
		<K extends keyof T>(query: FilterQuery<T>, select: K[]): Promise<Pick<T, K>[]>;
		<S extends SelectType<T>>(query: FilterQuery<T>, select?: S): Promise<SelectReturn<T, S>[]>;
	};
	findAll: {
		<K extends keyof T>(select: K[]): Promise<Pick<T, K>[]>;
		<S extends SelectType<T>>(select?: S): Promise<SelectReturn<T, S>[]>;
	};
	findOne: {
		<K extends keyof T>(query: FilterQuery<T>, select: K[]): Promise<Pick<T, K> | null>;
		<S extends SelectType<T>>(query: FilterQuery<T>, select?: S): Promise<SelectReturn<T, S> | null>;
	};
	updateMany: (
		query: FilterQuery<T>,
		data: UpdateQuery<T>,
	) => Promise<{
		acknowledged: boolean;
		matchedCount: number;
		modifiedCount: number;
	}>;
	updateOne: {
		<K extends keyof T>(query: FilterQuery<T>, data: UpdateQuery<T>, select: K[]): Promise<Pick<T, K> | null>;
		<S extends SelectType<T>>(
			query: FilterQuery<T>,
			data: UpdateQuery<T>,
			select?: S,
		): Promise<SelectReturn<T, S> | null>;
	};
}

export class MongoBaseService<T> implements IModelOperations<T> {
	protected readonly model: Model<T>;
	get Model(): Model<T> {
		return this.model;
	}

	public constructor(model: Model<T>) {
		this.model = model;
	}

	public async create(data: RequiredFields<Omit<T, 'createdAt' | 'updatedAt'>> & Partial<T>): Promise<T> {
		try {
			const createdDocument = new this.model(data);
			return (await createdDocument.save()).toJSON() as T;
		} catch (error: any) {
			if (error.code === 11_000) throw new BadRequestException('Document already exists');
			console.error(`Error creating document: ${error.message}`);
			throw new MongoError(`Error creating document: ${error.message}`);
		}
	}

	public async findAll<K extends keyof T>(select: K[]): Promise<Pick<T, K>[]>;
	public async findAll<S extends SelectType<T>>(select?: S): Promise<SelectReturn<T, S>[]>;

	public async findAll<K extends keyof T | SelectType<T>>(select: K[] | K = '' as K): Promise<T[]> {
		try {
			const baseQuery = this.model.find();

			if (Array.isArray(select)) {
				const projection = Object.fromEntries(select.map((field) => [field, 1]));
				return (await baseQuery.select(projection).lean().exec()) as T[];
			}

			return (await baseQuery
				.select(select as string)
				.lean()
				.exec()) as T[];
		} catch (error: any) {
			console.error(`Error finding documents: ${error.message}`);
			throw new MongoError(`Error finding documents: ${error.message}`);
		}
	}

	public async find<K extends keyof T>(query: FilterQuery<T>, select: K[]): Promise<Pick<T, K>[]>;
	public async find<S extends SelectType<T>>(query: FilterQuery<T>, select?: S): Promise<SelectReturn<T, S>[]>;

	public async find<K extends keyof T | SelectType<T>>(query: FilterQuery<T>, select: K[] | K = '' as K): Promise<T[]> {
		try {
			const baseQuery = this.model.find(query);

			if (Array.isArray(select)) {
				const projection = Object.fromEntries(select.map((field) => [field, 1]));
				return (await baseQuery.select(projection).lean().exec()) as T[];
			}

			return (await baseQuery
				.select(select as string)
				.lean()
				.exec()) as T[];
		} catch (error: any) {
			console.error(`Error finding documents: ${error.message}`);
			throw new MongoError(`Error finding documents: ${error.message}`);
		}
	}

	public async findOne<K extends keyof T>(query: FilterQuery<T>, select: K[]): Promise<Pick<T, K> | null>;
	public async findOne<S extends SelectType<T>>(query: FilterQuery<T>, select?: S): Promise<SelectReturn<T, S> | null>;

	public async findOne<K extends keyof T | SelectType<T>>(
		query: FilterQuery<T>,
		select: K[] | K = '' as K,
	): Promise<T | null> {
		try {
			const baseQuery = this.model.findOne(query);

			if (Array.isArray(select)) {
				const projection = Object.fromEntries(select.map((field) => [field, 1]));
				return (await baseQuery.select(projection).lean().exec()) as T | null;
			}

			return (await baseQuery
				.select(select as string)
				.lean()
				.exec()) as T | null;
		} catch (error: any) {
			console.error(`Error finding document: ${error.message}`);
			throw new MongoError(`Error finding document: ${error.message}`);
		}
	}

	public async updateOne<K extends keyof T>(
		query: FilterQuery<T>,
		data: UpdateQuery<T>,
		select: K[],
	): Promise<Pick<T, K> | null>;
	public async updateOne<S extends SelectType<T>>(
		query: FilterQuery<T>,
		data: UpdateQuery<T>,
		select?: S,
	): Promise<SelectReturn<T, S> | null>;

	public async updateOne<K extends keyof T | SelectType<T>>(
		query: FilterQuery<T>,
		data: UpdateQuery<T>,
		select: K[] | K = '' as K,
	): Promise<T | null> {
		try {
			const baseQuery = this.model.findOneAndUpdate(query, data, { new: true });

			if (Array.isArray(select)) {
				const projection = Object.fromEntries(select.map((field) => [field, 1]));
				return (await baseQuery.select(projection).lean().exec()) as T | null;
			}

			return (await baseQuery
				.select(select as string)
				.lean()
				.exec()) as T | null;
		} catch (error: any) {
			console.error(`Error updating document: ${error.message}`);
			throw new MongoError(`Error updating document: ${error.message}`);
		}
	}

	public async updateMany(
		query: FilterQuery<T>,
		data: UpdateQuery<T>,
	): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }> {
		try {
			return await this.model.updateMany(query, data).lean().exec();
		} catch (error: any) {
			console.error(`Error updating documents: ${error.message}`);
			throw new MongoError(`Error updating documents: ${error.message}`);
		}
	}

	public async deleteOne<K extends keyof T>(query: FilterQuery<T>, select: K[]): Promise<Pick<T, K> | null>;
	public async deleteOne<S extends SelectType<T>>(
		query: FilterQuery<T>,
		select?: S,
	): Promise<SelectReturn<T, S> | null>;

	public async deleteOne<K extends keyof T | SelectType<T>>(
		query: FilterQuery<T>,
		select: K[] | K = '' as K,
	): Promise<T | null> {
		try {
			const baseQuery = this.model.findOneAndDelete(query);

			if (Array.isArray(select)) {
				const projection = Object.fromEntries(select.map((field) => [field, 1]));
				return (await baseQuery.select(projection).lean().exec()) as T | null;
			}

			return (await baseQuery
				.select(select as string)
				.lean()
				.exec()) as T | null;
		} catch (error: any) {
			console.error(`Error deleting document: ${error.message}`);
			throw new MongoError(`Error deleting document: ${error.message}`);
		}
	}

	public async deleteMany(query: FilterQuery<T>): Promise<{ acknowledged: boolean; deletedCount: number }> {
		try {
			return await this.model.deleteMany(query).lean().exec();
		} catch (error: any) {
			console.error(`Error deleting documents: ${error.message}`);
			throw new MongoError(`Error deleting documents: ${error.message}`);
		}
	}

	public async count(query: FilterQuery<T>): Promise<number> {
		try {
			return await this.model.countDocuments(query).lean().exec();
		} catch (error: any) {
			console.error(`Error counting documents: ${error.message}`);
			throw new MongoError(`Error counting documents: ${error.message}`);
		}
	}

	public async aggregate(pipeline: any[]): Promise<any[]> {
		try {
			return await this.model.aggregate(pipeline).exec();
		} catch (error: any) {
			console.error(`Error aggregating documents: ${error.message}`);
			throw new MongoError(`Error aggregating documents: ${error.message}`);
		}
	}
}
