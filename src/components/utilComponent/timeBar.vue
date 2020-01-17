<template>
  <div id="timeBar">
    <div class="function-bar">
      <el-button @click="addPeriod" class="text-btn-m-plus text-btn-primary addBtn">+</el-button>
      <div class="eventBoxWrap unSelect">
        <div v-for="(item,index) in colors" :key="index">
          <label class="label-event">{{item.value}}</label>
          <div class="eventBox color" @click="setInfo(index)" :style="{backgroundColor:item.color}">
          </div>
        </div>
        <span>
          <label class="regular">regular</label>
          <div style="backgroundColor:#FDFD37;cursor:auto" class="color">
          </div>
        </span>
      </div>
    </div>
    <div class="content">
      <div v-for="(config, configIndex) in config" :key="configIndex">
        <!-- <div class="dateConfig">
          <date-pick class="datePick"></date-pick>
        </div> -->
        <div class="weekConfig">
          <div class="bars">
            <div v-for="(item,index) in config.weeks" :id="'timeslider'+(index+1)" :key="index">
              <time-slider
              :labelLangText="item.labelLangText"
              :setting="setting" :ref="'timeSlider'+index+1"
              :info="info"
              :sliderIndex="index"
              :configIndex="configIndex"
              @copySlider="copySlider"
              @changeBlock="changeBlock"
              @deleteBlock="deleteBlock"
              @deleteSlider="deleteSlider"
              @addBlock="addBlock"
              :sourceData="item"
              ></time-slider>
            </div>
          </div>
        </div>
        <div style="clear:both" class="line"></div>
      </div>
    </div>

  </div>
