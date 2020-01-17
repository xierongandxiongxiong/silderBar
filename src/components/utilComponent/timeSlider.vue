<template>
  <div>
    <div id="timeslider">
      <label class="label-week unSelect">{{sourceData.labelLangText}}</label>
      <div class="timeSlider">
        <div class="trCanvas" @click.self.stop="manualCreation" :style="{width:timeSliderWidth+'px'}" :id="'trCanvas'+'_'+sliderIndex+'_'+configIndex">
          <time-block v-for="(block,index) in sourceData.blocks" :key="index"
          :sourceData="block"
          :sliderLeftOffset="sliderLeftOffset"
          :sliderData="{
            blocks:sourceData.blocks,
            whichOne:index,
            sliderLeftOffset,
            oneMinWidth,
            oneHourWidth,
            timeSliderWidth,
            hasMove,
            sliderIndex,
            defaultOneTimeBlockTime,
            info,
            defaultColor:setting.defaultColor,
            configIndex
          }"
          @changeBlock="changeBlock"
          @deleteBlock="deleteBlock"
          @changeEventType="changeEventType"></time-block>
        </div>
        <div  v-for="(item,index) in 25" :key="index" unselectable="on" class="unSelect">
          <div class="coordinate" :style="{left:oneHourWidth*index+'px'}"></div>
          <label class="coordinateLabDiv" :style="{marginLeft:index<10?'':'-7px',left:oneHourWidth*index+'px'}">{{index}}</label>
        </div>
      </div>
      <div class="operation unSelect" unselectable="on" onselectstart="return false;">
        <slider-copy
        :setting="{
          'currentName':labelLangText,
          sliderNames
        }"
        @closeCopyDialog="closeCopyDialog"
        @copySlider="copySlider"
        ></slider-copy>
        <img src="@/assets/btn_main_delete_normal.svg" class="delImg" @click="deleteVisible=true" />
      </div>
    </div>
    <delete-dialog @closeDeleteDialog="deleteVisible=false" :deleteVisible="deleteVisible" @sureDelete="deleteSlider" :setting="{
      'titleLangTxt':'delete_slider',
      'contentLangTxt':'sure_delete'
    }"></delete-dialog>
  </div>
