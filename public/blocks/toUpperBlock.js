var toUpperBlock = {
  type: 'toUpper',
  message0: '%{BKY_TO_UPPER}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'String'
    }
  ],
  output: 'String',
  style: 'String Functions',
  tooltip: '%{BKY_TO_UPPER_TOOLTIP}',
  helpUrl: '%{BKY_TO_UPPER_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `toupper(${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([toUpperBlock]);
