Blockly.JavaScript.init(workspace);
Blockly.JavaScript = new Blockly.Generator('JavaScript');
var generator = javascript.javascriptGenerator;
let workspaceChangedAfterExecution = false; // Flag to track if the workspace has changed after execution
let hasExecuted = false;
let executedWorkspace = '';

window.onload = function () {
  initBlockly(); // Initialize your Blockly workspace
};

function initBlockly() {
  //loadWorkspace(); // Load the workspace after initialization

  fetch('/auth-token')
    .then((response) => response.json())
    .then((data) => {
      const token = data.authToken;
      if (token) {
        loadAutoSavedWorkspace();
      } else {
        loadWorkspace();
      }
    });
}

const state = Blockly.serialization.workspaces.save(workspace);

function autoSaveWorkspace() {
  fetch('/auth-token')
    .then((response) => response.json())
    .then((data) => {
      const token = data.authToken;
      const user = data.user;
      if (token) {
        document.getElementById('savedWorkspaces').style.display =
          'inline-block';

        // Serialize the current workspace state
        const state = Blockly.serialization.workspaces.save(workspace);
        const jsonState = JSON.stringify(state);

        // Assuming you have a global 'user' object with the current user ID
        if (jsonState && user.id) {
          // Send the workspace data to the server to update __autosave__ workspace
          fetch('/autoSaveWorkspace', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              workspaceData: jsonState,
              userId: user.id
            })
          })
            .then((response) => response.json())
            .then((result) => {
              if (result.error) {
                console.error('Error auto-saving workspace:', result.error);
              } else {
                console.log('Workspace auto-saved successfully.');
              }
            })
            .catch((error) => {
              console.error('Error auto-saving workspace:', error);
            });
        }
      }
    })
    .catch((error) => {
      console.error('Error fetching the token:', error);
    });
}

function loadAutoSavedWorkspace() {
  // Fetch the authentication token and user information
  fetch('/auth-token')
    .then((response) => response.json())
    .then((data) => {
      const token = data.authToken;
      const user = data.user;

      if (token && user && user.id) {
        // Construct the query to find the autosaved workspace ID for the user
        fetch(`/getUserWorkspaces?userId=${user.id}`)
          .then((response) => response.json())
          .then((data) => {
            const workspaces = data.workspaces;
            const autoSaveWorkspace = workspaces.find(
              (ws) => ws.workspaceName === '__autosave__'
            );

            if (autoSaveWorkspace) {
              // Fetch the autosaved workspace data using its ID
              fetch(`/getWorkspace?workspaceId=${autoSaveWorkspace.id}`)
                .then((response) => response.json())
                .then((data) => {
                  if (data.workspaceData) {
                    try {
                      // Deserialize and load the workspace state
                      const workspaceState = JSON.parse(data.workspaceData);

                      // Clear the existing workspace and load the autosaved state
                      Blockly.serialization.workspaces.load(
                        workspaceState,
                        workspace
                      );

                      console.log('Autosaved workspace loaded successfully.');
                    } catch (error) {
                      console.error('Error parsing workspace data:', error);
                      alert(
                        'Failed to load autosaved workspace. Please try again.'
                      );
                    }
                  } else {
                    console.log('No autosaved workspace data found.');
                  }
                })
                .catch((error) => {
                  console.error('Error fetching autosaved workspace:', error);
                  alert(
                    'Failed to fetch autosaved workspace. Please try again.'
                  );
                });
            } else {
              console.log('No autosaved workspace found for user ID:', user.id);
            }
          })
          .catch((error) => {
            console.error('Error fetching user workspaces:', error);
            alert('Failed to fetch user workspaces. Please try again.');
          });
      } else {
        loadWorkspace();
      }
    })
    .catch((error) => {
      console.error('Error fetching the token:', error);
      alert('Failed to fetch authentication token. Please try again.');
    });
}

