var regAnyOneBlock = {
  type: 'regAnyOne',
  category: 'Regular Expressions',
  unix_description: [
    {
      printName: false,
      Pattern: (value, notMatch) =>
        notMatch.checked ? '[^' + value + ']' : '[' + value + ']'
    }
  ],

  message0: '%{BKY_REGANYONE} \n %{BKY_REGANYONE_NOT}',
  args0: [
    {
      type: 'field_input',
      name: 'Pattern',
      text: 'String'
    },

    {
      type: 'field_checkbox',
      name: 'notMatch',
      checked: false
    }
  ],

  tooltip: '%{BKY_REGANYONE_TOOLTIP}',
  previousStatement: null,
  nextStatement: null,
  style: 'Regular Expressions',
  helpUrl: '%{BKY_REGANYONE_HELPURL}' // URL to further information or documentation.
};

Blockly.defineBlocksWithJsonArray([regAnyOneBlock]);
window.unixGenerator.forBlock['regAnyOne'] =
  window.unixGenerator.forBlock.concat;
