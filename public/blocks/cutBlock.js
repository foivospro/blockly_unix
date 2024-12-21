var cutBlock = {
  type: 'cut',
  category: 'Text Processing',
  unix_description: [
    {
      printName: true,
      delimiter: (fieldValues) => {
        return "-d '" + fieldValues['delimiter'] + "'";
      }, // Wrap value in -d 'value'
      columns: (fieldValues) => {
        return '-f ' + fieldValues['columns'];
      }, // Format for specific columns
      colsStart: (fieldValues) => {
        return '-f ' + fieldValues['colsStart'];
      }, // Starting column
      colsEnd: (fieldValues) => {
        return '-f ' + fieldValues['colsEnd'];
      }, // Ending column
      individualChars: (fieldValues) => {
        return "-c '" + fieldValues['individualChars'] + "'";
      }, // Specific characters
      charsStart: (fieldValues) => {
        return "-c '" + fieldValues['charsStart'] + "'";
      }, // Starting characters
      charsEnd: (fieldValues) => {
        return "-c '" + fieldValues['charsEnd'] + "'";
      } // Ending characters
    }
  ],
  message0: '%{BKY_CUT}\n',
  message1: '%{BKY_CUT_DELIMITER} %1\n',
  args1: [
    {
      type: 'field_input',
      name: 'delimiter',
      text: ''
    }
  ],
  message2: '%{BKY_CUT_DEFINE_COLUMNS} %1\n',
  args2: [
    {
      type: 'field_input',
      name: 'columns',
      text: ''
    }
  ],
  message3: '%{BKY_CUT_COLUMNS_START} %1 %{BKY_CUT_COLUMNS_END} %2\n',
  args3: [
    {
      type: 'field_input',
      name: 'colsStart',
      text: ''
    },
    {
      type: 'field_input',
      name: 'colsEnd',
      text: ''
    }
  ],
  message4: '%{BKY_CUT_SPECIFIC_CHARACTERS} %1\n',
  args4: [
    {
      type: 'field_input',
      name: 'individualChars',
      text: ''
    }
  ],
  message5: '%{BKY_CUT_START} %1 %{BKY_CUT_END} %2',
  args5: [
    {
      type: 'field_input',
      name: 'charsStart',
      text: ''
    },
    {
      type: 'field_input',
      name: 'charsEnd',
      text: ''
    }
  ],
  style: 'Text Processing',
  previousStatement: 'Action',
  nextStatement: 'Action',
  tooltip: '%{BKY_CUT_TOOLTIP}',
  helpUrl: '%{BKY_CUT_HELPURL}' // URL to further information or documentation.
};

Blockly.defineBlocksWithJsonArray([cutBlock]);

window.unixGenerator.forBlock['cut'] = window.unixGenerator.forBlock.generic;
