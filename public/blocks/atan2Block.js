var atan2Block = {
  type: 'atan2',
  message0: '%{BKY_ATAN2}',
  args0: [
    {
      type: 'input_value',
      name: 'Y',
      check: 'Number'
    },
    {
      type: 'input_value',
      name: 'X',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_ATAN2_TOOLTIP}',
  helpUrl: '%{BKY_ATAN2_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    var y = handleBlockByType(block.getInputTargetBlock('Y'));
    return `atan2(${y}, ${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([atan2Block]);
