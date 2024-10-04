// Global replacement map
const replacementMap = new Map([
  ['and', '&&'],
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
    const specificCommand = handleSpecificBlocks(currentBlock);
    try {
      if (filenameBlocks.includes(currentBlock.type)) {
        console.log('Filename Block initiated');
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
  console.log('HANDLEBLOCK () - Block Type:', blockType);

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
        handleFilenamesBlocks(block.getInputTargetBlock('fileEndStart')) +
        '"'
      : '';
  }

  var blockDefinition = window[blockType + 'Block']; // Construct the name of the block definition variable and access it
  var blockCategory = blockDefinition ? blockDefinition.category : '';
  console.log('HANDLEBLOCK - Block Category:', blockCategory);

  var aboveBlock = block.getPreviousBlock();
  var filenameValue = '';
  if (aboveBlock && filenameBlocks.includes(aboveBlock.type)) {
    filenameValue = handleFilenamesBlocks(aboveBlock);
  }

  // Fetch the attached regex block
  var inputreplaceTextBlock = block.getInputTargetBlock('regReplaceText');
  console.log('regReplaceText', inputreplaceTextBlock);
  var beginBlock = block.getInputTargetBlock('begin');
  console.log('begin', beginBlock);
  var endBlock = block.getInputTargetBlock('end');
  console.log('end', endBlock);

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
  var regexBlocks = getRegexChildenBlocks(block);
  //console.log("HANDLEBLOCK - regexBlocks[] length:", regexBlocks.length);

  var regexStringValue =
    regexBlocks.length > 0 ? generateRegexString(regexBlocks) : '';

  console.log('HANDLEBLOCK - Regex String value:', regexStringValue);

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

      console.log('HANDLEBLOCK - Variable name:', variable_name);
      console.log('HANDLEBLOCK - Variable value:', variable_value);
    } else {
      console.log('Variable not found');
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
  } else if (blockType === 'awk') {
    let beginIndex = commandParts.indexOf('BEGIN');
    let endIndex = commandParts.indexOf('END');
    let inputDelimIndex = commandParts.findIndex(
      (element) => typeof element === 'string' && element.includes('-F')
    );

    let begin = beginIndex !== -1 ? commandParts[beginIndex] : '';
    let end = endIndex !== -1 ? commandParts[endIndex] : '';
    let inputDelim =
      inputDelimIndex !== -1 ? commandParts[inputDelimIndex] : '';

    console.log('commands:', commandParts);
    if (conditionValue !== '') {
      commandString =
        blockType +
        ' ' +
        inputDelim +
        ' ' +
        "'" +
        ' ' +
        begin +
        ' ' +
        beginValue +
        ' ' +
        conditionValue +
        ' ' +
        regexStringValue +
        ' ' +
        end +
        ' ' +
        endValue +
        ' ' +
        "'" +
        ' ' +
        filenameValue;
    } else {
      let filteredArray = commandParts.filter(
        (item) =>
          item !== '' &&
          item !== null &&
          item !== undefined &&
          !item.includes('undefined') &&
          !item.includes('BEGIN') &&
          !item.includes('END')
      );
      console.log('commands:', filteredArray);
      // commandString = blockType +  ' ' + filteredArray.join(' ');
      commandString =
        blockType +
        ' ' +
        inputDelim +
        ' ' +
        "'" +
        ' ' +
        begin +
        ' ' +
        beginValue +
        ' ' +
        ' ' +
        regexStringValue +
        ' ' +
        end +
        ' ' +
        endValue +
        ' ' +
        "'" +
        ' ' +
        filenameValue;
    }
  } else if (blockType === 'find') {
    console.log('commands:', commandParts);
    commandString =
      blockType +
      ' ' +
      commandParts.join(' ') +
      ' ' +
      conditionValue +
      ' ' +
      regexStringValue +
      ' ' +
      wildcardFilenameValue +
      ' ' +
      lastFindCommand;
  } else {
    console.log('commands:', commandParts);
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
  console.log('handleMainBlocks init');
  let commandParts = [];

  //in case we don't have just a pattern in a main block but a full regex
  console.log('handleMainBlocks - regexStringValue:', regexStringValue);
  console.log('handleMainBlocks - patternValue:', patternValue);
  if (regexStringValue !== null && patternValue === '') {
    patternValue = regexStringValue;
    console.log('handleMainBlocks - after patternValue:', patternValue);
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
        value =
          blockDefinition.unix_description[0][field.name] == null &&
          field.getValue() != 0
            ? field.getValue()
            : field.getValue() == 0
              ? ''
              : blockDefinition.unix_description[0][field.name] +
                field.getValue();
      } else if (input.type === Blockly.INPUT_VALUE) {
        console.log('***', input.type, input.name, blockDefinition);
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
            console.log('handleMainBlocks -  inputValue:', inputValue);
            console.log('handleMainBlocks -  inputValueStr:', inputValueStr);
            if (inputValueStr !== '' && inputValue == null) {
              inputValue = inputValueStr;
              //console.log("handleMainBlocks - after inputValue:", inputValue);
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

      console.log('handleMainBlocks - value:', value);
      // Add the processed value to the command parts
      commandParts.push(value);
    });
  });

  return commandParts;
}

