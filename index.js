// TASK: import helper functions from utils
import {getTasks, createNewTask, patchTask, deleteTask} from './utils/taskFunctions.js';
// TASK: import initialData
import {initialData} from './initiaLData.js';

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// initializeData Function: checks if local storage already has data, if not it loads initialData to localStorage
 // Check if tasks data exists in local storage
 // If not, initialize it with initialData
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', true); //Key name, corrected; boolean value, set.
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  filterDiv: document.getElementById('filterDiv'),

  createTaskBtn: document.getElementById("create-task-btn"),
  columnDivs: document.querySelectorAll('.column-div')
};

let activeBoard = "";

// fetchAndDisplayBoardsAndTasks Function: Extracts unique board names from tasks and displays them
 // Fetch tasks data from local storage
 // Extract unique board names from tasks
 // Display boards and tasks on the UI
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    activeBoard = JSON.parse(localStorage.getItem("activeBoard")) || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// displayBoards Function: Creates different boards in the DOM based on board names
 // Display each board in the DOM with event listeners
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}
 
// filterAndDisplayTasksByBoard Function: Filters tasks corresponding to the board name and displays them on the DOM
 // Filter tasks by board name and status
 // Display filtered tasks on the UI
function filterAndDisplayTasksByBoard(boardName) {
  const filteredTasks = getTasks().filter(task => task.board === boardName);
  elements.columnDivs.forEach(column => {
    const status = column.dataset.status;
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.dataset.taskId = task.id;
      taskElement.addEventListener("click", () => openEditTaskModal(task));
      tasksContainer.appendChild(taskElement);
    });
  });
}

// refreshTasksUI Fuction: Refreshes the UI to reflect the changes in tasks
 // Refreshes the UI by calling filterAndDisplayTasksByBoard
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// styleActiveBoard Function: Styles the active board by adding an active class
 // Adds active class to the currently active board button
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// addTaskToUI Function: Adds a new task to the UI
 // Adds a new task element to the appropriate column in the UI
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
 
  tasksContainer.appendChild(taskElement);
}

// setupEventListeners Function: Sets up event listeners for various UI interactions
 // Sets up event listeners for buttons and UI elements
function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));


  // Cancel adding new task event listener*
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it*
  elements.filterDiv.addEventListener('click', (event) => {
    if (event.target === elements.filterDiv) {
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    }
  });
  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));
  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);
  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });

};

// toggleModal Fuction: Toggles tasks modal
  // Shows or hides the modal window based on the 'show' parameter
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

// addTask Function: Adds a new task to the task list
  // Retrieves task details from the modal form
  // Creates a new task object and adds it to the task list
  // Updates the UI to reflect the new task
function addTask(event) {
  event.preventDefault();

  // Get user inputs from the modal
  const title = document.getElementById('title-input').value;
  const description = document.getElementById('desc-input').value;
  const status = document.getElementById('select-status').value;

  // Create a task object with the user inputs
  const task = {
    title: title,
    description: description,
    status: status,
    id: JSON.parse(localStorage.getItem('id')),
    board: activeBoard,
  };

  // Create the new task using a helper function
  const newTask = createNewTask(task);

  // If the new task is successfully created, add it to the UI
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false); // Close the modal
    elements.filterDiv.style.display = 'none'; // Hide the filter overlay
    event.target.reset(); // Reset the form
    refreshTasksUI(); // Refresh the UI to reflect the changes
  }
}

// toggleSidebar Function: Toggles the sidebar visibility
  // Shows or hides the sidebar based on the 'show' parameter
function toggleSidebar(show) {
  const sidebarElement = document.getElementById('side-bar-div');

 if (show) {
   sidebarElement.style.display = 'block';
   elements.showSideBarBtn.style.display = "none";
   //sidebarElement.appendChild(svgElement);
 } else {
   sidebarElement.style.display = 'none';
   elements.showSideBarBtn.style.display = "block";
   // sidebarElement.removeChild(svgElement);
 }

 localStorage.setItem('showSideBar', show);
}

// toggleTheme Function: Toggles between light and dark themes
  // Toggles the theme of the UI between light and dark mode
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', document.body.classList.contains('light-theme') ? 'enabled' : 'disabled');
}

// openEditTaskModal Function: Opens the edit task modal and populates it with task details
  // Populates the edit task modal with task details
  // Sets up event listeners for save and delete actions
function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', () => {
    deleteTask(task.id);
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
  });

  // Show the edit task modal
  toggleModal(true, elements.editTaskModal);
}

// saveTaskChanges Function: Saves changes made to a task and updates the UI
  // Retrieves updated task details from the edit modal
  // Updates the task with the new details
  // Closes the edit modal and refreshes the UI
function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = document.getElementById('edit-task-title-input').value;
  const updatedDescription = document.getElementById('edit-task-desc-input').value;
  const updatedStatus = document.getElementById('edit-select-status').value;

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: updatedTitle,
    description: updatedDescription,
    status: updatedStatus,
    board: activeBoard
  };

  // Update task using a helper function
  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}


/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}