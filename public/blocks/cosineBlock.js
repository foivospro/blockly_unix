var cosineBlock = {
  type: 'cos',
  message0: '%{BKY_COSINE}',
  args0: [
    {
      type: 'input_value',
      name: 'X',
      check: 'Number'
    }
  ],
  output: 'Number',
  style: 'math_blocks',
  tooltip: '%{BKY_COSINE_TOOLTIP}',
  helpUrl: '%{BKY_COSINE_HELPURL}',

  generateCommand: function (block) {
    var x = handleBlockByType(block.getInputTargetBlock('X'));
    return `cos(${x})`;
  }
};

Blockly.defineBlocksWithJsonArray([cosineBlock]);
