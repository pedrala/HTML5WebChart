import t from '../common/i18n'

/**
 * @param {array} args
 * args[0]: message(내용)
 * args[1]: title(제목) or callback(함수) or options
 * args[2]: callback(함수) or options 
 * options: {
 *  confirmButtonText: 확인버튼 텍스트,
 *  cancelButtonText: 취소버튼 텍스트,
 *  callback: 확인버튼 동작
 * }
 */
export default {
  $alert: function (args) {
    return this.messageBox('alert', args);

  },
  $confirm: function (args) {
    return this.messageBox('confirm', args);
  },
  
  /**
   * @param {object } rChart
   * @param {string} type (alert or confirm)
   * @param {*} args 
   */
  messageBox: function (rChart, type, args) {
    let message, title;
    let options = {
      confirmButtonText: t('chart.okbtn'),
      cancelButtonText: t('chart.cancelbtn')
    }

    switch (args.length) {
      case 1:
        {
          message = args[0];
          break;
        }
      case 2:
        {
          message = args[0];
          const arg1 = args[1];
          if (typeof arg1 === 'string' || typeof arg1 === 'number') {
            title = arg1;
          } else if (typeof arg1 === 'function') {
            options.callback = arg1;
          } else if (typeof arg1 === 'object') {
            options = arg1;
          }
          break;
        }
      case 3:
        {
          message = args[0];
          title = args[1];
          const arg2 = args[2];
          if (typeof arg2 === 'function') {
            options.callback = arg2;
          } else if (typeof arg2 === 'object') {
            options = arg2;
          }
          break;
        }
      default:
        {
          type = 'alert';
          message = t('error.undefinedortoomany');
          options.callback = null;
        }
    }

    // options
    const confirmButtonText = options.confirmButtonText;
    const cancelButtonText = options.cancelButtonText;
    const callback = options.callback;

    // html 생성
    const html = [];    
    html.push('<div class="setting_modal">');
    html.push('<div class="el-message-box">');

    // 타이틀
    html.push(`<div class="el-message-box__header${title ? '' : ' no-header'}">${title || ''}</div>`);

    // 내용
    html.push('<div class="el-message-box__content">');
    html.push('<div class="el-message-box__message">');
    html.push(`<p>${message}</p>`);
    html.push('</div>');
    html.push('</div>');

    // 버튼
    html.push('<div class="el-message-box__btns">');

    if (type === 'confirm' && cancelButtonText) {
      html.push('<button id="cancelBtn" type="button" class="el-button el-button--default">');
      html.push(`<span>${cancelButtonText}</span>`);
      html.push('</button>');
    }

    if (confirmButtonText) {
      html.push('<button id="confirmBtn" type="button" class="el-button el-button--primary">');
      html.push(`<span>${confirmButtonText}</span>`);
      html.push('</button>');
    }

    html.push('</div>');

    html.push('</div>');
    html.push('</div>');

    const $wrapper = $(html.join(''));
    $wrapper
      .find('#cancelBtn').on('click', function () {
        close();
      }).end()
      .find('#confirmBtn').on('click', function () {
        if (callback) {
          callback.call(this);
        }

        close();
      }).end();

    function close() {
      if ($wrapper.siblings('.setting_modal').length) {
        $wrapper.remove();
      } else {
        rChart.RemoveWrapper();
      }
    }

    return $wrapper;
  }
}
