var NFBlock = {
  type: 'NF',
  category: 'Field Processing',
  unix_description: [
    {
      FieldNumber: 'NF'
    }
  ],
  message0: '%{BKY_FIELD_NUMBER} %1\n',
  args0: [
    {
      type: 'input_dummy',
      name: 'FieldNumber'
    }
  ],
  style: 'Special Variables',
  output: null,
  tooltip: '%{BKY_FIELD_NUMBER_TOOLTIP}',
  helpUrl: '%{BKY_FIELD_NUMBER_HELPURL}' // URL to further information or documentation.
};

Blockly.defineBlocksWithJsonArray([NFBlock]);
window.unixGenerator.forBlock['NF'] = window.unixGenerator.forBlock.generic;
