import {
    CMainBlock, CDateTimeXScaleItem, 
    CB_NO_SELECT, CB_SELECT, CB_SELECT_TOOL, CB_SELECT_GRAPH, DATETIME_TYPE, DRAW_CASE_RESIZE, VERT_BLOCK_TYPE, HORZ_BLOCK_TYPE, PRICE_REAL_TYPE, NUMERIC_TYPE, STRING_TYPE,
    gResultPos, gRectXTitleBox, gRectLeftYValueBox, gRectRightYValueBox, gLeftYTextPos, gRightYTextPos, gSelectSignBetween, gSelectSignSize, gDateArray, gTempDate, gTempDate1, gTempStartDate, gTempEndDate,
    ChangeGlobalTime, ConvertNumToDigitText, GetXIndexByXPos
} from '../chart/kfitsChart'

export default function CMobileMainBlock(rChart, rMapXScaleMng) {
    CMainBlock.call(this, rChart, rMapXScaleMng);
    this.m_nMaxOfViewCnt = 700;//모바일에서는 뷰카운트의 최대값을 700으로 셋팅한다
}

CMobileMainBlock.prototype = new CMainBlock();
CMobileMainBlock.prototype.constructor = CMobileMainBlock;


CMobileMainBlock.prototype.Initialize = function () {

    if (this.m_rGlobalProperty !== null) {
        this.m_rGlobalProperty.ShowCrossLine(false);
        this.ShowCrossLine(false);
    }
}

CMobileMainBlock.prototype.OnMouseDown = function (e) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;
    if (X < this.m_rectMainBlock.m_nLeft || this.m_rectMainBlock.m_nRight < X) {
        return false;
    }
    if (Y < this.m_rectMainBlock.m_nTop || this.m_rectMainBlock.m_nBottom < Y) {
        return false;
    }

    this.m_rChart.m_ScrollCtrl.AutoScrollStop();

    //LKY 블록 모바일 드래그 블록크기 확대축소 처리관련 >>>
    var length = this.m_ChartBlockArray.length;
    for (var i = 0; i < length; i++) {
        var rChartBlock = this.m_ChartBlockArray[i];

        var nMinBackgroundBottom = rChartBlock.m_rectGraphBackground.m_nBottom - 20;
        var nMaxBackgroundBottom = rChartBlock.m_rectGraphBackground.m_nBottom + 20;
        
        if (nMinBackgroundBottom <= Y && Y <= nMaxBackgroundBottom) {

            this.m_DragMouseInfo.m_bClickFlag = true;
            this.m_DragMouseInfo.m_nSelectChartIndex = i;
            this.m_DragMouseInfo.m_nSelectNextChartIndex = i + 1;
            this.m_SelectedChartBlock = this.m_ChartBlockArray[i];
            this.m_ChartBlockArray[i].OnMouseDown(e);

            break;
        }
    }
    //LKY 블록 모바일 드래그 블록크기 확대축소 처리관련 <<<

    this.m_SelectedChartBlock = null;
    var nResult = CB_NO_SELECT;
    var length = this.m_ChartBlockArray.length;
    for (var i = 0; i < length; i++) {
        nResult = this.m_ChartBlockArray[i].OnMouseDown(e);
        if (nResult == CB_SELECT || nResult == CB_SELECT_TOOL || nResult == CB_SELECT_GRAPH) {
            this.m_SelectedChartBlock = this.m_ChartBlockArray[i];
            break;
        }
    }

    if (nResult === CB_SELECT) {
        this.m_MagnifyStartXPos = null;
        this.m_rRectMagnify = null;
    }    

    return true;
}

