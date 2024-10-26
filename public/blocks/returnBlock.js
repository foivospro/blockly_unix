var returnBlock = {
  type: 'return',
  message0: '%{BKY_RETURN}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: ['String', 'Number']
    }
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'Field Processing',
  tooltip: '%{BKY_RETURN_TOOLTIP}',
  helpUrl: '%{BKY_RETURN_HELPURL}',

  generateCommand: function (block) {
    try {
      var x = handleBlockByType(block.getInputTargetBlock('X'));
      return `return ${x};`;
    } catch (e) {
      return `return;`;
    }
  }
};

Blockly.defineBlocksWithJsonArray([returnBlock]);
