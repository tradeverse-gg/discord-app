import { APIEmbedField, EmbedAuthorOptions, EmbedFooterOptions, HexColorString, RestOrArray } from 'discord.js';

import { EmbedComponentType } from './embeds-components.service';

export interface EmbedComponentsInputBase {
	type: EmbedComponentType;
	description?: string;
	title?: string;
	color?: HexColorString;
	author?: EmbedAuthorOptions;
	image?: string;
	thumbnail?: string;
	fields?: RestOrArray<APIEmbedField>;
	footer?: EmbedFooterOptions;
}

export interface DefaultEmbedComponentsInput extends EmbedComponentsInputBase {
	type: EmbedComponentType.Default;
	description: string;
}

export interface ErrorEmbedComponentsInput extends EmbedComponentsInputBase {
	type: EmbedComponentType.Error;
}

export interface WarningEmbedComponentsInput extends EmbedComponentsInputBase {
	type: EmbedComponentType.Warning;
}
