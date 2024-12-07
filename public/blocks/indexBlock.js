var indexBlock = {
  type: 'index',
  unix_description: [
    {
      printName: 'False',
      X: (value) => 'index(' + value + ',',
      Y: (value) => value + ')'
    }
  ],
  message0: '%{BKY_INDEX}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'String'
    },
    {
      type: 'input_value',
      name: 'Y',
      check: 'String'
    }
  ],
  output: 'Number',
  style: 'String Functions',
  tooltip: '%{BKY_INDEX_TOOLTIP}',
  helpUrl: '%{BKY_INDEX_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([indexBlock]);
window.unixGenerator.forBlock['index'] = window.unixGenerator.forBlock.generic;
