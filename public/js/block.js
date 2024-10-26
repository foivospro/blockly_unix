// Global replacement map
const replacementMap = new Map([
  //['and', '&&'], conflict with random block
  ['window.alert', 'print']
]);

var filenameBlocks = ['filename', 'filenamesCreate', 'fileEndStart'];

function generateCommandFromWorkspace() {
  let currentBlock = workspace.getTopBlocks()[0];
  let generatedCommand = '';
  let blockCount = 0;

  while (currentBlock) {
    blockCount++;
    var blockDef = window[currentBlock.type + 'Block'];
    const specificCommand = handleBlockByType(currentBlock);
    try {
      if (filenameBlocks.includes(currentBlock.type)) {
      } else if (
        blockDef &&
        (blockDef.category === 'I/O Redirection' ||
          blockDef.category === 'Regular Expressions')
      ) {
        generatedCommand += handleBlock(currentBlock);
      } else if (specificCommand) {
        generatedCommand += (generatedCommand ? ' | ' : '') + specificCommand;
      } else {
        generatedCommand +=
          (generatedCommand ? ' | ' : '') + handleBlock(currentBlock);
      }
    } catch (error) {
      console.error('An error occurred:', error.message);
      break;
    }
    currentBlock = currentBlock.getNextBlock();
  }

  return replaceKeywords(generatedCommand);
}

function handleBlock(block) {
  var blockType = block.type;
  var wildcardFilenameValue = '';
  var lastFindCommand = '';
  // get last child of find command for exec paramter
  if (blockType === 'find') {
    lastFindCommand = block.getNextBlock()
      ? '-exec ' + block.getNextBlock().type + ' {} \\;'
      : '';
    wildcardFilenameValue = block.getInputTargetBlock('fileEndStart')
      ? '-name ' +
        '"' +
        handleRegexBlocks(block.getInputTargetBlock('regPattern')) +
        '"'
      : '';
  }

  var blockDefinition = window[blockType + 'Block']; // Construct the name of the block definition variable and access it
  var blockCategory = blockDefinition ? blockDefinition.category : '';
  var aboveBlock = block.getPreviousBlock();
  var filenameValue = '';
  if (aboveBlock && filenameBlocks.includes(aboveBlock.type)) {
    filenameValue = handleFilenamesBlocks(aboveBlock);
  }

  // Fetch the attached regex block
  var inputreplaceTextBlock = block.getInputTargetBlock('regReplaceText');
  var beginBlock = block.getInputTargetBlock('begin');
  var endBlock = block.getInputTargetBlock('end');

  var beginValue = '';
  if (beginBlock) {
    beginValue = handleBeginEnd(beginBlock);
  }

  var endValue = '';
  if (endBlock) {
    endValue = handleBeginEnd(endBlock);
  }

  // If there's a connected block, and it's of type 'Regex', get the field value
  var patternValue = '';
  var conditionValue = '';

  //get all the regex children blocks of the main block
  var regexBlocks = getRegexChildrenBlocks(block);

  var regexStringValue =
    regexBlocks.length > 0 ? generateRegexString(regexBlocks) : '';

  let commandParts = [];

  if (blockCategory === 'Regular Expressions') {
    commandParts = handleRegexBlocks(block, blockDefinition, patternValue);
  } else if (blockType === 'variables_set') {
    var variableId = block.getFieldValue('VAR');

    // Get the variable model from the workspace
    var variableModel = Blockly.getMainWorkspace().getVariableById(variableId);

    if (variableModel) {
      // Get the name of the variable
      variable_name = variableModel.name;
      var variable_value = '';

      if (block.getInputTargetBlock('VALUE').getFieldValue('NUM') !== null) {
        variable_value = block
          .getInputTargetBlock('VALUE')
          .getFieldValue('NUM');
      } else if (
        block.getInputTargetBlock('VALUE').getFieldValue('TEXT') !== null
      ) {
        variable_value = generator.forBlock['text'](
          block.getInputTargetBlock('VALUE')
        );
      } else if (block.getInputTargetBlock('VALUE').type === 'arrayCreate') {
        variable_value = generator.forBlock['arrayCreate'](
          block.getInputTargetBlock('VALUE')
        );
      }
    } else {
    }
  } else {
    commandParts = handleMainBlocks(
      block,
      blockDefinition,
      patternValue,
      regexStringValue
    );
  }

  // Build the string command from parts
  let commandString;

  if (blockCategory === 'I/O Redirection') {
    commandString = commandParts.join(' ');
  } else if (blockCategory === 'Regular Expressions') {
    commandString = commandParts.join('');
  } else if (blockType === 'variables_set') {
    commandString = variable_name + '=' + variable_value + ' |';
  } else {
    commandString =
      blockType +
      ' ' +
      commandParts.join(' ') +
      ' ' +
      conditionValue +
      ' ' +
      regexStringValue +
      ' ' +
      filenameValue;
  }
  return commandString;
}