CMobileMainBlock.prototype.OnMouseUp = function (e) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    /////////////////////////////////////////////////////////////////////
    this.m_rChart.m_DrawingInfo.m_ScreenCanvas.setCapture = false;
    /////////////////////////////////////////////////////////////////////

    //LKY 블록 마우스 드래그 블록크기 확대축소 처리관련 >>>>>>>>>
    if (this.m_DragMouseInfo.m_bClickFlag === true) {
        this.m_DragMouseInfo.m_bClickFlag = false;
        this.m_DragMouseInfo.m_nSelectChartIndex = null;
        this.m_DragMouseInfo.m_nSelectNextChartIndex = null;
        return true;
    }
    //LKY 블록 마우스 드래그 블록크기 확대축소 처리관련 <<<<<<<<<

    if (!this.m_ToolMng.IsDrawingTool() && !this.m_rRectMagnify) {
        if (X < this.m_rectMainBlock.m_nLeft || this.m_rectMainBlock.m_nRight < X) {
            return false;
        }
        if (Y < this.m_rectMainBlock.m_nTop || this.m_rectMainBlock.m_nBottom < Y) {
            return false;
        }
    }

    var nResult = CB_NO_SELECT;
    var length = this.m_ChartBlockArray.length;
    for (var i = 0; i < length; i++) {
        nResult = this.m_ChartBlockArray[i].OnMouseUp(e);
        if ( nResult !== CB_NO_SELECT ) {
            break;                        
        }
    }

    if ( nResult === CB_SELECT_TOOL )
    {
        if( this.m_ToolMng.m_MovingTool === null && this.m_ToolMng.m_SelectedTool !== null )
        {
            var rToolProperty = this.m_ToolMng.GetSelectedToolPropertyInfo( this.m_ToolMng.m_SelectedTool, true );
            if( rToolProperty !== undefined )
            {
                this.m_ToolMng.m_rCopyToolProperty = rToolProperty.Copy();
                e.m_rChart = this.m_rChart;
                e.m_InfoData = rToolProperty;
                this.m_rChart.ShowToolMngBtn(e);
            }
        }
    }

    if (this.m_SelectedChartBlock) {

        if (!this.IsVisibleCrossLine()) {

            if (this.m_rChart.m_MobileScrollInfo) {

                //터치는 이동했지만 스크롤은 이동하지 못했으며 스크롤 현재 위치가 0인 경우는 좌측 마지막 위치에 스크롤이 위치해있다고 판단
                if (this.m_rChart.m_MobileScrollInfo.m_MovePixel && this.m_rChart.m_MobileScrollInfo.GetMoveScroll() == 0 && this.m_rChart.m_ScrollCtrl.m_Pos == 0) {

                    this.m_rChart.SendEvent("Event_Scroll");
                } else if (this.m_rChart.m_MobileScrollInfo.m_LastVelocity && this.m_rChart.m_MobileScrollInfo.m_LastVelocity > 1) {

                    var rSelectedGraph = this.m_SelectedChartBlock.GetSelectedGraph();
                    var rXScaleMng = rSelectedGraph.GetXScaleMng();
                    var nGraphRegionWidth = this.m_SelectedChartBlock.m_rectGraphRegion.Width();

                    if (rXScaleMng.m_nType == DATETIME_TYPE) {

                        if (nGraphRegionWidth > 0) {

                            this.m_rChart.m_ScrollCtrl.AutoScroll(this.m_rChart.m_MobileScrollInfo.m_IntervalTime, this.m_rChart.m_MobileScrollInfo.m_MovePixel,
                                this.m_rChart.m_MobileScrollInfo.m_LastVelocity, this.m_rChart.m_MobileScrollInfo.m_Acceleration, this.m_rChart.m_MobileScrollInfo.m_LastDirectX);
                        }
                    }
                }
            }
        }

        this.m_rRectMagnify = null;
        this.m_MagnifyStartXPos = null;

        this.m_rChart.BitBlt();
        this.m_SelectedChartBlock = null;
    }
    return true;
}
CMobileMainBlock.prototype.OnMouseMove = function (e) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (!this.m_ToolMng.IsDrawingTool() && !this.m_rRectMagnify) {

        if (e.currentTarget.id != this.m_rChart.m_DrawingInfo.m_strScreenCanvasId) {

            this.m_rCrossPoint = null;
            return false;
        }

        if (X < this.m_rectMainBlock.m_nLeft || this.m_rectMainBlock.m_nRight < X) {

            this.m_rCrossPoint = null;
            return false;
        }

        if (Y < this.m_rectMainBlock.m_nTop || this.m_rectMainBlock.m_nBottom < Y) {

            this.m_rCrossPoint = null;
            return false;
        }

        //멀티 터치인 경우 추가 검사
        if (this.m_rChart.m_MobileScrollInfo.GetTouchType() == 2) {

            var X1 = e.ChartSecondXPos;
            var Y1 = e.ChartSecondYPos;
            if (X1 < this.m_rectMainBlock.m_nLeft || this.m_rectMainBlock.m_nRight < X1) {

                this.m_rCrossPoint = null;
                return false;
            }

            if (Y1 < this.m_rectMainBlock.m_nTop || this.m_rectMainBlock.m_nBottom < Y1) {

                this.m_rCrossPoint = null;
                return false;
            }
        }
    }

    if (e.currentTarget.id == this.m_rChart.m_DrawingInfo.m_strScreenCanvasId) {

        switch (this.GetBlockType()) {
            case 0: //세로형
                {
                    var rFirstChartBlock = this.m_ChartBlockArray[0];
                    var rLastChartBlock = this.m_ChartBlockArray[this.m_ChartBlockArray.length - 1];

                    var nLeft = rFirstChartBlock.m_rectGraphBackground.m_nLeft;
                    var nRight = rFirstChartBlock.m_rectGraphBackground.m_nRight;
                    var nTop = rFirstChartBlock.m_rectGraphBackground.m_nTop;
                    var nBottom = rLastChartBlock.m_rectGraphBackground.m_nBottom;

                    this.m_strCrossLineXTitle = null;
                    this.m_strCrossLineYValue = null;

                    //LKY 블록 드래그 영역 모바일 이벤트 처리 >>>
                    if (this.m_DragMouseInfo.m_bClickFlag === true) {
                        this.ChartBlockClickDragMove(X, Y);
                        return;
                    }
                    //LKY 블록 드래그 영역 모바일 이벤트 처리 <<<

                    if ((nLeft < X && X < nRight) && (nTop < Y && Y < nBottom)) {

                        if (this.IsVisibleCrossLine() || this.m_ToolMng.IsDrawingTool() === true) {

                            if (this.m_rCrossPoint === null)
                                this.m_rCrossPoint = this.m_CrossPoint;

                            this.m_rCrossPoint.m_X = X;
                            this.m_rCrossPoint.m_Y = Y;

                            ///////////////////////////////////////////////////////

                            var rXScaleMng = this.m_rChart.GetSelectedXScaleMng();
                            if (rXScaleMng) {

                                var nViewDataCnt = rXScaleMng.m_nViewEndIndex - rXScaleMng.m_nViewStartIndex + 1;
                                var nGraphRegionWidth = rFirstChartBlock.m_rectGraphRegion.Width();
                                if (nGraphRegionWidth > 0) {

                                    var nFindXIndex = Math.floor((X - rFirstChartBlock.m_rectGraphRegion.m_nLeft) * (nViewDataCnt / rFirstChartBlock.m_rectGraphRegion.Width()) + rXScaleMng.m_nViewStartIndex);

                                    if (rXScaleMng.GetType() == DATETIME_TYPE) {

                                        if (this.m_rFindXScaleItem && this.m_nFindXScaleArrayIndex >= 0) {

                                            var nIntervalCnt = this.m_rFindXScaleItem.GetIntervalCnt();

                                            do {

                                                var nStartXIndex = this.m_rFindXScaleItem.GetStartPos();
                                                var nEndXIndex = nStartXIndex + nIntervalCnt - 1;

                                                //검색범위에 들어옴
                                                if (nStartXIndex <= nFindXIndex && nFindXIndex <= nEndXIndex) {

                                                    let tDateTime = this.m_rFindXScaleItem.GetDateTimeTByIndex(nFindXIndex, nIntervalCnt);
                                                    let GlobaloffsetDateTime = null;
													let nYear, nMonth, nDay, nH, nM, nS, strDate;

                                                    switch (this.m_rFindXScaleItem.GetCycle()) {

                                                        case 1: //일
                                                        case 2: //주
															gTempDate.setTime(tDateTime * 1000);
															nYear = gTempDate.getFullYear();
                                                    		nMonth = gTempDate.getMonth() + 1;
                                                    		nDay = gTempDate.getDate();
															strDate = gDateArray[gTempDate.getDay()];
                                                            this.m_strCrossLineXTitle = "" + nYear + "/" + (nMonth > 9 ? nMonth : "0" + nMonth) + "/" + (nDay > 9 ? nDay : "0" + nDay) + " (" + strDate + ")";
                                                            break;
                                                        case 3: //월
															gTempDate.setTime(tDateTime * 1000);
															nYear = gTempDate.getFullYear();
                                                    		nMonth = gTempDate.getMonth() + 1;                                                    		
                                                            this.m_strCrossLineXTitle = "" + nYear + "/" + (nMonth > 9 ? nMonth : "0" + nMonth);
                                                            break;
                                                        case 4: //년
															gTempDate.setTime(tDateTime * 1000);
															nYear = gTempDate.getFullYear();
                                                            this.m_strCrossLineXTitle = "" + nYear;
                                                            break;
                                                        case 5: //분
															GlobaloffsetDateTime = ChangeGlobalTime(this.m_rGlobalProperty.GetTimeZone(), tDateTime);
		                                                    nYear = GlobaloffsetDateTime.getFullYear();
		                                                    nMonth = GlobaloffsetDateTime.getMonth() + 1;
		                                                    nDay = GlobaloffsetDateTime.getDate();
		                                                    nH = GlobaloffsetDateTime.getHours();
		                                                    nM = GlobaloffsetDateTime.getMinutes();		                                                    
                                                            this.m_strCrossLineXTitle = "" + nYear + "/" + (nMonth > 9 ? nMonth : "0" + nMonth) + "/" + (nDay > 9 ? nDay : "0" + nDay) + " " + (nH > 9 ? nH : "0" + nH) + " " + (nM > 9 ? nM : "0" + nM);
                                                            break;
                                                        case 6: //초
															GlobaloffsetDateTime = ChangeGlobalTime(this.m_rGlobalProperty.GetTimeZone(), tDateTime);
		                                                    nYear = GlobaloffsetDateTime.getFullYear();
		                                                    nMonth = GlobaloffsetDateTime.getMonth() + 1;
		                                                    nDay = GlobaloffsetDateTime.getDate();
		                                                    nH = GlobaloffsetDateTime.getHours();
		                                                    nM = GlobaloffsetDateTime.getMinutes();
		                                                    nS = GlobaloffsetDateTime.getSeconds();
                                                            this.m_strCrossLineXTitle = "" + nYear + "/" + (nMonth > 9 ? nMonth : "0" + nMonth) + "/" + (nDay > 9 ? nDay : "0" + nDay) + " " + (nH > 9 ? nH : "0" + nH) + " " + (nM > 9 ? nM : "0" + nM) + " " + (nS > 9 ? nS : "0" + nS);
                                                            break;
                                                    }

                                                    break;
                                                }
                                                //범위가 들어오지 않아 검색해야 함
                                                else {

                                                    if (nFindXIndex < nStartXIndex) { //nStartXIndex부터 역으로 검색(즉, this.m_nFindXScaleArrayIndex -1 부터 검색)

                                                        if (this.m_nFindXScaleArrayIndex - 1 >= 0) {

                                                            var nXScaleItemArrayIndex = rXScaleMng.GetDateTimeXScaleItemByIndex(nFindXIndex, this.m_nFindXScaleArrayIndex - 1, 0, this.m_rFindXScaleItem);
                                                            if (nXScaleItemArrayIndex < 0 || this.m_rFindXScaleItem == null) {
                                                                //검색실패
                                                                break;
                                                            }

                                                            this.m_nFindXScaleArrayIndex = nXScaleItemArrayIndex;
                                                            nIntervalCnt = this.m_rFindXScaleItem.GetIntervalCnt();
                                                        } else {

                                                            //검색실패
                                                            break;
                                                        }
                                                    } else {

                                                        if (this.m_nFindXScaleArrayIndex + 1 < rXScaleMng.m_XScaleItemArray.length) {

                                                            var nXScaleItemArrayIndex = rXScaleMng.GetDateTimeXScaleItemByIndex(nFindXIndex, this.m_nFindXScaleArrayIndex + 1, rXScaleMng.m_XScaleItemArray.length - 1, this.m_rFindXScaleItem);
                                                            if (nXScaleItemArrayIndex < 0 || this.m_rFindXScaleItem == null) {
                                                                //검색실패
                                                                break;
                                                            }

                                                            this.m_nFindXScaleArrayIndex = nXScaleItemArrayIndex;
                                                            nIntervalCnt = this.m_rFindXScaleItem.GetIntervalCnt();
                                                        } else {
                                                            //검색실패
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            while (1);
                                        }
                                        //마우스가 차트영역으로 초기화 이후 처음 들어올 때
                                        else {

                                            this.m_nFindXScaleArrayIndex = null;

                                            if ((nFindXIndex - rXScaleMng.m_nViewStartIndex) < (rXScaleMng.m_nViewEndIndex - nFindXIndex)) {

                                                this.m_rFindXScaleItem = new CDateTimeXScaleItem(rXScaleMng);
                                                var nXScaleItemArrayIndex = rXScaleMng.GetDateTimeXScaleItemByIndex(nFindXIndex, 0, rXScaleMng.m_XScaleItemArray.length - 1, this.m_rFindXScaleItem);
                                                if (nXScaleItemArrayIndex >= 0 && this.m_rFindXScaleItem != null) {

                                                    this.m_nFindXScaleArrayIndex = nXScaleItemArrayIndex;
                                                }
                                            } else {

                                                this.m_rFindXScaleItem = new CDateTimeXScaleItem(rXScaleMng);
                                                var nXScaleItemArrayIndex = rXScaleMng.GetDateTimeXScaleItemByIndex(nFindXIndex, rXScaleMng.m_XScaleItemArray.length - 1, 0, this.m_rFindXScaleItem);
                                                if (nXScaleItemArrayIndex >= 0 && this.m_rFindXScaleItem != null) {

                                                    this.m_nFindXScaleArrayIndex = nXScaleItemArrayIndex;
                                                }
                                            }

                                            if (this.m_rFindXScaleItem && this.m_nFindXScaleArrayIndex >= 0) {

                                                var nStartXIndex = this.m_rFindXScaleItem.GetStartPos();
                                                var nIntervalCnt = this.m_rFindXScaleItem.GetIntervalCnt();
                                                var nEndXIndex = nStartXIndex + nIntervalCnt - 1;

                                                //검색범위에 들어옴
                                                if (nStartXIndex <= nFindXIndex && nFindXIndex <= nEndXIndex) {

                                                    let tDateTime = this.m_rFindXScaleItem.GetDateTimeTByIndex(nFindXIndex, nIntervalCnt);
													let GlobaloffsetDateTime = null;
													let nYear, nMonth, nDay, nH, nM, nS, strDate;

                                                    switch (this.m_rFindXScaleItem.GetCycle()) {

                                                        case 1: //일
                                                        case 2: //주
															gTempDate.setTime(tDateTime * 1000);
															nYear = gTempDate.getFullYear();
                                                    		nMonth = gTempDate.getMonth() + 1;
                                                    		nDay = gTempDate.getDate();
															strDate = gDateArray[gTempDate.getDay()];
                                                            this.m_strCrossLineXTitle = "" + nYear + "/" + (nMonth > 9 ? nMonth : "0" + nMonth) + "/" + (nDay > 9 ? nDay : "0" + nDay) + " (" + strDate + ")";
                                                            break;
                                                        case 3: //월
															gTempDate.setTime(tDateTime * 1000);
															nYear = gTempDate.getFullYear();
                                                    		nMonth = gTempDate.getMonth() + 1;                                                    		
                                                            this.m_strCrossLineXTitle = "" + nYear + "/" + (nMonth > 9 ? nMonth : "0" + nMonth);
                                                            break;
                                                        case 4: //년
															gTempDate.setTime(tDateTime * 1000);
															nYear = gTempDate.getFullYear();                                                            
                                                            this.m_strCrossLineXTitle = "" + nYear;
                                                            break;
                                                        case 5: //분
															GlobaloffsetDateTime = ChangeGlobalTime(this.m_rGlobalProperty.GetTimeZone(), tDateTime);
		                                                    nYear = GlobaloffsetDateTime.getFullYear();
		                                                    nMonth = GlobaloffsetDateTime.getMonth() + 1;
		                                                    nDay = GlobaloffsetDateTime.getDate();
		                                                    nH = GlobaloffsetDateTime.getHours();
		                                                    nM = GlobaloffsetDateTime.getMinutes();
                                                            this.m_strCrossLineXTitle = "" + nYear + "/" + (nMonth > 9 ? nMonth : "0" + nMonth) + "/" + (nDay > 9 ? nDay : "0" + nDay) + " " + (nH > 9 ? nH : "0" + nH) + " " + (nM > 9 ? nM : "0" + nM);
                                                            break;
                                                        case 6: //초
															GlobaloffsetDateTime = ChangeGlobalTime(this.m_rGlobalProperty.GetTimeZone(), tDateTime);
		                                                    nYear = GlobaloffsetDateTime.getFullYear();
		                                                    nMonth = GlobaloffsetDateTime.getMonth() + 1;
		                                                    nDay = GlobaloffsetDateTime.getDate();
		                                                    nH = GlobaloffsetDateTime.getHours();
		                                                    nM = GlobaloffsetDateTime.getMinutes();
		                                                    nS = GlobaloffsetDateTime.getSeconds();
                                                            this.m_strCrossLineXTitle = "" + nYear + "/" + (nMonth > 9 ? nMonth : "0" + nMonth) + "/" + (nDay > 9 ? nDay : "0" + nDay) + " " + (nH > 9 ? nH : "0" + nH) + " " + (nM > 9 ? nM : "0" + nM) + " " + (nS > 9 ? nS : "0" + nS);
                                                            break;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    //////////////////////////////////////////////////////
                                    //y축
                                    if (this.m_strCrossLineXTitle && this.m_strCrossLineXTitle.length > 0) {

                                        var i, nBlockLength = this.m_ChartBlockArray.length;
                                        for (i = 0; i < nBlockLength; i++) {

                                            var rChartBlock = this.m_ChartBlockArray[i];
                                            if (rChartBlock.IsInGraphBackgroundRect(X, Y)) {

                                                var rYScale = rChartBlock.GetSelectedYScale();

                                                if (rYScale.m_nPacketType == NUMERIC_TYPE) {

                                                    var yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
                                                    var yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
                                                    var DiffYValue = rYScale.m_MinMaxInfo.m_UpperLimit - rYScale.m_MinMaxInfo.m_LowerLimit;
                                                    var DiffY = rChartBlock.m_rectGraphRegion.Height();

                                                    var nMarkPos = rChartBlock.m_rectGraphRegion.m_nBottom - Y;
                                                    var yPos = rChartBlock.m_rectGraphRegion.m_nBottom - nMarkPos;

                                                    var ratio = nMarkPos / DiffY;
                                                    var YValue = (DiffYValue * ratio + rYScale.m_MinMaxInfo.m_LowerLimit);

                                                    this.m_strCrossLineYValue = ConvertNumToDigitText(YValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                                                }

                                                this.m_rFindChartBlock = rChartBlock;

                                                break;
                                            }
                                        }

                                        //console.log("XTitle:" + this.m_strCrossLineXTitle + ", YValue:" + this.m_strCrossLineYValue);
                                    }
                                }
                            }
                        }
                        //터치이벤트로 스크롤하는 경우 처리
                        else {
                            var rSelectedGraph = this.m_SelectedChartBlock.GetSelectedGraph();
                            var rXScaleMng = rSelectedGraph.GetXScaleMng();
                            var nGraphRegionWidth = this.m_SelectedChartBlock.m_rectGraphRegion.Width();

                            if (rXScaleMng.m_nType == DATETIME_TYPE) {

                                if (nGraphRegionWidth > 0) {

                                    var nTotalCnt = rXScaleMng.GetMergeDataCnt();

                                    var nTouchType = this.m_rChart.m_MobileScrollInfo.GetTouchType();

                                    if (nTouchType == 1) { //싱글 터치(스크롤 기능)

                                        //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                                        var nStartXIndex = GetXIndexByXPos(this.m_rChart.m_MobileScrollInfo.m_StartX, this.m_SelectedChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                                        var nEndXIndex = GetXIndexByXPos(this.m_rChart.m_MobileScrollInfo.m_NextX, this.m_SelectedChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                                        if (nTotalCnt <= nStartXIndex)
                                            nStartXIndex = nTotalCnt - 1;
                                        else if (nStartXIndex < 0)
                                            nStartXIndex = 0;

                                        if (nTotalCnt <= nEndXIndex)
                                            nEndXIndex = nTotalCnt - 1;
                                        else if (nEndXIndex < 0)
                                            nEndXIndex = 0;

                                        var nMoveScroll = nStartXIndex - nEndXIndex;
                                        if (nMoveScroll > 0) {
                                            var nNextEndXIndex = rXScaleMng.m_nViewEndIndex + nMoveScroll;
                                            var nDiff = nNextEndXIndex - (nTotalCnt - 1);
                                            if (nDiff > 0)
                                                nMoveScroll -= nDiff;
                                        } else if (nMoveScroll < 0) {
                                            var nPrevStartXIndex = rXScaleMng.m_nViewStartIndex + nMoveScroll;
                                            if (nPrevStartXIndex < 0)
                                                nMoveScroll -= nPrevStartXIndex;
                                        }

                                        this.m_rChart.m_MobileScrollInfo.SetMoveScroll(nMoveScroll); //touchEnd에서 참조

                                        this.m_rChart.ExtractYScaleMinMax(true);
                                        this.m_rChart.m_ScrollCtrl.Scroll(nMoveScroll);
                                        this.m_rChart.Draw(DRAW_CASE_RESIZE);

                                    } else { //멀티터치(확대/축소)

                                        var nOldViewStartIndex = rXScaleMng.m_nViewStartIndex;
                                        var nOldViewEndIndex = rXScaleMng.m_nViewEndIndex;

                                        var nFirstIndex = GetXIndexByXPos(this.m_rChart.m_MobileScrollInfo.m_FirstTouchX, this.m_SelectedChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                                        var nFirstNextIndex = GetXIndexByXPos(this.m_rChart.m_MobileScrollInfo.m_FirstNextTouchX, this.m_SelectedChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                                        var nSecondIndex = GetXIndexByXPos(this.m_rChart.m_MobileScrollInfo.m_SecondTouchX, this.m_SelectedChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                                        var nSecondNextIndex = GetXIndexByXPos(this.m_rChart.m_MobileScrollInfo.m_SecondNextTouchX, this.m_SelectedChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                                        var nDistance = Math.abs(nSecondIndex - nFirstIndex) + 1;
                                        var nMoveDistance = Math.abs(nSecondNextIndex - nFirstNextIndex) + 1;
                                        var nViewCnt = Math.abs(rXScaleMng.m_nViewStartIndex - rXScaleMng.m_nViewEndIndex) + 1;

                                        var nLeftDist = null;

                                        //뷰카운트가 1이고 축소인 경우 예외처리
                                        if (nViewCnt == 1) {
                                            var FirstDist = Math.abs(this.m_rChart.m_MobileScrollInfo.m_FirstTouchX - this.m_rChart.m_MobileScrollInfo.m_SecondTouchX);
                                            var SecondDist = Math.abs(this.m_rChart.m_MobileScrollInfo.m_FirstNextTouchX - this.m_rChart.m_MobileScrollInfo.m_SecondNextTouchX);
                                            if (FirstDist > SecondDist) {
                                                nDistance = FirstDist;
                                                nMoveDistance = SecondDist;

                                                var MoveRatio = nMoveDistance / nDistance;
                                                var nNewViewCnt = parseInt(nViewCnt / MoveRatio);
                                                if (nTotalCnt < nNewViewCnt)
                                                    nNewViewCnt = nTotalCnt;

                                                if (nNewViewCnt > nViewCnt)
                                                    nLeftDist = parseInt((nNewViewCnt - nViewCnt) / 2) * -1; //-1은 좌측스크롤 의미
                                            }
                                        } else {

                                            var MoveRatio = nMoveDistance / nDistance;
                                            var nNewViewCnt = parseInt(nViewCnt / MoveRatio);

                                            //지정한 ViewCnt 최대값을 ViewCnt가 넘지 않도록 예외처리
                                            let nMaxOfViewCnt = nTotalCnt < this.m_nMaxOfViewCnt ? nTotalCnt : this.m_nMaxOfViewCnt;
                                            if (nNewViewCnt > nMaxOfViewCnt)
                                                nNewViewCnt = nMaxOfViewCnt;

                                            if (nNewViewCnt < nViewCnt) //확대
                                            {
                                                var nDiff = nMoveDistance - nDistance;

                                                if (nFirstIndex >= nSecondIndex) {
                                                    var TempIndex = nSecondIndex;
                                                    nSecondIndex = nFirstIndex;
                                                    nFirstIndex = TempIndex;

                                                    TempIndex = nSecondNextIndex;
                                                    nSecondNextIndex = nFirstNextIndex;
                                                    nFirstNextIndex = TempIndex;
                                                }

                                                if (nFirstIndex < nSecondIndex) {

                                                    nLeftDist = nFirstIndex - nFirstNextIndex;
                                                    if (nLeftDist < 0)
                                                        nLeftDist = 0;

                                                    var nRightDist = nSecondNextIndex - nSecondIndex;
                                                    if (nRightDist < 0)
                                                        nRightDist = 0;

                                                    var nDiffCnt = nViewCnt - nNewViewCnt;
                                                    if (nLeftDist > 0) {
                                                        nLeftDist = parseInt(nDiffCnt * (nLeftDist / (nLeftDist + nRightDist)));
                                                        nRightDist = nDiffCnt - nLeftDist;
                                                    } else {
                                                        nLeftDist = 0;
                                                        nRightDist = nDiffCnt;
                                                    }
                                                }
                                            } else if (nNewViewCnt > nViewCnt) //축소
                                            {
                                                var nDiff = nDistance - nMoveDistance;

                                                if (nFirstIndex >= nSecondIndex) {
                                                    var TempIndex = nSecondIndex;
                                                    nSecondIndex = nFirstIndex;
                                                    nFirstIndex = TempIndex;

                                                    TempIndex = nSecondNextIndex;
                                                    nSecondNextIndex = nFirstNextIndex;
                                                    nFirstNextIndex = TempIndex;
                                                }

                                                if (nFirstIndex < nSecondIndex) {

                                                    nLeftDist = nFirstNextIndex - nFirstIndex;
                                                    if (nLeftDist < 0)
                                                        nLeftDist = 0;

                                                    var nRightDist = nSecondIndex - nSecondNextIndex;
                                                    if (nRightDist < 0)
                                                        nRightDist = 0;

                                                    var nDiffCnt = nNewViewCnt - nViewCnt;
                                                    if (nLeftDist > 0) {
                                                        nLeftDist = parseInt(-nDiffCnt * (nLeftDist / (nLeftDist + nRightDist)));
                                                        nRightDist = nDiffCnt - nLeftDist;
                                                    } else {
                                                        nLeftDist = 0;
                                                        nRightDist = nDiffCnt;
                                                    }
                                                }
                                            }
                                        }

                                        if (nLeftDist != null) {

                                            this.m_rChart.InitialViewInfo(nNewViewCnt);

                                            var nNewStartXIndex = nOldViewStartIndex + nLeftDist;
                                            if (nNewStartXIndex < 0)
                                                nNewStartXIndex = 0;
                                            else if (nNewStartXIndex > (nTotalCnt - nNewViewCnt))
                                                nNewStartXIndex = nTotalCnt - nNewViewCnt;

                                            var nMoveScroll = nNewStartXIndex - this.m_rChart.m_ScrollCtrl.m_Pos;

                                            this.m_rChart.ExtractYScaleMinMax(true);
                                            this.m_rChart.m_ScrollCtrl.Scroll(nMoveScroll);
                                            this.m_rChart.Draw(DRAW_CASE_RESIZE);

                                            //console.log("MainBlock.OnMouseMove nNewViewCnt:" + nNewViewCnt + ", nMoveScroll:" + nMoveScroll + ", nNewStartXIndex:" + nNewStartXIndex);
                                        }
                                    }

                                }
                            }

                        }
                    }

                    if (!this.m_strCrossLineXTitle && !this.m_strCrossLineYValue) {

                        //검색실패
                        this.m_rCrossPoint = null;
                        this.m_nFindXScaleArrayIndex = null;
                        this.m_rFindXScaleItem = null;
                        this.m_rFindChartBlock = null;
                    }
                }
                break;
        }
    } else
        this.m_rCrossPoint = null;


    if (this.m_rRectMagnify) {

        if (e.currentTarget.id == this.m_rChart.m_DrawingInfo.m_strScreenCanvasId) {

            //모바일에서는 터치로 확대축소를 하게 되므로 이 부분 주석처리하고 다르게 처리요망
            //if (this.m_MagnifyStartXPos == X) {
            //    this.m_rRectMagnify.m_nLeft = X;
            //    this.m_rRectMagnify.m_nRight = X;
            //}
            //else if (this.m_MagnifyStartXPos < X) {

            //    if (this.m_SelectedChartBlock) {

            //        if (this.m_SelectedChartBlock.m_rectGraphRegion.m_nRight < X)
            //            X = this.m_SelectedChartBlock.m_rectGraphRegion.m_nRight;
            //    }
            //    this.m_rRectMagnify.m_nLeft = this.m_MagnifyStartXPos;
            //    this.m_rRectMagnify.m_nRight = (this.m_rectMainBlock.m_nRight < X ? this.m_rectMainBlock.m_nRight : X);
            //} else {

            //    if (this.m_SelectedChartBlock) {

            //        if (X < this.m_SelectedChartBlock.m_rectGraphRegion.m_nLeft)
            //            X = this.m_SelectedChartBlock.m_rectGraphRegion.m_nLeft;
            //    }

            //    this.m_rRectMagnify.m_nLeft = (X < this.m_rectMainBlock.m_nLeft ? this.m_rectMainBlock.m_nLeft : X);
            //    this.m_rRectMagnify.m_nRight = this.m_MagnifyStartXPos;
            //}

            //console.log("magnifyRect left=" + this.m_rRectMagnify.m_nLeft + ", right=" + this.m_rRectMagnify.m_nRight);
        }

        this.m_rChart.BitBlt();

        return true;
    }

    var length = this.m_ChartBlockArray.length;
    for (var i = 0; i < length; i++) {
        if (this.m_ChartBlockArray[i].OnMouseMove(e))
            break;
    }

    if (this.m_ToolMng.IsDrawingTool())
        this.m_ToolMng.DrawToolOnMouseMove(this.m_rChart.m_DrawingInfo);
    else
        this.m_rChart.BitBlt();

    /////////////////////////
    //수치조회 및 툴팁기능(모바일에서는 터치로 수치조회를 하게 되므로 이 부분은 주석처리하고 처리를 다르게 해야 함)
    //this.FindRQGraphDataPerXScaleMng(X, Y);
    /////////////////////////

    return true;
}