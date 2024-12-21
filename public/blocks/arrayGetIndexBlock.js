var arrayGetIndexBlock = {
  type: 'arrayGetIndex',
  unix_description: [
    {
      printName: false,
      ARRAY: (fieldValues) => {
        return fieldValues['ARRAY'] + '[';
      },
      INDEX: (fieldValues) => {
        return fieldValues['INDEX'] + ']';
      }

    }
  ],
  message0: '%{BKY_ARRAY_GET_INDEX}',
  args0: [
    {
      type: 'input_value',
      name: 'ARRAY',
      check: 'String'
    }
  ],
  message1: '%{BKY_ARRAY_GET_INDEX_INDEX}',
  args1: [
    {
      type: 'input_value',
      name: 'INDEX',
      check: ['Number', 'String']
    }
  ],
  output: 'String',
  style: 'list_blocks',
  tooltip: '%{BKY_ARRAY_GET_INDEX_TOOLTIP}',
  helpUrl: '%{BKY_ARRAY_GET_INDEX_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([arrayGetIndexBlock]);
window.unixGenerator.forBlock['arrayGetIndex'] =
  window.unixGenerator.forBlock.generic;
