var sshBlock = {
  type: 'ssh',
  message0: '%{BKY_SSH}',
  category: 'Network Operations',
  unix_description: [
    {
      command: 'ssh %USER@%HOST -p %PORT %COMMAND'
    }
  ],
  message1: '%{BKY_SSH_HOST} %1',
  args1: [
    {
      type: 'field_input',
      name: 'HOST',
      text: 'host'
    }
  ],
  message2: '%{BKY_SSH_USER} %1',
  args2: [
    {
      type: 'field_input',
      name: 'USER',
      text: 'user'
    }
  ],
  message3: '%{BKY_SSH_PORT} %1',
  args3: [
    {
      type: 'field_input',
      name: 'PORT',
      text: '22'
    }
  ],
  style: 'Network Operations',
  previousStatement: 'Action',
  nextStatement: 'Action',
  tooltip: 'Ανοίγει ασφαλείς συνδέσεις δικτύου.',
  helpUrl: 'https://linux.die.net/man/1/ssh'
};

Blockly.defineBlocksWithJsonArray([sshBlock]);
