import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, type ComponentEmojiResolvable, type APIMessageComponentEmoji } from 'discord.js';

import { AbstractDefaultService } from '#core/abstract/service/default.service.abstract';

import type { ComponentPayload } from '#components/components.types';
import type { SafeAny } from '#core/types/any';

export interface ButtonsComponentsProps<T extends ComponentPayload = ComponentPayload<SafeAny>> {
	disabled?: boolean;
	emoji?: ComponentEmojiResolvable;
	label: string;
	payload: T;
	style: ButtonStyle;
}

export class ButtonsComponentsService extends AbstractDefaultService {
	public readonly enabled: boolean = true;
	constructor() {
		super('ButtonsComponentService');
	}

	button<T extends ComponentPayload = ComponentPayload<SafeAny>>(props: ButtonsComponentsProps<T>): ButtonBuilder {
		const button: ButtonBuilder = new ButtonBuilder().setLabel(props.label).setStyle(props.style);

		if (props.disabled) button.setDisabled(props.disabled);
		if (props.emoji) button.setEmoji(props.emoji as APIMessageComponentEmoji);

		const payload: string = JSON.stringify(props.payload);
		if (payload.length > 100) this.consoleLogger.warn(`Payload is too long: ${payload.length} characters`, payload);

		button.setCustomId(payload);

		return button;
	}

	buttons<T extends ComponentPayload = ComponentPayload<SafeAny>>(
		buttons: ButtonsComponentsProps<T>[],
	): ButtonBuilder[] {
		return buttons.map((button) => this.button(button));
	}

	buttonRow<T extends ComponentPayload = ComponentPayload<SafeAny>>(
		buttons: ButtonsComponentsProps<T>[],
	): ActionRowBuilder<ButtonBuilder> {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(this.buttons(buttons));
	}
}
