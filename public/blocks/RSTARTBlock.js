var RSTARTBlock = {
  type: 'RSTART',
  category: 'Field Processing',
  unix_description: [
    {
      FieldName: 'RSTART'
    }
  ],
  message0: '%{BKY_RSTART} %1\n',
  args0: [
    {
      type: 'input_dummy',
      name: 'FieldName'
    }
  ],
  style: 'Special Variables',
  output: null,
  tooltip: '%{BKY_RSTART_TOOLTIP}',
  helpUrl: '%{BKY_RSTART_HELPURL}' // URL to further information or documentation.
};

Blockly.defineBlocksWithJsonArray([RSTARTBlock]);
window.unixGenerator.forBlock['RSTART'] = window.unixGenerator.forBlock.generic;
