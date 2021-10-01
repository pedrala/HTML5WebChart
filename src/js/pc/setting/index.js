import baseHtml from '../../../html/pc/setting/index.html';

import chartHtml from './tabs/chart';
import guideLineHtml from './tabs/guideLine';
import scaleHtml from './tabs/scale';
import backgroundHtml from './tabs/background';
import alarmHtml from './tabs/alarm';

// 환경설정 팝업
export default (rChart, rStrKey) => {

  rChart.BackupChartFullProperty();
  
  const $baseHtml = $(baseHtml);
  const $settingModalArea = $('.setting_modal_area', $baseHtml);
  const $settingTab = $('.setting_tab', $settingModalArea);
  const $settingBottom = $('.setting_bottom', $settingModalArea);

  /**
   * jquery ui tabs 적용
   * 참고 url: https://jqueryui.com/tabs/
   */
  $settingTab.tabs({
    // 설정창 처음 오픈시
    create: function(e, ui) {      
      const tabIdx = $('.ui-tabs-tab', this).index(ui.tab) + 1;
      ui.panel.html(createTabContHtml(tabIdx, rChart, rStrKey));

      toggleBtnReset(tabIdx > 1, $settingBottom);
    },
    beforeActivate: function (e, ui) {
      ui.oldPanel.empty();
    },
    // 탭 변경시
    activate: function (e, ui) {
      const tabIdx = $('.ui-tabs-tab', this).index(ui.newTab) + 1;
      ui.newPanel.removeClass(function (index, className) {
        return (className.match(/(^|\s)tab_\S+/g) || []).join(' ');
      }).addClass('tab_' + tabIdx)
      .append(createTabContHtml(tabIdx, rChart, rStrKey));

      toggleBtnReset(tabIdx > 1, $settingBottom);
    }
  });

  // 팝업 닫기(X) 버튼
  $('a.btn_close', $settingModalArea).on('click', (e) => {
    rChart.DoNotSaveNCloseModal(e);
  });

  // 초기화 버튼
  $('a.btn_reset', $settingBottom).on('click', (e) => {
    e.preventDefault();

    rChart.InitializeGlobalProperty(false);

    $('#tab_cont', $settingTab).html(function () {
      const tabInstance = $settingTab.tabs("instance"),
        activeTabIdx = tabInstance.options.active + 1;
      return createTabContHtml(activeTabIdx, rChart);      
    });

    rChart.SetGlobalPropertyToChart(true);
  });

  // 취소 버튼
  $('a.btn_cancel', $settingBottom).on('click', (e) => {
    e.preventDefault();
    rChart.DoNotSaveNCloseModal(e);
  });

  // 확인 버튼
  $('a.btn_confirm', $settingBottom).on('click', (e) => {
    e.preventDefault();
    rChart.DeleteAllEmptyBlocks()
    rChart.SaveNCloseModal(e);
  });  

  // jquery draggable 적용  
  $settingModalArea.draggable({
    cursor: 'move',
    cancel: 'section.setting_tab, section.setting_bottom, a.btn_close',
    drag: function(event, ui) {
      // colorpicker도 같이 이동      
      $('.color_picker', ui.helper).spectrum('reflow');
    }
  });

  // 국제화 언어 적용
  $baseHtml.localize();

  return $baseHtml;
}

const createTabContHtml = (tabIdx, rChart, rStrKey) => {
  switch (tabIdx) {
    // 기준선
    case 2:
      return guideLineHtml(rChart);
      // 스케일
    case 3:
      return scaleHtml(rChart);
      // 배경
    case 4:
      return backgroundHtml(rChart);
      // 알림선
    case 5:
      return alarmHtml(rChart);
      // 차트/지표
    default:
      return chartHtml(rChart, rStrKey);
  }
}

// 초기화 버튼 토글
const toggleBtnReset = (isShow, $settingBottom) => {
  const $btnReset = $('a.btn_reset', $settingBottom);
  if (isShow) {
    $btnReset.show();
  } else {
    $btnReset.hide();
  }
}