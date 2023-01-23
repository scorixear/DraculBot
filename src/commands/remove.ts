import LanguageHandler from '../handlers/languageHandler';
import { ChatInputCommandInteraction } from 'discord.js';
import { CommandInteractionModel, MessageHandler } from 'discord.ts-architecture';

export default class RemoveCommand extends CommandInteractionModel {
  constructor() {
    const commandOptions: any[] = [];
    super('remove', LanguageHandler.language.commands.remove.description, 'remove', 'Owner', 'remove', commandOptions);
  }

  override async handle(interaction: ChatInputCommandInteraction) {
    try {
      await super.handle(interaction);
    } catch (err) {
      return;
    }

    const user = interaction.user;
    if (process.env.OWNER_ID === user.id) {
      await MessageHandler.reply({
        interaction,
        title: LanguageHandler.language.commands.remove.success.title,
        description: LanguageHandler.language.commands.remove.success.description,
        ephemeral: true
      });
      try {
        await interaction.guild?.leave();
      } catch {
        await MessageHandler.followUp({
          interaction,
          title: LanguageHandler.language.commands.remove.internal.title,
          description: LanguageHandler.language.commands.remove.internal.description,
          ephemeral: true,
          color: 0xcc0000
        });
      }
    } else {
      await MessageHandler.replyError({
        interaction,
        title: LanguageHandler.language.commands.remove.error.title,
        description: LanguageHandler.language.commands.remove.error.description
      });
    }
  }
}
