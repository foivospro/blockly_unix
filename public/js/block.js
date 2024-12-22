/************************************************************
 * block.js
 ************************************************************/

// Initialize the Unix generator
window.unixGenerator = new Blockly.Generator('Unix');

/**
 * The scrub_ function is responsible for chaining blocks together,
 * adding the appropriate connectors/transitions (e.g., "|").
 */
window.unixGenerator.scrub_ = function (block, code) {
  let nextBlock = block.getNextBlock();
  let nextCode = '';
  let isFilenameHandled = false;

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

    if (block.type === 'filenamesCreate' && !isFilenameHandled) {
      nextCode += handlerFunction(nextBlock) + ' ' + code;
      isFilenameHandled = true;
    } else {
      nextCode += connector + handlerFunction(nextBlock);
    }

    nextBlock = nextBlock.getNextBlock();
  }
  return isFilenameHandled ? nextCode : code + nextCode;
};

/**
 * Basic implementation for generic blocks (e.g., most Unix commands).
 */
window.unixGenerator.forBlock.generic = function (block) {
  const blockDefinition = window[block.type + 'Block'];
  const commandParts = handleBlocks(block, blockDefinition);
  if (!blockDefinition.unix_description[0].printName) {
    return `${commandParts.join(' ')}`;
  } else {
    return `${block.type} ${commandParts.join(' ')}`.trim();
  }
};

/**
 * Implementation for blocks that are concatenated (e.g., no extra connectors like "|").
 */
window.unixGenerator.forBlock.concat = function (block) {
  const blockDefinition = window[block.type + 'Block'];
  const commandParts = handleBlocks(block, blockDefinition);
  if (!blockDefinition.unix_description[0].printName) {
    return `${commandParts.join(' ')}`;
  } else {
    return `${block.type} ${commandParts.join(' ')}`.trim();
  }
};

/**
 * Function that generates the code (command) from the workspace.
 */
function generateCommandFromWorkspace() {
  const workspace = Blockly.getMainWorkspace();
  const blocks = workspace.getTopBlocks(true);
  const topBlock = blocks[0];
  const code = window.unixGenerator.blockToCode(topBlock);
  return code;
}

/**
 * handleBlocks: Processes the fields and connected blocks to produce the final Unix command.
 */
function handleBlocks(block, blockDefinition) {
  let commandParts = [];
  let metadata = [];

  const description = blockDefinition.unix_description[0];
  const blockType = block.type;

  // Check if the unix_description contains a key matching the block's type
  if (description[blockType]) {
    const commandName = description[blockType];
    commandParts.push(commandName);
    metadata.push({ value: commandName, type: blockType });
  }

  // Collect all field values from the block in an object
  const fieldValues = {};
  block.inputList.forEach((input) => {
    input.fieldRow.forEach((field) => {
      if (field.name) {
        fieldValues[field.name] = field.getValue();
      }
    });
  });

  // Iterate again to build the command parts
  block.inputList.forEach((input) => {
    input.fieldRow.forEach((field) => {
      let value = '';
      if (field instanceof Blockly.FieldDropdown) {
        value = description[field.getValue()] || '';
      } else if (field instanceof Blockly.FieldCheckbox) {
        if (
          description[field.name] &&
          typeof description[field.name] === 'function'
        ) {
          value =
            field.getValue() === 'TRUE'
              ? description[field.name](fieldValues)
              : '';
        } else {
          value = field.getValue() === 'TRUE' ? description[field.name] : '';
        }
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
            value = description[field.name](fieldValues);
          } else {
            value = userInput;
          }
        }
      }
      if (value) {
        commandParts.push(value);
        metadata.push({ value, type: block.type });
      }
    });

    // If there's a connected block, generate code for that as well
    if (input.connection && input.connection.isConnected()) {
      const childBlock = input.connection.targetBlock();
      if (childBlock) {
        const childCode = window.unixGenerator.blockToCode(childBlock);
        if (childCode) {
          if (!input.name) {
            console.error('Input has no name:', input);
            return;
          }
          const processingFn = description[input.name];
          if (typeof processingFn === 'function') {
            const processedChildCode = processingFn(childCode.trim());
            commandParts.push(processedChildCode);
            metadata.push({ value: processedChildCode, type: childBlock.type });
          } else {
            commandParts.push(childCode.trim());
            metadata.push({ value: childCode.trim(), type: childBlock.type });
          }
        }
      }
    }
  });

  // Example logic to handle 'arguments' blocks or reorder parts if needed
  const reorderedCommandParts = [];
  const argumentParts = [];

  metadata.forEach((part) => {
    if (part.type === 'argument' || part.type === 'argumentsCreate') {
      argumentParts.push(part.value);
    } else {
      reorderedCommandParts.push(part.value);
    }
  });

  // Append argument parts at the end
  const finalCommandParts = [...reorderedCommandParts, ...argumentParts];

  return finalCommandParts;
}
