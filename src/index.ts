import dotenv from 'dotenv';
import { DiscordHandler, InteractionHandler, Logger, WARNINGLEVEL } from 'discord.ts-architecture';
import { GatewayIntentBits, Partials } from 'discord.js';
import SqlHandler from './handlers/sqlHandler';
import VoiceEventHandler from './handlers/voiceEventHandler';
import AddTempChannelCommand from './commands/addTempChannel';
import RemoveTempChannelCommand from './commands/removeTempChannel';
// initialize configuration
dotenv.config();

declare global {
  /* eslint-disable-next-line */
  var discordHandler: DiscordHandler;
  /* eslint-disable-next-line */
  var interactionHandler: InteractionHandler;
  /* eslint-disable-next-line */
  var sqlHandler: SqlHandler;
}
global.interactionHandler = new InteractionHandler([new AddTempChannelCommand(), new RemoveTempChannelCommand()]);

global.discordHandler = new DiscordHandler(
  [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
  [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.Guilds
  ]
);
global.sqlHandler = new SqlHandler();

discordHandler.on('interactionCreate', (interaction) => global.interactionHandler.handle(interaction));
discordHandler.on('voiceStateUpdate', VoiceEventHandler.handleVoiceStateUpdate);

process.on('uncaughtException', (err: Error) => {
  Logger.exception('Uncaught Exception', err, WARNINGLEVEL.ERROR);
});
process.on('unhandledRejection', (reason) => {
  Logger.exception('Unhandled Rejection', reason, WARNINGLEVEL.ERROR);
});

sqlHandler.initDB().then(async () => {
  await discordHandler.login(process.env.DISCORD_TOKEN ?? '');
  await interactionHandler.init(process.env.DISCORD_TOKEN ?? '', process.env.CLIENTID ?? '', discordHandler);
  Logger.info('Bot is ready');
});
