import '../../css/mobile.css'

import {
    CHTMLChart,
    CPoint
} from '../chart/kfitsChart'
import CMobileMainBlock from './CMobileMainBlock'
import CMobileHScrollInfo from './CMobileHScrollInfo'

/** HTML 파일 */
import chartHtml from './setting/chart'
import settingHtml from './setting'
import toolHtml from './tool';
import depthHtml from './depth'

//공현욱 스크롤컨트롤 타입 추가
const SCROLL_GENERAL_TYPE = 0;    // 일반 스크롤
const SCROLL_THIN_TYPE = 1;       // 얇은 스크롤

let gOffsetXY = new CPoint(0, 0);

function GetOffsetXYFromTouchEvent(TouchEvent) {

    let nOffsetX = 0;
    let nOffsetY = 0;

    const target = TouchEvent.target;
    nOffsetY += target.offsetTop;
    nOffsetX += target.offsetLeft;

    let offsetParent = target.offsetParent;
    while (offsetParent) {

        nOffsetX += offsetParent.offsetLeft;
        nOffsetY += offsetParent.offsetTop;

        offsetParent = offsetParent.offsetParent;
    }

    gOffsetXY.m_X = nOffsetX;
    gOffsetXY.m_Y = nOffsetY;

    return gOffsetXY;
}

export default function CMobileWebChart(strParentDivId, strScreenCanvasId, nScrollBarType, strThemeName) {
    CHTMLChart.call(this, strParentDivId, strScreenCanvasId, nScrollBarType, strThemeName);

    //차트 스크롤 관련 멤버변수들
    this.m_MobileScrollInfo = new CMobileHScrollInfo();

     //LJH 2018.1.7 분석도구 그릴때 모양변경을 위한 꼭지점 크기
     this.m_ToolMargin = 15;

     // 20190115 전중현 : 트레이딩 라인 모바일 마진설정
    this.m_TradingLineMng.m_nSelectMargin = 8;
    this.m_TradingLineMng.m_nBoxSize = 40;
};

CMobileWebChart.prototype = new CHTMLChart();
CMobileWebChart.prototype.constructor = CMobileWebChart;

CMobileWebChart.prototype.SetDefaultFontInfo = function(){

    if (!this.m_DrawingInfo)
        this.m_DrawingInfo = new CDrawingInfo();

    this.m_DrawingInfo.m_nFontSize = 11;
    this.m_DrawingInfo.m_strFontName = 'Roboto, Dotum';
    //this.m_DrawingInfo.m_strFontName = "Dotum Regular";

};

CMobileWebChart.prototype.SetDefaultScrollHeight = function(){
	//공현욱 스크롤컨트롤 크기타입 : 0 - General Type, 1 - Thin Type >>
    this.m_nScrollHeight = (this.m_nScrollBarType === SCROLL_THIN_TYPE) ? 5 : 10;
};

CMobileWebChart.prototype.SetEventReg = function(){

    if (!this.m_DrawingInfo)
        this.m_DrawingInfo = new CDrawingInfo();

	var self = this;

	//터치 이벤트 등록
	this.m_DrawingInfo.m_ScreenCanvas.addEventListener("touchstart", this.OnTouchStart.bind(this), false);
	this.m_DrawingInfo.m_ScreenCanvas.addEventListener("touchmove", this.OnTouchMove.bind(this), false);
    this.m_DrawingInfo.m_ScreenCanvas.addEventListener("touchend", this.OnTouchEnd.bind(this), false);
    
    // 창크기 변경 이벤트
    /*
    window.addEventListener('resize', function () {
        var m_ResizeWrapper = self.m_ChartParentDIV;
        var m_ResizeCanvas = self.m_DrawingInfo.m_ScreenCanvas;        
        m_ResizeCanvas.width = m_ResizeWrapper.clientWidth;
        m_ResizeCanvas.height = window.innerHeight - 20;

        self.Resize(m_ResizeWrapper.clientWidth, m_ResizeCanvas.height);
    });
    */
};

CMobileWebChart.prototype.CreateMainBlock = function () {
    this.m_MainBlock = new CMobileMainBlock(this, this.m_mapXScaleMng);
}