function handleMainBlocks(
  block,
  blockDefinition,
  patternValue,
  regexStringValue
) {
  let commandParts = [];

  //in case we don't have just a pattern in a main block but a full regex
  if (regexStringValue !== null && patternValue === '') {
    patternValue = regexStringValue;
  }

  // Iterate over all inputs and their fields
  block.inputList.forEach((input) => {
    //console.log("handleMainBlocks - input:", input.name);
    input.fieldRow.forEach((field) => {
      //console.log("handleMainBlocks - field:", field);
      let value;

      // Handle dropdowns
      if (field instanceof Blockly.FieldDropdown) {
        paramselected = field.getValue();
        value = blockDefinition.unix_description[0][paramselected];
      }
      // Handle checkboxes
      else if (field instanceof Blockly.FieldCheckbox) {
        value =
          field.getValue() === 'TRUE'
            ? blockDefinition.unix_description[0][field.name]
            : '';
      }
      // Handle text inputs (including numbers)
      else if (field instanceof Blockly.FieldTextInput) {
        value =
          blockDefinition.unix_description[0][field.name] == null ||
          field.getValue() == ''
            ? field.getValue()
            : blockDefinition.unix_description[0][field.name].replace(
                'str',
                field.getValue()
              );
      } else if (field instanceof Blockly.FieldNumber) {
        if (
          blockDefinition.unix_description[0][field.name] == null &&
          field.getValue() != 0
        ) {
          value = field.getValue();
        } else if (field.getValue() == 0) {
          value = '';
        } else {
          value =
            blockDefinition.unix_description[0][field.name] + field.getValue();
        }
      } else if (input.type === Blockly.INPUT_VALUE) {
        if (
          block.getInputTargetBlock(input.name) &&
          blockDefinition.unix_description[0][input.name]
        ) {
          if (input.name === 'regPattern') {
            value =
              patternValue !== ''
                ? blockDefinition.unix_description[0][input.name].replace(
                    'patt',
                    patternValue
                  )
                : '';
          } else {
            inputBlock = block.getInputTargetBlock(input.name);
            var inputBlockDefinition = window[inputBlock.type + 'Block'];

            inputValue =
              inputBlockDefinition && inputBlockDefinition.unix_description
                ? inputBlockDefinition.unix_description[0]['TEXT'].replace(
                    'str',
                    inputBlock.getFieldValue('TEXT')
                  )
                : inputBlock.getFieldValue('TEXT');
            inputValueStr = getMultiplePrints(inputBlock);
            if (inputValueStr !== '' && inputValue == null) {
              inputValue = inputValueStr;
            }

            value =
              inputValue !== ''
                ? blockDefinition.unix_description[0][input.name].replace(
                    'str',
                    inputValue
                  )
                : '';
          }
        } else {
          value = '';
        }
      }

      // Add the processed value to the command parts
      commandParts.push(value);
    });
  });

  return commandParts;
}

function handleSpecificBlocks(currentBlock) {
  const blockTypesWithCommand = {
    touch: touchBlock,
    sed: sedBlock,
    ln: lnBlock,
    mv: mvBlock,
    rm: rmBlock,
    awk: awkBlock,
    conditionAction: conditionActionBlock,
    cut: cutBlock,
    NR: NRBlock,
    NF: NFBlock,
    column: columnBlock,
    condition: conditionBlock,
    atan2: atan2Block,
    cos: cosineBlock,
    exp: exponentBlock,
    log: logarithmBlock,
    sin: sineBlock,
    sqrt: sqrtBlock,
    length: lengthBlock,
    rand: randomBlock,
    seed: setSeedBlock,
    int: intBlock,
    index: indexBlock,
    match: matchBlock,
    toLower: toLowerBlock,
    toUpper: toUpperBlock,
    return: returnBlock,
    next: nextBlock,
    nextFile: nextFileBlock,
    exit: exitBlock,
    deleteList: deleteListBlock,
    deleteListElement: deleteListElementBlock
  };

  if (blockTypesWithCommand[currentBlock.type]) {
    return blockTypesWithCommand[currentBlock.type].generateCommand(
      currentBlock
    );
  }
  return '';
}

