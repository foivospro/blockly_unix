var beginBlock = {
  type: 'begin',
  category: 'Field Processing',
  message0: '%{BKY_BEGIN}',
  message1: '%{BKY_BEGIN_ACTION} %1',
  args1: [
    {
      type: 'input_statement',
      name: 'DO'
    }
  ],
  previousStatement: true,
  nextStatement: true,
  nextStatement: null,
  style: 'Field Processing',
  tooltip: '%{BKY_BEGIN_TOOLTIP}',
  helpUrl: '%{BKY_BEGIN_HELPURL}', // URL to further information or documentation.
  generateCommand: function (block) {
    var condCommand = 'BEGIN';
    var action = block.getInputTargetBlock('DO');
    console.log('action:', action);
    actionCommand = '';
    if (action !== null) {
      while (action) {
        actionCommand += handleBlockByType(action) + ' ';
        action = action.getNextBlock();
      }
    }
    return condCommand + ' {' + actionCommand + '}';
  }
};

Blockly.defineBlocksWithJsonArray([beginBlock]);
