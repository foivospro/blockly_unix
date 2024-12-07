var lengthBlock = {
  type: 'length',
  unix_description: [
    {
      printName: 'False',
      length: (value) => 'length(' + value + ')'
    }
  ],
  message0: '%{BKY_LENGTH}',
  args0: [
    {
      type: 'input_value',
      name: 'length',
      check: 'String'
    }
  ],
  output: 'String',
  style: 'String Functions',
  tooltip: '%{BKY_LENGTH_TOOLTIP}',
  helpUrl: '%{BKY_LENGTH_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([lengthBlock]);
window.unixGenerator.forBlock['length'] = window.unixGenerator.forBlock.generic;
