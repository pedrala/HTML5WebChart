import baseHtml from '../../../../html/mobile/setting/chart/type.html';

import candleHtml from './type/candle';
import barHtml from './type/bar';
import lineHtml from './type/line';
import pnfHtml from './type/pnf';
import threeHtml from './type/three';

import ChartTypes from '../../../../json/chart-type.json';
import t from '../../../common/i18n';

// 탭 01: 차트유형
export default (CMobileWebChart, Id) => {
  const $baseHtml = $(baseHtml);

  let priceId = Id
    || (!CMobileWebChart.IsSpecialChartType()
      ? CMobileWebChart.GetPriceIndicatorKey()
      : CMobileWebChart.GetSpecialIndicatorKey());
  let PropertyInfo = CMobileWebChart.GetPropertyInfo(priceId);
  let SubGraphPropertyInfo = PropertyInfo.m_SubGraphPropertyInfoArray[0];

  let isSpecialChart = false;

  const chartTypeHtml = [];
  ChartTypes.forEach((item, idx) => {
    if (item.use) {
      const isChecked = idx === SubGraphPropertyInfo.m_nSubGraphSubType;

      chartTypeHtml.push(`<li ${isChecked ? ' class="active"' : ''}>`);
      chartTypeHtml.push('<div class="chart_lst_bx">');
      chartTypeHtml.push('<span class="rdo_type">');
      chartTypeHtml.push(
        `<input data-type="${
          item.id
        }" name="chartType" value="${idx}" class="i_radio" type="radio"`,
      );
      if (isChecked) {
        chartTypeHtml.push(' checked');
      }
      chartTypeHtml.push('>');
      chartTypeHtml.push(`<span class="txt">${t(item.label)}</span>`);
      chartTypeHtml.push('</span>');
      chartTypeHtml.push(
        `<a href="#" data-id="${item.id}" class="btn_type_change">`,
      );
      chartTypeHtml.push('<span class="blind"></span>');
      chartTypeHtml.push('</a>');
      chartTypeHtml.push('</div>');
      chartTypeHtml.push('</li>');

      if (!isSpecialChart && isChecked && 'pnd,three'.indexOf(item.id) > -1) {
        isSpecialChart = true;
      }

      const $tabs = $('#chart-popup-wrapper .setting_tab_tit li a:not(:first)');
      if (isSpecialChart) {
        $tabs.addClass('disabled');
      } else {
        $tabs.removeClass('disabled');
      }
    }
  });
  $baseHtml.find('.chart_type_lst').html(chartTypeHtml.join(''));

  $baseHtml
    // 차트유형 선택
    .on('click', '.chart_lst_bx .rdo_type', function () {
      const $self = $(this);
      $self.find('input').prop('checked', true);
      $self
        .closest('li')
        .addClass('active')
        .siblings('li')
        .removeClass('active');
      PropertyInfo.m_SubGraphPropertyInfoArray[0].m_nSubGraphSubType = Number(
        $self.find('input').val(),
      );
      let PrevId = priceId;
      priceId = CMobileWebChart.SetPropertyInfo(priceId, PropertyInfo, true);
      if(PrevId !== priceId){
        PropertyInfo = CMobileWebChart.GetPropertyInfo(priceId);
        SubGraphPropertyInfo = PropertyInfo.m_SubGraphPropertyInfoArray[0];
      }
      CMobileWebChart.SetGlobalPropertyToChart();

      const $tabs = $('#chart-popup-wrapper .setting_tab_tit li a:not(:first)');
      if ('pnf,three'.indexOf($self.find('input').data('type')) > -1) {
        $tabs.addClass('disabled');
        isSpecialChart = true;
      } else {
        $tabs.removeClass('disabled');
        isSpecialChart = false;
      }
    })
    // 설정창 이동
    .on('click', '.btn_type_change', function (e) {
      e.preventDefault();
      const $selectedLi = $(this).closest('li');
      const $input = $selectedLi.find('input');

      let innerHtml;
      switch ($input.data('type')) {
        // 바
        case 'bar':
          innerHtml = barHtml(CMobileWebChart, priceId);
          break;
        // 라인
        case 'line':
          innerHtml = lineHtml(CMobileWebChart, priceId);
          break;
        // P&F
        case 'pnf':
          innerHtml = pnfHtml(CMobileWebChart, priceId);
          break;
        // 삼선전환도
        case 'three':
          innerHtml = threeHtml(CMobileWebChart, priceId);
          break;
        // 캔들
        default:
          innerHtml = candleHtml(CMobileWebChart, priceId);
          break;//return;
      }

      if (Id) innerHtml.find('#popupChartBack').data('id', Id);

      innerHtml.find('.modal_pop_tit').data('id', priceId);

      $(this)
        .closest('.chart_type_tab')
        .after(innerHtml)
        .next()
        .show()
        .siblings()
        .hide();
      $('#popupChartCancel, #popupChartOk').hide();
    });

  // 차트에서 선택 시
  if (Id) {
    $baseHtml
      .find('li.active')
      .find('.rdo_type')
      .trigger('click')
      .end()
      .find('.btn_type_change')
      .trigger('click');
  }

  $baseHtml.localize();
  return $baseHtml;
};