// Function to update the saved workspaces dropdown
async function updateWorkspaces(userId) {
  try {
    // Fetch the user's workspaces from the server
    const response = await fetch(`/getUserWorkspaces?userId=${userId}`);
    const data = await response.json();
    const workspaces = data.workspaces;
    const savedWorkspacesSelect = document.getElementById('savedWorkspaces');

    // Clear any existing options in the dropdown
    savedWorkspacesSelect.innerHTML = '';

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select a workspace';
    savedWorkspacesSelect.appendChild(defaultOption);

    // Populate dropdown with the user's saved workspaces
    workspaces.forEach((workspace) => {
      if (workspace.workspaceName !== '__autosave__') {
        const option = document.createElement('option');
        option.value = workspace.id; // use the workspace ID as the option value
        option.text = workspace.workspaceName; // display the workspace name
        savedWorkspacesSelect.appendChild(option);
      }
    });

    // Optionally, show a success message or silently update
    console.log('Workspaces updated successfully.');
  } catch (error) {
    console.error('Error updating workspaces:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('/auth-token')
    .then((response) => response.json())
    .then((data) => {
      const token = data.authToken;
      const user = data.user;
      if (token) {
        document.getElementById('savedWorkspaces').style.display =
          'inline-block';

        fetch(`/getUserWorkspaces?userId=${user.id}`)
          .then((response) => response.json())
          .then((data) => {
            const workspaces = data.workspaces;
            const savedWorkspacesSelect =
              document.getElementById('savedWorkspaces');

            // Clear any existing options
            savedWorkspacesSelect.innerHTML = '';

            // Add a default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.text = 'Select a workspace';
            savedWorkspacesSelect.appendChild(defaultOption);

            // Populate dropdown with the user's saved workspaces
            workspaces.forEach((workspace) => {
              if (workspace.workspaceName !== '__autosave__') {
                const option = document.createElement('option');
                option.value = workspace.id; // use the ID as the option value
                option.text = workspace.workspaceName; // display the workspace name
                savedWorkspacesSelect.appendChild(option);
              }
            });

            savedWorkspacesSelect.addEventListener('change', () => {
              const selectedWorkspaceId = savedWorkspacesSelect.value;

              if (selectedWorkspaceId) {
                fetch(`/getWorkspace?workspaceId=${selectedWorkspaceId}`)
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.workspaceData) {
                      const workspaceState = JSON.parse(data.workspaceData);
                      // Deserialize and load the workspace
                      Blockly.serialization.workspaces.load(
                        workspaceState,
                        workspace
                      );
                    } else {
                      console.error(
                        'Failed to load workspace: Invalid workspace data.'
                      );
                      alert('Failed to load workspace. Please try again.');
                    }
                  })
                  .catch((error) => {
                    console.error('Error loading workspace:', error);
                    alert('Failed to load workspace. Please try again.');
                  });
              }
            });
          })
          .catch((error) => {
            console.error('Error fetching user workspaces:', error);
          });

        document.getElementById('saveButton').style.display = 'inline-block';

        document
          .getElementById('saveButton')
          .addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default form submission behavior

            // Ask the user for the workspace name
            const workspaceName = prompt('Enter a name for your workspace:');

            if (!workspaceName || workspaceName.trim() === '') {
              alert('Workspace name cannot be empty.');
              return;
            }

            // Serialize the workspace state to JSON
            const state = Blockly.serialization.workspaces.save(workspace);
            const jsonState = JSON.stringify(state);

            // Ensure jsonState, user.id, and workspaceName are valid before submitting
            if (jsonState && user.id && workspaceName.trim() !== '') {
              // Set the value of the hidden input fields in the form
              document.getElementById('workspaceData').value = jsonState;
              document.getElementById('userId').value = user.id;
              document.getElementById('workspaceName').value = workspaceName;

              // Use AJAX to send the data to the server without redirecting
              fetch('/saveWorkspace', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  workspaceData: jsonState,
                  userId: user.id,
                  workspaceName: workspaceName
                })
              })
                .then((response) => response.json())
                .then((result) => {
                  if (result.error) {
                    console.error('Error saving workspace:', result.error);
                    alert('Failed to save workspace. Please try again.');
                  } else {
                    updateWorkspaces(user.id);
                    alert('Workspace saved successfully.');
                  }
                })
                .catch((error) => {
                  alert('Failed to save workspace. Please try again.');
                });
            } else {
              console.error(
                'Invalid workspace data, user ID, or workspace name.'
              );
              alert('Failed to save workspace. Invalid data.');
            }
          });
      }
    })
    .catch((error) => {
      console.error('Error fetching the token:', error);
    });
});
document
  .getElementById('themeDropdown')
  .addEventListener('change', function (event) {
    var selectedTheme = this.value;
    if (selectedTheme === 'halloween') {
      workspace.setTheme(Blockly.Themes.Halloween);
      document.getElementById('light-theme').disabled = false;
      document.getElementById('dark-theme').disabled = true;
    } else if (selectedTheme === 'dark') {
      document.getElementById('light-theme').disabled = true;
      document.getElementById('dark-theme').disabled = false;
      workspace.setTheme(Blockly.Themes.Dark);
    }
  });

