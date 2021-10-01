import {
  getLineTypeOptionHtml,
  getNThicknessOptionHtml,
  getVisibleCheckbox
} from '../html-helper'

import {
  ChartSettingEvent
} from '../event-handler';

import Moment from 'moment';
import t from '../../common/i18n';

import Tools from '../../../json/analysis-tool.json';
import {
  TOOL_TYPE
} from '../../chart/kfitsChart';

let strFormat, orgFormat;

export default (rChart, rToolInfo) => {

  const cycle = rToolInfo.m_Cycle; // 주기
  strFormat = cycle === 5 ? 'LT' : 'L'; // 날짜 포맷
  orgFormat = cycle === 5 ? 'YYYYMMDDHHmm' : 'YYYYMMDD'; // 전달된 데이터 날짜 포맷

  // 그리기 툴
  const toolLst = Tools.reduce((sum, {
    depth
  }) => {
    return sum.concat(depth.filter((p) => {
      return p.use;
    }))
  }, []);

  // 선택한 툴로 필터링
  const filtered = toolLst.filter(({
    type
  }) => TOOL_TYPE[type] === rToolInfo.m_nToolType)[0];

  if (!filtered) return;
  
  const html = [];

  html.push('<div class="dim"></div>');
  html.push('<div class="modal_cont">');

  const rToolType = rToolInfo.m_nToolType;
  // 수평선, 수직선 일 경우 
  const widthClazz = (rToolType === 3 || rToolType === 4) ? 'small' : '';

  html.push(`<div class="modal_area ${widthClazz}">`);
  html.push(`<strong class="pop_tit">${t('chart.' + filtered.label)}</strong>`);
  html.push('<div class="analysis_cont">');
  html.push('<table class="analysis_table">');
  html.push(`<caption>${t('chart.' + filtered.label)}</caption>`);
  html.push('<colgroup>');
  html.push('<col style="width:60px" />');
  html.push('<col style="width:110px;" />');
  html.push('<col style="width:35px" />');
  html.push('<col style="width:60px" />');
  html.push('</colgroup>');
  html.push('<tbody>');

  html.push(getHtml(filtered.prop, rToolInfo));

  html.push('</tbody>');
  html.push('</table>');
  html.push('</div>');

  /* S:버튼 영역 */
  html.push('<div class="btn_group">');
  html.push('<a href="#" class="btn_modal_reset">' + t('chart.reset') + '</a>');
  html.push('<a href="#" class="btn_modal_confirm">' + t('chart.okbtn') + '</a>');
  html.push('</div>');
  html.push('<a href="#" class="btn_modal_close">'+t('chart.popupclose')+'</a>');
  /* E:버튼 영역 */

  html.push('</div>');
  html.push('</div>');

  // html 생성
  const wrapper = document.createElement("div");
  wrapper.className = "modal_wrap";
  wrapper.innerHTML = html.join('');

  let $wrapper = $(wrapper);

  // 색상 선택
  $('.color_picker', $wrapper).mobileSpectrumColorPicker({
    props: rToolInfo,
    callback: setPropertyInfo
  })

  // 이벤트 연결
  $wrapper
    .on('focusout', '.input_txt', function () {
      let strName = $(this).attr("name"),
        nValue = $(this).val();
      setPropertyInfo(strName, nValue);
    })
    // 초기화
    .on('click', '.btn_modal_reset', function (e) {
      e.preventDefault();
      rToolInfo.InitToolInfo();

      const $popCont = $(this).closest('.btn_group').siblings('.analysis_cont');
      $popCont.find('tbody').empty().append(getHtml(filtered.prop, rToolInfo));
      
      rChart.SetSelectedToolPropertyInfo(rToolInfo, true);
    })
    // 확인
    .on('click', '.btn_modal_confirm', function (e) {
      e.preventDefault();
      rChart.OKTotalProperty(1);
      $wrapper.remove();
    })
    // 팝업닫기
    .on('click', '.btn_modal_close', function (e) {
      e.preventDefault();
      rChart.RollBackToolPropertyInfo();
      $wrapper.remove();
    });

  // 이벤트 연결
  new ChartSettingEvent($wrapper)
    .lineType(setPropertyInfo)
    .iCheckButton(setPropertyInfo);

  // PropertyInfo 값 변경
  function setPropertyInfo(label, value) {
    rToolInfo[label] = value;
    rChart.SetSelectedToolPropertyInfo(rToolInfo, true);
  }

  $wrapper.localize();

  return $wrapper;
}