CMobileWebChart.prototype.InitScroll = function () {
    this.m_MobileScrollInfo.InitScroll();
}
//////////////////////////////////////////////////////// >>
//터치 이벤트
CMobileWebChart.prototype.OnTouchStart = function(e) {

    e.preventDefault();    

    // 화면에 생성된 모달 삭제
    this.RemoveWrapper();

    var offsetXY = GetOffsetXYFromTouchEvent(e);

    if (e.targetTouches.length == 1) {
        
        e.ChartXPos = (e.targetTouches[0].pageX - offsetXY.m_X) - this.m_nMainBlockMargin;
        e.ChartYPos = (e.targetTouches[0].pageY - offsetXY.m_Y) - this.m_nMainBlockMargin;

        //console.log("CMobileWebChart.prototype.OnTouchStart timeStamp:" + e.timeStamp + " ChartX:" + e.ChartXPos + ", ChartY:" + e.ChartYPos);

        this.m_MobileScrollInfo.InitScroll();

        this.m_MobileScrollInfo.SetTouchType(1);

        this.m_MobileScrollInfo.SetStartInfo(e.timeStamp, e.ChartXPos);

        this.m_MobileScrollInfo.SetTouchStartX(e.ChartXPos);

        //스크롤 위에서 터치 이벤트 막음
        //if (this.m_ScrollCtrl.OnMouseDown(e))
        //    return;

        if (this.m_MainBlock.OnMouseDown(e))
            return;
    }
    else if (e.targetTouches.length > 1) {
        
        e.ChartXPos = (e.targetTouches[0].pageX - offsetXY.m_X) - this.m_nMainBlockMargin;
        e.ChartYPos = (e.targetTouches[0].pageY - offsetXY.m_Y) - this.m_nMainBlockMargin;

        e.ChartSecondXPos = (e.targetTouches[1].pageX - offsetXY.m_X) - this.m_nMainBlockMargin;
        e.ChartSecondYPos = (e.targetTouches[1].pageY - offsetXY.m_Y) - this.m_nMainBlockMargin;

        //console.log("OnTouchStart timeStamp:" + e.timeStamp + " ChartX:" + e.ChartXPos + ", ChartY:" + e.ChartYPos + ", SecondX:" + e.ChartSecondXPos + ", SecondY:" + e.ChartSecondYPos);

        this.m_MobileScrollInfo.InitScroll();

        this.m_MobileScrollInfo.SetTouchType(2);
        this.m_MobileScrollInfo.SetFirstTouch(e.targetTouches[0].identifier, e.ChartXPos);
        this.m_MobileScrollInfo.SetSecondTouch(e.targetTouches[1].identifier, e.ChartSecondXPos);

        //스크롤 위에서 터치 이벤트 막음
        //if (this.m_ScrollCtrl.OnMouseDown(e))
        //    return;

        if (this.m_MainBlock.OnMouseDown(e))
            return;
    }
};

CMobileWebChart.prototype.OnTouchMove = function(e) {

    e.preventDefault();

    var offsetXY = GetOffsetXYFromTouchEvent(e);

    if (e.targetTouches.length == 1) {

        e.ChartXPos = (e.targetTouches[0].pageX - offsetXY.m_X) - this.m_nMainBlockMargin;
        e.ChartYPos = (e.targetTouches[0].pageY - offsetXY.m_Y) - this.m_nMainBlockMargin;

        //console.log("CMobileWebChart.prototype.OnTouchMove timeStamp:" + e.timeStamp + " ChartX:" + e.ChartXPos + ", ChartY:" + e.ChartYPos);

        this.m_MobileScrollInfo.SetNextInfo(e.timeStamp, e.ChartXPos);
        this.m_MobileScrollInfo.Calc();

        //if (this.m_ScrollCtrl.OnMouseMove(e))
        //	return;

        this.m_MainBlock.OnMouseMove(e);

        this.m_MobileScrollInfo.SetStartInfo(e.timeStamp, e.ChartXPos);
    }
    else if (e.targetTouches.length > 1) {

        if (this.m_MobileScrollInfo.m_FirstTouchID == null || this.m_MobileScrollInfo.m_SecondTouchID == null)
            return;
        
        var i, nFirstTouchIndex = null, nSecondTouchIndex = null;
        for (i = 0; i < e.targetTouches.length; i++) {
            if (e.targetTouches[i].identifier == this.m_MobileScrollInfo.m_FirstTouchID)
                nFirstTouchIndex = i;
            else if (e.targetTouches[i].identifier == this.m_MobileScrollInfo.m_SecondTouchID)
                nSecondTouchIndex = i;
        }
        if (nFirstTouchIndex == null || nSecondTouchIndex == null)
            return;

        e.ChartXPos = (e.targetTouches[nFirstTouchIndex].pageX - offsetXY.m_X) - this.m_nMainBlockMargin;
        e.ChartYPos = (e.targetTouches[nFirstTouchIndex].pageY - offsetXY.m_Y) - this.m_nMainBlockMargin;

        e.ChartSecondXPos = (e.targetTouches[nSecondTouchIndex].pageX - offsetXY.m_X) - this.m_nMainBlockMargin;
        e.ChartSecondYPos = (e.targetTouches[nSecondTouchIndex].pageY - offsetXY.m_Y) - this.m_nMainBlockMargin;

        this.m_MobileScrollInfo.SetFirstTouch(e.targetTouches[nFirstTouchIndex].identifier, e.ChartXPos);
        this.m_MobileScrollInfo.SetSecondTouch(e.targetTouches[nSecondTouchIndex].identifier, e.ChartSecondXPos);

        //console.log("OnTouchMove timeStamp:" + e.timeStamp + " ChartX:" + e.ChartXPos + ", ChartY:" + e.ChartYPos + ", ChartSecondX:" + e.ChartSecondXPos + ", ChartSecondY:" + e.ChartSecondYPos);
        //console.log("CMobileWebChart.prototype.OnTouchMove 속도:" + this.m_MobileScrollInfo.m_LastVelocity + ", 가속도:" + this.m_MobileScrollInfo.m_Acceleration);
        //this.m_strLog += ("\r\nCMobileWebChart.prototype.OnTouchMove timeStamp:" + e.timeStamp + " ChartX:" + e.ChartXPos + ", ChartY:" + e.ChartYPos);
        //this.m_strLog += ("\r\nCMobileWebChart.prototype.OnTouchMove 속도:" + this.m_MobileScrollInfo.m_LastVelocity + ", 가속도:" + this.m_MobileScrollInfo.m_Acceleration);

        this.m_MainBlock.OnMouseMove(e);
    }
};

