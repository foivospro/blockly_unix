var sqrtBlock = {
  type: 'sqrt',
  message0: '%{BKY_SQUARE_ROOT}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_SQUARE_ROOT_TOOLTIP}',
  helpUrl: '%{BKY_SQUARE_ROOT_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `sqrt(${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([sqrtBlock]);
