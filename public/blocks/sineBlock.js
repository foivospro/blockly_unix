var sineBlock = {
  type: 'sin',
  message0: '%{BKY_SINE}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_SINE_TOOLTIP}',
  helpUrl: '%{BKY_SINE_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `sin(${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([sineBlock]);
