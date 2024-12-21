var exponentBlock = {
  type: 'exponent',
  unix_description: [
    {
      printName: false,
      exp: (fieldValues) => {
        return 'exp(' + fieldValues['exp'] + ')';
      }

    }
  ],
  message0: '%{BKY_EXPONENT}',
  args0: [
    {
      type: 'input_value',
      name: 'exp',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_EXPONENT_TOOLTIP}',
  helpUrl: '%{BKY_EXPONENT_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([exponentBlock]);
window.unixGenerator.forBlock['exponent'] =
  window.unixGenerator.forBlock.generic;
