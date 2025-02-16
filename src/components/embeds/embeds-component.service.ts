import { Injectable } from '@nestjs/common';
import { EmbedBuilder, HexColorString } from 'discord.js';

import { AbstractDefaultService } from '#core/abstract/service/default.service.abstract';

import {
	DefaultEmbedComponentsInput,
	ErrorEmbedComponentsInput,
	WarningEmbedComponentsInput,
} from '#components/embeds/embeds-component.types';

export enum EmbedComponentType {
	Default = 'default',
	Error = 'error',
	Warning = 'warning',
	Item = 'item',
}

export type EmbedComponentsInput =
	| DefaultEmbedComponentsInput
	| ErrorEmbedComponentsInput
	| WarningEmbedComponentsInput;

@Injectable()
export class EmbedsComponentsService extends AbstractDefaultService {
	public readonly enabled: boolean = true;
	public static readonly defaultEmbedColor: HexColorString = '#62b8f3';
	public static readonly defaultWarningColor: HexColorString = '#f97316';
	public static readonly defaultErrorEmbedColor: HexColorString = '#ff0000';

	public readonly defaultErrorTitle = 'Error';
	public readonly defaultErrorDescription = 'An error occurred.';
	public readonly defaultWarningTitle = 'Warning';
	public readonly defaultWarningDescription = 'An warning occurred.';

	constructor() {
		super('EmbedComponentsService');
	}

	public embed(input: EmbedComponentsInput): EmbedBuilder {
		const embed = new EmbedBuilder();

		if (input.author) {
			embed.setAuthor(input.author);
		} else {
			embed.setAuthor({
				name: 'Tradeverse',
			});
		}

		switch (input.type) {
			case EmbedComponentType.Error:
				if (!input.title) {
					input.title = this.defaultErrorTitle;
				}
				if (!input.description) {
					input.description = this.defaultErrorDescription;
				}
				if (!input.color) {
					input.color = EmbedsComponentsService.defaultErrorEmbedColor;
				}
				break;
			case EmbedComponentType.Warning:
				if (!input.title) {
					input.title = this.defaultWarningTitle;
				}
				if (!input.description) {
					input.description = this.defaultWarningDescription;
				}
				if (!input.color) {
					input.color = EmbedsComponentsService.defaultWarningColor;
				}
				break;
			default:
				if (!input.color) {
					input.color = EmbedsComponentsService.defaultEmbedColor;
				}
				break;
		}

		if (input.description) embed.setDescription(input.description);
		if (input.title) embed.setTitle(input.title);
		if (input.color) embed.setColor(input.color);
		if (input.image) embed.setImage(input.image);
		if (input.thumbnail) embed.setThumbnail(input.thumbnail);
		if (input.fields) embed.addFields(...input.fields);
		if (input.footer) embed.setFooter(input.footer);

		return embed;
	}

	public async embeds(input: EmbedComponentsInput[]): Promise<EmbedBuilder[]> {
		return Promise.all(input.map((i) => this.embed(i)));
	}
}