function handleSpecificBlocks(currentBlock) {
  let generatedCommand = '';
  // Handle different block types
  if (currentBlock.type === 'touch') {
    generatedCommand = touchBlock.generateCommand(currentBlock);
  } else if (currentBlock.type === 'sed') {
    generatedCommand = sedBlock.generateCommand(currentBlock);
  } else if (currentBlock.type === 'ln') {
    generatedCommand = lnBlock.generateCommand(currentBlock);
  } else if (currentBlock.type === 'mv') {
    generatedCommand = mvBlock.generateCommand(currentBlock);
  } else if (currentBlock.type === 'rm') {
    generatedCommand = rmBlock.generateCommand(currentBlock);
  }
  return generatedCommand;
}

function handleArgumentsBlocks(block) {
  console.log('handleArgumentsBlocks - init');
  var arguments = '';
  if (block && block.type === 'argumentsCreate') {
    console.log('handleArgumentsBlocks - block:', block.type);
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
    console.log('handleArgumentsBlocks - block:', block.type);
    return block.getFieldValue('ARGUMENT');
  } else {
    return '';
  }
}

function handleRegexBlocks(block, blockDefinition, patternValue) {
  console.log('handleRegexBlocks init');
  let commandParts = [];
  // Iterate over all inputs and their fields
  block.inputList.forEach((input) => {
    let value;
    //console.log("handleRegexBlocks - input:", input.name);
    input.fieldRow.forEach((field) => {
      console.log('handleRegexBlocks - field:', field);

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
          commandParts.splice(-3);
          value = patternValue
            ? blockDefinition.unix_description[0][field.name].replace(
                'patt',
                patternValue
              )
            : '';
        } else if (field.name === 'not' && field.getValue() === 'TRUE') {
          //custom for regRangeBlock
          commandParts = commandParts.map((element) => {
            if (element) {
              // Check if the element is not undefined
              return element.replace('[[:', '[^[:');
            }
            return element; // Return the element as is if it's undefined
          });
        } else {
          value =
            field.getValue() === 'TRUE'
              ? blockDefinition.unix_description[0][field.name]
              : '';
        }

        //console.log("handleRegexBlocks - commandParts:", commandParts);
        //specifically made for the regForBlock so value m is replaced with the infinity option(commandParts.length - 2 is used because the last part of the list is an object with an undefined value - don't know what)
        if (field.name === 'INFINITE' && field.getValue() === 'TRUE') {
          commandParts[commandParts.length - 2] = ',}';
          //console.log("handleRegexBlocks - commandParts:", commandParts);
        }
      } else if (field instanceof Blockly.FieldNumber) {
        value =
          blockDefinition.unix_description[0][field.name] == null
            ? field.getValue()
            : patternValue
              ? blockDefinition.unix_description[0][field.name]
                  .replace('n', field.getValue())
                  .replace('m', field.getValue())
                  .replace('patt', patternValue)
              : blockDefinition.unix_description[0][field.name]
                  .replace('n', field.getValue())
                  .replace('m', field.getValue())
                  .replace('patt', '');

        //specifically made for the regForBlock in case n=m is replaced with the '}' option(commandParts.length - 2 is used because the last part of the list is an object with an undefined value - don't know what)
        str = commandParts[commandParts.length - 2]
          ? commandParts[commandParts.length - 2]
          : 'notValid';
        //console.log("handleRegexBlocks - str:", str[str.length - 1]);
        //console.log("handleRegexBlocks - str:", field.getValue());
        //str.length - 1 is the n of the '{n' part of the command so far right before the m which is the current vlue that the user gives
        if (str[str.length - 1] == field.getValue()) {
          value = '}';
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
    console.log('handleRegexBlocks - value:', value);
    commandParts.push(value);
  });

  return commandParts;
}

function handleBeginEnd(block) {
  console.log('handleBegin init');
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

  console.log('handleBegin - code:', blockCode);

  return blockCode;
}

function generateRegexString(regexBlocksList) {
  console.log('generateRegexString init');
  let regexStringCommand = '';

  for (let block of regexBlocksList) {
    //console.log('generateRegexString - Block Type: ', block.type);

    var blockDef = window[block.type + 'Block'];
    // Generate the command for the current block
    try {
      regexStringCommand += handleBlock(block);
    } catch (error) {
      console.error('An error occurred:', error.message);
      break;
    }
  }

  console.log('generateRegexString - Generated regex:', regexStringCommand);

  return regexStringCommand;
}

function getRegexChildenBlocks(startBlock) {
  console.log('getRegexChildenBlocks init');
  var allBlocks = [];

  // Helper function to recursively add child blocks
  function addBlocks(block) {
    if (block) {
      var blockDefinition = window[block.type + 'Block'];
      // Check if the block's category is 'Regular Expressions'
      if (
        block.type != 'regPattern' &&
        block.type != 'regOr' &&
        blockDefinition
      ) {
        if (blockDefinition.category === 'Regular Expressions') {
          allBlocks.push(block);
        }
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
  console.log('handleFilenamesBlocks - init');
  var filename = '';
  if (block && block.type === 'filename') {
    filename = block.getFieldValue('FILENAME');
    console.log('handleFilenamesBlocks - filename:', filename);
  } else if (block && block.type === 'filenamesCreate') {
    filename = getFileNames(block);
    console.log('handleFilenamesBlocks - MultiplefilenameValue:', filename);
  } else {
    dropdownSelection = block.getFieldValue('metric_type');
    input = block.getFieldValue('FILENAME');
    filename = window[block.type + 'Block'].unix_description[0][
      dropdownSelection
    ].replace('str', input);
    console.log('handleFilenamesBlocks - WildcardsfilenameValue:', filename);
  }

  return filename;
}

function getFileNames(block) {
  console.log('getFileNames - init');
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
  console.log('getMultiplePrints - init');
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
          console.log('Variable name:', singlePrint);
        } else {
          console.log('Variable not found');
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

generator.forBlock['column'] = function (block) {
  var text = block.getFieldValue('TEXT');
  var code = '$' + `'${text}'`;
  return [code, generator.ORDER_ATOMIC];
};

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

generator.forBlock['logic_compare'] = function (block) {
  var leftBlock = block.getInputTargetBlock('A');
  var rightBlock = block.getInputTargetBlock('B');
  var leftBlockCode = generator.valueToCode(block, 'A', generator.ORDER_ATOMIC);
  var rightBlockCode = generator.valueToCode(
    block,
    'B',
    generator.ORDER_ATOMIC
  );
  if (leftBlock && leftBlock.type === 'regOutput' && leftBlockCode) {
    leftBlockCode = '/' + leftBlockCode + '/';
  }

  // Construct the final code for the logic_compare block
  var operator = block.getFieldValue('OP');

  // Map the field value to the corresponding symbol
  var operators = {
    EQ: '==',
    NEQ: '!=',
    LT: '<',
    LTE: '<=',
    GT: '>',
    GTE: '>='
  };
  var operatorSymbol = operators[operator];

  var code = leftBlockCode + ' ' + operatorSymbol + ' ' + rightBlockCode;
  return [code, generator.ORDER_RELATIONAL];
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
          console.log('inputFieldName:', inputFieldName);

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

Blockly.Extensions.register('cut_validation', function () {
  var thisBlock = this;

  // Register a change listener on the workspace
  thisBlock.workspace.addChangeListener(function (event) {
    // Check if the change involves this block
    if (event.blockId === thisBlock.id) {
      // Validate based on the conditions you specified
      var columnsValue = thisBlock.getFieldValue('columns').trim();
      var charsStartValue = thisBlock.getFieldValue('charsStart').trim();
      var charsEndValue = thisBlock.getFieldValue('charsEnd').trim();
      var delimiterValue = thisBlock.getFieldValue('delimiter').trim();

      if (
        columnsValue !== '' &&
        (charsStartValue !== '' || charsEndValue !== '')
      ) {
        // Set warning text since conditions are violated.
        thisBlock.setWarningText(
          'Can not choose columns and chars at the same time.\n' +
            'Columns are used for cut in files, chars are used for cut in strings'
        );
      } else if (
        delimiterValue !== '' &&
        (charsStartValue !== '' || charsEndValue !== '')
      ) {
        // Set warning text since conditions are violated.
        thisBlock.setWarningText(
          'Can not choose delimiter and chars at the same time.\n' +
            'Delimiter is used for cut in files, chars are used for cut in strings'
        );
      } else {
        // Clear warning text since conditions are satisfied.
        thisBlock.setWarningText(null);
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