var deleteArrayBlock = {
  type: 'deleteArray',
  message0: '%{BKY_DELETE_ARRAY}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: ['String']
    }
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'list_blocks',
  tooltip: '%{BKY_DELETE_ARRAY_TOOLTIP}',
  helpUrl: '%{BKY_DELETE_ARRAY_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `delete ${x};`;
  }
};

Blockly.defineBlocksWithJsonArray([deleteArrayBlock]);
