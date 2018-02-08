import React from 'react'
import { findDOMNode } from 'react-dom'
import moment from 'moment'
import dragula from 'react-dragula'
import _ from 'lodash'
import Task from './Task'

moment.locale($('html').attr('lang'))

class UserPanel extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      duration: props.duration || 0,
      distance: props.distance || 0,
      collapsed: props.collapsed,
    }
  }

  componentDidMount() {
    this.props.onLoad(this, findDOMNode(this))

    const { username, collapsed } = this.props

    $('#collapse-' + username).on('shown.bs.collapse', () => {
      this.setState({ collapsed: false })
    })

    $('#collapse-' + username).on('hidden.bs.collapse', () => {
      this.setState({ collapsed: true })
    })

    if (!collapsed) {
      $('#collapse-' + username).collapse('show')
    }

    // handler to change the task order within a courier tasklist
    const container = findDOMNode(this).querySelector('.courier-task-list')
    dragula([container], {

    }).on('drop', (element, target, source) => {

      const { tasks } = this.props

      const elements = target.querySelectorAll('.list-group-item')
      const tasksOrder = _.map(elements, element => element.getAttribute('data-task-id'))

      let newTasks = tasks.slice()
      newTasks.sort((a, b) => {
        const keyA = tasksOrder.indexOf(a['@id'])
        const keyB = tasksOrder.indexOf(b['@id'])

        return keyA > keyB ? 1 : -1
      })

      this.props.saveUserTasksRequest(this.props.username, newTasks)

    })

  }

  componentDidUpdate(prevProps) {
    if(prevProps.tasks !== this.props.tasks) {
      this.props.saveUserTasksRequest(this.props.username, this.props.tasks)
    }
  }

  add(task) {

    let tasks

    if (Array.isArray(task)) {
      tasks = task
    } else {
      tasks = [task]
    }

    this.props.onAdd(this.props.username, tasks)
  }

  remove(taskToRemove) {

    // Check if we need to remove another linked task
    let tasksToRemove = []
    if (taskToRemove.delivery) {
      tasksToRemove = _.filter(this.props.tasks, task => task.delivery !== null && task.delivery['@id'] === taskToRemove.delivery['@id'])
    } else {
      tasksToRemove = [ taskToRemove ]
    }

    this.props.onRemove(this.props.username, tasksToRemove)

  }

  render() {

    const { duration, distance, username, tasks } = this.props
    const { collapsed } = this.state

    tasks.sort((a, b) => {
      return a.position > b.position ? 1 : -1
    })

    const durationFormatted = moment.utc()
      .startOf('day')
      .add(duration, 'seconds')
      .format('HH:mm')

    const distanceFormatted = (distance / 1000).toFixed(2) + ' Km'

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            <i className="fa fa-user"></i> 
            <a role="button" data-toggle="collapse" data-parent="#accordion" href={ '#collapse-' + username }>{ username }</a> 
            { collapsed && ( <i className="fa fa-caret-down"></i> ) }
            { !collapsed && ( <i className="fa fa-caret-up"></i> ) }
          </h3>
        </div>
        <div id={ 'collapse-' + username } className="panel-collapse collapse" role="tabpanel">
          { tasks.length > 0 && (
            <div className="panel-body">
              <strong>Durée</strong>  <span>{ durationFormatted }</span>
              <br />
              <strong>Distance</strong>  <span>{ distanceFormatted }</span>
            </div>
          )}
          <div className="list-group dropzone">
            <div className="list-group-item text-center dropzone-item">
              Déposez les livraisons ici
            </div>
          </div>
          <div className="list-group courier-task-list">
            { tasks.map(task => (
              <Task
                key={ task['@id'] }
                task={ task }
                assigned={ true }
                onRemove={ task => this.remove(task) }
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
}

export default UserPanel