CMobileWebChart.prototype.OnTouchEnd = function(e) {

    e.preventDefault();

    var offsetXY = GetOffsetXYFromTouchEvent(e);

    e.ChartXPos = (e.changedTouches[0].pageX - offsetXY.m_X) - this.m_nMainBlockMargin;
    e.ChartYPos = (e.changedTouches[0].pageY - offsetXY.m_Y) - this.m_nMainBlockMargin;

    //console.log("CMobileWebChart.prototype.OnTouchEnd timeStamp:" + e.timeStamp + " ChartX:" + e.ChartXPos + ", ChartY:" + e.ChartYPos);

    if (e.touches.length >= 1) {

        e.ChartSecondXPos = (e.touches[0].pageX - offsetXY.m_X) - this.m_nMainBlockMargin;
        e.ChartSecondYPos = (e.touches[0].pageY - offsetXY.m_Y) - this.m_nMainBlockMargin;

        //console.log("OnTouchEnd timeStamp:" + e.timeStamp + " UpX:" + e.ChartXPos + ", UpY:" + e.ChartYPos + ", touchX:" + e.ChartSecondXPos + ", touchY:" + e.ChartSecondYPos);

        var i, nFirstTouchIndex = null, nSecondTouchIndex = null;
        for (i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier == this.m_MobileScrollInfo.m_FirstTouchID)
                nFirstTouchIndex = i;
            else if (e.touches[i].identifier == this.m_MobileScrollInfo.m_SecondTouchID)
                nSecondTouchIndex = i;
        }
        if (nFirstTouchIndex != null && nSecondTouchIndex != null)
            return;

        //this.m_MainBlock.OnMouseUp(e);
        this.m_MobileScrollInfo.InitScroll();

        //if (nFirstTouchIndex != null || nSecondTouchIndex != null) {
        //    this.m_MainBlock.OnMouseUp(e);
        //    this.m_MobileScrollInfo.InitScroll();
        //    this.m_MobileScrollInfo.SetTouchType(1);
        //    if (nFirstTouchIndex != null)
        //        this.m_MobileScrollInfo.SetStartInfo(e.timeStamp, this.m_MobileScrollInfo.m_FirstNextTouchX);
        //    else if (nSecondTouchIndex != null)
        //        this.m_MobileScrollInfo.SetStartInfo(e.timeStamp, this.m_MobileScrollInfo.m_SecondNextTouchX);
        //}
    }
    else {
        //console.log("OnTouchEnd timeStamp:" + e.timeStamp + " ChartX:" + e.ChartXPos + ", ChartY:" + e.ChartYPos);

        this.m_MainBlock.OnMouseUp(e);

        this.m_MobileScrollInfo.InitScroll();
    }
};
//////////////////////////////////////////////////////// <<

////////////////////////////////////////////////////////
// HTML
CMobileWebChart.prototype.CreateWrapper = function () {
    return $('<div>', {
      'class': 'popup_wrapper_mobile',
      'id': 'popup_wrapper_mobile'
    }).appendTo('body');
}

CMobileWebChart.prototype.RemoveWrapper = function () {
  $('#popup_wrapper_mobile', 'body').remove();
}

// 차트유형/지표설정
CMobileWebChart.prototype.ShowModalType = function (rStrKey) {
  const $wrapper = this.CreateWrapper();
  chartHtml(this, rStrKey).appendTo($wrapper);
}

// 환경설정
CMobileWebChart.prototype.ShowModalSetting = function () {
  const $wrapper = this.CreateWrapper();
  settingHtml(this).appendTo($wrapper);
}

// 깊이차트 설정
CMobileWebChart.prototype.ShowModalDepthSetting = function (rStrKey) {
    const $wrapper = this.CreateWrapper();
    depthHtml(this, rStrKey).appendTo($wrapper);
}

// 분석툴 설정창
CMobileWebChart.prototype.ShowToolSetup = function (prop) {
    const rBasicToolInfo = prop.m_InfoData;
    const $wrapper = this.CreateWrapper();
    toolHtml(this, rBasicToolInfo).appendTo($wrapper);
}

// 수치도구
CMobileWebChart.prototype.OpenDataList = function () {
    console.log('OpenDataList________________ ');

    // CMobileModalDataListHtml
}

