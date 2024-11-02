var FNRBlock = {
  type: 'FNR',
  category: 'Field Processing',
  unix_description: [
    {
      FNR: 'FNR'
    }
  ],
  message0: '%{BKY_FNR} %1\n',
  args0: [
    {
      type: 'input_dummy',
      name: 'FieldNumber'
    }
  ],
  style: 'Special Variables',
  output: null,
  tooltip: '%{BKY_FNR_TOOLTIP}',
  helpUrl: '%{BKY_FNR_HELPURL}', // URL to further information or documentation.
  generateCommand: function (block) {
    var awkCommand = 'FNR';
    return awkCommand;
  }
};

Blockly.defineBlocksWithJsonArray([FNRBlock]);