function handleBuiltInBlocks(currentBlock) {
  let generatedCommand = '';

  // Helper function to get variable by ID and return its name
  const getVariableName = (variableId) => {
    const variableModel =
      Blockly.getMainWorkspace().getVariableById(variableId);
    return variableModel ? variableModel.name : '';
  };

  // Helper function to get operator symbol
  const getOperatorSymbol = (operatorField) => {
    const operators = {
      EQ: '==',
      NEQ: '!=',
      LT: '<',
      LTE: '<=',
      GT: '>',
      GTE: '>=',
      ADD: '+',
      MINUS: '-',
      MULTIPLY: '*',
      DIVIDE: '/',
      POWER: '^',
      AND: '&&',
      OR: '||',
      NOT: '!'
    };
    return operators[operatorField];
  };

  switch (currentBlock.type) {
    // Variables set
    case 'variables_set': {
      const variableId = currentBlock.getFieldValue('VAR');
      const variableSetTo = handleBlockByType(
        currentBlock.getInputTargetBlock('VALUE')
      );
      const variableName = getVariableName(variableId);
      generatedCommand = `${variableName} = ${variableSetTo};`;
      break;
    }

    // Variables get
    case 'variables_get': {
      const variableId = currentBlock.getFieldValue('VAR');
      generatedCommand = getVariableName(variableId);
      break;
    }

    // Variables change
    case 'math_change': {
      const variableId = currentBlock.getFieldValue('VAR');
      const variableName = getVariableName(variableId);
      console.log('variableName:', variableName);
      const changeBy = handleBlockByType(
        currentBlock.getInputTargetBlock('DELTA')
      );
      generatedCommand = `${variableName} += ${changeBy};`;
      break;
    }

    // Math number
    case 'math_number': {
      generatedCommand = currentBlock.getFieldValue('NUM');
      break;
    }

    // Math arithmetic
    case 'math_arithmetic': {
      const leftBlockCode = handleBlockByType(
        currentBlock.getInputTargetBlock('A')
      );
      const rightBlockCode = handleBlockByType(
        currentBlock.getInputTargetBlock('B')
      );
      const operatorSymbol = getOperatorSymbol(
        currentBlock.getFieldValue('OP')
      );
      generatedCommand = `${leftBlockCode} ${operatorSymbol} ${rightBlockCode}`;
      break;
    }

    // Logic compare
    case 'logic_compare' || 'logic_operation': {
      const leftBlockCode = handleBlockByType(
        currentBlock.getInputTargetBlock('A')
      );
      const rightBlockCode = handleBlockByType(
        currentBlock.getInputTargetBlock('B')
      );
      const operatorSymbol = getOperatorSymbol(
        currentBlock.getFieldValue('OP')
      );
      generatedCommand = `${leftBlockCode} ${operatorSymbol} ${rightBlockCode}`;
      break;
    }

    // Control flow (if) block
    case 'controls_if': {
      const conditionBlock = currentBlock.getInputTargetBlock('IF0');
      let blockCode = '';
      console.log(conditionBlock);

      // Handle the primary condition
      if (conditionBlock) {
        conditionCode = handleBlockByType(conditionBlock);
        console.log('conditionCode:', conditionCode);
        blockCode = `if (${conditionCode}) {`;
      }

      // Handle actions for the main block
      let actionBlock = currentBlock.getInputTargetBlock('DO0');
      while (actionBlock) {
        let actionCode = handleBlockByType(actionBlock);
        blockCode += actionCode + ' ';
        actionBlock = actionBlock.getNextBlock();
      }
      blockCode += '}'; // Close the if block

      // Handle the ELSE IF blocks
      let elseIfIndex = 1;
      let elseIfBlock = currentBlock.getInputTargetBlock(`IF${elseIfIndex}`);
      while (elseIfBlock) {
        let elseIfConditionBlock = handleBlockByType(elseIfBlock);
        blockCode += ` else if (${elseIfConditionBlock}) {`;

        // Handle actions for ELSE IF block
        let elseIfActionBlock = currentBlock.getInputTargetBlock(
          `DO${elseIfIndex}`
        );
        while (elseIfActionBlock) {
          let actionCode = handleBlockByType(elseIfActionBlock);
          blockCode += actionCode + ' ';
          elseIfActionBlock = elseIfActionBlock.getNextBlock();
        }
        blockCode += '}'; // Close the else if block

        // Move to the next ELSE IF block
        elseIfIndex++;
        elseIfBlock = currentBlock.getInputTargetBlock(`IF${elseIfIndex}`);
      }

      const elseBlock = currentBlock.getInputTargetBlock('ELSE');
      if (elseBlock) {
        blockCode += ' else {';

        // Start with the first block under the ELSE section
        let elseActionBlock = elseBlock;
        while (elseActionBlock) {
          const actionCode = handleBlockByType(elseActionBlock);
          blockCode += actionCode + ' ';
          elseActionBlock = elseActionBlock.getNextBlock(); // Move to the next block in ELSE
        }

        blockCode += '}'; // Close the else block
      }

      generatedCommand = blockCode;
      break;
    }
    // forEach_loop
    case 'controls_forEach': {
      const variableId = currentBlock.getFieldValue('VAR');
      const variableName = getVariableName(variableId);
      const listBlock = currentBlock.getInputTargetBlock('LIST');
      const listName = handleBlockByType(listBlock);
      var action = currentBlock.getInputTargetBlock('DO');
      actionCommand = '';
      if (action !== null) {
        while (action) {
          actionCommand += handleBlockByType(action) + ' ';
          action = action.getNextBlock();
        }
      }
      generatedCommand = `for(${variableName} in ${listName} ) { ${actionCommand} }`;
      break;
    }

    // while_loop
    case 'controls_whileUntil': {
      const mode = currentBlock.getFieldValue('MODE');
      const conditionBlock = currentBlock.getInputTargetBlock('BOOL');
      const conditionCode = handleBlockByType(conditionBlock);
      var action = currentBlock.getInputTargetBlock('DO');
      actionCommand = '';
      if (action !== null) {
        while (action) {
          actionCommand += handleBlockByType(action) + ' ';
          action = action.getNextBlock();
        }
      }
      if (mode === 'WHILE') {
        generatedCommand = `while (${conditionCode}) { ${actionCommand} }`;
      } else {
        generatedCommand = `do { ${actionCommand} } while (${conditionCode})`;
      }
      break;
    }

    case 'controls_for': {
      const variableId = currentBlock.getFieldValue('VAR');
      const variableName = getVariableName(variableId);
      const fromBlock = currentBlock.getInputTargetBlock('FROM');
      const fromValue = handleBlockByType(fromBlock);
      const toBlock = currentBlock.getInputTargetBlock('TO');
      const toValue = handleBlockByType(toBlock);
      const byBlock = currentBlock.getInputTargetBlock('BY');
      const byValue = handleBlockByType(byBlock);
      var action = currentBlock.getInputTargetBlock('DO');
      actionCommand = '';
      if (action !== null) {
        while (action) {
          actionCommand += handleBlockByType(action) + ' ';
          action = action.getNextBlock();
        }
      }
      generatedCommand = `for( ${variableName}=${fromValue}; ${variableName} <= ${toValue}; ${variableName}+=${byValue} ) { ${actionCommand} }`;
      break;
    }

    case 'lists_create_with': {
      const elements = [];
      for (let i = 0; i < currentBlock.itemCount_; i++) {
        const elementCode = handleBlockByType(
          currentBlock.getInputTargetBlock('ADD' + i)
        );
        elements.push(elementCode);
      }
      generatedCommand = `[${elements.join(', ')}]`;
      break;
    }

    case 'lists_getIndex': {
      const listBlock = currentBlock.getInputTargetBlock('VALUE');
      console.log('listBlock:', listBlock);
      const listName = handleBlockByType(listBlock);
      console.log('listName:', listName);
      const indexSpecification = currentBlock.getFieldValue('WHERE');
      console.log('indexSpecification:', indexSpecification);
      switch (indexSpecification) {
        case 'FROM_START': {
          const indexBlock = currentBlock.getInputTargetBlock('AT');
          const indexValue = handleBlockByType(indexBlock);
          generatedCommand = `${listName}[${indexValue}]`;
          break;
        }
        case 'FIRST': {
          generatedCommand = `${listName}[1]`;
          break;
        }
      }
      break;
    }

    case 'lists_setIndex': {
      const listBlock = currentBlock.getInputTargetBlock('LIST');
      const listName = handleBlockByType(listBlock);
      console.log('listName:', listName);
      const indexBlock = currentBlock.getInputTargetBlock('AT');
      const indexValue = handleBlockByType(indexBlock);
      console.log('indexValue:', indexValue);
      const valueBlock = currentBlock.getInputTargetBlock('TO');
      const value = handleBlockByType(valueBlock);
      console.log('value:', value);
      generatedCommand = `${listName}[${indexValue}] = ${value}`;
      break;
    }

    case 'text': {
      generatedCommand = '"' + currentBlock.getFieldValue('TEXT') + '"';
      break;
    }

    case 'text_print': {
      const textBlock = currentBlock.getInputTargetBlock('TEXT');
      const textValue = handleBlockByType(textBlock);
      generatedCommand = `print ${textValue};`;
      break;
    }

    case 'controls_flow_statements': {
      const flowStatement = currentBlock.getFieldValue('FLOW');
      switch (flowStatement) {
        case 'BREAK':
          generatedCommand = 'break;';
          break;
        case 'CONTINUE':
          generatedCommand = 'continue;';
          break;
      }
      break;
    }
  }
  return generatedCommand;
}

