import baseHtml from '../../../../html/pc/setting/tabs/guideline.html';
import {
  getOnOffToggle
} from '../../html-helper';

import {
  ChartSettingEvent
} from '../../event-handler';

export default (rChart) => {

  const $baseHtml = $(baseHtml);  
  const rGlobalProperty = rChart.GetGlobalProperty(),
    rSelectedRQ = rChart.GetSelectedRQ();

  // 색상 변경    
  $('.color_picker', $baseHtml).each(function (idx) {
    $(this).spectrumColorPicker({
      props: rGlobalProperty.GetGuideLineInfo(rSelectedRQ, idx),
      param: idx,
      callback: setGlobalProperty
    });
  });

  // 라인 타입 변경
  $('.lineTypeSelect', $baseHtml).each(function (idx) {
    const rGuideLineInfo = rGlobalProperty.GetGuideLineInfo(rSelectedRQ, idx);
    $(this).linetypeselectmenu({
      props: rGuideLineInfo,
      param: idx,
      callback: setGlobalProperty
    });
  });

  // 라인 두께 변경
  $('.lineThicknessSelect', $baseHtml).each(function (idx) {
    const rGuideLineInfo = rGlobalProperty.GetGuideLineInfo(rSelectedRQ, idx);
    $(this).lineThicknessselectmenu({
      props: rGuideLineInfo,
      param: idx,
      callback: setGlobalProperty
    });
  });

  // on/off 토글
  $('.rdo_check', $baseHtml).html(function (idx) {
    const rGuideLineInfo = rGlobalProperty.GetGuideLineInfo(rSelectedRQ, idx);
    return getOnOffToggle(rGuideLineInfo['m_bShow'], 'm_bShow', idx);
  });

  // 이벤트 연결
  new ChartSettingEvent($baseHtml)
    .toggleSwitch(setGlobalProperty);

  // GlobalProperty 값 변경
  function setGlobalProperty(label, value, nIdx) {

    switch (label) {
      case "m_nLineType":
        rGlobalProperty.SetGuideLineType(rChart, nIdx, Number(value));
        break;
      case "m_nThickness":
        rGlobalProperty.SetGuideLineThickness(rChart, nIdx, Number(value));
        break;
      case "m_bShow":
        rGlobalProperty.SetGuideLineShow(rChart, nIdx, value);
        break;
      default:
        rGlobalProperty.SetGuideLineColor(rChart, nIdx, value);
    }

    rChart.SetGlobalPropertyToChart();
  }

  // 국제화 언어 적용
  $baseHtml.localize();

  return $baseHtml;
}