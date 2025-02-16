import type { Schema, Types } from 'mongoose';

type NativeDate = Date;

export type CompatibleType<T> =
	T extends Types.Subdocument<any, any, infer O>
		? CompatibleType<O>
		: T extends string | number | boolean | bigint | symbol | null
			? T
			: Date extends T
				? string
				: NativeDate extends T
					? string
					: {
							[key in keyof T]: undefined extends T[key]
								? T[key] extends infer U | undefined
									? CompatibleType<U> | undefined
									: T[key]
								: T[key] extends string | number | boolean | bigint | symbol | null
									? T[key]
									: Date extends T[key]
										? string
										: NativeDate extends T[key]
											? string
											: T[key] extends Types.Subdocument<any, any, infer O>
												? CompatibleType<O>
												: T[key] extends Types.ObjectId
													? string
													: T[key] extends { type: typeof Schema.Types.Mixed }
														? any
														: T[key] extends Schema.Types.Mixed
															? any
															: T[key] extends Function
																? T[key]
																: T[key] extends any[]
																	? CompatibleType<T[key][number]>[]
																	: T[key] extends object
																		? CompatibleType<T[key]>
																		: T[key];
						};
