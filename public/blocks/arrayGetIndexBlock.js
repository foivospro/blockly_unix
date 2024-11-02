var arrayGetIndexBlock = {
  type: 'arrayGetIndex',
  message0: '%{BKY_ARRAY_GET_INDEX}',
  args0: [
    {
      type: 'input_value',
      name: 'ARRAY',
      check: 'String'
    }
  ],
  message1: '%{BKY_ARRAY_GET_INDEX_INDEX}',
  args1: [
    {
      type: 'input_value',
      name: 'INDEX',
      check: ['Number', 'String']
    }
  ],
  output: 'String',
  style: 'list_blocks',
  tooltip: '%{BKY_ARRAY_GET_INDEX_TOOLTIP}',
  helpUrl: '%{BKY_ARRAY_GET_INDEX_HELPURL}',

  generateCommand: function (block) {
    var array = handleBlockByType(block.getInputTargetBlock('ARRAY'));
    var index = handleBlockByType(block.getInputTargetBlock('INDEX'));
    return `${array}[${index}]`;
  }
};

Blockly.defineBlocksWithJsonArray([arrayGetIndexBlock]);
