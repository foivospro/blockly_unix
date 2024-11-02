var FSBlock = {
  type: 'FS',
  category: 'Field Processing',
  unix_description: [
    {
      FieldSeparator: 'FS'
    }
  ],
  message0: '%{BKY_FIELD_SEPARATOR}',
  args0: [
    {
      type: 'field_input',
      name: 'FieldSeparator'
    }
  ],
  style: 'Special Variables',
  output: null,
  tooltip: '%{BKY_FIELD_SEPARATOR_TOOLTIP}',
  helpUrl: '%{BKY_FIELD_SEPARATOR_HELPURL}', // URL to further information or documentation.
  generateCommand: function (block) {
    var fieldSeparator = block.getFieldValue('FieldSeparator');
    return 'FS = "' + fieldSeparator + '"';
  }
};

Blockly.defineBlocksWithJsonArray([FSBlock]);
