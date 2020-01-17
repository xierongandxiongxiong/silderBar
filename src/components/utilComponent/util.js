'use strict'
const ElementUI = require('element-ui')
const Message = ElementUI.Message

function notify (type, message) {
  let notify
  let duration
  if (type === 'warning') {
    duration = 10000
  } else if (type === 'error' || type === 'danger') {
    type = 'error'
    duration = 120000
  } else if (type === 'success') {
    duration = 1000
  }
  let obj = {
    showClose: true,
    message,
    type,
    duration,
    offset: 112
  }
  if (type === 'error') {
    obj['iconClass'] = 'icon-btn-dialog-step-error-n el-message__icon'
    obj['customClass'] = 'portal-notify error-notify'
  }
  if (type === 'success') {
    obj['iconClass'] = 'icon-btn-dialog-step-complete-n el-message__icon'
    obj['customClass'] = 'portal-notify success-notify'
  }
  notify = Message((obj))
  return notify
}
module.exports = {
  notify
}
