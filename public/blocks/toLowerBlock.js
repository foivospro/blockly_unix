var toLowerBlock = {
  type: 'toLower',
  message0: '%{BKY_TO_LOWER}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'String'
    }
  ],
  output: 'String',
  style: 'String Functions',
  tooltip: '%{BKY_TO_LOWER_TOOLTIP}',
  helpUrl: '%{BKY_TO_LOWER_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `tolower(${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([toLowerBlock]);
