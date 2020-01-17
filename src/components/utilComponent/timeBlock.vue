<template>
  <div class="timeSliderDiv"
  @mousedown.self.stop="blockMouseDown"
  @mouseenter.self.stop="blockMouseEnter"
  @mouseleave.self.stop="blockMouseLeave"
  @mouseover.self.stop="blockMouseOver"
  @dblclick.self.stop="editBlock"
  :id="'timeS'+uniq"
  :style="{left:setting.startTimeCoordinate+'px',backgroundColor:'#'+ setting.color,width:timeBlockWidth+'px'}">
    <div class="startTimeBar" :id="'startTimeBar'+uniq"
    @mousedown.self.stop="startTimeBarDown"
    @mouseover.self.stop="startTimeBarOver"
    :style="{display:active?'block':'none'}"></div>
    <div class="stopTimeBar" :id="'stopTimeBar'+uniq" @mousedown.stop="stopTimeBarDown" @mouseover.stop="stopTimeBarOver" :style="{display:active?'block':'none'}"></div>
    <div class="startTimeShow" :id="'startTimeShow'+uniq" :style="{display:active?'block':'none'}">{{startTime}}</div>
    <div class="stopTimeShow" :id="'stopTimeShow'+uniq" :style="{display:active?'block':'none'}">{{stopTime}}</div>
    <editTimeBlock ref="editTimeBlock"
    :editBlockVisible="editBlockVisible"
    @closeEditDialog="closeEditDialog"
    @deleteBlock="deleteBlock"
    @changeBlock="changeBlock"
    :sourceData ="Object.assign(setting,{
      startTime,
      stopTime,
      info:sliderData.info,
      oneHourWidth:sliderData.oneHourWidth,
      defaultColor:sliderData.defaultColor,
      oneMinWidth:sliderData.oneMinWidth,
      blocks:sliderData.blocks
    })"></editTimeBlock>
  </div>
