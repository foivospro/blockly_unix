var intBlock = {
  type: 'int',
  message0: '%{BKY_TO_INT}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_TO_INT_TOOLTIP}',
  helpUrl: '%{BKY_TO_INT_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `int(${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([intBlock]);
