var indexBlock = {
  type: 'index',
  message0: '%{BKY_INDEX}',
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
  tooltip: '%{BKY_INDEX_TOOLTIP}',
  helpUrl: '%{BKY_INDEX_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    var y = handleBlockByType(block.getInputTargetBlock('Y'));
    return `index(${x}, ${y})`;
  }
};

Blockly.defineBlocksWithJsonArray([indexBlock]);