function handleBlockByType(currentBlock) {
  const builtInBlockTypes = [
    'variables_set',
    'variables_get',
    'math_change',
    'math_number',
    'math_arithmetic',
    'logic_compare',
    'logic_operation',
    'controls_if',
    'lists_create_with',
    'lists_getIndex',
    'lists_setIndex',
    'controls_forEach',
    'controls_whileUntil',
    'controls_for',
    'text',
    'text_print',
    'controls_flow_statements'
  ];
  if (builtInBlockTypes.includes(currentBlock.type)) {
    return handleBuiltInBlocks(currentBlock); // Use built-in handler
  } else {
    return handleSpecificBlocks(currentBlock); // Use specific handler
  }
}

function handleArgumentsBlocks(block) {
  var arguments = '';
  if (block && block.type === 'argumentsCreate') {
    let args = [];
    for (let i = 0; i < block.itemCount_; i++) {
      let inputBlock = block.getInputTargetBlock('ADD' + i);
      if (inputBlock) {
        let arg = inputBlock.getFieldValue('ARGUMENT');
        if (arg) {
          args.push(arg);
        }
      }
    }
    return args.join(' ');
  } else if (block && block.type === 'argument') {
    return block.getFieldValue('ARGUMENT');
  } else {
    return '';
  }
}

