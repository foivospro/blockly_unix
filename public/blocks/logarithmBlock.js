var logarithmBlock = {
  type: 'log',
  message0: '%{BKY_LOGARITHM}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_LOGARITHM_TOOLTIP}',
  helpUrl: '%{BKY_LOGARITHM_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `log(${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([logarithmBlock]);
