var sineBlock = {
  type: 'sine',
  unix_description: [
    {
      printName: 'False',
      sine: (value) => 'sin(' + value + ')'
    }
  ],
  message0: '%{BKY_SINE}',
  args0: [
    {
      type: 'input_value',
      name: 'sine',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_SINE_TOOLTIP}',
  helpUrl: '%{BKY_SINE_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([sineBlock]);
window.unixGenerator.forBlock['sine'] = window.unixGenerator.forBlock.generic;
