var deleteListElementBlock = {
  type: 'deleteListElement',
  message0: '%{BKY_DELETE_LIST_ELEMENT}',
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
  tooltip: '%{BKY_DELETE_LIST_ELEMENT_TOOLTIP}',
  helpUrl: '%{BKY_DELETE_LIST_ELEMENT_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `delete ${x};`;
  }
};

Blockly.defineBlocksWithJsonArray([deleteListElementBlock]);
