import { APIEmbedField, EmbedAuthorOptions, EmbedFooterOptions, HexColorString, RestOrArray } from 'discord.js';

import { EmbedComponentType } from './embeds-components.service';

export interface EmbedComponentsInputBase {
	author?: EmbedAuthorOptions;
	color?: HexColorString;
	description?: string;
	fields?: RestOrArray<APIEmbedField>;
	footer?: EmbedFooterOptions;
	image?: string;
	thumbnail?: string;
	title?: string;
	type: EmbedComponentType;
}

export interface DefaultEmbedComponentsInput extends EmbedComponentsInputBase {
	description: string;
	type: EmbedComponentType.Default;
}

export interface ErrorEmbedComponentsInput extends EmbedComponentsInputBase {
	type: EmbedComponentType.Error;
}

export interface WarningEmbedComponentsInput extends EmbedComponentsInputBase {
	type: EmbedComponentType.Warning;
}
