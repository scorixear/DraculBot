import SqlHandler from '../handlers/sqlHandler';
import LanguageHandler from '../handlers/languageHandler';
import { ChatInputCommandInteraction, SlashCommandChannelOption } from 'discord.js';
import { ChannelType } from 'discord-api-types/v10';
import { CommandInteractionModel, MessageHandler } from 'discord.ts-architecture';

declare const sqlHandler: SqlHandler;

export default class RemoveTempChannelCommand extends CommandInteractionModel {
  constructor() {
    const commandOptions: any[] = [];
    const channelOption: SlashCommandChannelOption = new SlashCommandChannelOption()
      .setName('channel')
      .setDescription(LanguageHandler.language.commands.addTempChannel.options.channel)
      .setRequired(true);
    channelOption.addChannelTypes(ChannelType.GuildVoice);
    commandOptions.push(channelOption);
    super(
      'removechannel',
      LanguageHandler.language.commands.removeTempChannel.description,
      'removechannel #general',
      'Moderation',
      'removechannel <#channel-name>',
      commandOptions
    );
  }

  override async handle(interaction: ChatInputCommandInteraction) {
    try {
      await super.handle(interaction);
    } catch (err) {
      return;
    }

    const channel = interaction.options.getChannel('channel', true);

    if (!(await sqlHandler.removeChannel(channel?.id ?? ''))) {
      await MessageHandler.replyError({
        interaction,
        title: LanguageHandler.language.commands.removeTempChannel.error.sqlTitle,
        description: LanguageHandler.language.commands.removeTempChannel.error.sqlDescription,
        color: 0xcc0000
      });
      return;
    }

    await MessageHandler.reply({
      interaction,
      title: LanguageHandler.language.commands.removeTempChannel.labels.success,
      description: LanguageHandler.replaceArgs(LanguageHandler.language.commands.removeTempChannel.labels.description, [
        `<#${channel.id}>`
      ])
    });
  }
}
