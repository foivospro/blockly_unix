var touchBlock = {
  type: 'touch',
  message0: '%{BKY_TOUCH}',
  category: 'File and Directory Operations',
  unix_description: [
    {
      not_create_file: '-c',
      change_time_t: '-t str',
      change_time_d: '-d str',
      access_time: '-a',
      modification_time: '-r'
    }
  ],
  message1: '%{BKY_TOUCH_NOT_CREATE_FILE}',
  args1: [
    {
      type: 'field_checkbox',
      name: 'not_create_file',
      checked: false
    }
  ],
  message2: '%{BKY_TOUCH_CHANGE_ACCESS_TIME}',
  args2: [
    {
      type: 'field_checkbox',
      name: 'access_time',
      checked: false
    }
  ],
  message3: '%{BKY_TOUCH_CHANGE_MODIFICATION_TIME}',
  args3: [
    {
      type: 'field_checkbox',
      name: 'modification_time',
      checked: false
    }
  ],

  message4: '%{BKY_TOUCH_SPECIFY_TIME_FORMAT_T}',
  args4: [
    {
      type: 'field_input',
      name: 'change_time_t',
      text: '',
      check: 'String'
    }
  ],
  message5: '%{BKY_TOUCH_PROPOSE_OTHER_FORMAT}',
  message6: '%{BKY_TOUCH_SPECIFY_TIME_FORMAT_D}',
  args6: [
    {
      type: 'field_input',
      name: 'change_time_d',
      text: '',
      check: 'String'
    }
  ],
  extensions: ['validate_touch_time_t', 'validate_touch_time_d'],
  style: 'File and Directory Operations',
  previousStatement: 'Action',
  nextStatement: 'Action',
  tooltip: '%{BKY_TOUCH_TOOLTIP}',
  helpUrl: '%{BKY_TOUCH_HELPURL}' // URL to further information or documentation.
};

Blockly.defineBlocksWithJsonArray([touchBlock]);