</template>
<script>
import _ from 'lodash'
import editTimeBlock from './editTimeBlock'
export default {
  name: 'timeBlock',
  components: {
    editTimeBlock
  },
  props: {
    sourceData: {
      type: Object,
      default: () => {
        return {
          startTimeCoordinate: 0,
          stopTimeCoordinate: 48,
          color: 'fff'

        }
      }
    },
    sliderData: {
      type: Object,
      default: () => {
        return {
          whichOne: 0,
          sliderLeftOffset: 0,
          oneMinWidth: 0.4,
          blocks: [],
          oneHourWidth: 24,
          timeSliderWidth: 864,
          hasmove: false,
          sliderIndex: 0,
          defaultOneTimeBlockTime: 30,
          info: 0,
          defaultColor: ['#FF231E', '#0CC90C', '#007ACC'],
          configIndex: 0
        }
      }
    }

  },
  data () {
    return {
      active: false,
      setting: {
        startTimeCoordinate: 0,
        stopTimeCoordinate: 48,
        color: 'fff',
        id: 0
      },
      g_stopClickTimeStamp: '',
      g_startClickTimeStamp: '',
      editBlockVisible: false
    }
  },
  watch: {
    sourceData: function (val) {
      this.setting = val
    }
  },
  computed: {
    startTime: function () {
      return this.coordinate2Time(this.setting.startTimeCoordinate)
    },
    stopTime: function () {
      return this.coordinate2Time(this.setting.stopTimeCoordinate)
    },
    timeBlockWidth: function () {
      return this.setting.stopTimeCoordinate - this.setting.startTimeCoordinate
    },
    uniq: function () {
      return '_' + this.sliderData.configIndex + '_' + this.sliderData.sliderIndex + '_' + this.sliderData.whichOne
    }
  },
  mounted: function () {
    this.setting = _.cloneDeep(this.sourceData)
  },
  methods: {
    blockMouseDown (enent) {
      let e = event || window.event
      let self = this
      let originalStopTimeCoordinate = _.cloneDeep(self.setting.stopTimeCoordinate)
      let originalStartTimeCoordinate = _.cloneDeep(self.setting.startTimeCoordinate) // 时间段的原始偏移量
      let sliderLeftOffset = self.sliderData.sliderLeftOffset
      let timeSliderWidth = self.sliderData.timeSliderWidth
      let blocks = self.sliderData.blocks
      let whichOne = self.findWhichOne()
      self.g_stopClickTimeStamp = new Date().getTime()
      self.g_startClickTimeStamp = new Date().getTime()
      debugger
      let timeBlockWidth = parseFloat((originalStopTimeCoordinate - originalStartTimeCoordinate).toFixed(4)) // 时间段自身的宽度
      // let timeDifferenceMins = Number(stopTime.split(':')[0]) * 60 + Number(stopTime.split(':')[1]) - Number(startTime.split(':')[0]) * 60 - Number(startTime.split(':')[1])
      let mouseRelativeOffsetX = parseFloat((self.getMousePos(e).x - originalStartTimeCoordinate - sliderLeftOffset).toFixed(4)) // 鼠标在时间段上的偏移
      let leftBorder = 0
      let rightBorder = timeSliderWidth
      let toStartTimeCoordinate = 0
      let toStopTimeCoordinate = 0
      let timeBlockDom = document.getElementById('timeS' + self.uniq)

      if (blocks.length > 1 && whichOne > -1) {
        if (whichOne === 0) {
          rightBorder = blocks[whichOne + 1].startTimeCoordinate
        } else if (whichOne === blocks.length - 1) {
          leftBorder = blocks[whichOne - 1].stopTimeCoordinate
        } else {
          leftBorder = blocks[whichOne - 1].stopTimeCoordinate
          rightBorder = blocks[whichOne + 1].startTimeCoordinate
        }
      }
      document.onmousemove = function (event) {
        let e = event || window.event
        self.g_stopClickTimeStamp = new Date().getTime()
        timeBlockDom.style.cursor = 'move'
        self.changeEventType(true)
        if (self.g_stopClickTimeStamp - self.g_startClickTimeStamp > 80) {
          // self.changeEventType(true)
          toStartTimeCoordinate = parseFloat((self.getMousePos(e).x - mouseRelativeOffsetX - sliderLeftOffset).toFixed(4))
          toStartTimeCoordinate = self.resizeStartTimeCoordinate(toStartTimeCoordinate)
          if (toStartTimeCoordinate < leftBorder) {
            toStartTimeCoordinate = leftBorder
            self.documnetMouseUp()
            console.log('toStartTimeCoordinate <= leftBorder')
          } else if (toStartTimeCoordinate > parseFloat((rightBorder - timeBlockWidth).toFixed(4))) {
            toStartTimeCoordinate = parseFloat((rightBorder - timeBlockWidth).toFixed(4))
            self.documnetMouseUp()
            console.log('toStartTimeCoordinate >= parseFloat((rightBorder - timeBlockWidth).toFixed(4))')
          }
          toStopTimeCoordinate = parseFloat((toStartTimeCoordinate + timeBlockWidth).toFixed(4))
          if (toStartTimeCoordinate >= leftBorder && toStopTimeCoordinate <= rightBorder) {
            timeBlockDom.style.left = toStartTimeCoordinate + 'px'
            self.setting.startTimeCoordinate = toStartTimeCoordinate
            self.setting.stopTimeCoordinate = toStopTimeCoordinate
          } else {
            self.documnetMouseUp()
            return false
          }
        }
      }
      document.onmouseleave = document.onmouseup = function () {
        self.documnetMouseUp()
      }
      self.stopPropagation(e)
    },
    blockMouseEnter () {
      this.active = true
    },
    blockMouseLeave () {
      this.active = false
    },
    startTimeBarDown (event) {
      let e = event || window.event
      let self = this
      let startTimeCoordinate
      let sliderLeftOffset = self.sliderData.sliderLeftOffset
      let blocks = self.sliderData.blocks
      let oldStarTimeCoordinate = _.cloneDeep(self.setting.startTimeCoordinate)
      let oldStopTimeCoordinate = _.cloneDeep(self.setting.stopTimeCoordinate)
      let whichOne = self.findWhichOne()
      let oneMinWidth = self.sliderData.oneMinWidth
      let defaultOneTimeBlockTime = self.sliderData.defaultOneTimeBlockTime
      e.target.style.cursor = 'w-resize'
      self.g_startClickTimeStamp = new Date().getTime()
      let mouseRelativeOffsetX = parseFloat((oldStarTimeCoordinate - (self.getMousePos(e).x - sliderLeftOffset)).toFixed(4))
      let leftBorder = 0
      if (blocks.length > 1) {
        if (whichOne !== 0) {
          leftBorder = blocks[whichOne - 1].stopTimeCoordinate
        }
      }
      document.onmousemove = function (event) {
        let e = event || window.event
        self.g_stopClickTimeStamp = new Date().getTime()
        if (self.g_stopClickTimeStamp - self.g_startClickTimeStamp > 100) {
          startTimeCoordinate = parseFloat((self.getMousePos(e).x - sliderLeftOffset + mouseRelativeOffsetX).toFixed(4))
          startTimeCoordinate = self.resizeStopTimeCoordinate(startTimeCoordinate)
          if (startTimeCoordinate < leftBorder) {
            startTimeCoordinate = leftBorder
            self.documnetMouseUp()
            console.log('startTimeCoordinate <= leftBorder')
          } else if (oldStopTimeCoordinate - startTimeCoordinate < oneMinWidth * defaultOneTimeBlockTime) {
            startTimeCoordinate = oldStarTimeCoordinate - (oneMinWidth * defaultOneTimeBlockTime)
            self.documnetMouseUp()
            console.log('30 less')
          } else if (startTimeCoordinate > oldStopTimeCoordinate) {
            startTimeCoordinate = oldStopTimeCoordinate
            self.documnetMouseUp()
            console.log('startTimeCoordinate > oldStopTimeCoordinate')
          } else {
            self.setting.startTimeCoordinate = startTimeCoordinate
          }
        }
      }
      document.onmouseup = document.onmouseleave = function () {
        self.documnetMouseUp()
      }
      self.stopPropagation(e)
    },
    documnetMouseUp () {
      let self = this
      // alert('up')
      document.getElementById('stopTimeBar' + self.uniq).style.cursor = 'default'
      document.getElementById('startTimeBar' + self.uniq).style.cursor = 'default'
      document.getElementById('timeS' + self.uniq).style.cursor = 'auto'
      self.changeBlock(self.setting)
      self.changeEventType(false)
      document.onmousemove = document.onmouseup = document.onmouseleave = null
    },
    stopPropagation (e) {
      if (document.all) { // 兼容IE8
        e.cancelBubble = true
      } else {
        e.stopPropagation()
      }
    },
    stopTimeBarDown (event) {
      let e = event || window.event
      let self = this
      let stopTimeCoordinate
      let sliderLeftOffset = self.sliderData.sliderLeftOffset
      let timeSliderWidth = self.sliderData.timeSliderWidth
      let blocks = self.sliderData.blocks
      let oneMinWidth = self.sliderData.oneMinWidth
      let defaultOneTimeBlockTime = self.sliderData.defaultOneTimeBlockTime
      e.target.style.cursor = 'w-resize'
      self.g_startClickTimeStamp = new Date().getTime()
      let oldStartTimeCoordinate = _.cloneDeep(self.setting.startTimeCoordinate)
      let whichOne = self.findWhichOne()
      let mouseRelativeOffsetX = parseFloat((self.getMousePos(e).x - sliderLeftOffset - self.setting.stopTimeCoordinate).toFixed(4))
      let rightBorder = timeSliderWidth
      if (blocks.length > 1) {
        if (whichOne !== blocks.length - 1) {
          rightBorder = blocks[whichOne + 1].startTimeCoordinate
        }
      }
      document.onmousemove = function (event) {
        let e = event || window.event
        self.g_stopClickTimeStamp = new Date().getTime()
        if (self.g_stopClickTimeStamp - self.g_startClickTimeStamp > 50) {
          stopTimeCoordinate = parseFloat((self.getMousePos(e).x - sliderLeftOffset - mouseRelativeOffsetX).toFixed(4))
          stopTimeCoordinate = self.resizeStopTimeCoordinate(stopTimeCoordinate)
          if (stopTimeCoordinate > rightBorder) {
            stopTimeCoordinate = rightBorder
            self.documnetMouseUp()
            console.log('stopTimeCoordinate >= rightBorder')
          } else if (stopTimeCoordinate - oldStartTimeCoordinate < oneMinWidth * defaultOneTimeBlockTime) {
            stopTimeCoordinate = oldStartTimeCoordinate + oneMinWidth * defaultOneTimeBlockTime
            self.documnetMouseUp()
            console.log('30 minute less')
          } else if (stopTimeCoordinate < oldStartTimeCoordinate) {
            stopTimeCoordinate = oldStartTimeCoordinate
            self.documnetMouseUp()
            console.log('stopTimeCoordinate < oldStartTimeCoordinate')
          }
          self.setting.stopTimeCoordinate = stopTimeCoordinate
        }
      }
      document.onmouseup = document.onmouseleave = function () {
        self.documnetMouseUp()
      }
      self.stopPropagation(e)
    },
    blockMouseOver (event) {
      this.active = true
    },
    startTimeBarOver (e) {
      e.target.style.cursor = 'e-resize'
    },
    stopTimeBarOver (e) {
      e.target.style.cursor = 'e-resize'
    },
    getMousePos (event, flag) {
      var e = event || window.event
      var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft
      var scrollY = document.documentElement.scrollTop || document.body.scrollTop
      var x
      if (flag) { // fix 20200107
        x = e.layerX
      } else {
        x = e.pageX || e.clientX + scrollX
      }
      var y = e.pageY || e.clientY + scrollY
      return { 'x': x, 'y': y }
    },
    time2Coordinate: function (time) {
      let coordinate
      let self = this
      let hourCoordinate = parseInt(time.split(':')[0], 10) * self.sliderData.oneHourWidth
      let minCoordinate = parseInt(time.split(':')[1], 10) * self.sliderData.oneMinWidth
      minCoordinate = parseFloat(minCoordinate.toFixed(4))
      coordinate = hourCoordinate + minCoordinate
      return coordinate
    },
    coordinate2Time: function (coordinate) {
      let self = this
      let tmpHour = Math.floor(coordinate / self.sliderData.oneHourWidth)
      let min = Math.floor(coordinate % self.sliderData.oneHourWidth / self.sliderData.oneMinWidth)
      let time
      if (min < 10) {
        min = '0' + min
      } else if (min === 60) {
        min = '00'
        tmpHour += 1
      }

      let hour = tmpHour.toString().length < 2 ? '0' + tmpHour : tmpHour
      time = hour + ':' + min
      return time
    },
    findWhichOne: function () {
      let self = this
      let originalStartTimeCoordinate = _.cloneDeep(self.setting.startTimeCoordinate)
      let whichOne = self.sliderData.blocks.findIndex(item => {
        return item.startTimeCoordinate === originalStartTimeCoordinate
      })
      return whichOne
    },
    editBlock: function () {
      // alert('edit')
      let self = this
      self.g_startClickTimeStamp = new Date().getTime()
      // self.g_stopClickTimeStamp = new Date().getTime() + 100
      console.log(self.g_stopClickTimeStamp - self.g_startClickTimeStamp)
      // if (self.g_stopClickTimeStamp - self.g_startClickTimeStamp > 10) {
      self.editBlockVisible = true
      // }
    },
    changeEventType: function (data) {
      this.$emit('changeEventType', data)
    },
    closeEditDialog: function () {
      this.editBlockVisible = false
      this.changeEventType(false)
    },
    deleteBlock: function () {
      let self = this
      self.$emit('deleteBlock', self.findWhichOne())
    },
    changeBlock: function (data) {
      let self = this
      self.$emit('changeBlock', {
        data: data,
        index: self.findWhichOne()
      })
    },
    resizeStartTimeCoordinate: function (coordinate) {
      var Remainder = coordinate % 10
      if (Remainder % 2 !== 0) {
        coordinate = coordinate - 1
      }
      return coordinate
    },
    resizeStopTimeCoordinate: function (coordinate) {
      var Remainder = coordinate % 10
      if (Remainder % 2 !== 0) {
        coordinate = coordinate + 1
      }
      return coordinate
    }
  }
}
</script>
