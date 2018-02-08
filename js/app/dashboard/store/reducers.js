import { combineReducers } from 'redux'
import _ from 'lodash'


// initial data pumped from the template
const tasksInitial = window.AppData.Dashboard.tasks,
      unassignedTasksInitial = _.filter(tasksInitial, task => !task.isAssigned),
      assignedTasksList = _.filter(tasksInitial, task => task.isAssigned),
      assignedTasksByUserInitial = _.groupBy(assignedTasksList, task => task.assignedTo)

/*
  Store for all assigned tasks
*/
const assignedTasksByUser = (state = assignedTasksByUserInitial, action) => {

  let  userTasks = state[action.username],
    newState = { ...state },
    newUserTasks,
    taskComparator = (taskA, taskB) => taskA['@id'] === taskB['@id']

  switch(action.type) {
    case 'ASSIGN_TASKS':
      newUserTasks = userTasks.slice()
      newState[action.username] = Array.prototype.concat(newUserTasks, action.tasks)
      newState[action.username].duration = 0
      newState[action.username].distance = 0
      break
    case 'REMOVE_TASKS':
      newUserTasks  = _.differenceWith(
        userTasks,
        _.intersectionWith(userTasks, action.tasks, taskComparator),
        taskComparator
      )
      newState[action.username] = newUserTasks
      newState[action.username].duration = 0
      newState[action.username].distance = 0
      break
    case 'ADD_USERNAME':
      newState[action.username] = []
      newState[action.username].duration = 0
      newState[action.username].distance = 0
      break
    case 'SAVE_USER_TASKS_SUCCESS':
      newState[action.username].duration = action.duration
      newState[action.username].distance = action.distance
      break
    case 'UPDATE_TASK':
      if (action.task.assignedTo) {
        userTasks = state[action.task.assignedTo]
        let index =  _.findIndex(userTasks, action.task, taskComparator)
        newState[action.task.assignedTo] = Array.prototype.splice(index, 1, action.task)
      }
      break
  }

  return newState
}

/*
  Store for all unassigned tasks
 */
const unassignedTasks = (state = unassignedTasksInitial, action) => {
  let newState = state.slice(),
    taskComparator = (taskA, taskB) => taskA['@id'] === taskB['@id']

  switch(action.type) {
    case 'ASSIGN_TASKS':
      newState  = _.differenceWith(
        newState,
        _.intersectionWith(newState, action.tasks, taskComparator),
        taskComparator
        )
      break
    case 'REMOVE_TASKS':
      newState = Array.prototype.concat(newState, action.tasks)
      break
    case 'UPDATE_TASK':
      let index =  _.findIndex(state, action.task, taskComparator)
      newState = Array.prototype.splice(index, 1, action.task)
      break
  }

  return newState
}

const addModalIsOpen = (state = false, action) => {
  switch(action.type) {
    case 'OPEN_ADD_USER':
      return true
    case 'CLOSE_ADD_USER':
      return false
    default:
      return state
  }
}

const userPanelLoading = (state = false, action) => {
  switch(action.type) {
    case 'SAVE_USER_TASKS':
      return true
    case 'SAVE_USER_TASKS_SUCCESS':
      return false
    case 'SAVE_USER_TASKS_ERROR':
      throw(new Error('Unhnadled error case for save'))
    default:
      return state
  }
}


export default combineReducers({
  assignedTasksByUser,
  unassignedTasks,
  userPanelLoading,
  addModalIsOpen
})
