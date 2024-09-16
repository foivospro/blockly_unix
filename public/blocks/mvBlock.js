var mvBlock = {
  type: 'mv',
  category: 'File and Directory Operations',
  message0: '%{BKY_MV_MESSAGE}', // Correctly references %1 (SOURCE) and %2 (DEST)
  unix_description: [
    {
      not_prompt_confirmation: '-f',
      prompt_confirmation: '-i',
      verbose: '-v',
      not_overwrite: '-n'
    }
  ],
  message1: '%{BKY_MV_NOT_PROMPT_CONFIRMATION}',
  args1: [
    {
      type: 'field_checkbox',
      name: 'not_prompt_confirmation',
      checked: false
    }
  ],
  message2: '%{BKY_MV_PROMPT_CONFIRMATION}',
  args2: [
    {
      type: 'field_checkbox',
      name: 'prompt_confirmation',
      checked: false
    }
  ],
  message3: '%{BKY_MV_VERBOSE}',
  args3: [
    {
      type: 'field_checkbox',
      name: 'verbose',
      checked: false
    }
  ],
  message4: '%{BKY_MV_NOT_OVERWRITE}',
  args4: [
    {
      type: 'field_checkbox',
      name: 'not_overwrite',
      checked: false
    }
  ],
  message5: '%{BKY_MV_SOURCE}: %1 %{BKY_MV_DEST}: %2',
  args5: [
    {
      type: 'field_input',
      name: 'SOURCE',
      text: 'source'
    },
    {
      type: 'field_input',
      name: 'DEST',
      text: 'destination'
    }
  ],
  style: 'File and Directory Operations',
  previousStatement: 'Action',
  nextStatement: 'Action',
  tooltip: 'Μετακινεί ή μετονομάζει αρχεία.',
  helpUrl: 'https://linux.die.net/man/1/mv'
};

Blockly.defineBlocksWithJsonArray([mvBlock]);
