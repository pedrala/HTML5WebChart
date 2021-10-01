import {
  getLineTypeOptionHtml,
  getNThicknessOptionHtml,
  getVisibleCheckbox
} from '../html-helper'

import components from './components.json'

import {
  ChartSettingEvent
} from '../event-handler';

import t from '../../common/i18n';

export default (rChart, rStrKey) => {

  rChart.BackupChartFullProperty();
  
  const rPropertyInfo = this.GetPropertyInfo(rStrKey);
  const rSubGraphPropertyInfo = rPropertyInfo.m_SubGraphPropertyInfoArray[0];
  const rHogaDepthTypeInfo = rSubGraphPropertyInfo.m_HogaDepthTypeInfo;
  const rGlobalProperty = this.GetGlobalProperty();

  const html = [];
  html.push('<div class="dim"></div>');
  html.push('<div class="modal_cont">');
  html.push('<div class="modal_area">');
  html.push(`<strong class="pop_tit">${t(components.title)}</strong>`);
  html.push('<div class="depthchart_cont">');
  html.push('<table class="depthchart_table">');
  html.push(`<caption>${t(components.title)}</caption>`);
  html.push('<colgroup>');
  html.push('<col style="width:55px" />');
  html.push('<col style="width:45px;" />');
  html.push('<col style="width:55px" />');
  html.push('<col style="width:37px" />');
  html.push('</colgroup>');
  html.push('<tbody>');
  html.push(getHtml(components, rHogaDepthTypeInfo, rGlobalProperty));
  html.push('</tbody>');
  html.push('</table>');
  html.push('</div>');

  /* S:버튼 영역 */
  html.push('<div class="btn_group">');
  html.push('<a href="#" class="btn_modal_reset">' + t('chart.reset') + '</a>');
  html.push('<a href="#" class="btn_modal_confirm">' + t('chart.okbtn') + '</a>');
  html.push('</div>');
  html.push('<a href="#" class="btn_modal_close">' + t('chart.popupclose') + '</a>');
  /* E:버튼 영역 */

  html.push('</div>');
  html.push('</div>');

  // html 생성
  const wrapper = document.createElement("div");
  wrapper.className = "modal_wrap";
  wrapper.innerHTML = html.join('');

  const $wrapper = $(wrapper);

  $('.color_picker', $wrapper).mobileSpectrumColorPicker({
    props: rHogaDepthTypeInfo,
    callback: setPropertyInfo
  })
  
  // 이벤트 연결
  new ChartSettingEvent($wrapper)
    .colorPicker(setPropertyInfo)
    .iCheckButton(setPropertyInfo)
    .lineType(setPropertyInfo);
  
  $wrapper
    // 초기화
    .on('click', '.btn_modal_reset', function (e) {
      e.preventDefault();

      rChart.InitializeGlobalProperty(false);

      const rPropertyInfo = rChart.GetDefaultIndicatorProperty("_HOGADEPTH_");
      if (!rPropertyInfo) {
        return;
      }

      const rSubGraphPropertyInfo = rPropertyInfo.m_SubGraphPropertyInfoArray[0];
      if (!rSubGraphPropertyInfo) {
        return;
      }
      const rHogaDepthTypeInfo = rSubGraphPropertyInfo.m_HogaDepthTypeInfo;
      const rGlobalProperty = rChart.GetGlobalProperty();

      const $popCont = $(this).closest('.pop_btn_bx').siblings('.pop_cont');

      $popCont.empty().append(getHtml(components, rHogaDepthTypeInfo, rGlobalProperty));

      rChart.SetGlobalPropertyToChart(false);

      rChart.SetDefaultIndicatorPropertyToChart(rStrKey, "_HOGADEPTH_");
    })
    // 확인
    .on('click', '.btn_modal_confirm', function (e) {
      e.preventDefault();
      rChart.OKTotalProperty();
      $wrapper.remove();
    })
    // 팝업닫기
    .on('click', '.btn_modal_close', function (e) {
      e.preventDefault();
      rChart.CancelTotalProperty();
      $wrapper.remove();
    });

  $wrapper.localize();

  // PropertyInfo 값 변경
  function setPropertyInfo(label, value) {

    switch (label) {
      case 'm_clrBuyLine':
        rHogaDepthTypeInfo['m_clrBuyLine'] = value;
        rHogaDepthTypeInfo['m_clrBuyRange'] = value;
        break;
      case 'm_clrSellLine':
        rHogaDepthTypeInfo['m_clrSellLine'] = value;
        rHogaDepthTypeInfo['m_clrSellRange'] = value;
        break;
      default:
        rGlobalProperty[label] = value;
    }

    rChart.SetGlobalPropertyToChart();
  }

  return $wrapper;
}

// html 생성
function getHtml(components, rHogaDepthTypeInfo, rGlobalProperty) {

  const contHtml = [];
  components.rows.forEach((row) => {
    const cols = row.cols || '';

    contHtml.push('<tr>');

    if (cols) {

      cols.forEach((col) => {
        const label = col.label || '';
        const color = col.color || '';
        const checkbox = col.checkbox || '';
        const type = col.type || '';
        const thickness = col.thickness || '';

        if (label) {
          contHtml.push(`<th scope="row">${t(label)}</th>`);
        }

        if (checkbox) {
          contHtml.push('<th scope="row" colspan="2">');
          checkbox.forEach((item) => {
            contHtml.push(getVisibleCheckbox(rGlobalProperty[item.name], item.label, item.defaultValue, item.type, item.name));
          });
          contHtml.push('</th>');
        }

        if (color) {
          contHtml.push('<td>');
          contHtml.push(`<input type="text" class="color_picker" name="${color}">`);
          contHtml.push('</td>');
        }

        if (type) {
          contHtml.push('<td>');
          contHtml.push(`<div class="line_select_bx line_height_bx" id="${type}">`);
          contHtml.push(getLineTypeOptionHtml(rGlobalProperty[type], type));
          contHtml.push('</div>');
          contHtml.push('</td>');
        }

        if (thickness) {
          contHtml.push('<td>');
          contHtml.push(`<div class="line_select_bx line_px_bx" id="${thickness}">`);
          contHtml.push(getNThicknessOptionHtml(rGlobalProperty[thickness], thickness));
          contHtml.push('</div>');
          contHtml.push('</td>');
        }
      });
    }

    contHtml.push('</tr>');
  });

  return contHtml.join('');
}
