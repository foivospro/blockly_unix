var argumentCountBlock = {
  type: 'ARGC',
  category: 'Field Processing',
  unix_description: [
    {
      ARGC: 'ARGC'
    }
  ],
  message0: '%{BKY_ARGUMENT_COUNT} %1\n',
  args0: [
    {
      type: 'input_dummy',
      name: 'FieldNumber'
    }
  ],
  style: 'Special Variables',
  output: null,
  tooltip: '%{BKY_ARGUMENT_COUNT_TOOLTIP}',
  helpUrl: '%{BKY_ARGUMENT_COUNT_HELPURL}', // URL to further information or documentation.
  generateCommand: function (block) {
    var awkCommand = 'ARGC';
    return awkCommand;
  }
};

Blockly.defineBlocksWithJsonArray([argumentCountBlock]);
