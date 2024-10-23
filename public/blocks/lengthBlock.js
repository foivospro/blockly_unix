var lengthBlock = {
  type: 'length',
  message0: '%{BKY_LENGTH}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'String'
    }
  ],
  output: 'String',
  style: 'String Functions',
  tooltip: '%{BKY_LENGTH_TOOLTIP}',
  helpUrl: '%{BKY_LENGTH_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `length(${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([lengthBlock]);
