var setSeedBlock = {
  type: 'seed',
  message0: '%{BKY_SETSEED}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_SET_SEED_TOOLTIP}',
  helpUrl: '%{BKY_SET_SEED_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `srand(${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([setSeedBlock]);
