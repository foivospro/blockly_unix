var indexBlock = {
  type: 'index',
  unix_description: [
    {
      printName: false,
      X: (fieldValues) => {
        return 'index(' + fieldValues['X'] + ',';
      },
      Y: (fieldValues) => {
        return fieldValues['Y'] + ')';
      }
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
