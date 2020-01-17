<template>
  <el-dialog :visible.sync="deleteVisible" id="delete" append-to-body :close-on-click-modal="false" :show-close="false">
    <div class="Dialog-Title">Delete</div>
    <div class="Description" >Sure To delete?</div>
    <div class="primitiveTagAlarmBottom">
      <p style="text-align:right;width:90%;font-size:16px;">
          <el-button type="text" class="text-btn-m-plus text-btn-info"  @click="closeDeleteDialog">CANCEL</el-button>
          <el-button type="text" class="text-btn-m-plus text-btn-primary" @click="sureDelete" style="color:#f9564f">'DELETE'</el-button>
      </p>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'deleteDialog',
  data () {
    return {

    }
  },
  props: {
    deleteVisible: {
      type: Boolean,
      default: false
    },
    setting: {
      type: Object,
      default: () => {
        return {
          titleLangTxt: 'delete_block',
          contentLangTxt: 'sure_delete'
        }
      }
    }
  },
  methods: {
    closeDeleteDialog: function () {
      this.$emit('closeDeleteDialog')
    },
    sureDelete: function () {
      this.$emit('sureDelete')
      this.closeDeleteDialog()
    }
  }
}
</script>
<style lang="scss">
#delete{
  .Description{
    // text-align: center
  }
}
</style>
