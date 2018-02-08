import React from 'react'
import { connect } from 'react-redux'
import dragula from 'dragula'
import { updateTask } from './store/actions'
import TaskList from './components/TaskList'
import UserPanelList from './components/UserPanelList'

let inDraggingUnassignedTask

const userComponentMap = new Map()


/*
  Code to handle drag and drop from unassigned tasks to assigned
 */
var drake = dragula({
  copy: true,
  copySortSource: false,
  revertOnSpill: true,
  accepts: (el, target, source, sibling) => target !== source
})
  .on('cloned', function (clone, original) {
    // fired when we start dragging from unassigned tasks
    inDraggingUnassignedTask = original
    if ($(original).hasClass('list-group-item')) {
      $(original).addClass('disabled')
    } else {
      $(original).find('.list-group-item').addClass('disabled')
    }
  }).on('dragend', function (el) {
    if ($(inDraggingUnassignedTask).hasClass('list-group-item')) {
      $(inDraggingUnassignedTask).removeClass('disabled')
    } else {
      $(inDraggingUnassignedTask).find('.list-group-item').removeClass('disabled')
    }
  }).on('over', function (el, container, source) {
    if (userComponentMap.has(container)) {
      $(container).addClass('dropzone--over');
    }
  }).on('out', function (el, container, source) {
    if (userComponentMap.has(container)) {
      $(container).removeClass('dropzone--over');
    }
  }).on('drop', function(element, target, source) {

    const component = userComponentMap.get(target)

    let tasks = []
    if ($(element).data('task-group') === true) {
      tasks = $(element)
        .children()
        .map((index, el) => $(el).data('task-id'))
        .map((index, taskID) => _.find(window.AppData.Dashboard.tasks, task => task['@id'] === taskID))
        .toArray()
    } else {
      const task = _.find(window.AppData.Dashboard.tasks, task => task['@id'] === $(element).data('task-id'))
      tasks.push(task)
    }

    component.add(tasks)

    $(target).removeClass('dropzone--loading')
    element.remove()
  })


function onLoad (el) {
  drake.containers.push(el)
}


class DashboardApp extends React.Component {

  componentDidMount() {
    this.props.socket.on('task:done', task => this.props.updateTask(task))
    this.props.socket.on('task:failed', task => this.props.updateTask(task))
  }

  render () {

    let proxy = this.props.proxy

    return (
      <div>
        <TaskList
          onLoad={ el => onLoad(el) }
        />
        <UserPanelList
          couriersList={ window.AppData.Dashboard.couriersList }
          onLoad={(component, element) => {
            drake.containers.push(element)
            userComponentMap.set(element, component)
          }}
          onTaskListChange={(username, taskList) => {
            proxy.addTaskList(username, taskList)
          }}
        />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {
    updateTask: (task) => { dispatch(updateTask(task)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardApp)
