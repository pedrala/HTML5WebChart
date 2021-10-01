import baseHtml from '../../../../html/pc/setting/tabs/background.html';

import {
  ChartSettingEvent
} from '../../event-handler';

export default (rChart) => {

  const $baseHtml = $(baseHtml);
  const rGlobalProperty = rChart.GetGlobalProperty();

  // 색상 변경
  $('.color_picker', $baseHtml).spectrumColorPicker({
    props: rGlobalProperty,
    callback: setGlobalProperty
  });

  // 라인 타입 변경
  $('.lineTypeSelect', $baseHtml).linetypeselectmenu({
    props: rGlobalProperty,
    callback: setGlobalProperty
  });

  // 라인 두께 변경
  $('.lineThicknessSelect', $baseHtml).lineThicknessselectmenu({
      props: rGlobalProperty,
      callback: setGlobalProperty
  });

  //
  $('.i_check', $baseHtml).prop({
    checked: function () {
      const n = $(this).attr('name');
      return rGlobalProperty[n];
    },
    disabled: function() {
      const p = $(this).attr('parent');
      if (!p) return false;
      return !rGlobalProperty[p];
    }
  }).on('change', function() {
    const c = $(this).attr('children');
    $(`[name=${c}]`, $baseHtml).prop("disabled", !$(this).is(":checked"));
  });
  
  // 이벤트 연결
  new ChartSettingEvent($baseHtml)
    .iCheckButton(setGlobalProperty);

  // GlobalProperty 값 변경
  function setGlobalProperty(label, value) {

    switch (label) {
      case "m_clrBack":
        rGlobalProperty.SetClrBack(value);
        break;
      case "m_clrText":
        rGlobalProperty.SetClrText(value);
        break;
      case "m_clrVertLine":
        rGlobalProperty.SetClrVertLine(value);
        break;
      case "m_clrHorzLine":
        rGlobalProperty.SetClrHorzLine(value);
        break;
      case "m_clrCrossLine":
        rGlobalProperty.SetClrCrossLine(value);
        break;
      default:
        if (typeof value === 'string')
          value = Number(value);
        rGlobalProperty[label] = value;
    }

    rChart.SetGlobalPropertyToChart();
  } 

  // 국제화 언어 적용
  $baseHtml.localize();
  
  return $baseHtml;
}