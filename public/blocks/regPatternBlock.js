var regPatternBlock = {
  type: 'regPattern',
  category: 'Regular Expressions',
  message0: '%{BKY_REGPATTERN}',
  unix_description: [
    {
      printName: false
    }
  ],
  args0: [
    {
      type: 'field_input',
      name: 'regPattern',
      text: 'string' // default text for the input
    }
  ],
  previousStatement: ['String', 'Action'],
  nextStatement: 'Action',
  style: 'Regular Expressions',
  tooltip: '%{BKY_REGPATTERN_TOOLTIP}',
  helpUrl: '%{BKY_REGPATTERN_HELPURL}' // URL to further information or documentation.
};

Blockly.defineBlocksWithJsonArray([regPatternBlock]);
window.unixGenerator.forBlock['regPattern'] =
  window.unixGenerator.forBlock.concat;
