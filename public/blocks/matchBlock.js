var matchBlock = {
  type: 'match',
  message0: '%{BKY_MATCH}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'String'
    },
    {
      type: 'input_value',
      name: 'Y',
      check: 'String'
    }
  ],
  output: 'Number',
  style: 'String Functions',
  tooltip: '%{BKY_MATCH_TOOLTIP}',
  helpUrl: '%{BKY_MATCH_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    var y = handleBlockByType(block.getInputTargetBlock('Y'));
    return `match(${x}, ${y})`;
  }
};

Blockly.defineBlocksWithJsonArray([matchBlock]);
