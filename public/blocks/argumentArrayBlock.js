var argumentArrayBlock = {
  type: 'ARGV',
  message0: '%{BKY_ARGUMENT_ARRAY}',
  args0: [
    {
      type: 'input_value',
      name: 'INDEX',
      check: ['Number', 'String']
    }
  ],
  output: 'String',
  style: 'Special Variables',
  tooltip: '%{BKY_ARGUMENT_ARRAY_TOOLTIP}',
  helpUrl: '%{BKY_ARGUMENT_ARRAY_HELPURL}',

  generateCommand: function (block) {
    var index = handleBlockByType(block.getInputTargetBlock('INDEX'));
    return `ARGV[${index}]`;
  }
};

Blockly.defineBlocksWithJsonArray([argumentArrayBlock]);