function handleConditionActionBlocks(block) {
  var conditionAction = '';
  var block = block.getInputTargetBlock('awkConditionAction');
  if (block && block.type === 'conditionAction') {
    while (block) {
      console.log('block:', block);
      conditionAction += handleBlockByType(block) + ' ';
      block = block.getNextBlock();
    }
  }
  return conditionAction;
}

function handleRegexBlocks(block, blockDefinition, patternValue) {
  let commandParts = [];
  const blockName = block.type;
  const blockDescription = blockDefinition.unix_description[0][blockName] || '';
  if (blockDescription) {
    let value = patternValue
      ? blockDescription.replace('patt', patternValue)
      : blockDescription.replace('patt', '');
    commandParts.push(value);
  }
  // Iterate over all inputs and their fields
  block.inputList.forEach((input) => {
    let value;
    input.fieldRow.forEach((field) => {
      // Handle dropdowns
      if (field instanceof Blockly.FieldDropdown) {
        paramselected = field.getValue();
        //console.log("handleRegexBlocks - paramselected:", paramselected);
        value = blockDefinition.unix_description[0][paramselected];

        value = patternValue
          ? value.replace('patt', patternValue)
          : value.replace('patt', '');
        //console.log("handleRegexBlocks - value:", value);
      } else if (field instanceof Blockly.FieldCheckbox) {
        if (field.name === 'notMatch' && field.getValue() === 'TRUE') {
          //custom for regAnyOneBlock
          commandParts = commandParts.map((element) => {
            if (element) {
              return element.replace('[', '[^'); // Check if the element is not undefined
            }
            return element; // Return the element as is if it's undefined
          });
        } else if (field.name === 'not' && field.getValue() === 'TRUE') {
          //custom for regRangeBlock
          commandParts = commandParts.map((element) => {
            if (element) {
              // Check if the element is not undefined
              return element.replace('[[:', '[^[:');
            }
            return element; // Return the element as is if it's undefined
          });
        } else if (field.name === 'INFINITE' && field.getValue() === 'TRUE') {
          const regexPattern = /\{(\d+),(\d+)\}/;
          const lastPart = commandParts[commandParts.length - 1];
          if (regexPattern.test(lastPart)) {
            const newPart = lastPart.replace(regexPattern, '{$1,}');
            commandParts[commandParts.length - 1] = newPart;
          }
        } else {
          value =
            field.getValue() === 'TRUE'
              ? blockDefinition.unix_description[0][field.name]
              : '';
        }
      } else if (field instanceof Blockly.FieldNumber) {
        if (field.name === 'FROM') {
          value = `{${field.getValue()},`;
        } else if (field.name === 'TO') {
          let fromValue = block.getFieldValue('FROM');
          if (fromValue == field.getValue()) {
            commandParts[commandParts.length - 1] = `{${fromValue}}`;
          } else {
            commandParts[commandParts.length - 1] += `${field.getValue()}}`;
          }
        }
      } else if (field instanceof Blockly.FieldTextInput) {
        value =
          blockDefinition.unix_description[0][field.name] == null
            ? field.getValue()
            : patternValue
              ? blockDefinition.unix_description[0][field.name].replace(
                  'patt',
                  patternValue
                )
              : blockDefinition.unix_description[0][field.name].replace(
                  'patt',
                  field.getValue()
                );
      } else if (input.type === Blockly.INPUT_VALUE) {
        value = blockDefinition.unix_description[0][input.name]
          ? blockDefinition.unix_description[0][input.name].replace(
              'patt',
              patternValue
            )
          : '';
      }
    });
    if (
      input.type === Blockly.NEXT_STATEMENT ||
      input.type === Blockly.INPUT_STATEMENT
    ) {
      let statementCode = '';
      let childBlock = block.getInputTargetBlock(input.name);

      while (childBlock) {
        // Process the child block using handleBlock
        let childCode = handleBlock(childBlock);
        statementCode += childCode;
        // Move to the next block connected via next connection
        childBlock = childBlock.getNextBlock();
      }

      value = blockDefinition.unix_description[0][input.name]
        ? blockDefinition.unix_description[0][input.name].replace(
            'stm',
            statementCode
          )
        : '';
    }
    commandParts.push(value);
  });

  return commandParts;
}

