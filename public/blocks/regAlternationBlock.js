var regAlternationBlock = {
  type: 'regAlternation',
  category: 'Regular Expressions',
  unix_description: [
    {
      printName: false,
      LEFT_PATTERN: (fieldValues) => {
        return fieldValues['LEFT_PATTERN'] + ' |';
      },
      RIGHT_PATTERN: (fieldValues) => {
        return fieldValues['RIGHT_PATTERN'];
      }
    }
  ],
  message0: '%1',
  args0: [
    {
      type: 'input_statement',
      name: 'LEFT_PATTERN',
      check: 'String'
    }
  ],

  message1: '%{BKY_REGALTERNATION}',

  message2: '%1',
  args2: [
    {
      type: 'input_statement',
      name: 'RIGHT_PATTERN',
      check: 'String'
    }
  ],
  style: 'Regular Expressions',
  previousStatement: null,
  nextStatement: null,
  tooltip:
    'Matches either the pattern on the left or the pattern on the right. Use | for logical "or".',
  helpUrl:
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#logical_or' // URL για περισσότερες πληροφορίες
};

Blockly.defineBlocksWithJsonArray([regAlternationBlock]);
window.unixGenerator.forBlock['regAlternation'] =
  window.unixGenerator.forBlock.concat;
