export default class LanguageHandler {
  public static language = {
    commands: {
      addTempChannel: {
        description: 'Links a Voice-Channel to a Temp-Channel.',
        error: {
          usageTitle: 'Wrong usage',
          textTitle: 'Textchannel selected',
          textDescription: 'Textchannel select, the channel must be a voice channel.',
          sqlTitle: 'DB Error',
          sqlDescription: 'channel could not be saved.'
        },
        labels: {
          success: 'Channel configured',
          description: 'Channel $0 is configured. Temp channels follow the schema `$1`'
        },
        options: {
          channel: 'The channel that should be the temp channel generator',
          channel_names: 'The schema for the temp channel names.'
        }
      },
      removeTempChannel: {
        description: 'Removes the configuration of temp-channels',
        error: {
          usageTitle: 'Wrong Usage',
          sqlTitle: 'DB Error',
          sqlDescription: 'Could not delete channel configuration.'
        },
        labels: {
          success: 'Channel configuration deleted.',
          description: 'The Configuration for channel $0 was deleted.'
        }
      },
      remove: {
        description: 'Removes this bot from this server',
        success: {
          title: 'Leaving Server',
          description: 'I will try to leave this server now!'
        },
        internal: {
          title: 'Internal Error',
          description: 'Internal Error when trying to leave server.'
        },
        error: {
          title: 'No permissions',
          description: 'You are not permitted to execute this command'
        }
      }
    }
  };

  /**
   * Replaces preset args with values in a string
   * @param input
   * @param args
   * @return the filled string
   */
  public static replaceArgs(input: string, args: string[]) {
    // console.log(input);
    // console.log(args);
    for (let i = 0; i < args.length; i++) {
      input = input.split('$' + i).join(args[i]);
    }
    return input;
  }
}
