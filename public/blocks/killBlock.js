var killBlock = {
  type: 'kill',
  category: 'Other Commands',
  message0: '%{BKY_KILL} %1',
  unix_description: [
    {
      command: 'kill %PID'
    }
  ],
  args0: [
    {
      type: 'field_input',
      name: 'PID',
      text: 'PID' // default PID
    }
  ],
  style: 'Other Commands',
  previousStatement: 'Action',
  nextStatement: 'Action',
  tooltip: '%{BKY_KILL_TOOLTIP}',
  helpUrl: '%{BKY_KILL_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([killBlock]);
//
