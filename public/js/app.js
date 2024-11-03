let workspaceChangedAfterLastExecution = false; // Flag to track if the workspace has changed after execution
let hasExecuted = false;
let executedWorkspace = '';
const state = Blockly.serialization.workspaces.save(workspace);

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
      if (
        workspace.workspaceName !== '__autosave__' &&
        workspace.workspaceName !== 'executedWorkspace'
      ) {
        const option = document.createElement('option');
        option.value = workspace.id; // use the workspace ID as the option value
        option.text = workspace.workspaceName; // display the workspace name
        savedWorkspacesSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Error updating workspaces:', error);
  }
}

function manageWorkspaces() {
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
              if (
                workspace.workspaceName !== '__autosave__' &&
                workspace.workspaceName !== 'executedWorkspace'
              ) {
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
}

function manageTheme(event) {
  var selectedTheme = event.target.value; // Παίρνουμε την επιλεγμένη τιμή από το event.target

  if (selectedTheme === 'halloween') {
    workspace.setTheme(Blockly.Themes.Halloween); // Ορισμός του θέματος Halloween
    document.getElementById('light-theme').disabled = false;
    document.getElementById('dark-theme').disabled = true;
  } else if (selectedTheme === 'dark') {
    document.getElementById('light-theme').disabled = true;
    document.getElementById('dark-theme').disabled = false;
    workspace.setTheme(Blockly.Themes.Dark); // Ορισμός του σκοτεινού θέματος
  }
}

function loadLanguageFile(language) {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script');
    script.src = 'msg/' + language + '.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
var selectedLanguage;
function loadInitialLanguage() {
  selectedLanguage = 'en';
  loadLanguageFile(selectedLanguage).then(initBlockly);
}

function handleLanguageChange(event) {
  selectedLanguage = event.target.value;
  loadLanguageFile(selectedLanguage).then(function () {
    Blockly.getMainWorkspace().clear();
    initBlockly();
  });
}

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
      workspaceChangedAfterLastExecution = true;
      hasExecuted = false;
      if (token) {
        autoSaveWorkspace();
      } else {
        saveWorkspace();
      }
    });
}

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
      if (!token) {
        fetch('/saveGuestWorkspace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            workspaceData: jsonState
          })
        });
      }
    });
}

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

function executeButton() {
  const generatedCommand = generateCommandFromWorkspace();
  const blockCount = workspace.getTopBlocks().length;
  saveWorkspaceOnExecute(blockCount);

  if (generatedCommand.length > 0) {
    document.getElementById('resultsText').innerText = generatedCommand;
  } else {
    document.getElementById('resultsText').innerText = '\n'; // Insert a newline character if the command is empty so that the results area does not shrink
  }
}

function saveWorkspaceOnExecute(blockCount) {
  if (blockCount > 0) {
    fetch('/auth-token')
      .then((response) => response.json())
      .then((data) => {
        if (workspaceChangedAfterLastExecution) {
          const state = Blockly.serialization.workspaces.save(workspace);
          executedWorkspace = JSON.stringify(state);
          const token = data.authToken;
          const user = data.user;
          hasExecuted = true;
          workspaceChangedAfterLastExecution = false;
          if (token) {
            if (executedWorkspace) {
              fetch('/saveWorkspace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  workspaceData: executedWorkspace,
                  userId: user.id,
                  workspaceName: 'executedWorkspace'
                })
              });
            }
          } else {
            console.log(
              'Workspace has changed since execution ',
              workspaceChangedAfterLastExecution
            );
            saveGuestWorkspaceData();
          }
        }
      });
  } else {
    console.log('Has executed ', hasExecuted);
  }
}

function resetWorkspace() {
  if (
    confirm(
      'Are you sure you want to reset the workspace? Everything will be deleted.'
    )
  ) {
    workspace.clear(); // Καθαρίζει το workspace
  }
}

// EventListeners
document
  .getElementById('copyButton')
  .addEventListener('click', copyToClipboard);

document
  .getElementById('executeButton')
  .addEventListener('click', executeButton);

document
  .getElementById('resetButton')
  .addEventListener('click', resetWorkspace);

document
  .getElementById('themeDropdown')
  .addEventListener('change', manageTheme);

document
  .getElementById('languageMenu')
  .addEventListener('change', handleLanguageChange);

document.addEventListener('DOMContentLoaded', loadInitialLanguage);

document.addEventListener('DOMContentLoaded', () => {
  manageWorkspaces();
});

Blockly.getMainWorkspace().addChangeListener(onWorkspaceChange);
