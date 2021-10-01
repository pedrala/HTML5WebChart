import baseHtml from '../../../../html/pc/setting/tabs/scale.html';
import {
  getOnOffToggle,
  getQuantityInput
} from '../../html-helper';

import {
  ChartSettingEvent
} from '../../event-handler';

export default (rChart) => {

  const $baseHtml = $(baseHtml);
  const rGlobalProperty = rChart.GetGlobalProperty();

  // on/off 토글
  $('.rdo_check', $baseHtml).html(function() {
    const n = $(this).data('name');
    return getOnOffToggle(rGlobalProperty[n], n);
  });

  // spinner
  $('.prd_count', $baseHtml).html(function () {
    const n = $(this).data('name');
    return $(getQuantityInput(rGlobalProperty[n], n)).html();
  }) 
  // 범위 밖 숫자 입력시 이전 값으로 돌림
  .on('keyup', '.cout_input', function () {
    let n = $(this).attr("name"),
      v = Number($(this).val());

    let prev = rGlobalProperty[n];
    if (setGlobalProperty(n, v) === false) {
      $(this).val(prev);
    }
  });  

  // 체크박스
  $('.i_check', $baseHtml).prop({
    checked: function () {
      const n = $(this).attr('name');
      return rGlobalProperty[n];
    },
    disabled: function () {
      const p = $(this).attr('parent');
      if (!p) return false;
      return !rGlobalProperty[p];
    }
  }).on('change', function () {
    const c = $(this).attr('children');
    $(`[name=${c}]`, $baseHtml).prop("disabled", !$(this).is(":checked"));
  });

  // 라디오버튼
  $('.i_radio', $baseHtml).prop({
    checked: function () {
      const n = $(this).attr('name'),
        v = $(this).val();
      return rGlobalProperty[n] == v;
    },
    disabled: function () {
      const p = $(this).attr('parent');
      if (!p) return false;
      return !$(`[name=${p}]`, $baseHtml).prop('checked');
    }
  });
  
  // 체크박스, 라디오버튼 상태 변경
  /* const toggleCheckElement = ($target) => {
    $target.prop('checked', function () {
      const n = $target.attr('name'),
        v = $target.val();
      return rGlobalProperty[n] == v;
    });

    $target.prop('disabled', function () {
      const p = $target.attr('parent');
      if (!p) return false;
      return !$(`[name=${p}]`, $baseHtml).prop('checked');
    });
  } */

  // html 생성
  /* $('li', $baseHtml).each((idx, li) => {
    const $li = $(li),
      type = $li.data('type'),
      name = $li.data('name');

    switch (type) {
      case 'toggle': {
        $('.rdo_check', $li).html(getOnOffToggle(rGlobalProperty[name], name));
        break;
      }
      case 'checkbox': {
        const $checkbox = $('.i_check', $li);
        toggleCheckElement($checkbox);        

        $checkbox.on('change', function () {
          const c = $checkbox.attr('children');
          $(`[name=${c}]`, $baseHtml).prop("disabled", !$(this).is(":checked"));
        });

        break;
      }
      case 'radio': {
        toggleCheckElement($('.i_radio', $li));
        break;
      }
      case 'spinner': {
        $li.append(getQuantityInput(rGlobalProperty[name], name))
        // 범위 밖 숫자 입력시 이전 값으로 돌림
        .on('keyup', '.cout_input', function () {
          let n = $(this).attr("name"),
            v = Number($(this).val());

          let prev = rGlobalProperty[n];
          if (setGlobalProperty(n, v) === false) {
            $(this).val(prev);
          }
        });
        break;
      }
      default: break;
    }
  }); */

  // 이벤트 연결
  new ChartSettingEvent($baseHtml)
    .toggleSwitch(setGlobalProperty)
    .iRadioButton(setGlobalProperty)
    .iCheckButton(setGlobalProperty)
    .quantity(function () {
      const inputField = $(this),
        strName = inputField.attr("name"),
        nValue = Number(inputField.val());

      if (setGlobalProperty(strName, nValue) === false) {
        inputField.val(rGlobalProperty[strName]);
      }
    });  

  // GlobalProperty 값 변경
  function setGlobalProperty(label, value) {

    switch (label) {
      case "m_bInvertPriceYAxis":
        rGlobalProperty.SetInvertYScale(value);
        break;
      case "m_bLogPriceYAxis":
        rGlobalProperty.SetLogYScale(value);
        break;
      case "m_nShowLatestPriceType":
        rGlobalProperty.SetShowLatestPriceTypeForSetupHtml(value);
        break;
      case "m_nPriceChangeRatioType":
        rGlobalProperty.SetPriceChangeRatioTypeWithShowLatestPriceType(value);
        break;
      case "m_nRightMargin":
        if (rGlobalProperty.SetRightMargin(value) === false)
          return false;
        break;
      case "m_nTopBottomMargin":
        if (rGlobalProperty.SetTopBottomMargin(value) === false)
          return false;
        break;
      default:        
        rGlobalProperty[label] = value;
    }

    rChart.SetGlobalPropertyToChart();
  }  

  // 국제화 언어 적용
  $baseHtml.localize();

  return $baseHtml;
}