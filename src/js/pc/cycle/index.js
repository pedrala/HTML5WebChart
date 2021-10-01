import baseHtml from '../../../html/pc/cycle/index.html';

import {
  getQuantityInput,
  getVisibleCheckbox,
} from '../html-helper';
import { ChartSettingEvent } from '../event-handler';
import { CYCLE_OPTIONS, CYCLE_MIN } from '../../chart/kfitsChart';
import t from '../../common/i18n';

// 주기 설정
export default function () {
  return new Promise((resolve, reject) => {
    // const self = this;
    const $wrapper = this.CreateWrapper(),
      $div = $('#setting_modal_bx', $wrapper);

    const $baseHtml = $(baseHtml);
    const items = this.getCycleOptions();

    function createHtml() {
      $('#list', $baseHtml).empty();
      items.forEach((item, index) => {
        const current = CYCLE_OPTIONS.find(obj => obj.nValue === item.cycle);
        const $tr = $('<tr>', {
          'class': () => {
            return item.selected ? 'sel' : '';
          }
        });        

        $('<td>').append(getVisibleCheckbox(item.is)).appendTo($tr);

        const $cycle = $('<td>', {'class': 'title'}).text(() => {
          let txt = '';
          if (current.isInterval) {
            txt = item.interval + ' ';
          }
          txt += t(current.strText);
          return txt;
        }).appendTo($tr);

        const $period = $('<td>').append(getQuantityInput(item.interval)).appendTo($tr);
        if (!current.isInterval) {
          $('.prd_count', $period).hide();
        }

        const $td = $('<td>', {
          'style': 'padding-left:5px;'
        }).appendTo($tr),
          $fieldset = $('<fieldset>', {
            'class': 'select_ui'
          }).appendTo($td),
          $select = $('<select>', {
            'name': 'cycle'
          }).appendTo($fieldset);

        $select.optsselectmenu({
          width: 90,
          props: items,
          param: index,
          opts: CYCLE_OPTIONS,
          callback: function (id, val, idx) {
            items[idx][id] = Number(val);
            const cycleTxt = $(':selected', $select).text();
            if (Number(val) !== CYCLE_MIN) {
              items[idx].interval = 1;
              $('.prd_count', $period).hide();
              $cycle.text(cycleTxt);
            } else {
              items[idx].interval = $('input', $period).val();
              $('.prd_count', $period).show();
              $cycle.text(items[idx].interval + ' ' + cycleTxt);
            }
          }
        });

        $('#list', $baseHtml).append($tr);
      });

      new ChartSettingEvent($baseHtml).quantity(function () {
        const $self = $(this);
        const $tr = $self.closest('tr'),
          $cycle = $('td:eq(1)', $tr);
        const idx = $tr.index();
        let val = parseInt($self.val(), 10);
        if (val >= 1000) {
          val = 999;
        } else if (val < 1) {
          val = 1;
        }
        $self.val(val);
        items[idx].interval = val;
        $cycle.text(val + ' ' + $('option:selected', $tr).text());
      });
    }

    createHtml();

    // 주기 설정 선택
    $baseHtml.on('click', '#list .title', function () {
      const $self = $(this);
      const $tr = $self.closest('tr');
      const idx = $tr.index();
      $tr.siblings().removeClass('sel');
      for (let i = 0, size = items.length; i < size; i++) {
        delete items[i].selected;
      }
      if (!$tr.hasClass('sel')) {
        $tr.addClass('sel');
        items[idx].selected = true;
      }
    })
    // 체크 박스
      .on('change', '#list input:checkbox', function () {
        const $self = $(this);
        const isChecked = $self.is(':checked');
        const $tr = $self.closest('tr');
        const idx = $tr.index();
        items[idx].is = isChecked;
      })
      // 주기 순서 변경
      .on('click', '.period-order-btns > a', function () {
        const $self = $(this);
        const idx = $baseHtml.find('#list tr.sel').index();
        if (idx === -1) return;
        const item = items[idx];
        if ($self.hasClass('top')) {
          items.splice(idx, 1);
          items.unshift(item);
        } else if ($self.hasClass('up')) {
          items.splice(idx, 1);
          items.splice(idx - 1, 0, item);
        } else if ($self.hasClass('down')) {
          items.splice(idx, 1);
          items.splice(idx + 1, 0, item);
        } else if ($self.hasClass('bottom')) {
          items.splice(idx, 1);
          items.push(item);
        }
        createHtml();
      });

    $baseHtml.localize();
    
    $baseHtml.appendTo($div);    
    
    $baseHtml.find('.anal_setting_modal').draggable({
      handle: '.src_tit',
    });

    /* alert 닫기 */
    $('#cycle-ok-btn').on('click', () => {
      $('#cycle-alert').hide();
    });

    $baseHtml.find('#okBtn')
      .off('click')
      .on('click', (e) => {
        e.preventDefault();
        let i;
        const dup = {};

        for (i = 0, size = items.length; i < size; i++) {
          const item = items[i];
          const key = `cycle-${item.cycle}-interval-${item.interval}`;
          if (item.is) dup[key] = (dup[key] || 0) + 1;
          const current = CYCLE_OPTIONS.find(obj => obj.nValue === item.cycle);
          item.text = current.strText.substring(current.strText.lastIndexOf('.') + 1);
          delete item.selected;
        }
        
        //ie에서 findIndex함수 동작하지 않으므로 대신 구현
        //if (Object.keys(dup).findIndex(key => dup[key] > 1) > -1) {
        //  $('#cycle-alert').show();
        //  return;
        //}
        let KeyValue;        
        for( KeyValue in dup){
          if( dup[KeyValue] > 1){
            $('#cycle-alert').show();
            return;  
          }
        }

        localStorage.setItem('chart-cycles', JSON.stringify(items));
        this.RemoveWrapper();
        resolve(items.filter(item => item.is));

      }).end()
      .find('.btn_close')
      .off('click')
      .on('click', (e) => {
        e.preventDefault();
        this.RemoveWrapper();
        reject();
      });
  });
}