function getHtml({
  start,
  end,
  style,
  extend
}, rToolInfo) {

  const contHtml = [];

  // 시작
  if (start) {
    contHtml.push('<tr>');

    let name, localeDate;
    start.forEach(item => {
      switch (item) {
        case 'date':          
          name = 'm_strStartDateTime';
          // 수직선, 피보나치 시간대일 경우
          if (rToolInfo.m_nToolType === 3 || rToolInfo.m_nToolType === 12) {
            name = 'm_strEndDateTime';
          }
          localeDate = Moment(rToolInfo[name], orgFormat);
          contHtml.push(`<th scope="row">${t('chart.startdate')}</th>`);
          contHtml.push('<td>');
          //contHtml.push(`<input value="${rToolInfo[calendar]}" name="${calendar}" class="input_txt" type="text" />`);
          contHtml.push(localeDate.format(strFormat));
          contHtml.push('</td>');
          break;
        case 'price':
        contHtml.push(`<th scope="row">${t('chart.price')}</th>`);
          contHtml.push('<td>');
          contHtml.push(`<input value="${rToolInfo['m_strStartValue']||0}" name="m_strStartValue" class="input_txt" type="text" />`);
          contHtml.push('</td>');
          break;
      }
    });

    contHtml.push('</tr>');
  }

  // 종료
  if (end) {
    contHtml.push('<tr>');

    let localeDate;
    end.forEach(item => {
      switch (item) {
        case 'date':
          localeDate = Moment(rToolInfo['m_strEndDateTime'], orgFormat);
          contHtml.push(`<th scope="row">${t('chart.enddate')}</th>`);
          contHtml.push('<td>');
          //contHtml.push(`<input value="${rToolInfo[calendar]}" name="${calendar}" class="input_txt" type="text" />`);
          contHtml.push(localeDate.format(strFormat));
          contHtml.push('</td>');
          break;
        case 'price':
          contHtml.push(`<th scope="row">${t('chart.price')}</th>`);
          contHtml.push('<td>');
          contHtml.push(`<input value="${rToolInfo['m_strEndValue']||0}" name="m_strEndValue" class="input_txt" type="text" />`);
          contHtml.push('</td>');
          break;
      }
    });

    contHtml.push('</tr>');
  }
 
  // 선스타일
  if (style) {
    contHtml.push('<tr>');
    contHtml.push(`<th scope="row">${t('chart.style')}</th>`);

    contHtml.push('<td colspan="3">');
    
    contHtml.push(`<div class="line_select_bx line_height_bx" id="m_nToolLineType">`);
    contHtml.push(getLineTypeOptionHtml(rToolInfo['m_nToolLineType'], 'm_nToolLineType'));
    contHtml.push('</div>');
  
    contHtml.push(`<div class="line_select_bx line_px_bx" id="m_nThickness">`);
    contHtml.push(getNThicknessOptionHtml(rToolInfo['m_nThickness'], 'm_nThickness'));
    contHtml.push('</div>');

    contHtml.push('<input type="text" class="color_picker" name="m_clrTool">');
    
    contHtml.push('</td>');
    contHtml.push('</tr>');
  }
  
  if (extend) {
    contHtml.push('<tr>');
    contHtml.push('<td colspan="4">');

    extend.forEach(item => {
      if (item === 'section') {
        const name = 'm_bUsePriceRange';
        contHtml.push(getVisibleCheckbox(rToolInfo[name], 'chart.pricerange', true, 'Boolean', name));
      }
    });

    contHtml.push('</td>');
    contHtml.push('</tr>');
  }

  return contHtml.join('');
}
