var filenamesCreateBlock = {
  type: 'filenamesCreate',
  category: 'Function inputs',
  message0: '%{BKY_FILES_CREATE_WITH} %1',
  args0: [
    {
      type: 'input_dummy',
      name: 'EMPTY'
    }
  ],
  style: 'Function inputs',
  nextStatement: 'Action',
  helpUrl: '%{BKY_FILES_CREATE_WITH_HELPURL}',
  tooltip: '%{BKY_FILES_CREATE_WITH_TOOLTIP}'
};

Blockly.defineBlocksWithJsonArray([filenamesCreateBlock]);
