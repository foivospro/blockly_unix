var deleteArrayElementBlock = {
  type: 'deleteArrayElement',
  message0: '%{BKY_DELETE_ARRAY_ELEMENT}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: ['String']
    }
  ],
  message1: '%{BKY_DELETE_ARRAY_ELEMENT_INDEX}',
  args1: [
    {
      type: 'input_value',
      name: 'INDEX',
      check: ['Number', 'String']
    }
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'list_blocks',
  tooltip: '%{BKY_DELETE_ARRAY_ELEMENT_TOOLTIP}',
  helpUrl: '%{BKY_DELETE_ARRAY_ELEMENT_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    var index = handleBlockByType(block.getInputTargetBlock('INDEX'));
    return `delete ${x}[${index}];`;
  }
};

Blockly.defineBlocksWithJsonArray([deleteArrayElementBlock]);
