var toUpperBlock = {
  type: 'toUpper',
  unix_description: [
    {
      printName: false,
      toUpper: (fieldValues) => {
        return 'toupper(' + fieldValues['toUpper'] + ')';
      }

    }
  ],
  message0: '%{BKY_TO_UPPER}',
  args0: [
    {
      type: 'input_value',
      name: 'toUpper',
      check: 'String'
    }
  ],
  output: 'String',
  style: 'String Functions',
  tooltip: '%{BKY_TO_UPPER_TOOLTIP}',
  helpUrl: '%{BKY_TO_UPPER_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([toUpperBlock]);
window.unixGenerator.forBlock['toUpper'] =
  window.unixGenerator.forBlock.generic;
