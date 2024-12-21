var sqrtBlock = {
  type: 'sqrt',
  unix_description: [
    {
      printName: false,
      sqrt: (fieldValues) => {
        return 'sqrt(' + fieldValues['sqrt'] + ')';
      }
    }
  ],
  message0: '%{BKY_SQUARE_ROOT}',
  args0: [
    {
      type: 'input_value',
      name: 'sqrt',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_SQUARE_ROOT_TOOLTIP}',
  helpUrl: '%{BKY_SQUARE_ROOT_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([sqrtBlock]);
window.unixGenerator.forBlock['sqrt'] = window.unixGenerator.forBlock.generic;