</template>
<script>
import timeSlider from './timeSlider.vue'
import datePick from './datePick.vue'
import editTimeBlock from './editTimeBlock.vue'
import _ from 'lodash'
import Vue from 'vue'
export default {
  name: 'timeBar',
  props: {
  },
  components: {
    timeSlider,
    editTimeBlock,
    datePick
  },
  data () {
    return {
      colors: [
        {
          color: '#FF231E',
          value: 'peak'
        },
        {
          color: '#0CC90C',
          value: 'sharp'
        },
        // {
        //   color: '#FDFD37',
        //   value: 'regular'
        // },
        {
          color: '#007ACC',
          value: 'valley'
        }
      ],
      times: [],
      config: [
        {
          dateRange: {
            from: '',
            to: ''
          },
          weeks: [
            {
              labelLangText: 'monday',
              value: 1,
              blocks: []
            }, {
              labelLangText: 'tuesday',
              value: 2,
              blocks: []
            }, {
              labelLangText: 'wednesday',
              value: 3,
              blocks: []
            }, {
              labelLangText: 'thursday',
              value: 4,
              blocks: []
            }, {
              labelLangText: 'friday',
              value: 5,
              blocks: []
            }, {
              labelLangText: 'saturday',
              value: 6,
              blocks: []
            }, {
              labelLangText: 'sunday',
              value: 7,
              blocks: []
            }
          ]
        }
      ],
      currentTime: '12:00',
      showTimes: ['00:00', '06:00', '12:00', '18:00', '24:00'],
      setting: {
        mountedId: 'timeslider',
        defaultColor: ['FF231E', '0CC90C', '007ACC']
      },
      info: 0
    }
  },
  mounted: function () {

  },
  methods: {
    setInfo (index) {
      this.info = index
    },
    copySlider ({sliderFromIndex, sliderToNames, configIndex}) {
      let self = this
      this.config[configIndex].weeks.map((item, index) => {
        if (sliderToNames.indexOf(item.labelLangText) > -1) {
          item.blocks = _.cloneDeep(self.config[configIndex].weeks[sliderFromIndex].blocks)
        }
      })
    },
    changeBlock ({block, blockIndex, sliderIndex, configIndex}) {
      let self = this
      Vue.set(self.config[configIndex].weeks[sliderIndex].blocks, blockIndex, block)
      let blocks = _.cloneDeep(self.config[configIndex].weeks[sliderIndex].blocks)
      let blocks2 = []
      blocks.forEach((block, index) => {
        if (index !== blocks.length - 1 && blocks.length > 1) {
          if (block.stopTimeCoordinate === blocks[index + 1].startTimeCoordinate && block.color === blocks[index + 1].color) {
            blocks[index].stopTimeCoordinate = _.cloneDeep(blocks[index + 1].stopTimeCoordinate)
            blocks.splice(index + 1, 1)
          }
        }
        blocks2.push(block)
      })
      self.config[configIndex].weeks[sliderIndex].blocks = _.cloneDeep(blocks2)
    },
    deleteBlock ({blockIndex, sliderIndex, configIndex}) {
      this.config[configIndex].weeks[sliderIndex].blocks.splice(blockIndex, 1)
    },
    deleteSlider ({sliderIndex, configIndex}) {
      this.config[configIndex].weeks[sliderIndex].blocks = []
    },
    addBlock ({block, sliderIndex, configIndex}) {
      let self = this
      let blocks = _.cloneDeep(self.config[configIndex].weeks[sliderIndex].blocks)
      blocks.push(block)
      blocks = blocks.sort((a, b) => {
        return a.startTimeCoordinate - b.startTimeCoordinate
      })
      blocks.forEach((block, index) => {
        if (index !== blocks.length - 1 && blocks.length > 1) {
          // if (block.color === blocks[index + 1].color) {
          //   blocks[index].stopTimeCoordinate = _.cloneDeep(blocks[index + 1].startTimeCoordinate)
          //   blocks.splice(index + 1, 1)
          // }
        }
      })
      self.config[configIndex].weeks[sliderIndex].blocks = _.cloneDeep(blocks)
    },
    addPeriod () {
      this.config.push({
        dateRange: {
          from: '',
          to: ''
        },
        weeks: [
          {
            labelLangText: 'monday',
            value: 1,
            blocks: []
          }, {
            labelLangText: 'tuesday',
            value: 2,
            blocks: []
          }, {
            labelLangText: 'wednesday',
            value: 3,
            blocks: []
          }, {
            labelLangText: 'thursday',
            value: 4,
            blocks: []
          }, {
            labelLangText: 'friday',
            value: 5,
            blocks: []
          }, {
            labelLangText: 'saturday',
            value: 6,
            blocks: []
          }, {
            labelLangText: 'sunday',
            value: 7,
            blocks: []
          }
        ]
      })
    }
  }
}
</script>
<style src="./timeSlider.css"></style>
<style lang="scss">
#timeBar{
  position: relative;
  #triangle {
    width: 0;
    height: 0;
    margin: 0 auto;
    z-index: 199;
    border-top: 1rem solid rgb(190, 98, 75);
    border-left: 1rem solid transparent;
    border-right: 1rem solid transparent;
  }
  .function-bar{
    position: fixed;
    width:70%;
    top:5px;
    .addBtn{
      float: left;
    }
    .eventBoxWrap{
      float: right;
    }
  }
  .content{
    margin-top:40px;
  }
  .dateConfig {
    margin:10px;
    float:left;
    height: 260px
  }
  .weekConfig {
    float:left
  }
  .datePick{
    position:relative;
    top:40%
  }
  li{
    display: inline-block;
    // width:50px;
  }
  .bar{
    margin:0 20px;
  }
  .color{
    width:24px;
    height:24px;
    border-radius:50%;
    // margin:20px;
    display: inline-block;
    cursor: pointer;
  }
  .timeCell{
    width:0.8px;
    height:30px;
  }
  .currentCell{
    height:40px;
    border: 1px solid red
  }
  .showCell{
    height:30px;
    border: 1px solid #e1e1e1
  }
  .valueCell{
    width:0.8px;
    height:20px;
  }
  .showTime{
    position: relative;
    display: inline-block;
    width: 40px;
  }
  .regular{
    float: left;
    margin-left: 20px;
    width:60px
  }
  .unSelect{
    -moz-user-select: none;
    -khtml-user-select: none;
    user-select: none;
  }
  .line{
    width:100%;
    height:1px;
    border: 1px dashed grey;
    margin: 10px 0;
  }
}

</style>
