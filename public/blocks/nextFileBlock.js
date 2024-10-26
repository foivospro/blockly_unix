var nextFileBlock = {
  type: 'nextFile',
  message0: '%{BKY_NEXT_FILE}',
  args0: [],
  previousStatement: true,
  nextStatement: true,
  style: 'Field Processing',
  tooltip: '%{BKY_NEXT_FILE_TOOLTIP}',
  helpUrl: '%{BKY_NEXT_FILE_HELPURL}',

  generateCommand: function (block) {
    return `nextfile;`;
  }
};

Blockly.defineBlocksWithJsonArray([nextFileBlock]);
