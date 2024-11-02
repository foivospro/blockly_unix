var endBlock = {
  type: 'end',
  category: 'Field Processing',
  message0: '%{BKY_END}',
  message1: '%{BKY_END_ACTION} %1',
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
  tooltip: '%{BKY_END_TOOLTIP}',
  helpUrl: '%{BKY_END_HELPURL}', // URL to further information or documentation.
  generateCommand: function (block) {
    var condCommand = 'END';
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

Blockly.defineBlocksWithJsonArray([endBlock]);
