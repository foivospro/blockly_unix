var nextBlock = {
  type: 'next',
  message0: '%{BKY_NEXT}',
  args0: [],
  previousStatement: true,
  nextStatement: true,
  style: 'Field Processing',
  tooltip: '%{BKY_NEXT_TOOLTIP}',
  helpUrl: '%{BKY_NEXT_HELPURL}',

  generateCommand: function (block) {
    return `next;`;
  }
};

Blockly.defineBlocksWithJsonArray([nextBlock]);
