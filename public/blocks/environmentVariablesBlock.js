var environBlock = {
  type: 'ENVIRON',
  category: 'Field Processing',
  unix_description: [
    {
      ENVIRON: 'ENVIRON'
    }
  ],
  message0: '%{BKY_ENVIRONMENT_VARIABLE} %1\n',
  args0: [
    {
      type: 'field_dropdown',
      name: 'ENV_VAR',
      options: [
        ['Home Directory (HOME)', 'HOME'],
        ['System Path (PATH)', 'PATH'],
        ['Username (USER)', 'USER'],
        ['Shell Type (SHELL)', 'SHELL'],
        ['Current Directory (PWD)', 'PWD'],
        ['Language Setting (LANG)', 'LANG'],
        ['Terminal Type (TERM)', 'TERM'],
        ['Default Editor (EDITOR)', 'EDITOR'],
        ['Mail Directory (MAIL)', 'MAIL'],
        ['Login Name (LOGNAME)', 'LOGNAME'],
        ['Hostname (HOSTNAME)', 'HOSTNAME'],
        ['Previous Directory (OLDPWD)', 'OLDPWD'],
        ['Terminal Lines (LINES)', 'LINES'],
        ['Terminal Columns (COLUMNS)', 'COLUMNS']
      ]
    }
  ],
  style: 'Special Variables',
  output: null,
  tooltip: '%{BKY_ENVIRONMENT_VARIABLE_TOOLTIP}',
  helpUrl: '%{BKY_ENVIRONMENT_VARIABLE_HELPURL}', // URL to further information or documentation.
  generateCommand: function (block) {
    var envVar = block.getFieldValue('ENV_VAR');
    return 'ENVIRON["' + envVar + '"]';
  }
};

Blockly.defineBlocksWithJsonArray([environBlock]);
