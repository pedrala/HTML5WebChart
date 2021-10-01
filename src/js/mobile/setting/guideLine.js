import {
  getLineTypeOptionHtml,
  getNThicknessOptionHtml,
  getOnOffToggle
} from '../html-helper';

import {
  guideLine as components
} from './components.json'

import {
  ChartSettingEvent
} from '../event-handler';

import t from '../../common/i18n';

// 탭 02: 기준선
export default (rChart) => {

  const rGlobalProperty = rChart.GetGlobalProperty(),
    rSelectedRQ = rChart.GetSelectedRQ(),
    strLineType = 'm_nLineType',
    strThickness = 'm_nThickness',
    strClrLine = 'm_clrLine',
    strShow = 'm_bShow';

  // html 생성
  let html = [];
  html.push('<ul class="candel_change_lst">');

  let length = components.length;
  for (let i = 0; i < length; i++) {
    let component = components[i],
      rows = component.rows;

    rows.forEach(({
      label,
      packetName,
      index
    }, j) => {
      const rGuideLineInfo = rGlobalProperty.GetGuideLineInfo(rSelectedRQ, index) || {
        m_clrLine: '#ffffff',
        m_nLineType: 0,
        m_nThickness: 1,
        m_bShow: false
      };

      html.push(`<li id="packet-${packetName}" data-idx="${index}">`);

      html.push('<div class="lst_bx">');
      html.push(`<strong class="tit">${t(label)}</strong>`);
      html.push('<div class="check_rgt_bx color_select_bx">');

      html.push(`<div class="line_select_bx line_height_bx" id="${strLineType}">`);
      html.push(getLineTypeOptionHtml(rGuideLineInfo[strLineType]));
      html.push('</div>');

      html.push(`<div class="line_select_bx line_px_bx" id="${strThickness}">`);
      html.push(getNThicknessOptionHtml(rGuideLineInfo[strThickness]));
      html.push('</div>');

      html.push(`<input type="text" class="color_picker" name="${strClrLine}">`);

      html.push(getOnOffToggle(rGuideLineInfo[strShow], true, strShow));

      html.push('</div>');
      html.push('</div>');
      html.push('</li>');
    });
  }

  html.push('</ul>');


  let wrapper = document.createElement("div");
  wrapper.className = "tab_cont";
  wrapper.innerHTML = html.join('');

  let $wrapper = $(wrapper);

  // 색상 변경    
  $('.color_picker', $wrapper).each(function (idx) {
    $(this).mobileSpectrumColorPicker({
      props: rGlobalProperty.GetGuideLineInfo(rSelectedRQ, idx),
      param: idx,
      callback: function (id, color, idx) {
        rGlobalProperty.SetGuideLineColor(rChart, Number(idx), color);
        rChart.SetGlobalPropertyToChart();
      }
    });
  });

  // 이벤트 연결
  new ChartSettingEvent($wrapper)
    .lineType(setGlobalProperty)
    .toggleSwitch(setGlobalProperty);

  // GlobalProperty 값 변경
  function setGlobalProperty(label, value, nIdx) {

    switch (label) {
      case "m_nLineType":
        rGlobalProperty.SetGuideLineType(rChart, nIdx, value);
        break;
      case "m_nThickness":
        rGlobalProperty.SetGuideLineThickness(rChart, nIdx, value);
        break;
      case "m_bShow":
        rGlobalProperty.SetGuideLineShow(rChart, nIdx, value);
        break;
    }

    rChart.SetGlobalPropertyToChart();
  }

  // resize
  $(function () {
    $(".modal_chart_type .tab_cont").css('height', $(window).height() - 86);
  });

  $wrapper.localize();
  return $wrapper;
}