var rmBlock = {
  type: 'rm',
  message0: '%{BKY_RM}',
  category: 'File and Directory Operations',
  unix_description: [
    {
      force: '-f',
      request_confirmation: '-i',
      remove_directory: '-d',
      recursive: '-R',
      verbose: '-v',
      undelete: '-W',
      no_cross_mount: '-x'
    }
  ],
  message1: '%{BKY_RM_FORCE}',
  args1: [
    {
      type: 'field_checkbox',
      name: 'force',
      checked: false
    }
  ],
  message2: '%{BKY_RM_REQUEST_CONFIRMATION}',
  args2: [
    {
      type: 'field_checkbox',
      name: 'request_confirmation',
      checked: false
    }
  ],
  message3: '%{BKY_RM_REMOVE_DIRECTORIES}',
  args3: [
    {
      type: 'field_checkbox',
      name: 'remove_directory',
      checked: false
    }
  ],
  message4: '%{BKY_RM_RECURSIVE}',
  args4: [
    {
      type: 'field_checkbox',
      name: 'recursive',
      checked: false
    }
  ],
  message5: '%{BKY_RM_VERBOSE}',
  args5: [
    {
      type: 'field_checkbox',
      name: 'verbose',
      checked: false
    }
  ],
  message6: '%{BKY_RM_NO_CROSS_MOUNT}',
  args6: [
    {
      type: 'field_checkbox',
      name: 'no_cross_mount',
      checked: false
    }
  ],
  extensions: [],
  style: 'File and Directory Operations',
  previousStatement: 'Action',
  nextStatement: 'Action',
  tooltip: '%{BKY_RM_TOOLTIP}',
  helpUrl: 'https://linux.die.net/man/1/rm'
};

Blockly.defineBlocksWithJsonArray([rmBlock]);
