var headBlock = {
  type: 'head',
  message0: '%{BKY_HEAD_MESSAGE}',
  category: 'Text Processing',
  unix_description: [
    {
      printName: true,
      bytes: '-c',
      lines: '-n'
    }
  ],
  message1: '%{BKY_HEAD_METRIC}',
  args1: [
    {
      type: 'field_dropdown',
      name: 'metric_type',
      options: [
        ['lines', 'lines'],
        ['bytes', 'bytes']
      ]
    }
  ],
  message2: '%{BKY_HEAD_NUMBER_OF}',
  args2: [
    {
      type: 'field_number',
      name: 'METRIC',
      value: 10 // default number of bytes
    }
  ],

  tooltip: '%{BKY_HEAD_TOOLTIP}',
  previousStatement: 'Action',
  nextStatement: 'Action',
  style: 'Text Processing',
  helpUrl: '' // URL to further information or documentation.
};

Blockly.defineBlocksWithJsonArray([headBlock]);

window.unixGenerator.forBlock['head'] = window.unixGenerator.forBlock.generic;
