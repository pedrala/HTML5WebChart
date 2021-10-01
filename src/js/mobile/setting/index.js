import baseHtml from '../../../html/mobile/modal_setting.html';

import normalHtml from './normal';
import guideLineHtml from './guideLine';
import alarmHtml from './alarm';

export default (rChart) => {

  rChart.BackupChartFullProperty();
  
  const $baseHtml = $(baseHtml);

  // 이벤트 연결
  $baseHtml
    // 상단 탭 이동
    .on('click', '.setting_tab_tit > li > a', function(e) {
      e.preventDefault();

      let activeCont;
      switch (
        $(this)
          .attr('href')
          .substring(1)
      ) {
        // 기준선
        case 'guideLine':
          activeCont = guideLineHtml(rChart);
          break;
        // 알림선
        case 'alarm':
          activeCont = alarmHtml(rChart);
          break;
        // 일반설정
        default:
          activeCont = normalHtml(rChart);
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
    })
    // 취소
    .on('click', '.popup_modal_cancel', function(e) {
      e.preventDefault();
      rChart.CancelTotalProperty();
      rChart.RemoveWrapper();
    })
    // 확인
    .on('click', '.popup_modal_ok', function(e) {
      e.preventDefault();
      rChart.OKTotalProperty();
      rChart.RemoveWrapper();
    })
    // 초기 선택 탭
    .find('.setting_tab_tit')
    .find('li:first > a')
    .trigger('click');

  $baseHtml.localize();
  

  // resize
  $(() => {
    $('.modal_chart_type .tab_cont').css('height', $(window).height() - 86);
    $(window).resize(() => {
      $('.modal_chart_type .tab_cont').css('height', $(window).height() - 86);
    });
  });

  return $baseHtml;
};
