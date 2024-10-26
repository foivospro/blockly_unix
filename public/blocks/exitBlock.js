var exitBlock = {
  type: 'exit',
  message0: '%{BKY_EXIT}',
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
  tooltip: '%{BKY_EXIT_TOOLTIP}',
  helpUrl: '%{BKY_EXIT_HELPURL}',

  generateCommand: function (block) {
    try {
      var x = handleBlockByType(block.getInputTargetBlock('X'));
      return `exit ${x};`;
    } catch (e) {
      return `exit;`;
    }
  }
};

Blockly.defineBlocksWithJsonArray([exitBlock]);
