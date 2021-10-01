import baseHtml from '../../../../html/mobile/modal_chart.html';

import typeHtml from './type';
import assistantHtml from './assistant';

import Indicators from '../../../../json/default-indicators.json';

// 차트유형/지표설정
export default (rChart, rStrKey) => {  
  rChart.BackupChartFullProperty();

  const $baseHtml = $(baseHtml);
  // 표시되어 있는 모든 지표의 property 얻기
  const indicatorPropertyInfo = rChart.GetIndicatorPropertyInfo(rStrKey);

  console.log('IndicatorPropertyInfo', indicatorPropertyInfo);

  // 이벤트 연결
  $baseHtml
    // 상단 탭 이동
    .on('click', '.setting_tab_tit > li > a', function (e, key) {
      e.preventDefault();
      if ($(this).parent().hasClass('disabled')) return;

      let activeCont;
      switch (
        $(this)
          .attr('href')
          .substring(1)
      ) {
        // 차트유형
        case 'type':
          activeCont = typeHtml(rChart, key);
          break;
        // 오버레이
        case 'overlay':
          activeCont = assistantHtml(rChart, 'overlay', key);
          break;
        // 보조지표
        case 'sub':
          activeCont = assistantHtml(rChart, 'sub', key);
          break;
        default:
          break;
      }

      $(this)
        .addClass('active')
        .closest('li')
        .siblings('li')
        .find('a')
        .removeClass('active');
      $(this)
        .closest('.chart_tab_bx')
        .find('.setting_tab_cont')
        .html(activeCont);
    });

  $baseHtml.localize();

  // 그래프 선택 진입시 해당 그래프로 이동
  const settingTabTit = $baseHtml.find('.setting_tab_tit');
  const IndicatorInfo = indicatorPropertyInfo.m_indicatorInfoArray[rStrKey];
  if (IndicatorInfo) {
    const type = IndicatorInfo.m_strName;
    console.log('setting open key', rStrKey);
    if (type === '_PRICE_') {
      settingTabTit.find('li:first > a').trigger('click', rStrKey);
    } else {
      settingTabTit
        .find(`li > a[href="#${Indicators[type].type}"]`)
        .trigger('click', rStrKey);
    }
  } else {
    settingTabTit.find('li:first > a').trigger('click');
  }

  // 리사이즈
  $(() => {
    $('.modal_chart_type .tab_cont').css('height', $(window).height() - 86);
    $('.modal_view_cont').css('height', $(window).height() - 45);
    $(window).resize(() => {
      $('.modal_chart_type .tab_cont').css('height', $(window).height() - 86);
      $('.modal_view_cont').css('height', $(window).height() - 45);
    });
  });

  $baseHtml
    // 취소
    .on('click', '#popupChartCancel', (e) => {
      e.preventDefault();
      rChart.CancelTotalProperty();
      rChart.RemoveWrapper();
    })
    // 확인
    .on('click', '#popupChartOk', (e) => {
      e.preventDefault();
      rChart.OKTotalProperty();
      rChart.RemoveWrapper();
    })
    // 뒤로가기
    .on('click', '#popupChartBack', function (e) {
      e.preventDefault();
      if ($(this).data('id')) {
        $baseHtml.remove();
      } else {
        $('#popupChartCancel, #popupChartOk').show();
        $baseHtml
          .find('.chart_type_tab')
          .show()
          .next()
          .remove();
      }
    })
    // 초기화
    .on('click', '#popupChartReset', (e) => {
      e.preventDefault();
      const id = $baseHtml.find('.modal_pop_tit:eq(1)').data('id');
      const property = rChart.SetDefaultIndicatorPropertyToChart(id);
      const type = property.m_strName;
      console.log('type____________________: %O', type);
      if (type === '_PRICE_') {
        settingTabTit.find('li:first > a').trigger('click', id);
      } else {
        settingTabTit
          .find(`li > a[href="#${Indicators[type].type}"]`)
          .trigger('click', id);
      }
    })
    // 기본값
    .on('click', '#popupChartDefaultSave', (e) => {
      e.preventDefault();
      const property = rChart.GetPropertyInfo(
        $baseHtml.find('.modal_pop_tit:eq(1)').data('id'),
      );
      rChart.ChangeDefaultIndicatorProperty(property.m_strName, property);
    });

  return $baseHtml;
};
