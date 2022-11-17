import { VoiceBasedChannel, ChannelType, VoiceState, GuildBasedChannel } from 'discord.js';
export default class VoiceEventHandler {
  public static tempChannels: VoiceBasedChannel[] = [];
  public static async handleVoiceStateUpdate(newVoice: VoiceState, oldVoice: VoiceState) {
    const newUserChannel = oldVoice.channel;
    const oldUserChannel = newVoice.channel;

    if (oldUserChannel !== newUserChannel) {
      if (oldUserChannel && VoiceEventHandler.tempChannels.includes(oldUserChannel)) {
        if (oldUserChannel.members.size === 0) {
          for (let i = 0; i < VoiceEventHandler.tempChannels.length; i++) {
            if (VoiceEventHandler.tempChannels[i] === oldUserChannel) {
              VoiceEventHandler.tempChannels.splice(i, 1);
              break;
            }
          }
          await oldUserChannel.delete();
        }
      }
      if (newUserChannel) {
        const replacement = await global.sqlHandler.findChannel(newUserChannel.id);
        if (replacement) {
          let counter = 1;
          while (
            newVoice.guild.channels.cache.find(
              (c: GuildBasedChannel) => c.name === replacement.replace('$', counter.toString())
            )
          ) {
            counter++;
          }
          const channel = await newVoice.guild.channels.create({
            name: replacement.replace('$', counter.toString()),
            type: ChannelType.GuildVoice,
            parent: newUserChannel.parent ?? undefined
          });
          await channel.permissionOverwrites.set(newUserChannel.permissionOverwrites.cache);
          await channel.setUserLimit(newUserChannel.userLimit);
          await channel.setPosition(newUserChannel.position + 1);
          VoiceEventHandler.tempChannels.push(channel);
          newVoice.setChannel(channel);
        }
      }
    }
  }
}
