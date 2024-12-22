var conditionBlock = {
  type: 'condition',
  category: 'Field Processing',
  unix_description: [
    {
      printName: false,
      leftPart: (fieldValues) => {
        return fieldValues['leftPart'];
      },
      equals: '==',
      not_equals: '!=',
      smaller: '<',
      smaller_equals: '<=',
      greater: '>',
      greater_equals: '>=',
      logical_and: '&&',
      logical_or: '||',
      logical_not: '!',
      rightPart: (fieldValues) => {
        return fieldValues['rightPart'];
      }
    }
  ],
  message0: '%1', // First message line for left_part
  args0: [
    {
      type: 'input_value',
      name: 'left_part',
      check: ['String', 'Number', 'Boolean'] // Allow both String and Number types
    }
  ],
  message1: '%1', // Second message line for operator
  args1: [
    {
      type: 'field_dropdown',
      name: 'operator',
      options: [
        ['==', 'equals'],
        ['!=', 'not_equals'],
        ['<', 'smaller'],
        ['<=', 'smaller_equals'],
        ['>', 'greater'],
        ['>=', 'greater_equals'],
        ['&& (AND)', 'logical_and'],
        ['|| (OR)', 'logical_or'],
        ['! (NOT)', 'logical_not']
      ]
    }
  ],
  message2: '%1', // Third message line for right_part
  args2: [
    {
      type: 'input_value',
      name: 'right_part',
      check: ['String', 'Number', 'Boolean'] // Allow both String and Number types
    }
  ],
  style: 'Field Processing',
  output: null
};

Blockly.defineBlocksWithJsonArray([conditionBlock]);
window.unixGenerator.forBlock['condition'] =
  window.unixGenerator.forBlock.generic;
