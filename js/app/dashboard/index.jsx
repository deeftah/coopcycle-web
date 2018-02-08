import React from 'react'
import { render, findDOMNode } from 'react-dom'
import { Provider } from 'react-redux'
import { DatePicker, LocaleProvider } from 'antd'
import fr_FR from 'antd/lib/locale-provider/fr_FR'
import en_GB from 'antd/lib/locale-provider/en_GB'
import MapHelper from '../MapHelper'
import MapProxy from './components/MapProxy'
import TaskRangePicker from './widgets/TaskRangePicker'
import L from 'leaflet'
import moment from 'moment'
import store from './store/store'
import DashboardApp from './app'


const locale = $('html').attr('lang'),
      antdLocale = locale === 'fr' ? fr_FR : en_GB,
      map = MapHelper.init('map'),
      proxy = new MapProxy(map),
      hostname = window.location.hostname,
      socket = io('//' + hostname, { path: '/tracking/socket.io' })


_.each(window.AppData.Dashboard.tasks, task => proxy.addTask(task))
_.each(window.AppData.Dashboard.taskLists, (taskList, username) => proxy.addTaskList(username, taskList))


render(
  <Provider store={store}>
    <DashboardApp
      proxy={proxy}
      socket={socket}
    />
  </Provider>,
  document.querySelector('.dashboard__aside')
)

render(
  <LocaleProvider locale={antdLocale}>
    <DatePicker
      format={ 'll' }
      defaultValue={ moment(window.AppData.Dashboard.date) }
      onChange={(date, dateString) => {
        if (date) {
          const dashboardURL = window.AppData.Dashboard.dashboardURL.replace('__DATE__', date.format('YYYY-MM-DD'))
          window.location.replace(dashboardURL)
        }
      }} />
  </LocaleProvider>,
  document.querySelector('#date-picker')
)

new TaskRangePicker(document.querySelector('#task_rangepicker'), [
  document.querySelector('#task_doneAfter'),
  document.querySelector('#task_doneBefore')
])

const couriersMap = new Map()
const couriersLayer = new L.LayerGroup()

couriersLayer.addTo(map)

socket.on('tracking', data => {
  let marker
  if (!couriersMap.has(data.user)) {
    marker = MapHelper.createMarker(data.coords, 'bicycle', 'circle', '#000')
    const popupContent = `<div class="text-center">${data.user}</div>`
    marker.bindPopup(popupContent, {
      offset: [3, 70]
    })
    couriersLayer.addLayer(marker)
    couriersMap.set(data.user, marker)
  } else {
    marker = couriersMap.get(data.user)
    marker.setLatLng(data.coords).update()
    marker.setIcon(MapHelper.createMarkerIcon('bicycle', 'circle', '#000'))
  }
})

socket.on('online', username => {
  console.log(`User ${username} is connected`)
})

socket.on('offline', username => {
  if (!couriersMap.has(username)) {
    console.error(`User ${username} not found`)
    return
  }
  const marker = couriersMap.get(username)
  marker.setIcon(MapHelper.createMarkerIcon('bicycle', 'circle', '#CCC'))
})
