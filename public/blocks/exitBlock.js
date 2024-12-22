var exitBlock = {
  type: 'exit',
  message0: '%{BKY_EXIT}',
  args0: [
    {
      printName: true,
      type: 'input_value',
      name: 'X',
      check: ['String', 'Number']
    }
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'Field Processing',
  tooltip: '%{BKY_EXIT_TOOLTIP}',
  helpUrl: '%{BKY_EXIT_HELPURL}'
};

Blockly.defineBlocksWithJsonArray([exitBlock]);
