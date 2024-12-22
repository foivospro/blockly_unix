var arraySetIndexBlock = {
  type: 'arraySetIndex',
  unix_description: [
    {
      printName: false,
      ARRAY: (fieldValues) => {
        return fieldValues['ARRAY'] + '[';
      },
      INDEX: (fieldValues) => {
        return fieldValues['INDEX'] + '] =';
      },
      VALUE: (fieldValues) => {
        return fieldValues['VALUE'] + ';';
      }
    }
  ],
  message0: '%{BKY_ARRAY_SET_INDEX}',
  args0: [
    {
      type: 'input_value',
      name: 'ARRAY',
      check: 'String'
    }
  ],
  message1: '%{BKY_ARRAY_SET_INDEX_INDEX}',
  args1: [
    {
      type: 'input_value',
      name: 'INDEX',
      check: ['Number', 'String']
    }
  ],
  message2: '%{BKY_ARRAY_SET_INDEX_VALUE}',
  args2: [
    {
      type: 'input_value',
      name: 'VALUE',
      check: ['String', 'Number']
    }
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'list_blocks',
  tooltip: '%{BKY_ARRAY_SET_INDEX_TOOLTIP}',
  helpUrl: '%{BKY_ARRAY_SET_INDEX_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([arraySetIndexBlock]);
window.unixGenerator.forBlock['arraySetIndex'] =
  window.unixGenerator.forBlock.generic;