function handleBeginEnd(block) {
  var blockCode;
  //console.log("handleBeginEnd - block :", block.type);
  var innerBlock = block.getInputTargetBlock('DO');
  //console.log("handleBeginEnd - innerBlock :", innerBlock);

  var doBlock = innerBlock.getInputTargetBlock('DO0');
  if (innerBlock.type === 'controls_if' && !doBlock) {
    // Check if the "do" block of an if statement is empty
    var conditionBlock = innerBlock.getInputTargetBlock('IF0'); // Get the first condition block
    if (conditionBlock) {
      blockCode = generator.blockToCode(conditionBlock)[0];
      blockCode = blockCode.replace(/'/g, '').replace(/;/g, '');
      blockCode = blockCode.replace(/\n/g, ' ').replace(/\s+/g, ' ') + "'";
    }
  } else {
    blockCode = generator.blockToCode(innerBlock);
    blockCode = blockCode.replace(/'/g, '');
    blockCode = '{' + blockCode.replace(/\n/g, ' ').replace(/\s+/g, ' ') + '}';
  }

  return blockCode;
}

function generateRegexString(regexBlocksList) {
  let regexStringCommand = '';

  for (let block of regexBlocksList) {
    // Generate the command for the current block
    try {
      regexStringCommand += handleBlock(block);
    } catch (error) {
      console.error('An error occurred:', error.message);
      break;
    }
  }

  return regexStringCommand;
}

function getRegexChildrenBlocks(startBlock) {
  var allBlocks = [];

  // Helper function to recursively add child blocks
  function addBlocks(block) {
    if (block) {
      var blockDefinition = window[block.type + 'Block'];
      // Check if the block's category is 'Regular Expressions'
      if (blockDefinition.category === 'Regular Expressions') {
        allBlocks.push(block);
      }

      // Add next connected block
      if (block.nextConnection && block.nextConnection.targetBlock()) {
        addBlocks(block.nextConnection.targetBlock());
      }
    }
  }

  // Start with the first child block connected to an input, if it exists
  startBlock.inputList.forEach(function (input) {
    if (input.connection && input.connection.targetBlock()) {
      addBlocks(input.connection.targetBlock());
    }
  });

  return allBlocks;
}

// Function to replace keywords in a command
function replaceKeywords(command) {
  replacementMap.forEach((value, key) => {
    if (typeof key === 'string' || key instanceof String) {
      // If the key is a string, use it in a RegExp
      command = command.replace(new RegExp(key, 'g'), value);
    } else if (key instanceof RegExp) {
      // If the key is a RegExp, use it directly
      command = command.replace(key, (match) => {
        // If the value is a function, call it with the match
        if (typeof value === 'function') {
          return value(match);
        }
        return value;
      });
    }
  });

  const xargsOnePlaceholder = /xargs.*-I{}.*?/;
  if (xargsOnePlaceholder.test(command)) {
    command = command.replace(/(xargs.*?)\|/, '$1{} |');
  }
  return command;
}

function handleFilenamesBlocks(block) {
  var filename = '';
  if (block && block.type === 'filename') {
    filename = block.getFieldValue('FILENAME');
  } else if (block && block.type === 'filenamesCreate') {
    filename = getFileNames(block);
  } else {
    dropdownSelection = block.getFieldValue('metric_type');
    input = block.getFieldValue('FILENAME');
    filename = window[block.type + 'Block'].unix_description[0][
      dropdownSelection
    ].replace('str', input);
  }

  return filename;
}

function getFileNames(block) {
  let fileNames = [];
  for (let i = 0; i < block.itemCount_; i++) {
    let inputBlock = block.getInputTargetBlock('ADD' + i);
    if (inputBlock) {
      let fileName = inputBlock.getFieldValue('FILENAME');
      if (fileName) {
        fileNames.push(fileName);
      }
    }
  }
  return fileNames.join(' ');
}

function getMultiplePrints(block) {
  let prints = [];
  for (let i = 0; i < block.itemCount_; i++) {
    let inputBlock = block.getInputTargetBlock('ADD' + i);
    //console.log("getMultiplePrints - inputBlock Type: ", inputBlock.type);
    if (inputBlock) {
      let singlePrint;
      var blockDefinition = window[inputBlock.type + 'Block'];
      if (inputBlock.type == 'column') {
        singlePrint = blockDefinition.unix_description[0]['TEXT'].replace(
          'str',
          inputBlock.getFieldValue('TEXT')
        );
      } else if (inputBlock.type == 'NR') {
        singlePrint = blockDefinition.unix_description[0]['recordNumber'];
      } else if (inputBlock.type == 'NF') {
        singlePrint = blockDefinition.unix_description[0]['FieldNumber'];
      } else if (inputBlock.type == 'regPattern') {
        singlePrint = inputBlock.getFieldValue('regPattern');
      } else if (inputBlock.type == 'variables_get') {
        // Retrieve the variable ID from the block
        var variableId = inputBlock.getFieldValue('VAR');

        // Get the variable model from the workspace
        var variableModel =
          Blockly.getMainWorkspace().getVariableById(variableId);

        if (variableModel) {
          // Get the name of the variable
          singlePrint = variableModel.name;
        } else {
        }
      } else if (inputBlock.type == 'math_arithmetic') {
        singlePrint = generator.blockToCode(inputBlock);
      } else {
        singlePrint = '"' + inputBlock.getFieldValue('TEXT') + '"';
      }
      if (singlePrint) {
        prints.push(singlePrint);
      }
    }
  }
  return prints.join(',');
}

generator.forBlock['text'] = function (block) {
  var textValue = block.getFieldValue('TEXT');
  var code = '"' + textValue + '"';
  return [code, generator.ORDER_ATOMIC];
};

generator.forBlock['arrayCreate'] = function (block) {
  var elements = [];
  for (var i = 0; i < block.itemCount_; i++) {
    var elementCode = generator.valueToCode(
      block,
      'ADD' + i,
      generator.ORDER_NONE
    );
    elements.push(elementCode);
  }
  var listString = elements.join(' '); // Join elements with space
  return ['(' + listString + ')', generator.ORDER_ATOMIC];
};

Blockly.Blocks['lists_getIndex'] = {
  init: function () {
    this.appendValueInput('VALUE').setCheck('Array').appendField('in list');

    // Customize the dropdown to remove unwanted options
    this.whereField = new Blockly.FieldDropdown(
      [
        ['index', 'FROM_START'],
        ['first', 'FIRST']
      ],
      this.updateShape_.bind(this)
    ); // Bind the updateShape_ function to handle changes

    this.appendDummyInput().appendField(this.whereField, 'WHERE');

    // Initially call the shape update in case the default value requires it
    this.updateShape_(this.whereField.getValue());

    this.setOutput(true);
    this.setColour(Blockly.Msg['LISTS_HUE']);
  },

  updateShape_: function (option) {
    // Remove previous "AT" input if it exists
    if (this.getInput('AT')) {
      this.removeInput('AT');
    }

    if (option === 'FROM_START') {
      this.appendValueInput('AT');
    }
  }
};

Blockly.Blocks['lists_setIndex'] = {
  init: function () {
    // Create the input for the list
    this.appendValueInput('LIST').setCheck('Array').appendField('in list');

    // Input for the index where the value should be set
    this.appendValueInput('AT').setCheck('Number').appendField('set in index');

    // Input for the value to set
    this.appendValueInput('TO').appendField('to');

    // Make this block able to connect to other blocks
    this.setPreviousStatement(true);
    this.setNextStatement(true);

    // Set block color
    this.setColour(Blockly.Msg['LISTS_HUE']);
  }
};

//***********************************
//EXTENSIONS FOR VALIDATIONS - START
//***********************************
Blockly.Extensions.register('integer_validation', function () {
  var thisBlock = this;

  // Initialize a property to store the last valid value.
  this.lastValidValue = {};

  // Automatically attach validators to all integer fields.
  thisBlock.inputList.forEach(function (input) {
    input.fieldRow.forEach(function (field) {
      if (field instanceof Blockly.FieldNumber) {
        // Store the initial value as the last valid value.
        thisBlock.lastValidValue[field.name] = field.getValue();

        field.setValidator(function (newValue) {
          var intValue = Number(newValue);
          if (Number.isInteger(intValue)) {
            // Update last valid value to the new value.
            thisBlock.lastValidValue[field.name] = newValue;
            // Clear warning text since the value is valid.
            field.sourceBlock_.setWarningText(null);
            return newValue;
          } else {
            // Set warning text since the value is invalid.
            field.sourceBlock_.setWarningText('You must enter an integer.');
            // Revert to the last valid value.
            return thisBlock.lastValidValue[field.name];
          }
        });
      }
    });
  });
});

function registerConnectionRestrictionExtension(
  extensionName,
  parentBlockTypes, // Array of allowed parent block types
  inputFieldNamesMap, // Object to map block types to their input field names
  allowedBlockType,
  restrictedInputField // New parameter for the restricted input field
) {
  Blockly.Extensions.register(extensionName, function () {
    this.setOnChange(function (changeEvent) {
      if (
        changeEvent.type === Blockly.Events.BLOCK_MOVE &&
        this.id === changeEvent.blockId
      ) {
        var parentBlock = this.getParent();

        if (parentBlock && parentBlockTypes.includes(parentBlock.type)) {
          // Get the input field name based on the parent block type
          var inputFieldName = inputFieldNamesMap[parentBlock.type];

          // Check connection to the correct input field
          if (inputFieldName) {
            // Check the restricted connection (e.g., SOURCE)
            var restrictedConnection = parentBlock
              .getInput(restrictedInputField)
              .connection.targetBlock();
            if (restrictedConnection && restrictedConnection === this) {
              // Disconnect if connected to the restricted input
              if (this.outputConnection.targetConnection) {
                this.outputConnection.disconnect();
              }
            }

            // If the connected block is not this block, or if it's not the allowed block type, disconnect
            if (allowedBlockType && this.type !== allowedBlockType) {
              if (this.outputConnection.targetConnection) {
                this.outputConnection.disconnect();
              }
            }
          } else {
            // No valid input field for this parent block
            if (this.outputConnection.targetConnection) {
              this.outputConnection.disconnect();
            }
          }
        } else {
          // If the parent block is not of the expected type, disconnect
          if (this.outputConnection.targetConnection) {
            this.outputConnection.disconnect();
          }
        }
      }
    });
  });
}

// Register the connection restriction for the 'argument' block
registerConnectionRestrictionExtension(
  'restrict_args_block',
  ['argumentsCreate', 'mv', 'ln'],
  {
    argumentsCreate: 'EMPTY',
    mv: 'DEST',
    ln: 'TARGET'
  },
  'argument',
  'SOURCE'
);

registerConnectionRestrictionExtension(
  'restrict_filename_to_filenamesCreate',
  ['filenamesCreate'],
  { filenamesCreate: 'EMPTY' },
  'filename'
);

registerConnectionRestrictionExtension(
  'restrict_fileEndStart_to_filenamesCreate',
  ['filenamesCreate'],
  { filenamesCreate: 'EMPTY' },
  'fileEndStart'
);

registerConnectionRestrictionExtension(
  'restrict_touch_to_argumentsCreate',
  ['argumentsCreate'],
  { argumentsCreate: 'EMPTY' },
  'touch'
);

Blockly.Extensions.register('disallow_multiple_filenames', function () {
  this.setOnChange(function (changeEvent) {
    if (
      changeEvent.type === Blockly.Events.BLOCK_MOVE &&
      changeEvent.blockId === this.id
    ) {
      var connectedBlock = this.getPreviousBlock();
      if (connectedBlock && connectedBlock.type === 'filenamesCreate') {
        // Disconnect the disallowed block
        this.previousConnection.disconnect();
        console.warn('Disallowed block type cannot be connected here.');
      }
    }
  });
});

//***********************************
//EXTENSIONS FOR VALIDATIONS - END
//***********************************

//***************************
//MUTATORS FOR LISTS - START
//***************************
function getExtraBlockState(block) {
  // TODO: This is a dupe of the BlockChange.getExtraBlockState code, do we
  //    want to make that public?
  if (block.saveExtraState) {
    const state = block.saveExtraState();
    return state ? JSON.stringify(state) : '';
  } else if (block.mutationToDom) {
    const state = block.mutationToDom();
    return state ? Blockly.Xml.domToText(state) : '';
  }
  return '';
}

/**
 * Creates a minus image field used for mutation.
 * @param {Object=} args Untyped args passed to block.minus when the field
 *     is clicked.
 * @returns {Blockly.FieldImage} The minus field.
 */
function createMinusField(args = undefined) {
  const minus = new Blockly.FieldImage(
    minusImage_File,
    15,
    15,
    undefined,
    onClick_
  );
  /**
   * Untyped args passed to block.minus when the field is clicked.
   * @type {?(Object|undefined)}
   * @private
   */
  minus.args_ = args;
  return minus;
}

/**
 * Calls block.minus(args) when the minus field is clicked.
 * @param {Blockly.FieldImage} minusField The field being clicked.
 * @private
 */
function onClick_(minusField) {
  // TODO: This is a dupe of the mutator code, anyway to unify?
  const block = minusField.getSourceBlock();

  if (block.isInFlyout) {
    return;
  }

  Blockly.Events.setGroup(true);
  const oldExtraState = getExtraBlockState(block);
  block.minus(minusField.args_);
  const newExtraState = getExtraBlockState(block);

  if (oldExtraState != newExtraState) {
    Blockly.Events.fire(
      new Blockly.Events.BlockChange(
        block,
        'mutation',
        null,
        oldExtraState,
        newExtraState
      )
    );
  }
  Blockly.Events.setGroup(false);
}

const minusImage_File =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
  'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
  'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
  'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K';

/**
 * Creates a plus image field used for mutation.
 * @param {Object=} args Untyped args passed to block.minus when the field
 *     is clicked.
 * @returns {Blockly.FieldImage} The Plus field.
 */
function createPlusField(args = undefined) {
  const plus = new Blockly.FieldImage(
    plusImage_File,
    15,
    15,
    undefined,
    onClickPlus_
  );
  /**
   * Untyped args passed to block.plus when the field is clicked.
   * @type {?(Object|undefined)}
   * @private
   */
  plus.args_ = args;
  return plus;
}

/**
 * Calls block.plus(args) when the plus field is clicked.
 * @param {!Blockly.FieldImage} plusField The field being clicked.
 * @private
 */
function onClickPlus_(plusField) {
  // TODO: This is a dupe of the mutator code, anyway to unify?
  const block = plusField.getSourceBlock();

  if (block.isInFlyout) {
    return;
  }

  Blockly.Events.setGroup(true);
  const oldExtraState = getExtraBlockState(block);
  block.plus(plusField.args_);
  const newExtraState = getExtraBlockState(block);

  if (oldExtraState != newExtraState) {
    Blockly.Events.fire(
      new Blockly.Events.BlockChange(
        block,
        'mutation',
        null,
        oldExtraState,
        newExtraState
      )
    );
  }
  Blockly.Events.setGroup(false);
}

const plusImage_File =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
  '9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT' +
  'ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz' +
  'FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW' +
  'MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS' +
  '44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg==';
//*************************
//MUTATORS FOR LISTS - END
//*************************
