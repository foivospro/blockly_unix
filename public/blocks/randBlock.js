var randomBlock = {
  type: 'random',
  unix_description: [
    {
      printName: false,
      rand: 'rand()'
    }
  ],
  message0: '%{BKY_RANDOM}',
  args0: [],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_RANDOM_TOOLTIP}',
  helpUrl: '%{BKY_RANDOM_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([randomBlock]);
window.unixGenerator.forBlock['random'] = window.unixGenerator.forBlock.generic;
