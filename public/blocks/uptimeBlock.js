var uptimeBlock = {
  type: 'uptime',
  message0: '%{BKY_UPTIME}',
  category: 'System Monitoring',
  unix_description: [
    {
      desc: 'Displays how long the system has been running, the number of users, and the system load averages.',
      pretty: '-p',
      since: '-s',
      kernel_version: '-v',
      help: '--help'
    }
  ],
  message1: '%{BKY_UPTIME_PRETTY}',
  args1: [
    {
      type: 'field_checkbox',
      name: 'pretty',
      checked: false
    }
  ],
  message2: '%{BKY_UPTIME_SINCE}',
  args2: [
    {
      type: 'field_checkbox',
      name: 'since',
      checked: false
    }
  ],
  message3: '%{BKY_UPTIME_KERNEL_VERSION}',
  args3: [
    {
      type: 'field_checkbox',
      name: 'kernel_version',
      checked: false
    }
  ],

  extensions: ['integer_validation'],

  style: 'System Monitoring',
  previousStatement: 'Action',
  nextStatement: 'Action',
  tooltip: '%{BKY_UPTIME_TOOLTIP}',
  helpUrl: '%{BKY_UPTIME_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([uptimeBlock]);
