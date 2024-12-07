var FILENAMEBlock = {
  type: 'FILENAME',
  category: 'Field Processing',
  unix_description: [
    {
      Filename: 'FILENAME'
    }
  ],
  message0: '%{BKY_FILENAME_VARIABLE} %1\n',
  args0: [
    {
      type: 'input_dummy',
      name: 'Filename'
    }
  ],
  style: 'Special Variables',
  output: null,
  tooltip: '%{BKY_FILENAME_TOOLTIP}',
  helpUrl: '%{BKY_FILENAME_HELPURL}' // URL to further information or documentation.
};

Blockly.defineBlocksWithJsonArray([FILENAMEBlock]);
window.unixGenerator.forBlock['FILENAME'] =
  window.unixGenerator.forBlock.generic;
