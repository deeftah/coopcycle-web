function assignTasks (username, tasks) {
  return {type: 'ASSIGN_TASKS', username, tasks}
}

function removeTasks (username, tasks) {
  return {type: 'REMOVE_TASKS', username, tasks}
}

function saveUserTasks (username, tasks) {
  return {type: 'SAVE_USER_TASKS', username, tasks}
}

function saveUserTasksSuccess (username, tasks, duration, distance) {
  return {type: 'SAVE_USER_TASKS_SUCCESS', username, tasks, duration, distance}
}

function addUsernameToList (username) {
  return {type: 'ADD_USERNAME', username}
}

function updateTask (task) {
  return {type: 'UPDATE_TASK', task}
}

function openAddUserModal () {
  return {type: 'OPEN_ADD_USER'}
}

function closeAddUserModal() {
  return {type: 'CLOSE_ADD_USER'}
}

function saveUserTasksRequest (username, tasks) {
    const data = tasks.map((task, index) => {
      return {
        task: task['@id'],
        position: index
      }
    })

    return function(dispatch) {
      dispatch(saveUserTasks(username, tasks))

      return fetch(
        window.AppData.Dashboard.assignTaskURL.replace('__USERNAME__', username),
        {
          credentials: "include",
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ).then((rep) => {
        rep.json().then((data) =>
          dispatch(saveUserTasksSuccess(username, tasks, data.duration, data.distance))
        )
      })
    }
}

export {
  updateTask,
  addUsernameToList,
  saveUserTasks,
  saveUserTasksRequest,
  assignTasks,
  removeTasks,
  openAddUserModal,
  closeAddUserModal
}
