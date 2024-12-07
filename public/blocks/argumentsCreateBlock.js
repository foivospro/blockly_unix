var argumentsCreateBlock = {
  type: 'argumentsCreate',
  unix_description: [
    {
      printName: 'False',
      EMPTY: (value) => value
    }
  ],
  category: 'Function inputs',
  message0: '%{BKY_ARGUMENTS_CREATE_WITH} %1',
  args0: [
    {
      type: 'input_dummy',
      name: 'EMPTY'
    }
  ],
  output: 'String',
  style: 'Function inputs',
  helpUrl: '%{BKY_ARGUMENTS_CREATE_WITH_HELPURL}',
  tooltip: '%{BKY_ARGUMENTS_CREATE_WITH_TOOLTIP}'
};

Blockly.defineBlocksWithJsonArray([argumentsCreateBlock]);

window.unixGenerator.forBlock['argumentsCreate'] =
  window.unixGenerator.forBlock.concat;