function loadLanguageFile(language) {
  return Promise.all([
    new Promise((resolve, reject) => {
      var script = document.createElement('script');
      script.src = 'msg/' + language + '.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }),
    new Promise((resolve, reject) => {
      var script = document.createElement('script');
      script.src = 'js/' + language + '.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    })
  ]);
}

function loadInitialLanguage() {
  var selectedLanguage = 'en'; // Αρχική γλώσσα (αγγλικά)
  loadLanguageFile(selectedLanguage).then(initBlockly);
}

function handleLanguageChange() {
  document
    .getElementById('languageMenu')
    .addEventListener('change', function (event) {
      var selectedLanguage = event.target.value;
      loadLanguageFile(selectedLanguage).then(function () {
        // Clear the workspace before reloading blocks in the new language
        Blockly.getMainWorkspace().clear();
        initBlockly();
      });
    });
}

loadInitialLanguage();
handleLanguageChange();

function loadWorkspace() {
  var jsonState = localStorage.getItem('blocklyWorkspace');
  if (jsonState) {
    console.log('blocklyWorkspace found in local storage.');
    try {
      var state = JSON.parse(jsonState);
      Blockly.serialization.workspaces.load(state, workspace);
      console.log('Blockly workspace loaded successfully.');
    } catch (e) {
      console.error('Error parsing JSON from local storage:', e);
    }
  } else {
    console.log('No saved blocklyWorkspace found in local storage.');
  }
}

function onWorkspaceChange(event) {
  fetch('/auth-token')
    .then((response) => response.json())
    .then((data) => {
      const token = data.authToken;
      if (token) {
        autoSaveWorkspace();
      } else {
        saveWorkspace();
      }
    });
  if (hasExecuted) {
    // Compare the current workspace state with the executed workspace state
    const currentWorkspaceState =
      Blockly.serialization.workspaces.save(workspace);
    const jsonCurrentState = JSON.stringify(currentWorkspaceState);

    if (jsonCurrentState !== executedWorkspace) {
      workspaceChangedAfterExecution = true;
      console.log('Workspace has changed since execution.');
    } else {
      workspaceChangedAfterExecution = false;
      console.log('Workspace has not changed since execution.');
    }
  }
}
Blockly.getMainWorkspace().addChangeListener(onWorkspaceChange);

function saveWorkspace() {
  //used for saving the workspace in the local storage of the browser in case the user is not logged in
  const state = Blockly.serialization.workspaces.save(workspace);
  const jsonState = JSON.stringify(state);
  localStorage.setItem('blocklyWorkspace', jsonState);
}

// Used to collect workspace data from guest users when they close the tab.
function saveGuestWorkspaceData() {
  const state = Blockly.serialization.workspaces.save(workspace);
  const jsonState = JSON.stringify(state);
  fetch('/auth-token')
    .then((response) => response.json())
    .then((data) => {
      const token = data.authToken;
      if (!token && hasExecuted && jsonState !== executedWorkspace) {
        workspaceChangedAfterExecution = true;
      }
      if (!token) {
        fetch('/saveGuestWorkspace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            workspaceData: jsonState,
            executionStatus: hasExecuted,
            changesAfterExecution: workspaceChangedAfterExecution
          })
        })
          .then((response) => response.json())
          .then((result) => {
            if (result.error) {
              console.error('Error saving guest workspace:', result.error);
              alert('Failed to save guest workspace. Please try again.');
            }
          })
          .catch((error) => {
            alert('Failed to save guest workspace. Please try again.');
          });
      }
    });
}
window.addEventListener('beforeunload', saveGuestWorkspaceData);
//window.addEventListener('beforeunload', autoSaveWorkspace);

// Global replacement map
const replacementMap = new Map([
  ['findDuplicates', 'uniq -d'],
  ['showUniqs', 'uniq -u'],
  // "or": "||",
  ['and', '&&'],
  ['window.alert', 'print']
  // Add more key-value pairs as needed
]);

// used for correctly using the cut block with the -c parameter
let regexKey = /(\d+)\s+-c-(\d+)/g;
replacementMap.set(regexKey, (str) => {
  regexKey.lastIndex = 0; // Reset lastIndex for global regex
  let match = regexKey.exec(str);
  return match ? `${match[1]}-${match[2]}` : null;
});

// used for correctly using the find block
let regexKeyFind = /([-+])\s+(\d+)/g;
replacementMap.set(regexKeyFind, (str) => {
  regexKeyFind.lastIndex = 0; // Reset lastIndex for global regex
  let match = regexKeyFind.exec(str);
  return match ? `${match[1]}${match[2]}` : null;
});

// used for correctly using the find block
let regexKeyFind1 = /([+-])(\d+)\s+([A-Z])/g;
replacementMap.set(regexKeyFind1, (str) => {
  regexKeyFind1.lastIndex = 0; // Reset lastIndex for global regex
  let match = regexKeyFind1.exec(str);
  return match ? `${match[1]}${match[2]}${match[3]}` : null;
});

// used for printing variables changes without the extra generic javascript check
replacementMap.set(/\(typeof (.+?) === number \? (.+?) : 0\) /g, '');

// used for printing correctly variable's changes
replacementMap.set(/= \+1/g, '++');
replacementMap.set(/= \+/g, '+=');
replacementMap.set(/== \//g, '~ /');
replacementMap.set(/\/ ==/g, '/ ~');
replacementMap.set(/,(\d+)\.(\d+)/g, '');

// used for sed
replacementMap.set(/\/\s{1,}/g, '/');
replacementMap.set(/\/\'\s{1,}g/g, "/g'");

//used for gzip
replacementMap.set(/\s.?-k\s{1,}/g, '-k ');

//used for exec parameter in find
replacementMap.set(/{}.\\;.*?\|.*/g, '{} \\;');

replacementMap.set(/}}\'\s+END/g, '}} END');
replacementMap.set(/}\s\'{/g, '} {');
// replacementMap.set(/\'\s+\'/g, "'");
replacementMap.set(/\|\s+\|\s+awk/g, ' awk');
replacementMap.set(/\|\s+\|/g, ' |');
replacementMap.set(/,0\s+\|/g, ' |');

//used for xargs
replacementMap.set(/xargs(?!.*-I{}).*?\|/g, 'xargs ');
replacementMap.set(/xargs.*-I{}.*?\|/g, 'xargs -I{} ');

//used for cd
replacementMap.set(/^cd../g, 'cd ./');

var filenameBlocks = ['filename', 'filenamesCreate', 'fileEndStart'];

document
  .getElementById('executeButton')
  .addEventListener('click', function onExecuteButtonClick() {
    // Start from the first block
    let currentBlock = workspace.getTopBlocks()[0];
    let generatedCommand = '';
    let blockCount = 0; // Mark the workspace as executed if users clicks the execute button and there are blocks in the workspace

    while (currentBlock) {
      blockCount++;
      var blockDef = window[currentBlock.type + 'Block'];
      // Generate the command for the current block
      try {
        if (filenameBlocks.includes(currentBlock.type)) {
          console.log('Filename Block initiated');
        } else if (
          blockDef &&
          (blockDef.category === 'I/O Redirection' ||
            blockDef.category === 'Regular Expressions')
        ) {
          generatedCommand += handleBlock(currentBlock);
        } else {
          generatedCommand +=
            (generatedCommand ? ' | ' : '') + handleBlock(currentBlock);
        }
      } catch (error) {
        console.error('An error occurred:', error.message);
        if (error.lineNumber) {
          console.log('Line Number:', error.lineNumber);
        }
        // For a complete stack trace:
        console.error(error.stack);
        break;
      }
      // Move to the next connected block
      currentBlock = currentBlock.getNextBlock();
    }

    console.log('before command:', generatedCommand);
    generatedCommand = replaceKeywords(generatedCommand);

    // Combine the constructed UNIX command and filename
    if (generatedCommand.length > 0) {
      document.getElementById('resultsText').innerText = generatedCommand;
    } else {
      document.getElementById('resultsText').innerText = '\n'; // Insert a newline character if the command is empty so that the results area does not shrink
    }

    console.log('Generated command:', generatedCommand);
    if (blockCount > 0) {
      fetch('/auth-token')
        .then((response) => response.json())
        .then((data) => {
          const token = data.authToken;
          if (!token) {
            hasExecuted = true;
            console.log('It got executed');
            const state = Blockly.serialization.workspaces.save(workspace);
            executedWorkspace = JSON.stringify(state);
          }
          console.log('Has executed ', hasExecuted); // Now inside the .then block
        });
    } else {
      console.log('Has executed ', hasExecuted); // Still log if no fetch occurs
    }
    console.log('Top blocks:', workspace.getTopBlocks());
  });

document.getElementById('resetButton').addEventListener('click', function () {
  if (
    confirm(
      'Are you sure you want to reset the workspace? Everything will be deleted.'
    )
  ) {
    workspace.clear(); // this clears the workspace
  }
});

function copyToClipboard() {
  // Get the text from the results area
  var text = document.getElementById('resultsArea').innerText;

  // Create a temporary text area element
  var textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    // Copy the text inside the text area to the clipboard
    document.execCommand('copy');
    alert('Text copied to clipboard!'); // Optional: Show a message indicating the text was copied
  } catch (err) {
    console.error('Unable to copy', err); // Log the error if the copy operation fails
  }

  // Clean up: Remove the temporary text area element
  document.body.removeChild(textArea);
}

