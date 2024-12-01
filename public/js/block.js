window.unixGenerator = new Blockly.Generator('Unix');

window.ioGenerator = new Blockly.Generator('Io');

window.awkGenerator = new Blockly.Generator('Awk');

window.unixGenerator.scrub_ = function (block, code) {
  const nextBlock = block.getNextBlock();
  let nextCode = '';
  if (nextBlock) {
    if (
      nextBlock.styleName_ === 'I/O Redirection' ||
      nextBlock.styleName_ === 'Regular Expressions'
    ) {
      console.log(nextBlock.styleName_);
      nextCode = window.unixGenerator.blockToCode(nextBlock);
    } else {
      nextCode = ' | ' + window.unixGenerator.blockToCode(nextBlock);
    }
  }

  return code + nextCode;
};

window.unixGenerator.forBlock.generic = function (block) {
  const blockDefinition = window[block.type + 'Block'];
  const commandParts = handleBlocks(block, blockDefinition);
  if (blockDefinition.unix_description[0].printName == 'False') {
    return `${commandParts.join(' ')}`.trim();
  } else {
    return `${block.type} ${commandParts.join(' ')}`.trim();
  }
};

function generateCommandFromWorkspace() {
  const workspace = Blockly.getMainWorkspace();
  const code = window.unixGenerator.workspaceToCode(workspace);
  return code;
}

function handleBlocks(block, blockDefinition) {
  let commandParts = [];
  block.inputList.forEach((input) => {
    input.fieldRow.forEach((field) => {
      let value = '';
      if (field instanceof Blockly.FieldDropdown) {
        value = blockDefinition.unix_description[0][field.getValue()] || '';
      } else if (field instanceof Blockly.FieldCheckbox) {
        value =
          field.getValue() === 'TRUE'
            ? blockDefinition.unix_description[0][field.name]
            : '';
      } else if (
        field instanceof Blockly.FieldTextInput ||
        field instanceof Blockly.FieldNumber
      ) {
        const userInput = field.getValue();
        const defaultText = field.text_;
        if (userInput && userInput !== defaultText) {
          if (
            blockDefinition.unix_description[0][field.name] &&
            typeof blockDefinition.unix_description[0][field.name] ===
              'function'
          ) {
            value = blockDefinition.unix_description[0][field.name](userInput);
          } else {
            value = userInput;
          }
        }
      }

      if (value) {
        commandParts.push(value);
      }
    });
  });

  return commandParts;
}
