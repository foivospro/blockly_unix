var arraySetIndexBlock = {
  type: 'arraySetIndex',
  message0: '%{BKY_ARRAY_SET_INDEX}',
  args0: [
    {
      type: 'input_value',
      name: 'ARRAY',
      check: 'String'
    }
  ],
  message1: '%{BKY_ARRAY_SET_INDEX_INDEX}',
  args1: [
    {
      type: 'input_value',
      name: 'INDEX',
      check: ['Number', 'String']
    }
  ],
  message2: '%{BKY_ARRAY_SET_INDEX_VALUE}',
  args2: [
    {
      type: 'input_value',
      name: 'VALUE',
      check: ['String', 'Number']
    }
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'list_blocks',
  tooltip: '%{BKY_ARRAY_SET_INDEX_TOOLTIP}',
  helpUrl: '%{BKY_ARRAY_SET_INDEX_HELPURL}',

  generateCommand: function (block) {
    var array = handleBlockByType(block.getInputTargetBlock('ARRAY'));
    var index = handleBlockByType(block.getInputTargetBlock('INDEX'));
    var value = handleBlockByType(block.getInputTargetBlock('VALUE'));
    return `${array}[${index}] = ${value};`;
  }
};

Blockly.defineBlocksWithJsonArray([arraySetIndexBlock]);
