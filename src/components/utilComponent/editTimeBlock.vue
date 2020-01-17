<template>
  <el-dialog id="modalDiv" append-to-body :visible.sync="editBlockVisible" :show-close="false" :close-on-click-modal="false" title="Edit">
    <div class="content">
      <el-main>
        <div class="time-div">
          <div class="time-start-div">
            <label for="" class="time-lab">Start Time</label>
            <el-input  class="time-edit" v-model="startH"  @change="validate('startM',startH)"></el-input>
            <span>:</span>
            <el-input class="time-edit" v-model="startM"  @change="validate('startM',startM)"></el-input>
          </div>
          <div class="time-stop-div">
            <label for="" class="time-lab">Stop Time</label>
            <el-input class="time-edit" v-model="stopH" @change="validate('stopH',startH)"></el-input>
            <span>:</span>
            <el-input class="time-edit" v-model="stopM" @change="validate('stopM',startM)"></el-input>
          </div>
          <div class="event-div">
            <label for="" class="time-lab">Type</label>
            <el-select class="time-edit" id="eventSelect" v-model="selectType">
              <el-option v-for="(item,index) in types" :key="index" :value="item.value" :label="item.textLang">{{item.textLang}}</el-option>
            </el-select>
          </div>
        </div>
      </el-main>
      <el-footer class="footer" style="height:20px">
        <el-button type="text" class="save text-btn-m-plus text-btn-primary" @click="changeBlock">SET</el-button>
        <el-button type="text" class="save text-btn-m-plus text-btn-primary" @click="deleteVisible=true">DELETE</el-button>
        <el-button type="text" class="save text-btn-m-plus text-btn-primary" @click="closeDialog">CANCEL</el-button>
      </el-footer>
    </div>
    <delete-dialog @closeDeleteDialog="deleteVisible=false" :deleteVisible="deleteVisible" @sureDelete="deleteBlock" :setting="{
      'titleLangTxt':'delete_block',
      'contentLangTxt':'sure_delete'
    }"></delete-dialog>
  </el-dialog>
</template>
<script>
import deleteDialog from './deleteDialog'
import util from './util.js'
import _ from 'lodash'
export default {
  name: 'editTimeBlock',
  data () {
    return {
      types: [
        {
          textLang: 'peak',
          value: 0
        }, {
          textLang: 'sharp',
          value: 1
        }, {
          textLang: 'valley',
          value: 2
        }
      ],
      selectType: 0,
      startH: '',
      startM: '',
      stopH: '',
      stopM: '',
      deleteVisible: false
    }
  },
  components: {
    deleteDialog
  },
  props: {
    editBlockVisible: {
      type: Boolean,
      default: false
    },
    sourceData: {
      type: Object,
      default: () => {
        return {
          startTimeCoordinate: 0,
          stopTimeCoordinate: 48,
          color: 'fff',
          startTime: '00:00',
          stopTime: '23:59',
          info: 0,
          defaultColor: ['#FF231E', '#0CC90C', '#007ACC'],
          oneHourWidth: 24,
          oneMinWidth: 0.4,
          blocks: []
        }
      }
    }
  },
  watch: {
    editBlockVisible: function (val) {
      if (val) {
        console.log(this.sourceData)
        let self = this
        let sourceData = self.sourceData
        self.startH = Math.floor(sourceData.startTimeCoordinate / sourceData.oneHourWidth) + ''
        self.startM = Math.floor(sourceData.startTimeCoordinate % sourceData.oneHourWidth / sourceData.oneMinWidth) + ''
        self.stopH = Math.floor(sourceData.stopTimeCoordinate / sourceData.oneHourWidth) + ''
        self.stopM = Math.floor(sourceData.stopTimeCoordinate % sourceData.oneHourWidth / sourceData.oneMinWidth) + ''
        self.selectType = sourceData.defaultColor.findIndex(color => color === sourceData.color)
      }
    }
  },
  methods: {
    changeBlock () {
      let self = this
      if (!self.checkData()) {
        util.notify('error', 'please check config')
        return false
      }
      let STH = parseInt(self.startH, 10)
      let STM = parseInt(self.startM, 10)
      let SPH = parseInt(self.stopH, 10)
      let SPM = parseInt(self.stopM, 10)
      let startTimeCoordinate = self.time2Coordinate(STH + ':' + STM)
      let stopTimeCoordinate = self.time2Coordinate(SPH + ':' + SPM)
      let index = self.findWhichOne()
      if (index > 0) {
        if (self.sourceData.blocks[index - 1].stopTimeCoordinate > startTimeCoordinate) {
          util.notify('error', 'please check config')
          return false
        }
      } else {
        if (startTimeCoordinate < 0) {
          util.notify('error', 'please check config')
          return false
        }
      }
      if (self.sourceData.blocks.length - 1 !== index) {
        if (stopTimeCoordinate > self.sourceData.blocks[index + 1].startTimeCoordinate) {
          util.notify('error', 'please check config')
          return false
        }
      }

      if (stopTimeCoordinate - startTimeCoordinate < 6) {
        util.notify('error', 'period should more than 15 minute')
        return false
      }
      this.$emit('changeBlock', {
        startTimeCoordinate,
        stopTimeCoordinate,
        color: self.sourceData.defaultColor[self.selectType]
      })
      this.closeDialog()
    },
    deleteBlock () {
      this.$emit('deleteBlock')
      this.closeDialog()
    },
    closeDialog () {
      this.$emit('closeEditDialog')
    },
    time2Coordinate: function (time) {
      var coordinate
      var self = this
      var hourCoordinate = parseInt(time.split(':')[0], 10) * self.sourceData.oneHourWidth
      var minCoordinate = parseInt(time.split(':')[1], 10) * self.sourceData.oneMinWidth
      minCoordinate = parseFloat(minCoordinate.toFixed(4))
      coordinate = hourCoordinate + minCoordinate
      return coordinate
    },
    validate (type, value) {
      // let self = this
      let maxTime
      if (type === 'startH') {
        maxTime = 23
      } else if (type === 'stopH') {
        maxTime = 24
      } else {
        maxTime = 59
      }
      let regStatus = (/\D+/g).test(value)
      if (!value || regStatus || value < 0 || value > maxTime) {
        console.log('error')
        return false
      } else {
        return true
      }
    },
    findWhichOne: function () {
      let self = this
      let originalStartTimeCoordinate = _.cloneDeep(self.sourceData.startTimeCoordinate)
      let whichOne = self.sourceData.blocks.findIndex(item => {
        return item.startTimeCoordinate === originalStartTimeCoordinate
      })
      return whichOne
    },
    checkData () {
      let self = this
      let flag = true
      let array = ['startH', 'startM', 'stopH', 'stopM']
      array.forEach(item => {
        if (!self.validate(item, self[item])) {
          flag = false
        }
      })
      return flag
    }
  }
}
</script>
<style lang="scss">
#modalDiv{
  .content{
    // text-align: center;
  }
  .time-start-div{
    margin-bottom: 10px;
  }
  .time-stop-div{
    margin-bottom: 10px;
  }
  .time-edit.el-input{
    width:60px;
  }
  .time-edit .el-input{
    width:100px;
  }
  .footer{
    text-align:right;
    height:48px;
  }
  .el-dialog{
    width:420px
  }
  .time-lab{
    width:80px;
  }
  .event-div{
    padding:0;
    margin: 0 20px 0 0;
  }
}
</style>
