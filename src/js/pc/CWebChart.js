import '../../css/pc.css';
import {
  CHTMLChart,
} from '../chart/kfitsChart';

import popmenuHtml from './popmenu';
import contextmenuHtml from './contextmenu';
import settingHtml from './setting';
import toolHtml from './tool';
import depthHtml from './depth';
import cyclePromise from './cycle';
import messageBox from './message-box';

export default function CWebChart(strParentDivId, strScreenCanvasId, nScrollBarType, strThemeName) {
  CHTMLChart.call(this, strParentDivId, strScreenCanvasId, nScrollBarType, strThemeName);

  // LJH 2018.1.7 분석도구 그릴때 모양변경을 위한 꼭지점 크기
  this.m_ToolMargin = 5;

  // 차트 하단 네비 생성
  // popmenuHtml.Create(this);
}

// 공현욱 스크롤컨트롤 타입 추가
const SCROLL_GENERAL_TYPE = 0; // 일반 스크롤
const SCROLL_THIN_TYPE = 1; // 얇은 스크롤

CWebChart.prototype = new CHTMLChart();
CWebChart.prototype.constructor = CWebChart;

CWebChart.prototype.SetDefaultFontInfo = function () {
  this.m_DrawingInfo.m_nFontSize = 11;
  this.m_DrawingInfo.m_strFontName = 'Roboto, Dotum';

  //this.m_DrawingInfo.m_nFontSize = 11;
  //this.m_DrawingInfo.m_strFontName = '굴림';
  //this.m_DrawingInfo.m_strCursorName = 'crosshair';
  //this.m_DrawingInfo.m_strFontColor = '#000000';
};

CWebChart.prototype.SetDefaultScrollHeight = function () {
  //공현욱 스크롤컨트롤 크기타입 : 0 - General Type, 1 - Thin Type >>
  this.m_nScrollHeight = (this.m_nScrollBarType === SCROLL_THIN_TYPE) ? 9 : 18;
};

CWebChart.prototype.SetEventReg = function () {

  const self = this;

  if (!this.m_DrawingInfo.m_ScreenCanvas.onmousedown) {
    this.m_DrawingInfo.m_ScreenCanvas.onmousedown = function (e) {
      e.preventDefault();
      //e.stopPropagation();
      self.OnMouseDown(e);
    };
  }

  if (!this.m_DrawingInfo.m_ScreenCanvas.onmousemove) {
    this.m_DrawingInfo.m_ScreenCanvas.onmousemove = function (e) {
      self.OnMouseMove(e);
    };
  }

  if (!this.m_DrawingInfo.m_ScreenCanvas.ondblclick) {
    this.m_DrawingInfo.m_ScreenCanvas.ondblclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.OnLButtonDblclick(e);
    };
  }

  if (!this.m_DrawingInfo.m_ScreenCanvas.onmouseup) {
    this.m_DrawingInfo.m_ScreenCanvas.onmouseup = function (e) {
      self.OnMouseUp(e);
    };
  }

  if (!this.m_DrawingInfo.m_ScreenCanvas.onmouseover) {
    this.m_DrawingInfo.m_ScreenCanvas.onmouseover = function () {
      //popmenuHtml.Show();
    };
  }

  if (!this.m_DrawingInfo.m_ScreenCanvas.onmouseout) {
    this.m_DrawingInfo.m_ScreenCanvas.onmouseout = function (e) {
      self.OnMouseOut(e);
      //popmenuHtml.Hide();
    };
  }

  //Wheel 이벤트 등록
  if (!this.m_DrawingInfo.m_ScreenCanvas.onmousewheel) {

    this.m_DrawingInfo.m_ScreenCanvas.onmousewheel = function (event) {

      event.preventDefault();

      let delta = 0;
      if (!event) { //Mozilla (Firefox) 계열
        event = window.event;
      }

      if (event.wheelDelta) { //Internet Explorer 계열
        delta = event.wheelDelta / 120;
        if (window.opera) { //Opera 계열
          delta = -delta;
        }
      } else if (event.detail) { //Mozilla (Firefox) 계열
        delta = -event.detail / 3;
      }
      
      if (delta && self.m_GlobalProperty.GetUseWheelScroll()) {
        //delta < 0 up
        //delta > 0 down
        //console.log(delta);
        if (delta > 0)
          self.ZoomIn(10);
        else
          self.ZoomOut(10);

      }
    };
  }

  // R 메뉴
  if (!this.m_DrawingInfo.m_ScreenCanvas.oncontextmenu) {
    this.m_DrawingInfo.m_ScreenCanvas.oncontextmenu = function (e) {
      self.ShowContextMenu(e);
    };
  }
};

