var randomBlock = {
  type: 'rand',
  message0: '%{BKY_RANDOM}',
  args0: [],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_RANDOM_TOOLTIP}',
  helpUrl: '%{BKY_RANDOM_HELPURL}',

  generateCommand: function (block) {
    var code = `rand()`;
    return code;
  }
};

Blockly.defineBlocksWithJsonArray([randomBlock]);