</template>
<script>
import timeBlock from './timeBlock.vue'
import sliderCopy from './sliderCopy'
import deleteDialog from './deleteDialog'
export default {
  name: 'timeSlider',
  components: {
    timeBlock,
    sliderCopy,
    deleteDialog
  },
  props: {
    labelLangText: {
      type: String,
      default: 'monday'
    },
    setting: {
      type: Object,
      default: () => {
        return {
          mountedId: 'timeslider',
          defaultColor: ['#FF231E', '#0CC90C', '#007ACC']
        }
      }
    },
    info: {
      type: Number,
      default: 0
    },
    sliderIndex: {
      type: Number,
      default: 0
    },
    configIndex: {
      type: Number,
      default: 0
    },
    sourceData: {
      type: Object,
      default: () => {
        return {
          labelLangText: 'monday',
          value: 1,
          blocks: []
        }
      }
    }
  },
  data () {
    return {
      g_startClickTimeStamp: '',
      g_stopClickTimeStamp: '',
      g_language: '',
      blocks: [
        // {
        // startTimeCoordinate: 0,
        // stopTimeCoordinate: 48,
        // color: 'FF231E'
        // }
      ],
      startTimeCoordinateArray: [], // 存放每个时间段的开始坐标
      stopTimeCoordinateArray: [], // 存放每个时间段的结束坐标
      startTimeArray: [], // 存放每个时间段的开始时间
      stopTimeArray: [], // 存放每个时间段的结束时间
      infosArray: [], // 存放每个时间轴的所有时间段上的信息数组，例如2:00-4:00这个时间段用来绑定移动侦测事件
      curStartTime: 0, // 存放当前操作时间段的开始时间
      curStopTime: 0, // 存放当前操作时间段的结束时间
      curTimeBlockDom: null,
      curStartTimeShowDom: null,
      curStopTimeShowDom: null,
      lastStartCoordinate: 0, // 存放最后一个被创建时间段的开始坐标
      timeSliderWidth: 576, // 时间轴宽度
      sliderLeftOffset: 0, // 时间轴距离页面最左边的距离
      oneTimeBlockWidth: 0, // 手动创建时间段的默认宽度
      oneHourWidth: 24, // 每一个小时占的宽度
      oneMinWidth: 0.4, // 每一个分钟占的宽度
      timeBlockNums: 0, // 时间段个数
      hasMove: false, // 判断时间段是click事件还是move事件
      whichOne: 0, // 目前操纵的时间段在坐标数组中的索引
      timeSliderNums: 0,
      curTimeBlockId: null, // 当前操作的时间段的ID
      mountedId: 'timeslider', /// /当前挂载的真实DOM的ID
      wrapperDiv: null, // 时间轴所有元素的外部定位DOM
      curInfo: null, // 当前时间段的信息
      defaultOneTimeBlockTime: 30, // 手动创建时间段的默认时间间隔(min)
      sliderNames: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      copyVisible: false,
      editBlockVisible: false,
      deleteVisible: false
    }
  },
  methods: {
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
    // rgbToHex (rgb) {
    //   var _rgb = rgb.match(/[^\(\)]+(?=\))/g)[0].split(',')
    //   if (_rgb) {
    //     var hex = ''
    //     _.forEach(_rgb, function (item) {
    //       hex += ('0' + parseInt(item, 10).toString(16)).slice(-2)
    //     })
    //     return (hex)
    //   }
    // },
    manualCreation: function (e) {
      let self = this
      let startTimeCoordinate = parseFloat((self.getMousePos(e, 1).x - self.sliderLeftOffset).toFixed(4))
      let stopTimeCoordinate = startTimeCoordinate + self.defaultOneTimeBlockTime * self.oneMinWidth
      // 创建时间段
      self.sourceData.blocks.forEach((block, index) => {
        if (stopTimeCoordinate > block.startTimeCoordinate && startTimeCoordinate < block.stopTimeCoordinate) {
          return false
        }
      })
      self.createTimeBlock({
        startTimeCoordinate,
        info: self.info
      })
    },
    coordinate2Time: function (coordinate) {
      let self = this
      let tmpHour = Math.floor(coordinate / self.oneHourWidth)
      let min = Math.floor(coordinate % self.oneHourWidth / self.oneMinWidth)
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
    createTimeBlock: function (obj) {
      let self = this
      let startTimeCoordinate = obj.startTimeCoordinate || 0
      let stopTimeCoordinate
      startTimeCoordinate = self.resizeStartTimeCoordinate(startTimeCoordinate)
      // var Remainder = startTimeCoordinate % 10
      // if (Remainder % 2 !== 0) {
      //   startTimeCoordinate = startTimeCoordinate - 1
      // }
      stopTimeCoordinate = startTimeCoordinate + self.defaultOneTimeBlockTime * self.oneMinWidth || 0
      if (stopTimeCoordinate <= startTimeCoordinate) {
        return
      }
      if ((startTimeCoordinate) > self.timeSliderWidth - self.oneTimeBlockWidth) {
        return
      }
      // 判断新创建的时间段是否与已存在时间段重叠
      if (self.sourceData.blocks.length >= 1) {
        for (var j = 0; j < self.sourceData.blocks.length; j++) {
          if (stopTimeCoordinate > self.sourceData.blocks[j].startTimeCoordinate && startTimeCoordinate < self.sourceData.blocks[j].stopTimeCoordinate) {
            return
          }
        }
      }
      let block = {
        startTimeCoordinate: startTimeCoordinate,
        stopTimeCoordinate: stopTimeCoordinate,
        color: self.setting.defaultColor[self.info]
      }
      self.addBlock(block)
    },
    // timeBlockInit: function (data) {
    //   // 隐藏复制框
    //   let self = this
    //   var domArray = self.getElementsByClassName('editContent', '', 'div')
    //   for (var i = 0; i < domArray.length; i++) {
    //     domArray[i].style.display = 'none'
    //   }
    //   for (var i = 0; i < data.length; i++) {
    //     var item = data[i]
    //     var startTime = item.split('-')[0]
    //     var stopTime = item.split('-')[1]
    //     var info = self.infosArray[i]

    //     self.createTimeBlock({
    //       startTime: startTime,
    //       stopTime: stopTime,
    //       info: info
    //     })
    //   }
    // },
    // 获取当前对应时间的坐标
    time2Coordinate: function (time) {
      let coordinate
      let self = this
      let hourCoordinate = parseInt(time.split(':')[0], 10) * self.oneHourWidth
      let minCoordinate = parseInt(time.split(':')[1], 10) * self.oneMinWidth
      minCoordinate = parseFloat(minCoordinate.toFixed(4))
      coordinate = hourCoordinate + minCoordinate
      return coordinate
    },
    initial () {
      let self = this
      self.wrapperDiv = document.getElementById('trCanvas' + '_' + self.sliderIndex + '_' + self.configIndex)
      // self.sliderLeftOffset = (self.wrapperDiv.getBoundingClientRect().left + document.documentElement.scrollLeft)
      // console.log(self.configIndex + ':' + self.sliderLeftOffset)
      self.oneHourWidth = parseFloat((self.timeSliderWidth / 24).toFixed(4)) // 每一个小时占的宽度
      self.oneMinWidth = parseFloat((self.timeSliderWidth / 24 / 60).toFixed(4)) // 每一个分钟占的宽度
      self.fiveMinWidth = parseFloat((self.timeSliderWidth / 24 / 60).toFixed(4)) * 5 // 每五分钟占的宽度
      self.oneTimeBlockWidth = parseFloat((self.timeSliderWidth / 24 / 60 * self.defaultOneTimeBlockTime).toFixed(4)) // 手动创建时间段的默认宽度
      self.fiveTimeBlockWidth = parseFloat((self.timeSliderWidth / 24 / 60 * self.defaultOneTimeBlockTime).toFixed(4)) * 5 // 手动创建时间段的默认宽度
    },
    changeBlock: function ({data, index}) {
      let self = this
      this.$emit('changeBlock', {
        block: data,
        blockIndex: index,
        sliderIndex: self.sliderIndex,
        configIndex: self.configIndex
      })
    },
    changeEventType: function (data) {
      this.hasMove = data
    },
    deleteBlock: function (index) {
      let self = this
      self.$emit('deleteBlock', {
        blockIndex: index,
        sliderIndex: self.sliderIndex,
        configIndex: self.configIndex
      })
      // this.blocks.splice(index, 1)
    },
    closeCopyDialog: function () {
      this.copyVisible = false
    },
    copySlider: function (checkedNames) {
      let self = this
      this.$emit('copySlider', {
        sliderFromIndex: self.sliderIndex,
        sliderToNames: checkedNames,
        configIndex: self.configIndex
      })
    },
    deleteSlider: function () {
      this.$emit('deleteSlider', {
        sliderIndex: this.sliderIndex,
        configIndex: this.configIndex
      })
    },
    addBlock: function (block) {
      let self = this
      this.$emit('addBlock', {
        block,
        sliderIndex: self.sliderIndex,
        configIndex: self.configIndex
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
  },
  mounted: function () {
    this.initial()
  }
}
</script>

<style lang="scss">
#timeslider{
  // height:60px;
  .label-week{
    display: inline-block;
    width:80px;
  }
  .timeSlider{
    float: left;
  }
  .operation{
    float: left;
    position: relative;
    margin-left:20px;
    top:-4px;
  }
  .unSelect{
    -moz-user-select: none;
    -khtml-user-select: none;
    user-select: none;
  }
}
</style>