////////////////////////////////////////////////////////
// HTML
// 화면 내 팝업창 생성
CWebChart.prototype.CreateWrapper = function () {

  const $div = $('<div>', {      
      'id': 'setting_modal_bx',
      'class': 'setting_modal_bx'
    }),
    $wrapper = $('<div>', {
      'id': 'popup_wrapper_pc',
      'class': 'popup_wrapper_pc'
    });
  
  // 
  if ($('#popup_wrapper_pc', 'body').length) {
    return $('#popup_wrapper_pc', 'body');
  }
  
  $div.append('<div class="dim"></div>');

  // 화면 스크롤 숨김
  $('body').css('overflow-y', 'hidden');
  $wrapper.on('contextmenu', function (e) {
    e.preventDefault();
  });

  this.HideContextMenu();
  
  return $wrapper.append($div).appendTo('body');
}

// 팝업창 제거
CWebChart.prototype.RemoveWrapper = function () {
  // 화면 스크롤 복구
  $('body').css('overflow-y', 'auto');
  $('#popup_wrapper_pc', 'body').remove();
}

// R메뉴
CWebChart.prototype.ShowContextMenu = function (e) {

  if(this.GetUseContextMenu() !== true)
    return;

  const $wrapper = $('<div>', {
      'id': 'context_menu',
      'class': 'popup_wrapper_pc'
    }),
    $html = contextmenuHtml(this,
    e.clientX || 0,
    e.clientY || 0,
    (e.offsetX - this.m_nMainBlockMargin),
    (e.offsetY - this.m_nMainBlockMargin));

  if ($html === null) {
    return;
  }

  $('#context_menu', 'body').remove();

  $wrapper.append($html).appendTo('body');
  $wrapper.on('contextmenu', function (e) {
    e.preventDefault();
  });

  // 차트영역 내 표시를 위한 수식
  const $chartRightMenu = $html.find('.chart_contextmenu');
  const outerWidth = $chartRightMenu.outerWidth();
  const outerHeight = $chartRightMenu.outerHeight();
  const innerWidth = Number(window.innerWidth);
  const innerHeight = Number(window.innerHeight);

  if (innerWidth < e.clientX + outerWidth) {
    $chartRightMenu.css('left', String(innerWidth - outerWidth).concat('px'));
  }
  if (innerHeight < e.clientY + outerHeight) {
    $chartRightMenu.css('top', String(innerHeight - outerHeight).concat('px'));
  }
};

CWebChart.prototype.HideContextMenu = function () {
  $('#context_menu', 'body').remove();
}

// 환경설정 팝업
CWebChart.prototype.ShowModalSetting = function (rStrKey) {
  const $wrapper = this.CreateWrapper(),
    $div = $('#setting_modal_bx', $wrapper);
  settingHtml(this, rStrKey).appendTo($div);
}

// 분석툴 설정창
CWebChart.prototype.ShowToolSetup = function (prop) {
  const $wrapper = this.CreateWrapper(),
    $div = $('#setting_modal_bx', $wrapper);
  toolHtml(this, prop).appendTo($div);
}

// 깊이차트 설정
CWebChart.prototype.ShowModalDepthSetting = function (rStrKey) {    
  const $wrapper = this.CreateWrapper(),
    $div = $('#setting_modal_bx', $wrapper);
  depthHtml(this, rStrKey).appendTo($div);
}

// 추가부분
CWebChart.prototype.ShowDataList = function () {

};

CWebChart.prototype.SaveNCloseModal = function (e, nType) {
  if (e) e.preventDefault();

  if (nType) this.OKTotalProperty(nType);
  else this.OKTotalProperty();

  this.RemoveWrapper();
};

CWebChart.prototype.DoNotSaveNCloseModal = function (e) {
  if (e) e.preventDefault();
  this.CancelTotalProperty();
  this.RemoveWrapper();
}

/**
 * 메시지 박스(alert)
 * @param {string} message
 * @param {string||object||function} title or options or callback
 * @param {object||function} options or callback
 * options: {
 *  confirmButtonText: 확인버튼 텍스트,
 *  callback: 확인버튼 동작
 * }
 */
CWebChart.prototype.Alert = function () {
  const $wrapper = this.CreateWrapper(),
    $div = $('#setting_modal_bx', $wrapper);
  messageBox.messageBox(this, 'alert', arguments).appendTo($div);
}

/**
 * 메시지 박스(confirm)
 * @param {string} message
 * @param {string||object||function} title or options or callback
 * @param {object||function} options or callback
 * options: {
 *  confirmButtonText: 확인버튼 텍스트,
 *  cancelButtonText: 취소버튼 텍스트,
 *  callback: 확인버튼 동작
 * }
 */
CWebChart.prototype.Confirm = function () {
  const $wrapper = this.CreateWrapper(),
    $div = $('#setting_modal_bx', $wrapper);
  messageBox.messageBox(this, 'confirm', arguments).appendTo($div);
  
}

CWebChart.prototype.ShowModalCycleSettings = cyclePromise;
