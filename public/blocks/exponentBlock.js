var exponentBlock = {
  type: 'exp',
  message0: '%{BKY_EXPONENT}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_EXPONENT_TOOLTIP}',
  helpUrl: '%{BKY_EXPONENT_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `exp(${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([exponentBlock]);
