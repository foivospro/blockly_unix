var RSTARTBlock = {
  type: 'RSTART',
  category: 'Field Processing',
  unix_description: [
    {
      RSTART: 'RSTART'
    }
  ],
  message0: '%{BKY_RSTART} %1\n',
  args0: [
    {
      type: 'input_dummy',
      name: 'FieldNumber'
    }
  ],
  style: 'Special Variables',
  output: null,
  tooltip: '%{BKY_RSTART_TOOLTIP}',
  helpUrl: '%{BKY_RSTART_HELPURL}', // URL to further information or documentation.
  generateCommand: function (block) {
    var awkCommand = 'RSTART';
    return awkCommand;
  }
};

Blockly.defineBlocksWithJsonArray([RSTARTBlock]);
