window.unixGenerator = new Blockly.Generator('Unix');

window.unixGenerator.scrub_ = function (block, code) {
  let nextBlock = block.getNextBlock();
  let nextCode = '';

  while (nextBlock) {
    const handlerFunction = window.unixGenerator.forBlock[nextBlock.type];

    let connector = '';
    if (handlerFunction === window.unixGenerator.forBlock.generic) {
      connector = ' | ';
    } else if (handlerFunction === window.unixGenerator.forBlock.concat) {
      connector = '';
    } else {
      connector = ' ';
    }

    nextCode += connector + handlerFunction(nextBlock);
    nextBlock = nextBlock.getNextBlock();
  }

  return code + nextCode;
};

window.unixGenerator.forBlock.generic = function (block) {
  const blockDefinition = window[block.type + 'Block'];
  const commandParts = handleBlocks(block, blockDefinition);
  if (!blockDefinition.unix_description[0].printName) {
    return `${commandParts.join(' ')}`;
  } else {
    return `${block.type} ${commandParts.join(' ')}`.trim();
  }
};

window.unixGenerator.forBlock.concat = function (block) {
  const blockDefinition = window[block.type + 'Block'];
  const commandParts = handleBlocks(block, blockDefinition);
  if (!blockDefinition.unix_description[0].printName) {
    return `${commandParts.join(' ')}`;
  } else {
    return `${block.type} ${commandParts.join(' ')}`.trim();
  }
};

function generateCommandFromWorkspace() {
  const workspace = Blockly.getMainWorkspace();
  blocks = workspace.getTopBlocks(true);
  topBlock = blocks[0];
  const code = window.unixGenerator.blockToCode(topBlock);
  return code;
}

function handleBlocks(block, blockDefinition) {
  let commandParts = [];
  const description = blockDefinition.unix_description[0];
  const blockType = block.type;

  // Check if the unix_description contains a key matching the block's type
  if (description[blockType]) {
    const commandName = description[blockType];
    commandParts.push(commandName);
  }

  block.inputList.forEach((input) => {
    input.fieldRow.forEach((field) => {
      let value = '';
      if (field instanceof Blockly.FieldDropdown) {
        value = description[field.getValue()] || '';
      } else if (field instanceof Blockly.FieldCheckbox) {
        value = field.getValue() === 'TRUE' ? description[field.name] : '';
      } else if (
        field instanceof Blockly.FieldTextInput ||
        field instanceof Blockly.FieldNumber
      ) {
        const userInput = field.getValue();
        const defaultText = field.text_;
        if (userInput && userInput !== defaultText) {
          if (
            description[field.name] &&
            typeof description[field.name] === 'function'
          ) {
            value = description[field.name](userInput);
          } else {
            value = userInput;
          }
        }
      }
      if (value) {
        commandParts.push(value);
      }
    });

    if (input.connection && input.connection.isConnected()) {
      const childBlock = input.connection.targetBlock();
      if (childBlock) {
        const childCode = window.unixGenerator.blockToCode(childBlock);
        const inputDescription = description[input.name] || '';
        if (childCode) {
          if (!input.name) {
            console.error('Input has no name:', input);
            return;
          }
          const processingFn = description[input.name];

          if (typeof processingFn === 'function') {
            const processedChildCode = processingFn(childCode.trim());
            commandParts.push(processedChildCode);
          } else {
            commandParts.push(childCode.trim());
          }
        }
      }
    }
  });

  return commandParts;
}
