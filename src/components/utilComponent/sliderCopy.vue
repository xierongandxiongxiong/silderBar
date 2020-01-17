<template>
  <el-popover
    placement="right"
    width="400"
    v-model="copyVisible"
    trigger="click">
    <div id="copy-box">
      <el-header style="height:38px">
          <label>COPY TO</label>
      </el-header>
      <el-main>
        <el-checkbox-group @change="handleCheckedNamesChange" v-model="checkedNames">
            <el-checkbox v-for="(item,index) in sliderNamesExceptSelected" :key="index" :label="item" class="check-item"></el-checkbox>
        </el-checkbox-group>
        <!-- <div> -->
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">Check All</el-checkbox>
        <!-- </div> -->
      </el-main>
      <el-footer>
          <el-button type="text" class="text-btn-m-plus text-btn-primary" @click="copySlider">SAVE</el-button>
          <el-button type="text" class="text-btn-m-plus text-btn-primary" @click="closeCopyDialog">CANCEL</el-button>
      </el-footer>
    </div>
    <img slot="reference" src="@/assets/btn_main_copy_normal.svg"/>
  </el-popover>
</template>
<script>
import _ from 'lodash'
export default {
  name: 'sliderCopy',
  props: {
    setting: {
      type: Object,
      default: () => {
        return {
          currentName: 'monday',
          sliderNames: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }
      }
    }
    // copyVisible: {
    //   type: Boolean,
    //   default: false
    // }
  },
  data () {
    return {
      checkedNames: [],
      isIndeterminate: true,
      checkAll: false,
      sliderNamesExceptSelected: [],
      copyVisible: false
    }
  },
  watch: {
    copyVisible: function (val) {
      if (val) {
        let self = this
        self.sliderNamesExceptSelected = _.cloneDeep(self.setting.sliderNames)
        let index = self.sliderNamesExceptSelected.findIndex(name => name === self.setting.currentName)
        self.sliderNamesExceptSelected.splice(index, 1)
      }
    }
  },
  methods: {
    handleCheckedNamesChange (val) {
      let checkedCount = val.length
      this.checkAll = checkedCount === this.sliderNamesExceptSelected.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.setting.sliderNames.length
    },
    handleCheckAllChange (val) {
      this.checkedNames = val ? this.sliderNamesExceptSelected : []
      this.isIndeterminate = false
    },
    copySlider () {
      this.$emit('copySlider', this.checkedNames)
      this.closeCopyDialog()
    },
    closeCopyDialog () {
      this.copyVisible = false
      // this.$emit('closeCopyDialog')
    }
  }
}
</script>
<style lang="scss">
#copy-box{
  .check-item{
    display: block
  }

}
</style>
