import baseHtml from '../../../../html/mobile/setting/chart/assistant.html';

import volumeHtml from './type/assistant/volume';
import movingAverageHtml from './type/assistant/movingAverage';
import oscillatorHtml from './type/assistant/oscillator';
import etcHtml from './type/assistant/etc';

import Indicators from '../../../../json/default-indicators.json';
import { getVisibleCheckbox } from '../../html-helper';

// 탭 02: 오버레이
export default (CMobileWebChart, Type, Id) => {
  const $baseHtml = $(baseHtml);

  const IndicatorPropertyInfo = CMobileWebChart.GetIndicatorPropertyInfo(Id);
  const IndicatorInfoArray = Object.keys(
    IndicatorPropertyInfo.m_indicatorInfoArray,
  ).map((key) => {
    const indicatorInfo = IndicatorPropertyInfo.m_indicatorInfoArray[key];
    indicatorInfo.id = key;
    return indicatorInfo;
  });

  console.log('IndicatorInfoArray', IndicatorInfoArray);

  const isSub = Type === 'sub';
  const html = [];
  Object.keys(Indicators).forEach((key) => {
    const indicator = Indicators[key];
    const currentInfos = IndicatorInfoArray.filter(
      item => item.m_strName === key,
    );
    const currentInfoSize = currentInfos.length;
    const isLast = currentInfoSize < 2;

    if (indicator.type === Type && indicator.use) {
      (currentInfoSize ? currentInfos : [{}]).forEach((item, idx) => {
        html.push(`<li class="${key}`);
        if (item.id) html.push(' active');
        if (isSub) {
          html.push(' subLnk');
          if (isLast || !idx) html.push(' plus');
          else html.push(' minus');
        }
        html.push('">');
        html.push('  <div class="chart_lst_bx">');
        html.push(getVisibleCheckbox(item.id, indicator.m_strTitleLangKey, item.id, key));
        if ('_MA_,_VOLUME_,_VMA_'.indexOf(key) === -1 && isSub) {
          html.push(
            '<a href="#plus" class="btn_type_plus btn_lst_setting"><span class="blind"></span></a>',
          );
          html.push(
            '<a href="#minus" class="btn_type_minus btn_lst_setting"><span class="blind"></span></a>',
          );
        }
        html.push('<a href="#" class="btn_type_change"><span class="blind"></span></a>');
        html.push('  </div>');
        html.push('</li>');
      });
    }
  });

  $baseHtml
    .find('.chart_type_lst')
    .html(html.join(''))
    // 지표 선택
    .on('change', '.chart_lst_bx :checkbox', function (e) {
      e.preventDefault();
      const $self = $(this);
      const $selectedLi = $self.closest('li');
      const type = $self.data('type');
      const isChecked = $self.is(':checked');

      // 선택
      if (isChecked) {
        $selectedLi.addClass('active');
        const onlyOne = '_MA_,_VOLUME_,_VMA_'.indexOf(type) !== -1;
        const id = CMobileWebChart.SimpleAddIndicator(type, onlyOne);
        $self.val(id);
      } else { // 선택 해제
        CMobileWebChart.SettingDeleteIndicator($self.val());
        $selectedLi.removeClass('active');
        $self.val('');
      }
    })
    // 지표 추가
    .on('click', '.btn_type_plus', function (e) {
      e.preventDefault();
      const $selectedLi = $(this).closest('li');
      const copyHtml = $selectedLi.clone()[0].outerHTML;
      $(copyHtml)
        .find('input[name="show"]')
        .prop('checked', false)
        .val('')
        .end()
        .removeClass('plus active')
        .addClass('minus')
        .insertAfter($selectedLi.last());
    })
    // 지표 삭제
    .on('click', '.btn_type_minus', function (e) {
      e.preventDefault();
      const $selectedLi = $(this).closest('li');
      const $input = $selectedLi.find('input[name="show"]');
      const id = $input.val();
      if (id) {
        CMobileWebChart.SettingDeleteIndicator(id);
      }
      $(this)
        .closest('li')
        .remove();
    })
    // 설정창 이동
    .on('click', '.btn_type_change', function (e) {
      e.preventDefault();

      const $selectedLi = $(this).closest('li');
      const $selectedInput = $selectedLi.find('input[name="show"]');
      const id = $selectedInput.val();
      const subType = $selectedInput.data('type');
      const indicator = Indicators[subType];

      let innerHtml;
      switch (subType) {
        // 주가이동평균
        case '_MA_':
        case '_VMA_': // 거래량 이동평균
          innerHtml = movingAverageHtml(
            CMobileWebChart,
            indicator,
            id,
            subType,
          );
          break;
        // 거래량
        case '_VOLUME_':
          innerHtml = volumeHtml(CMobileWebChart, indicator, id);
          break;
        case '_MACDOS_':
          innerHtml = oscillatorHtml(CMobileWebChart, indicator, id);
          break;
        default:
          innerHtml = etcHtml(CMobileWebChart, indicator, id, Type, subType);
          break;
      }

      if (Id) innerHtml.find('#popupChartBack').data('id', Id);

      innerHtml.find('.modal_pop_tit').data('id', id);

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
      .find(`input[value="${Id}"]`)
      .prop('checked', true)
      .closest('li')
      .find('.btn_type_change')
      .end()
      .find('.btn_type_change')
      .trigger('click');
  }

  $baseHtml.localize();
  return $baseHtml;
};