// Attach the function to the 'click' event of the button
document
  .getElementById('copyButton')
  .addEventListener('click', copyToClipboard);

Blockly.JavaScript.forBlock['filename'] = function (block) {
  var filename = block.getFieldValue('FILENAME');
  return [JSON.stringify(filename), Blockly.JavaScript.ORDER_NONE];
};

function handleBlock(block) {
  var blockType = block.type;
  console.log('HANDLEBLOCK - Block Type:', blockType);

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
  var inputPatternBlock = block.getInputTargetBlock('regPattern');
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

  //console.log("inputPatternBlock:", inputPatternBlock.type);
  // If there's a connected block, and it's of type 'Regex', get the field value
  var patternValue = '';
  var conditionValue = '';
  if (inputPatternBlock && inputPatternBlock.type === 'regPattern') {
    patternValue = inputPatternBlock.getFieldValue('regPattern');
    console.log('HANDLEBLOCK - patternValue:', patternValue);
  } else if (inputPatternBlock && inputPatternBlock.type === 'regOr') {
    patternValue = getMultiplePatterns(inputPatternBlock);
    console.log('HANDLEBLOCK - MultiplepatternValue:', patternValue);
  } else if (inputPatternBlock && inputPatternBlock.type === 'condOutput') {
    console.log('inputPatternBlock', inputPatternBlock);
    console.log('blockType', blockType);
    conditionValue = handleConditionsAndLoops(inputPatternBlock, blockType);
    console.log('HANDLEBLOCK - conditionValue', conditionValue);
  }

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

  //in case of the awk the regexStringValue is already included in the command so we dont need it
  if (blockType === 'awk') {
    regexStringValue = '';
    let contains = commandParts.some(
      (element) => element && element.includes("-F'")
    );
    if (!contains) {
      commandParts[0] = "'" + commandParts[0];
    }
  }

  //in case of the sed command the regexStringValue is already included in the command so we dont need it
  if (blockType === 'sed') {
    regexStringValue = '';
  }

  // Build the string command from parts
  let commandString;

  if (blockCategory === 'I/O Redirection') {
    commandString = commandParts.join(' ');
  } else if (blockCategory === 'Regular Expressions') {
    commandString = regexStringValue + commandParts.join('');
  }
  // else if(blockType === 'loopOutput'){
  // commandString = conditionValue.replace(/{(.+?) }'/g, "$1");
  // }
  else if (blockType === 'variables_set') {
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
        filteredArray.join(' ') +
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

  console.log('HANDLEBLOCK - command built:', commandString);

  // Here you can add any custom logic for special cases

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

function handleRegexBlocks(block, blockDefinition, patternValue) {
  console.log('handleRegexBlocks init');
  let commandParts = [];
  // Iterate over all inputs and their fields
  block.inputList.forEach((input) => {
    //console.log("handleRegexBlocks - input:", input.name);
    input.fieldRow.forEach((field) => {
      console.log('handleRegexBlocks - field:', field);
      let value;

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
      } else if (input.type === Blockly.INPUT_STATEMENT) {
        value = '';
      }

      console.log('handleRegexBlocks - value:', value);
      // Add the processed value to the command parts
      console.log('handleRegexBlocks - commandParts:', commandParts);
      commandParts.push(value);
    });
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

function handleConditionsAndLoops(block, blockType) {
  console.log('handleConditionsAndLoops init');
  var blockCode;
  //console.log("handleConditionsAndLoops - block :", block.type);
  var innerBlock = block.getInputTargetBlock('DO');
  //console.log("handleConditionsAndLoops - innerBlock :", innerBlock);

  var conditionBlock = innerBlock.getInputTargetBlock('IF0'); // Get the first condition block
  var doBlock = innerBlock.getInputTargetBlock('DO0');

  if (innerBlock.type === 'controls_if' && !doBlock) {
    // Check if the "do" block of an if statement is empty
    //console.log("handleConditionsAndLoops - conditionBlock:", conditionBlock.type);
    if (conditionBlock) {
      blockCode = generator.blockToCode(conditionBlock)[0];
      blockCode = blockCode.replace(/'/g, ''); //.replace(/;/g, '');
      if (blockType == 'awk') {
        blockCode = blockCode.replace(/\n/g, ' ').replace(/\s+/g, ' ');
      } else {
        blockCode = blockCode.replace(/\n/g, ' ').replace(/\s+/g, ' ') + "'";
      }
    }
  } else {
    blockCode = generator.blockToCode(innerBlock);
    blockCode = blockCode.replace(/'/g, ''); //.replace(/;/g, '');
    if (blockType == 'awk') {
      blockCode =
        '{' + blockCode.replace(/\n/g, ' ').replace(/\s+/g, ' ') + '}';
    } else {
      blockCode =
        '{' + blockCode.replace(/\n/g, ' ').replace(/\s+/g, ' ') + "}'";
    }
  }

  console.log('handleConditionsAndLoops - code:', blockCode);

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

function getMultiplePatterns(block) {
  console.log('getMultiplePatterns - init');
  let patterns = [];
  for (let i = 0; i < block.itemCount_; i++) {
    let inputBlock = block.getInputTargetBlock('ADD' + i);
    if (inputBlock) {
      let patt = inputBlock.getFieldValue('regPattern');
      if (patt) {
        patterns.push(patt);
      }
    }
  }
  return patterns.join('|');
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
      } else if (inputBlock.type == 'regOr') {
        singlePrint = getMultiplePatterns(inputBlock);
      } else if (inputBlock.type == 'regOutput') {
        singlePrint = handleBlock(inputBlock);
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

generator.forBlock['NR'] = function (block) {
  var code = 'NR';
  return [code, generator.ORDER_ATOMIC];
};

generator.forBlock['NF'] = function (block) {
  var code = 'NF';
  return [code, generator.ORDER_ATOMIC];
};

generator.forBlock['multiplePrint'] = function (block) {
  var code = getMultiplePrints(block);
  return [code, generator.ORDER_ATOMIC];
};

generator.forBlock['regPattern'] = function (block) {
  var text = block.getFieldValue('regPattern');
  var code = `'${text}'`;
  return [code, generator.ORDER_ATOMIC];
};

generator.forBlock['regOr'] = function (block) {
  var code = getMultiplePatterns(block);
  return [code, generator.ORDER_ATOMIC];
};

generator.forBlock['regOutput'] = function (block) {
  var code = handleBlock(block);
  return [code, generator.ORDER_ATOMIC];
};

generator.forBlock['awk'] = function (block) {
  var code = handleBlock(block);
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

  if (rightBlock && rightBlock.type === 'regOutput' && rightBlockCode) {
    rightBlockCode = '/' + rightBlockCode + '/';
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

// Define validation extension for the touch -t flag
Blockly.Extensions.register('validate_touch_time_t', function () {
  this.getField('change_time_t').setValidator(function (input) {
    // Define multiple regex patterns to match different formats
    var patterns = [
      /^$/, // Empty string pattern
      /^(\d{2})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])(\.[0-5][0-9])?$/, // CCYYMMDDhhmm[.SS]
      /^(\d{2})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])$/, // CCYYMMDDhhmm
      /^(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])(\.[0-5][0-9])?$/, // YYMMDDhhmm[.SS]
      /^(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])$/, // YYMMDDhhmm
      /^(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])(\.[0-5][0-9])?$/, // MMDDhhmm[.SS]
      /^(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])$/ // MMDDhhmm
    ];

    // Allow empty input
    if (input === '') {
      return input; // Accept empty input as valid
    }

    // Check if input matches one of the valid formats
    var isValid = patterns.some(function (pattern) {
      return pattern.test(input);
    });

    if (!isValid) {
      return null; // Invalid input, reject
    }

    // Determine the current date, year, and century
    var now = new Date();
    var currentYear = now.getFullYear();
    var currentCentury = Math.floor(currentYear / 100);

    // Parse input based on its length
    var century = '';
    var year = '';
    var month = '';
    var day = '';
    var hour = '';
    var minute = '';
    var second = '00'; // default seconds to '00'

    switch (input.length) {
      case 15: // CCYYMMDDhhmm[.SS]
        century = input.substr(0, 2);
        year = input.substr(2, 2);
        month = input.substr(4, 2);
        day = input.substr(6, 2);
        hour = input.substr(8, 2);
        minute = input.substr(10, 2);
        second = input.substr(12, 2);
        break;
      case 13: // YYMMDDhhmm[.SS]
        year = input.substr(0, 2);
        month = input.substr(2, 2);
        day = input.substr(4, 2);
        hour = input.substr(6, 2);
        minute = input.substr(8, 2);
        second = input.substr(10, 2);
        break;
      case 12: // CCYYMMDDhhmm
        century = input.substr(0, 2);
        year = input.substr(2, 2);
        month = input.substr(4, 2);
        day = input.substr(6, 2);
        hour = input.substr(8, 2);
        minute = input.substr(10, 2);
        break;
      case 11: // MMDDhhmm[.SS]
        month = input.substr(0, 2);
        day = input.substr(2, 2);
        hour = input.substr(4, 2);
        minute = input.substr(6, 2);
        second = input.substr(8, 2);
        year = String(currentYear).slice(-2); // default to current year
        century = String(currentCentury); // default to current century
        break;
      case 10: // YYMMDDhhmm
        year = input.substr(0, 2);
        month = input.substr(2, 2);
        day = input.substr(4, 2);
        hour = input.substr(6, 2);
        minute = input.substr(8, 2);
        break;
      case 8: // MMDDhhmm
        month = input.substr(0, 2);
        day = input.substr(2, 2);
        hour = input.substr(4, 2);
        minute = input.substr(6, 2);
        year = String(currentYear).slice(-2); // default to current year
        century = String(currentCentury); // default to current century
        break;

      default:
        return null; // Invalid length, reject
    }

    // If year is present but no century, infer based on year
    if (year && !century) {
      century = parseInt(year, 10) >= 69 ? '19' : '20'; // infer century
    }

    var fullYear = parseInt(century) * 100 + parseInt(year, 10);

    // Validate ranges for month, day, hour, minute, and second
    if (
      month < '01' ||
      month > '12' ||
      day < '01' ||
      day > '31' ||
      hour < '00' ||
      hour > '23' ||
      minute < '00' ||
      minute > '59' ||
      second < '00' ||
      second > '60'
    ) {
      return null; // Invalid input: reject and keep the old value
    }

    // Check day validity for the given month and year (leap year handling)
    var daysInMonth = new Date(fullYear, parseInt(month, 10), 0).getDate();
    if (parseInt(day, 10) > daysInMonth) {
      return null; // Invalid day for the given month
    }

    return input; // Input is valid
  });
});

// Define validation extension for the touch -d flag
Blockly.Extensions.register('validate_touch_time_d', function () {
  this.getField('change_time_d').setValidator(function (input) {
    // Define regex patterns to match different valid formats
    var patterns = [
      /^$/, // Empty string pattern
      /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])([T\s])(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z)?$/ // YYYY-MM-DDThh:mm:SS[.frac][tz] or YYYY-MM-DD hh:mm:SS[.frac][tz]
    ];

    // Check if input matches one of the valid patterns
    var isValid = patterns.some(function (pattern) {
      return pattern.test(input);
    });

    if (!isValid) {
      return null; // Invalid input, reject
    }

    // Normalize the input by replacing space with 'T'
    input = input.replace(/\s/, 'T');

    // Extract components from input
    var parts = input.split('T');
    var datePart = parts[0];
    var timePart = (parts[1] || '').split('.')[0]; // Remove fractional seconds part
    var fractionPart = (parts[1] || '').split('.')[1] || ''; // Extract fractional seconds
    var tzPart = (parts[1] || '').includes('Z') ? 'Z' : '';

    // Handle date part
    var dateParts = datePart.split('-');
    var year = dateParts[0];
    var month = dateParts[1];
    var day = dateParts[2];

    // Handle time part
    var timeParts = timePart.split(':');
    var hour = timeParts[0] || '00';
    var minute = timeParts[1] || '00';
    var second = timeParts[2] || '00';

    // Validate ranges for year, month, day, hour, minute, and second
    if (
      month < '01' ||
      month > '12' ||
      day < '01' ||
      day > '31' ||
      hour < '00' ||
      hour > '23' ||
      minute < '00' ||
      minute > '59' ||
      second < '00' ||
      second > '59'
    ) {
      return null; // Invalid input: reject
    }

    // Check day validity for the given month and year (leap year handling)
    var daysInMonth = new Date(year, parseInt(month, 10), 0).getDate();
    if (parseInt(day, 10) > daysInMonth) {
      return null; // Invalid day for the given month
    }

    // Fractional seconds handling
    if (fractionPart.length > 3) {
      return null; // Fractional seconds should not exceed 3 digits
    }

    // Optional time zone part validation
    if (tzPart && tzPart !== 'Z') {
      return null; // Invalid time zone designator, should be 'Z' if present
    }

    return input; // Input is valid
  });
});

//***********************************
//EXTENSIONS FOR VALIDATIONS - END
//***********************************

//************************
//LANG FOR LABELS - START
//************************
/**
 * Create a namespace for the application.
 */
var Unix = {};

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
Unix.LANGUAGE_NAME = {
  en: 'English'
};

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if parameter not found.
 * @return {string} The parameter value or the default value if not found.
 */
Unix.getStringParamFromUrl = function (name, defaultValue) {
  var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? deUnixURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 */
Unix.getLang = function () {
  var lang = Unix.getStringParamFromUrl('lang', '');
  if (Unix.LANGUAGE_NAME[lang] === undefined) {
    // Default to English.
    lang = 'en';
  }
  return lang;
};

/**
 * User's language (e.g. "en").
 * @type {string}
 */
Unix.LANG = Unix.getLang();

// // Load the Unix demo's language strings.
// document.write('<script src="msg/' + Unix.LANG + '.js"></script>\n');
// Load Blockly's language strings.
document.write('<script src="js/' + Unix.LANG + '.js"></script>\n');
//**********************
//LANG FOR LABELS - END
//**********************

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
