var filenameVariableBlock = {
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
      name: 'FieldNumber'
    }
  ],
  style: 'Special Variables',
  output: null,
  tooltip: '%{BKY_FILENAME_TOOLTIP}',
  helpUrl: '%{BKY_FILENAME_HELPURL}', // URL to further information or documentation.
  generateCommand: function (block) {
    var awkCommand = 'FILENAME';
    return awkCommand;
  }
};

Blockly.defineBlocksWithJsonArray([filenameVariableBlock]);
