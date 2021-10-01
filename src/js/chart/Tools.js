import {
    DATETIME_TYPE, GetXIndexByXPos, GetYValueByYPos, CRect, CPoint, CBaseTool, CBasicToolInfo, START_POS, END_POS, LINE_POS,
    GetStrDateTimeBytTime, ConvertNumToDigitText, gPointStart, gPointEnd, gPointTemp1, gPointTemp2,
    PS_SOLID, PS_DOT, PS_DASH, PS_DASHDOT, PS_DASHDOTDOT, Log, CFiboToolInfo, CFiboTimeToolInfo, gMinMaxInfo, TOOL_TYPE
} from './kfitsChart.js'

export const POINT_HALF_WIDTH = 3, POINT_WIDTH = 6;

function DrawSelectRect(rTool, rDrawingInfo) {
    const XPos1 = Math.floor(rTool.m_StartXPos) + 0.5;
    const YPos1 = Math.floor(rTool.m_StartYPos) + 0.5;
    const XPos2 = Math.floor(rTool.m_EndXPos) + 0.5;
    const YPos2 = Math.floor(rTool.m_EndYPos) + 0.5;

    rDrawingInfo.m_ScreenContext.setLineDash([0, 0]);
    rDrawingInfo.m_ScreenContext.fillStyle = "#ffffff";
    rDrawingInfo.m_ScreenContext.lineWidth = 1;

    switch (rTool.m_ToolInfo.m_nToolType) {
        case TOOL_TYPE['RECT_TOOL']: // 사각형
        case TOOL_TYPE['CIRCLE_TOOL']: // 원
            rDrawingInfo.m_ScreenContext.fillRect(XPos1 - POINT_HALF_WIDTH, YPos1 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.fillRect(XPos2 - POINT_HALF_WIDTH, YPos2 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.fillRect(XPos1 - POINT_HALF_WIDTH, YPos2 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.fillRect(XPos2 - POINT_HALF_WIDTH, YPos1 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(XPos1 - POINT_HALF_WIDTH, YPos1 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(XPos2 - POINT_HALF_WIDTH, YPos2 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(XPos1 - POINT_HALF_WIDTH, YPos2 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(XPos2 - POINT_HALF_WIDTH, YPos1 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            break;
        case TOOL_TYPE['VERT_LINE_TOOL']: // 수직선
            rDrawingInfo.m_ScreenContext.fillRect(XPos1 - POINT_HALF_WIDTH, Math.abs(YPos1 + YPos2) / 2 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(XPos1 - POINT_HALF_WIDTH, Math.abs(YPos1 + YPos2) / 2 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            break;
        case TOOL_TYPE['HOZR_LINE_TOOL']: // 수평선
            rDrawingInfo.m_ScreenContext.fillRect(Math.abs(XPos1 + XPos2) / 2 - POINT_HALF_WIDTH, YPos1 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(Math.abs(XPos1 + XPos2) / 2 - POINT_HALF_WIDTH, YPos1 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            break;
        case TOOL_TYPE['CROSS_LINE_TOOL']: // 십자선
            rDrawingInfo.m_ScreenContext.fillRect(XPos1 - POINT_HALF_WIDTH, YPos1 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(XPos1 - POINT_HALF_WIDTH, YPos1 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            break;
        case TOOL_TYPE['FIBONACCI_TIME_TOOL']: // 피보나치 시간대
            rDrawingInfo.m_ScreenContext.fillRect(XPos1 - POINT_HALF_WIDTH, (YPos1 / 2) - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.fillRect(XPos2 - POINT_HALF_WIDTH, (YPos2 / 2) - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(XPos1 - POINT_HALF_WIDTH, (YPos1 / 2) - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(XPos2 - POINT_HALF_WIDTH, (YPos2 / 2) - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            break;
        default:
            rDrawingInfo.m_ScreenContext.fillRect(XPos1 - POINT_HALF_WIDTH, YPos1 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.fillRect(XPos2 - POINT_HALF_WIDTH, YPos2 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(XPos1 - POINT_HALF_WIDTH, YPos1 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
            rDrawingInfo.m_ScreenContext.strokeRect(XPos2 - POINT_HALF_WIDTH, YPos2 - POINT_HALF_WIDTH, POINT_WIDTH, POINT_WIDTH);
    }
}

function CalcExpandLinePoint( ptStart, ptEnd, bLeftExt, bRightExt )
{
    // 2.1 먼저 기본 방향성을 확인하기 위한 양축의 변화량을 확인한다.
	if( bLeftExt === true && bRightExt === false && ptEnd.m_X < ptStart.m_X )
	{
        gPointTemp1.m_X = ptStart.m_X;
        gPointTemp1.m_Y = ptStart.m_Y;

        ptStart.m_X = ptEnd.m_X;
        ptStart.m_Y = ptEnd.m_Y;
        
        ptEnd.m_X = gPointTemp1.m_X;
        ptEnd.m_Y = gPointTemp1.m_Y;
    }
    
    if( bLeftExt === false && bRightExt === true && ptEnd.m_X < ptStart.m_X )
	{
		gPointTemp1.m_X = ptStart.m_X;
        gPointTemp1.m_Y = ptStart.m_Y;

        ptStart.m_X = ptEnd.m_X;
        ptStart.m_Y = ptEnd.m_Y;
        
        ptEnd.m_X = gPointTemp1.m_X;
        ptEnd.m_Y = gPointTemp1.m_Y;
	}

    var DX = ptEnd.m_X - ptStart.m_X;
	var DY = ptEnd.m_Y - ptStart.m_Y;

    // 2.2 Logic을 간단히 하기 위하여 우하단(+,+)의 방향으로 조정하고 Flag을 관리한다.
	var bXTransformation = ( DX < 0 ) ? true : false;
	if( bXTransformation)
	{
		DX = -DX;
		ptEnd.m_X = ptStart.m_X + Math.floor( DX );
    }
    var bYTransformation = ( DY < 0 ) ? true : false;
	if( bYTransformation)
	{
		DY = -DY;
		ptEnd.m_Y = ptStart.m_Y + Math.floor( DY );
    }
    
    // 2.3 확장을 처리한다.
    // 2.3.1 각이 크기를 감안하여 진행 방향확장을 처리한다.
    gPointTemp1.m_X = ptStart.m_X;
    gPointTemp1.m_Y = ptStart.m_Y;
    gPointTemp2.m_X = ptEnd.m_X;
    gPointTemp2.m_Y = ptEnd.m_Y;

	if( bRightExt === true )
	{
		if( DX < DY )
		{
			gPointTemp2.m_Y = 10000;
			gPointTemp2.m_X = Math.floor( ( DX / DY ) * ( gPointTemp2.m_Y - ptStart.m_Y ) + ptStart.m_X );
		}
		else if( DY < DX )
		{
			gPointTemp2.m_X = 10000;
			gPointTemp2.m_Y = Math.floor( ( DY / DX ) * ( gPointTemp2.m_X - ptStart.m_X ) + ptStart.m_Y );
		}
    }
    
    if( bLeftExt === true )
	{
		if( DX < DY )
		{
			gPointTemp1.m_Y = -10000;
			gPointTemp1.m_X = Math.floor( ( DX / DY) * ( gPointTemp1.m_Y - ptStart.m_Y ) + ptStart.m_X );
		}
		else if( DY < DX)
		{
			gPointTemp1.m_X = -10000;
			gPointTemp1.m_Y = Math.floor( ( DY / DX) * ( gPointTemp1.m_X - ptStart.m_X ) + ptStart.m_Y );
		}
    }
    
    // 2.4 기본 방향으로 조정한다.
	if( bXTransformation)
	{
		DX	= -DX;
		ptEnd.m_X			= ptStart.m_X - Math.floor( DX );
		gPointTemp1.m_X	    = ptStart.m_X - ( gPointTemp1.m_X	- ptStart.m_X);
		gPointTemp2.m_X		= ptStart.m_X - ( gPointTemp2.m_X	- ptStart.m_X);
	}
	if( bYTransformation)
	{
		DY = -DY;
		ptEnd.m_Y			= ptStart.m_Y - Math.floor( DY );
		gPointTemp1.m_Y	    = ptStart.m_Y - ( gPointTemp1.m_Y	- ptStart.m_Y);
		gPointTemp2.m_Y		= ptStart.m_Y - ( gPointTemp2.m_Y	- ptStart.m_Y);
    }
    
    ptStart.m_X = gPointTemp1.m_X;
    ptStart.m_Y = gPointTemp1.m_Y;
    
    ptEnd.m_X = gPointTemp2.m_X;
    ptEnd.m_Y = gPointTemp2.m_Y;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////
export function CLineTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    var nXScaleType = rXScaleMng.m_nType;
    var KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    var Cycle = rRQSet.m_RQInfo.m_nCycle;
    var nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null;
    this.m_StartYPos = null;
    this.m_EndXPos = null;
    this.m_EndYPos = null;

    // 좌/우측 라인확장 좌표
    this.m_StartExpXPos = null;
    this.m_StartExpYPos = null;
    this.m_EndExpXPos = null;
    this.m_EndExpYPos = null;

    this.m_nIntervalBongCount = 0;//2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CBasicToolInfo(rXScaleMng.m_rChart.GetChartType(), LINE_TOOL, nXScaleType, KeyCode, Cycle, nInterval);
}
CLineTool.prototype = new CBaseTool();
CLineTool.prototype.constructor = CLineTool;

CLineTool.prototype.Copy = function (rCopy) {

    if (rCopy === undefined || rCopy === null) {
        rCopy = new CLineTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
            rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo;//도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition === null)
            rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
            rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    }
    else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}
CLineTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;
    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIndexIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
            (nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
            return;

        var tStartDateTime = this.m_ToolInfo.m_StartDateTimeT;
        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;
        var nTextMargin = 10;

        var yStartPos = null;
        var xStartPos = null;
        var yEndPos = null;
        var xEndPos = null;

        var PreStartXPos = this.m_StartXPos;
        var PreStartYPos = this.m_StartYPos;
        var PreEndXPos = this.m_EndXPos;
        var PreEndYPos = this.m_EndYPos;

        var strRQ = this.m_rRQSet.GetRQ();
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;        
        else {

            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];
            if (rStartRQPackets === undefined)
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined)
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
        EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

        yStartPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;

        if (bInvert === true)
        {
            yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
            yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
        }

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.fillStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        if( this.m_ToolInfo.m_bExpandLeft === true ||  this.m_ToolInfo.m_bExpandRight === true )
        {
            if( xStartPos !== PreStartXPos || yStartPos != PreStartYPos 
                || xEndPos !== PreEndXPos || yEndPos !== PreEndYPos 
                || this.m_StartExpXPos === null || this.m_StartExpYPos === null
                || this.m_EndExpXPos === null || this.m_EndExpYPos === null )
            {
                gPointStart.m_X = xStartPos;
                gPointStart.m_Y = yStartPos;
                gPointEnd.m_X = xEndPos;
                gPointEnd.m_Y = yEndPos;

                CalcExpandLinePoint( gPointStart, gPointEnd, this.m_ToolInfo.m_bExpandLeft, this.m_ToolInfo.m_bExpandRight );
                
                this.m_StartExpXPos = gPointStart.m_X;
                this.m_StartExpYPos = gPointStart.m_Y;
                this.m_EndExpXPos = gPointEnd.m_X;
                this.m_EndExpYPos = gPointEnd.m_Y;
            }

            DrawingInfo.m_ScreenContext.moveTo(this.m_StartExpXPos, this.m_StartExpYPos);
            DrawingInfo.m_ScreenContext.lineTo(this.m_EndExpXPos, this.m_EndExpYPos);
        }
        else
        {
            DrawingInfo.m_ScreenContext.moveTo(xStartPos, yStartPos);
            DrawingInfo.m_ScreenContext.lineTo(xEndPos, yEndPos);
        }
        DrawingInfo.m_ScreenContext.stroke();        

        if( this.m_ToolInfo.m_bShowLeftText )
        {
            DrawingInfo.m_ScreenContext.textBaseline = "middle";
            DrawingInfo.m_ScreenContext.textAlign = "right";
            
            if( xStartPos <= xEndPos )
            {
                if( yStartPos != PreStartYPos || this.m_ToolInfo.m_strStartValue === null )
                    this.m_ToolInfo.m_strStartValue = ConvertNumToDigitText(this.m_ToolInfo.m_StartYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strStartValue, xStartPos - nTextMargin, yStartPos );
            }
            else
            {
                if( yEndPos !== PreEndYPos || this.m_ToolInfo.m_strEndValue === null )
                    this.m_ToolInfo.m_strEndValue = ConvertNumToDigitText(this.m_ToolInfo.m_EndYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, xEndPos - nTextMargin, yEndPos );
            }
        }
        if( this.m_ToolInfo.m_bShowRightText )
        {
            DrawingInfo.m_ScreenContext.textBaseline = "middle";
            DrawingInfo.m_ScreenContext.textAlign = "left";
            
            if( xStartPos <= xEndPos )
            {
                if( yEndPos !== PreEndYPos || this.m_ToolInfo.m_strEndValue === null )
                    this.m_ToolInfo.m_strEndValue = ConvertNumToDigitText(this.m_ToolInfo.m_EndYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, xEndPos + nTextMargin, yEndPos );
            }
            else
            {
                if( yStartPos != PreStartYPos || this.m_ToolInfo.m_strStartValue === null )
                    this.m_ToolInfo.m_strStartValue = ConvertNumToDigitText(this.m_ToolInfo.m_StartYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);                
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strStartValue, xStartPos + nTextMargin, yStartPos );
            }
        }

        DrawingInfo.m_ScreenContext.restore();
    }
}

CLineTool.prototype.Draw = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    //x축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
        (nViewEndIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
        return;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;    

    var nTextMargin = 8;
    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }
    
    StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

    //y축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((StartYValue < yMin && EndYValue < yMin) ||
        (yMax < StartYValue && yMax < EndYValue))
        return;

    var PreStartXPos = this.m_StartXPos;
    var PreStartYPos = this.m_StartYPos;
    var PreEndXPos = this.m_EndXPos;
    var PreEndYPos = this.m_EndYPos;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        //라인추세선의 시작점 시간과 끝점 시간을 얻어낸다
        var tStartDateTime = this.m_ToolInfo.m_StartDateTimeT;
        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;

        var strRQ = this.m_rRQSet.GetRQ();

        //시작점 시간에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {
            
            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];

            //시작점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rStartRQPackets === undefined)
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //시작점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //시작점의 y값에 대한 좌표계산
        this.m_StartYPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;

        //끝점 시간에 대한 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];

            //끝점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rEndRQPackets === undefined)
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //끝점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //끝점 y값에 대한 좌표계산
        this.m_EndYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_EndYPos = rectGraphRegion.m_nBottom - this.m_EndYPos + rectGraphRegion.m_nTop;

        DrawingInfo.m_ScreenContext.beginPath();

        switch (this.m_ToolInfo.m_nToolLineType)
        {
            case PS_SOLID: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
            case PS_DASH: DrawingInfo.m_ScreenContext.setLineDash([8, 4]); break;
            case PS_DOT: DrawingInfo.m_ScreenContext.setLineDash([2, 3]); break;
            case PS_DASHDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]); break;
            case PS_DASHDOTDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]); break;
            default: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        }

        DrawingInfo.m_ScreenContext.fillStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        if( this.m_ToolInfo.m_bExpandLeft === true ||  this.m_ToolInfo.m_bExpandRight === true )
        {
            if( this.m_StartXPos !== PreStartXPos || this.m_StartYPos != PreStartYPos 
                || this.m_EndXPos !== PreEndXPos || this.m_EndYPos !== PreEndYPos 
                || this.m_StartExpXPos === null || this.m_StartExpYPos === null
                || this.m_EndExpXPos === null || this.m_EndExpYPos === null || this.m_bReCalc === true )
            {
                gPointStart.m_X = this.m_StartXPos;
                gPointStart.m_Y = this.m_StartYPos;
                gPointEnd.m_X = this.m_EndXPos;
                gPointEnd.m_Y = this.m_EndYPos;

                CalcExpandLinePoint( gPointStart, gPointEnd, this.m_ToolInfo.m_bExpandLeft, this.m_ToolInfo.m_bExpandRight );
                this.m_StartExpXPos = gPointStart.m_X;
                this.m_StartExpYPos = gPointStart.m_Y;
                this.m_EndExpXPos = gPointEnd.m_X;
                this.m_EndExpYPos = gPointEnd.m_Y;
            }
            DrawingInfo.m_ScreenContext.moveTo(this.m_StartExpXPos, this.m_StartExpYPos);
            DrawingInfo.m_ScreenContext.lineTo(this.m_EndExpXPos, this.m_EndExpYPos);
        }
        else
        {
            DrawingInfo.m_ScreenContext.moveTo(this.m_StartXPos, this.m_StartYPos);
            DrawingInfo.m_ScreenContext.lineTo(this.m_EndXPos, this.m_EndYPos);
        }
        DrawingInfo.m_ScreenContext.stroke();

        if( this.m_ToolInfo.m_bShowLeftText )
        {
            DrawingInfo.m_ScreenContext.textBaseline = "middle";
            DrawingInfo.m_ScreenContext.textAlign = "right";

            if( this.m_StartXPos <= this.m_EndXPos )
            {
                if( this.m_StartYPos != PreStartYPos || this.m_ToolInfo.m_strStartValue === null || this.m_bReCalc === true )                
                    this.m_ToolInfo.m_strStartValue = ConvertNumToDigitText(this.m_ToolInfo.m_StartYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strStartValue, this.m_StartXPos - nTextMargin, this.m_StartYPos );
            }
            else
            {
                if( this.m_EndYPos !== PreEndYPos || this.m_ToolInfo.m_strEndValue === null || this.m_bReCalc === true )
                    this.m_ToolInfo.m_strEndValue = ConvertNumToDigitText(this.m_ToolInfo.m_EndYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, this.m_EndXPos - nTextMargin, this.m_EndYPos );    
            }
        }
        if( this.m_ToolInfo.m_bShowRightText )
        {
            DrawingInfo.m_ScreenContext.textBaseline = "middle";
            DrawingInfo.m_ScreenContext.textAlign = "left";
            
            if( this.m_StartXPos <= this.m_EndXPos )
            {
                if( this.m_EndYPos !== PreEndYPos || this.m_ToolInfo.m_strEndValue === null || this.m_bReCalc === true )                
                    this.m_ToolInfo.m_strEndValue = ConvertNumToDigitText(this.m_ToolInfo.m_EndYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, this.m_EndXPos + nTextMargin, this.m_EndYPos );
            }
            else
            {
                if( this.m_StartYPos != PreStartYPos || this.m_ToolInfo.m_strStartValue === null || this.m_bReCalc === true )                
                    this.m_ToolInfo.m_strStartValue = ConvertNumToDigitText(this.m_ToolInfo.m_StartYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strStartValue, this.m_StartXPos + nTextMargin, this.m_StartYPos );
            }
        }

        this.m_bReCalc = false;

        if (this.m_bSelected) {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();
        DrawingInfo.m_ScreenContext.setLineDash([0, 0]);

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CLineTool.prototype.IsInMine = function (X, Y) {

    var nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;
    if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin))) {
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin))) {
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    }
    
    var DeltaX = this.m_StartXPos - this.m_EndXPos;
    if (this.m_StartXPos <= this.m_EndXPos) {
        if (X < (this.m_StartXPos - nMargin) || (this.m_EndXPos + nMargin) < X)
            return false;
    }
    else {
        if (X < (this.m_EndXPos - nMargin) || (this.m_StartXPos + nMargin) < X)
            return false;
    }

    if (this.m_StartYPos <= this.m_EndYPos) {
        if (Y < (this.m_StartYPos - nMargin) || (this.m_EndYPos + nMargin) < Y)
            return false;
    }
    else {
        if (Y < (this.m_EndYPos - nMargin) || (this.m_StartYPos + nMargin) < Y)
            return false;
    }

    var bIsInMine = false;
    if (Math.abs(DeltaX) > nMargin) {
        var a = (this.m_StartYPos - this.m_EndYPos) / DeltaX;//console.log("X:" + X + ", Y:" + Y + " " + "a(" + a + ")=(" + this.m_EndYPos + "-" + this.m_StartYPos + ")/(" + this.m_EndXPos + "-" + this.m_StartXPos + ")");
        var b = (this.m_StartYPos - a * this.m_StartXPos);//console.log("b(" + b + ")=(" + this.m_StartYPos + "-" + a + " * " + this.m_StartXPos + ")");
        var CalcY = a * X + b; //console.log("CalcY(" + CalcY + ")=(" + a + "*" + X + " + " + b + "), Y=" + Y);
        //console.log((CalcY - nMargin) + "<=" + Y + " && " + Y + "<=" + (CalcY + nMargin));
        if ((CalcY - nMargin) <= Y && Y <= (CalcY + nMargin)) { 
            bIsInMine = true;
        }
    } else {
        //수직으로 추세선이 그려진 경우는 상단 X, Y 범위 검사로 충분
        bIsInMine = true;
    }

    if (bIsInMine === true) {
        this.m_nHitTestPosInfo = LINE_POS;
        this.m_HitPosition = new CPoint(X, Y);
    }

    return bIsInMine;
}
CLineTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {

            var rChartBlockCol = rSelectedGraph.m_rRQInCol.m_rChartBlockCol;
            var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
            var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
            var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();            
            if (nGraphRegionWidth + nRightMargin > 0) {

                ///////////////////////////////////////////////
                //모양이 변경되는 그리기 모드인 경우                    
                ///////////////////////////////////////////////
                if (this.m_nHitTestPosInfo === START_POS || this.m_nHitTestPosInfo === END_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.m_nViewEndIndex - rXScaleMng.m_nViewStartIndex + 1;

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    console.log("CLineTool.OnMouseMove [X:" + X + ", nFindXIndex:" + nFindXIndex + "]");

                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                    
                    var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                    if (rStartXIndexInBongRange) {
                        console.log("CLineTool.OnMouseMove FindStartXIndex [nFindXIndex:" + nFindXIndex + ", StartXIndexInBongRange:" + rStartXIndexInBongRange.m_nFindXIndex + "]");

                        if (this.m_nHitTestPosInfo === START_POS) {
                            this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_StartYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }
                        else if (this.m_nHitTestPosInfo === END_POS) {
                            this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;
                    }                                        
                }
                else if (this.m_nHitTestPosInfo === LINE_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.GetViewDataCnt();

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
                    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
                    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X ||
                        rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y )
                    {

                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);

                    //if (this.m_HitPosition.m_X < rChartBlock.m_rectGraphRegion.m_nLeft)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nLeft;
                    //else if (rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < this.m_HitPosition.m_X)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin ;

                    //이전 클릭위치와 현재 클릭위치 차이로 이동거리와 방향 계산
                    var DeltaXPos = X - this.m_HitPosition.m_X;
                    var DeltaYPos = Y - this.m_HitPosition.m_Y;

                    var MaxXIndex = null, MinXIndex = null;
                    var NewMaxXIndex = null, NewMinXIndex = null;

                    var NewMaxDateTime = null, NewMinDateTime = null;
                    var MaxDateTime = null, MinDateTime = null;

                    var MaxY = null, MinY = null;
                    var NewMaxY = null, NewMinY = null;

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nHitXIndex = GetXIndexByXPos(this.m_HitPosition.m_X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    var nCurXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                        MaxXIndex = this.m_ToolInfo.m_EndXIndex;
                        MaxY = this.m_EndYPos;
                        MaxDateTime = this.m_ToolInfo.m_EndDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_StartXIndex;
                        MinY = this.m_StartYPos;
                        MinDateTime = this.m_ToolInfo.m_StartDateTimeT;
                    }
                    else {

                        MaxXIndex = this.m_ToolInfo.m_StartXIndex;
                        MaxY = this.m_StartYPos;
                        MaxDateTime = this.m_ToolInfo.m_StartDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_EndXIndex;
                        MinY = this.m_EndYPos;
                        MinDateTime = this.m_ToolInfo.m_EndDateTimeT;
                    }

                    //우측이동
                    if (DeltaXPos > 0) {

                        ////////////////////////////////////////////////////////////
                        //미래영역에서도 그려져야 하므로 이 부분 주석처리
                        //var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                        //현재 마우스 위치가 전체데이터 개수를 넘어가면 마지막 위치로 이동
                        //if (nCurXIndex >= nTotalCnt)
                        //    nCurXIndex = nTotalCnt - 1;
                        ////////////////////////////////////////////////////////////

                        //이전 클릭위치(nHitXIndex)가 속한 봉의 위치 찾기
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nHitXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 1번");
                            return;
                        }
                        nHitXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nHitXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //nHitXIndex부터 nCurXIndex까지의 이동 봉거리 계산

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        var nMoveBongCnt = this.CountMoveBongCnt(nHitXIndex, nCurXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {

                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //우측으로 이동시 우측 MaxIndex부터 카운트
                        var bIsUpper = (nHitXIndex <= MaxXIndex ? true : false);
                        var rResult = this.MoveUpperIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        //MinIndex를 우측으로 nMoveBongCnt 실봉개수만큼 이동                        
                        bIsUpper = (nHitXIndex <= MinXIndex ? true : false);
                        rResult = this.MoveUpperIndex(MinXIndex, MinDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;

                        //y pixel정보를 이용하여 y 가격 계산
                        NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMinXIndex + "," + NewMaxXIndex + ")");

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMaxXIndex + "," + NewMinXIndex + ")");

                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                    else if (DeltaXPos < 0) {
                        if (nCurXIndex < 0)
                            nCurXIndex = 0;

                        //현재 클릭위치(nCurXIndex)가 속한 봉의 위치찾기
                        //(nCurXIndex를 포함하고 있는 봉의 시작Index 찾아 nCurXIndex에 셋팅)
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nCurXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 2번");
                            return;
                        }
                        nCurXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nCurXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        //nCurXInde로 부터 nHitXIndex까지의 실제 봉의 개수 카운트(nCurXIndex 봉은 카운트하지 않고 nHitXIndex위치 봉은 카운트)
                        var nMoveBongCnt = this.CountMoveBongCnt(nCurXIndex, nHitXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {
                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }
                        
                        //nMoveBongCnt만큼 양 끝점 이동시키기
                        var bIsUpper = (nCurXIndex < MinXIndex) ? true : false;
                        var rResult = this.MoveLowerIndex(MinXIndex, MinDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        bIsUpper = (nCurXIndex < MaxXIndex) ? true : false;
                        rResult = this.MoveLowerIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;

                        NewMaxY = GetYValueByYPos((MaxY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos((MinY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                }
            }
        }
    }
}

export function CHozrLineTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    var nXScaleType = rXScaleMng.m_nType;
    var KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    var Cycle = rRQSet.m_RQInfo.m_nCycle;
    var nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null;
    this.m_StartYPos = null;
    this.m_EndXPos = null;
    this.m_EndYPos = null;

    this.m_nIntervalBongCount = 0;//2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CBasicToolInfo(rXScaleMng.m_rChart.GetChartType(), HOZR_LINE_TOOL, nXScaleType, KeyCode, Cycle, nInterval);
}
CHozrLineTool.prototype = new CBaseTool();
CHozrLineTool.prototype.constructor = CHozrLineTool;

CHozrLineTool.prototype.Copy = function (rCopy) {

    if (rCopy == undefined || rCopy == null) {
        rCopy = new CHozrLineTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
            rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo;//도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition == null)
            rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
            rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    }
    else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}
CHozrLineTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;    

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndexIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionHeight = rectGraphRegion.Height();

    var nTextMargin = 2;
    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }    

    if (rXScaleMng.GetType() == DATETIME_TYPE) {

        //if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
        //    (nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
        //    return;

        var PreStartYPos = this.m_StartYPos;
        var PreEndYPos = this.m_EndYPos;

        StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
        EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

        var xStartPos = rectGraphRegion.m_nLeft;
        var xEndPos = rectGraphRegion.m_nRight;
        var yStartPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        var yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
        {
            yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
            yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
        }

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        let XPos, YPos;
        XPos = Math.floor(xStartPos) + 0.5;
        YPos = Math.floor(yStartPos) + 0.5;
        DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);
        XPos = Math.floor(xEndPos) + 0.5;
        YPos = Math.floor(yEndPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        DrawingInfo.m_ScreenContext.stroke();

        if( this.m_ToolInfo.m_bShowLeftText === true || this.m_ToolInfo.m_bShowRightText === true )
        {
            DrawingInfo.m_ScreenContext.fillStyle = this.m_ToolInfo.m_clrTool;
            
            if( PreStartYPos !== yStartPos || this.m_ToolInfo.m_strEndValue === null )
                this.m_ToolInfo.m_strEndValue = ConvertNumToDigitText(this.m_ToolInfo.m_EndYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);

            if( yStartPos + DrawingInfo.m_nFontHeight > rectGraphRegion.m_nBottom )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "bottom";
                nTextMargin *= -1;
            }
            else
                DrawingInfo.m_ScreenContext.textBaseline = "top";

            if( this.m_ToolInfo.m_bShowLeftText )
            {
                DrawingInfo.m_ScreenContext.textAlign = "left";
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, xStartPos, yStartPos + nTextMargin );

            }
            if( this.m_ToolInfo.m_bShowRightText )
            {
                DrawingInfo.m_ScreenContext.textAlign = "right";
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, xEndPos, yEndPos + nTextMargin );
            }
        }

        DrawingInfo.m_ScreenContext.restore();
    }
}

CHozrLineTool.prototype.Draw = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    //x축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    //if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
    //   (nViewEndIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
    //  return;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionHeight = rectGraphRegion.Height();

    var nTextMargin = 2;
    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }
    StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

    if ((StartYValue < yMin && EndYValue < yMin) ||
        (yMax < StartYValue && yMax < EndYValue))
        return;
    //if (( this.m_ToolInfo.m_EndYValue < yMin) || (yMax < this.m_ToolInfo.m_EndYValue))
        //return;

    if (rXScaleMng.GetType() == DATETIME_TYPE) {

        var PreStartYPos = this.m_StartYPos;
        var PreEndYPos = this.m_EndYPos;

        this.m_StartXPos = rectGraphRegion.m_nLeft;
        this.m_StartYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;
        this.m_EndXPos = rectGraphRegion.m_nRight;
        this.m_EndYPos = this.m_StartYPos;

        DrawingInfo.m_ScreenContext.beginPath();

        switch (this.m_ToolInfo.m_nToolLineType)
        {
            case PS_SOLID: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
            case PS_DASH: DrawingInfo.m_ScreenContext.setLineDash([8, 4]); break;
            case PS_DOT: DrawingInfo.m_ScreenContext.setLineDash([2, 3]); break;
            case PS_DASHDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]); break;
            case PS_DASHDOTDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]); break;            
            default: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        }

        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        let XPos, YPos;
        XPos = Math.floor(this.m_StartXPos) + 0.5;
        YPos = Math.floor(this.m_StartYPos) + 0.5;
        DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

        XPos = Math.floor(this.m_EndXPos) + 0.5;
        YPos = Math.floor(this.m_EndYPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        DrawingInfo.m_ScreenContext.stroke();

        if( this.m_ToolInfo.m_bShowLeftText === true || this.m_ToolInfo.m_bShowRightText === true )
        {
            DrawingInfo.m_ScreenContext.fillStyle = this.m_ToolInfo.m_clrTool;

            if( PreStartYPos !== this.m_StartYPos || this.m_ToolInfo.m_strEndValue === null || this.m_bReCalc === true )
            {
                this.m_bReCalc = false;
                this.m_ToolInfo.m_strEndValue = ConvertNumToDigitText(this.m_ToolInfo.m_EndYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
            }

            if( this.m_StartYPos + DrawingInfo.m_nFontHeight > rectGraphRegion.m_nBottom )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "bottom";
                nTextMargin *= -1;
            }
            else
                DrawingInfo.m_ScreenContext.textBaseline = "top";

            if( this.m_ToolInfo.m_bShowLeftText )
            {
                DrawingInfo.m_ScreenContext.textAlign = "left";
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, this.m_StartXPos, this.m_StartYPos + nTextMargin );

            }
            if( this.m_ToolInfo.m_bShowRightText )
            {
                DrawingInfo.m_ScreenContext.textAlign = "right";
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, this.m_EndXPos, this.m_EndYPos + nTextMargin );
            }
        }

        if (this.m_bSelected) {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();
        DrawingInfo.m_ScreenContext.setLineDash([0, 0]);

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CHozrLineTool.prototype.IsInMine = function (X, Y) {

    var nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;

    if (Y < (this.m_EndYPos - nMargin) || Y > (this.m_EndYPos + nMargin)) {
        return false;
    }

    this.m_nHitTestPosInfo = LINE_POS;
    this.m_HitPosition = new CPoint(X, Y);

    return true;
}
CHozrLineTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;
    
    if (this.m_nHitTestPosInfo !== 0) {
        
        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();            
            if (nGraphRegionWidth + nRightMargin > 0) {
                var rYScale = rSelectedGraph.GetYScale();

                //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                    nFindXIndex = 0;

                if (this.m_nHitTestPosInfo === LINE_POS) {
                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X || rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y ) {
                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);
                }

                var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();
                this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
            }
        }
    }
}

export function CVertLineTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    var nXScaleType = rXScaleMng.m_nType;
    var KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    var Cycle = rRQSet.m_RQInfo.m_nCycle;
    var nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null;
    this.m_StartYPos = null;
    this.m_EndXPos = null;
    this.m_EndYPos = null;

    this.m_nIntervalBongCount = 0;//2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CBasicToolInfo(rXScaleMng.m_rChart.GetChartType(), VERT_LINE_TOOL, nXScaleType, KeyCode, Cycle, nInterval);
}
CVertLineTool.prototype = new CBaseTool();
CVertLineTool.prototype.constructor = CVertLineTool;

CVertLineTool.prototype.Copy = function (rCopy) {

    if (rCopy == undefined || rCopy == null) {
        rCopy = new CVertLineTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
            rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo;//도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition == null)
            rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
            rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    }
    else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}
CVertLineTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndexIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;
    var strDateTime, nTextWidth, nTextXPosMargin = 4, nTextYPosMargin = 0;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {
        if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) || (nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_EndXIndex)) {
            return;
        }

        var PreStartXPos = this.m_StartXPos;
        var PreEndXPos = this.m_EndXPos;

        var yStartPos = null;
        var xStartPos = null;
        var yEndPos = null;
        var xEndPos = null;

        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined) {
            xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        } else {
            var strRQ = this.m_rRQSet.GetRQ();
            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined) {
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            } else {
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
            }
        }
        xStartPos = xEndPos;

        yStartPos = rectGraphRegion.m_nTop;
        yEndPos = rectGraphRegion.m_nBottom;

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        let XPos, YPos;
        XPos = Math.floor(xStartPos) + 0.5;
        YPos = Math.floor(yStartPos) + 0.5;        
        DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

        XPos = Math.floor(xEndPos) + 0.5;
        YPos = Math.floor(yEndPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        DrawingInfo.m_ScreenContext.stroke();

        if( this.m_ToolInfo.m_bShowTopText === true || this.m_ToolInfo.m_bShowBottomText === true )
        {
            DrawingInfo.m_ScreenContext.fillStyle = this.m_ToolInfo.m_clrTool;
            if( PreStartXPos !== xStartPos || this.m_ToolInfo.m_strEndDateTime === null )
            {
                strDateTime = GetStrDateTimeBytTime( rChartBlock.m_rGlobalProperty.GetTimeZone(), tEndDateTime, this.m_ToolInfo.m_Cycle, 1 );
                this.m_ToolInfo.m_strEndDateTime = this.m_ToolInfo.m_strStartDateTime = strDateTime;
            }
            else
                strDateTime = this.m_ToolInfo.m_strEndDateTime;

            nTextWidth = DrawingInfo.m_Context.measureText(strDateTime).width + 4;

            if( xStartPos + nTextWidth > rectGraphRegion.m_nRight )
            {
                DrawingInfo.m_ScreenContext.textAlign = "right";
                nTextXPosMargin *= -1;
            }
            else
                DrawingInfo.m_ScreenContext.textAlign = "left";                

            if( this.m_ToolInfo.m_bShowTopText )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "top";
                DrawingInfo.m_ScreenContext.fillText(strDateTime, xStartPos + nTextXPosMargin, yStartPos + nTextYPosMargin );
            }
            if( this.m_ToolInfo.m_bShowBottomText )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "bottom";
                DrawingInfo.m_ScreenContext.fillText(strDateTime, xEndPos + nTextXPosMargin, yEndPos - nTextYPosMargin );
            }
        }

        DrawingInfo.m_ScreenContext.restore();
    }
}

CVertLineTool.prototype.Draw = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIncludeRightMargin = rChartBlockCol.nViewEndIndexIncludeRightMargin;

    if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) || (nViewEndIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIncludeRightMargin < this.m_ToolInfo.m_EndXIndex)) {
        return;
    }

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;
    var strDateTime, nTextWidth, nTextXPosMargin = 4, nTextYPosMargin = 0;

    if (rXScaleMng.GetType() == DATETIME_TYPE) {

        var PreStartXPos = this.m_StartXPos;
        var PreEndXPos = this.m_EndXPos;

        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined) {
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        } else {
            var strRQ = this.m_rRQSet.GetRQ();
            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined) {
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            } else {
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
            }
        }
        this.m_StartXPos = this.m_EndXPos;

        this.m_StartYPos = rectGraphRegion.m_nTop;
        this.m_EndYPos = rectGraphRegion.m_nBottom;

        DrawingInfo.m_ScreenContext.beginPath();

        switch (this.m_ToolInfo.m_nToolLineType)
        {
            case PS_SOLID: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
            case PS_DASH: DrawingInfo.m_ScreenContext.setLineDash([8, 4]); break;
            case PS_DOT: DrawingInfo.m_ScreenContext.setLineDash([2, 3]); break;
            case PS_DASHDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]); break;
            case PS_DASHDOTDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]); break;
            default: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        }

        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        let XPos, YPos;
        XPos = Math.floor(this.m_StartXPos) + 0.5;
        YPos = Math.floor(this.m_StartYPos) + 0.5;        
        DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

        XPos = Math.floor(this.m_EndXPos) + 0.5;
        YPos = Math.floor(this.m_EndYPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        DrawingInfo.m_ScreenContext.stroke();

        if( this.m_ToolInfo.m_bShowTopText === true || this.m_ToolInfo.m_bShowBottomText === true )
        {
            DrawingInfo.m_ScreenContext.fillStyle = this.m_ToolInfo.m_clrTool;
            if( PreStartXPos !== this.m_StartXPos || this.m_ToolInfo.m_strEndDateTime === null || this.m_bReCalc === true )
            {
                this.m_bReCalc = false;
                strDateTime = GetStrDateTimeBytTime(rChartBlock.m_rGlobalProperty.GetTimeZone(), tEndDateTime, this.m_ToolInfo.m_Cycle, 1 );
                this.m_ToolInfo.m_strEndDateTime = this.m_ToolInfo.m_strStartDateTime = strDateTime;
            }
            else
                strDateTime = this.m_ToolInfo.m_strEndDateTime;

            nTextWidth = DrawingInfo.m_Context.measureText(strDateTime).width + 4;

            if( this.m_StartXPos + nTextWidth > rectGraphRegion.m_nRight )
            {
                DrawingInfo.m_ScreenContext.textAlign = "right";
                nTextXPosMargin *= -1;
            }
            else
                DrawingInfo.m_ScreenContext.textAlign = "left";                

            if( this.m_ToolInfo.m_bShowTopText )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "top";
                DrawingInfo.m_ScreenContext.fillText(strDateTime, this.m_StartXPos + nTextXPosMargin, this.m_StartYPos + nTextYPosMargin );
            }
            if( this.m_ToolInfo.m_bShowBottomText )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "bottom";
                DrawingInfo.m_ScreenContext.fillText(strDateTime, this.m_EndXPos + nTextXPosMargin, this.m_EndYPos - nTextYPosMargin );
            }
        }

        if (this.m_bSelected) {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();
        DrawingInfo.m_ScreenContext.setLineDash([0, 0]);

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CVertLineTool.prototype.IsInMine = function (X, Y) {

    var nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;

    if (X < (this.m_EndXPos - nMargin) || X > (this.m_EndXPos + nMargin)) {
        return false;
    }

    this.m_nHitTestPosInfo = LINE_POS;
    this.m_HitPosition = new CPoint(X, Y);

    return true;
}
CVertLineTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();            
            if (nGraphRegionWidth + nRightMargin > 0) {

                var rRQSet = rSelectedGraph.GetRQSet();
                var strRQ = rRQSet.GetRQ();

                //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                    nFindXIndex = 0;

                if (this.m_nHitTestPosInfo === LINE_POS) {
                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X || rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y) {
                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);
                }

                var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                if (rStartXIndexInBongRange) {
                    this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                    this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                    this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                    this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;

                    this.m_rXScaleMng = rXScaleMng;
                    this.m_rChartBlock = rChartBlock;
                }
            }
        }
    }
}

export function CCrossLineTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    var nXScaleType = rXScaleMng.m_nType;
    var KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    var Cycle = rRQSet.m_RQInfo.m_nCycle;
    var nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null;
    this.m_StartYPos = null;
    this.m_EndXPos = null;
    this.m_EndYPos = null;

    this.m_nIntervalBongCount = 0;//2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CBasicToolInfo(rXScaleMng.m_rChart.GetChartType(), CROSS_LINE_TOOL, nXScaleType, KeyCode, Cycle, nInterval);
}
CCrossLineTool.prototype = new CBaseTool();
CCrossLineTool.prototype.constructor = CCrossLineTool;

CCrossLineTool.prototype.Copy = function (rCopy) {

    if (rCopy == undefined || rCopy == null) {
        rCopy = new CCrossLineTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
            rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo;//도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition == null)
            rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
            rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    }
    else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}
CCrossLineTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {
    
    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndexIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    var nTextMargin = 2;
    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    var nTextMargin = 2;
    var strDateTime, nTextWidth, nTextXPosMargin = 4, nTextYPosMargin = 0;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) || (nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
            return;

        var yStartPos = null;
        var xStartPos = null;
        var yEndPos = null;
        var xEndPos = null;

        var PreStartXPos = this.m_StartXPos;
        var PreStartYPos = this.m_StartYPos;
        var PreEndXPos = this.m_EndXPos;
        var PreEndYPos = this.m_EndYPos;

        var strRQ = this.m_rRQSet.GetRQ();
        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {
            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined)
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        xStartPos = xEndPos;

        StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
        EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;
        
        yStartPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;

        if (bInvert === true)
        {
            yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
            yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
        }

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        let XPos, YPos;
        XPos = Math.floor(rectGraphRegion.m_nLeft) + 0.5;
        YPos = Math.floor(yStartPos) + 0.5;        
        DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

        XPos = Math.floor(rectGraphRegion.m_nRight) + 0.5;
        YPos = Math.floor(yEndPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        XPos = Math.floor(xStartPos) + 0.5;
        YPos = Math.floor(rectGraphRegion.m_nTop) + 0.5;        
        DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

        XPos = Math.floor(xEndPos) + 0.5;
        YPos = Math.floor(rectGraphRegion.m_nBottom) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        DrawingInfo.m_ScreenContext.stroke();

        if( this.m_ToolInfo.m_bShowTopText === true || this.m_ToolInfo.m_bShowBottomText === true )
        {
            DrawingInfo.m_ScreenContext.fillStyle = this.m_ToolInfo.m_clrTool;
            if( PreStartXPos !== xStartPos || this.m_ToolInfo.m_strEndDateTime === null )
            {
                strDateTime = GetStrDateTimeBytTime( rChartBlock.m_rGlobalProperty.GetTimeZone(), tEndDateTime, this.m_ToolInfo.m_Cycle, 1 );
                this.m_ToolInfo.m_strEndDateTime = this.m_ToolInfo.m_strStartDateTime = strDateTime;
            }
            else
                strDateTime = this.m_ToolInfo.m_strEndDateTime;
            
            nTextWidth = DrawingInfo.m_Context.measureText(strDateTime).width + 4;

            if( xStartPos + nTextWidth > rectGraphRegion.m_nRight )
            {
                DrawingInfo.m_ScreenContext.textAlign = "right";
                nTextXPosMargin *= -1;
            }
            else
                DrawingInfo.m_ScreenContext.textAlign = "left";                

            if( this.m_ToolInfo.m_bShowTopText )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "top";
                DrawingInfo.m_ScreenContext.fillText(strDateTime, xStartPos + nTextXPosMargin, rectGraphRegion.m_nTop + nTextYPosMargin );
            }
            if( this.m_ToolInfo.m_bShowBottomText )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "bottom";
                DrawingInfo.m_ScreenContext.fillText(strDateTime, xEndPos + nTextXPosMargin, rectGraphRegion.m_nBottom - nTextYPosMargin );
            }
        }

        if( this.m_ToolInfo.m_bShowLeftText === true || this.m_ToolInfo.m_bShowRightText === true )
        {
            DrawingInfo.m_ScreenContext.fillStyle = this.m_ToolInfo.m_clrTool;
            if( PreStartYPos !== yStartPos || this.m_ToolInfo.m_strEndValue === null )
                this.m_ToolInfo.m_strEndValue = ConvertNumToDigitText(this.m_ToolInfo.m_EndYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);

            if( yStartPos + DrawingInfo.m_nFontHeight > rectGraphRegion.m_nBottom )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "bottom";
                nTextMargin *= -1;
            }
            else
                DrawingInfo.m_ScreenContext.textBaseline = "top";

            if( this.m_ToolInfo.m_bShowLeftText )
            {
                DrawingInfo.m_ScreenContext.textAlign = "left";
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, rectGraphRegion.m_nLeft, yStartPos + nTextMargin );

            }
            if( this.m_ToolInfo.m_bShowRightText )
            {
                DrawingInfo.m_ScreenContext.textAlign = "right";
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, rectGraphRegion.m_nRight, yEndPos + nTextMargin );
            }
        }

        DrawingInfo.m_ScreenContext.restore();
    }
}

CCrossLineTool.prototype.Draw = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    var bDrawHozrLine = true;
    //x축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
        (nViewEndIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
        bDrawHozrLine = false;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;    

    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    var nTextMargin = 2;
    var strDateTime, nTextWidth, nTextXPosMargin = 4, nTextYPosMargin = 0;

    StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

    var bDrawVertLine = true;
    //y축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((StartYValue < yMin && EndYValue < yMin) ||
        (yMax < StartYValue && yMax < EndYValue))
        bDrawVertLine = false;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        var PreStartXPos = this.m_StartXPos;
        var PreStartYPos = this.m_StartYPos;
        var PreEndXPos = this.m_EndXPos;
        var PreEndYPos = this.m_EndYPos;

        var strRQ = this.m_rRQSet.GetRQ();
        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {
            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined)
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        this.m_StartXPos = this.m_EndXPos;

        this.m_StartYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;
        this.m_EndYPos = this.m_StartYPos;

        DrawingInfo.m_ScreenContext.beginPath();
        
        switch (this.m_ToolInfo.m_nToolLineType)
        {
            case PS_SOLID: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
            case PS_DASH: DrawingInfo.m_ScreenContext.setLineDash([8, 4]); break;
            case PS_DOT: DrawingInfo.m_ScreenContext.setLineDash([2, 3]); break;
            case PS_DASHDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]); break;
            case PS_DASHDOTDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]); break;            
            default: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        }

        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        let XPos, YPos;
        if( bDrawVertLine === true )
        {
            XPos = Math.floor(rectGraphRegion.m_nLeft) + 0.5;
            YPos = Math.floor(this.m_StartYPos) + 0.5;            
            DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

            XPos = Math.floor(rectGraphRegion.m_nRight) + 0.5;
            YPos = Math.floor(this.m_EndYPos) + 0.5;
            DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

            DrawingInfo.m_ScreenContext.stroke();
        }

        if( bDrawHozrLine === true )
        {
            XPos = Math.floor(this.m_StartXPos) + 0.5;
            YPos = Math.floor(rectGraphRegion.m_nTop) + 0.5;            
            DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

            XPos = Math.floor(this.m_EndXPos) + 0.5;
            YPos = Math.floor(rectGraphRegion.m_nBottom) + 0.5;
            DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

            DrawingInfo.m_ScreenContext.stroke();
        }

        if( this.m_ToolInfo.m_bShowTopText === true || this.m_ToolInfo.m_bShowBottomText === true )
        {
            DrawingInfo.m_ScreenContext.fillStyle = this.m_ToolInfo.m_clrTool;
            if( PreStartXPos !== this.m_StartXPos || this.m_ToolInfo.m_strEndDateTime === null || this.m_bReCalc === true )
            {
                strDateTime = GetStrDateTimeBytTime( rChartBlock.m_rGlobalProperty.GetTimeZone(), tEndDateTime, this.m_ToolInfo.m_Cycle, 1 );
                this.m_ToolInfo.m_strEndDateTime = this.m_ToolInfo.m_strStartDateTime = strDateTime;
            }
            else
                 strDateTime = this.m_ToolInfo.m_strEndDateTime;

            nTextWidth = DrawingInfo.m_Context.measureText(strDateTime).width + 4;

            if( this.m_StartXPos + nTextWidth > rectGraphRegion.m_nRight )
            {
                DrawingInfo.m_ScreenContext.textAlign = "right";
                nTextXPosMargin *= -1;
            }
            else
                DrawingInfo.m_ScreenContext.textAlign = "left";                

            if( this.m_ToolInfo.m_bShowTopText === true && bDrawHozrLine === true )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "top";
                DrawingInfo.m_ScreenContext.fillText(strDateTime, this.m_StartXPos + nTextXPosMargin, rectGraphRegion.m_nTop + nTextYPosMargin );
            }
            if( this.m_ToolInfo.m_bShowBottomText === true && bDrawHozrLine === true )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "bottom";
                DrawingInfo.m_ScreenContext.fillText(strDateTime, this.m_EndXPos + nTextXPosMargin, rectGraphRegion.m_nBottom - nTextYPosMargin );
            }
        }

        if( this.m_ToolInfo.m_bShowLeftText === true || this.m_ToolInfo.m_bShowRightText === true )
        {
            DrawingInfo.m_ScreenContext.fillStyle = this.m_ToolInfo.m_clrTool;
            
            if( PreStartYPos !== this.m_StartYPos || this.m_ToolInfo.m_strEndValue === null || this.m_bReCalc === true )
                this.m_ToolInfo.m_strEndValue = ConvertNumToDigitText(this.m_ToolInfo.m_EndYValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);

            if( this.m_StartYPos + DrawingInfo.m_nFontHeight > rectGraphRegion.m_nBottom )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "bottom";
                nTextMargin *= -1;
            }
            else
                DrawingInfo.m_ScreenContext.textBaseline = "top";

            if( this.m_ToolInfo.m_bShowLeftText === true && bDrawVertLine === true )
            {
                DrawingInfo.m_ScreenContext.textAlign = "left";
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, rectGraphRegion.m_nLeft, this.m_StartYPos + nTextMargin );

            }
            if( this.m_ToolInfo.m_bShowRightText === true && bDrawVertLine === true )
            {
                DrawingInfo.m_ScreenContext.textAlign = "right";
                DrawingInfo.m_ScreenContext.fillText(this.m_ToolInfo.m_strEndValue, rectGraphRegion.m_nRight, this.m_EndYPos + nTextMargin );
            }
        }

        this.m_bReCalc = false;

        if (this.m_bSelected) {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();
        DrawingInfo.m_ScreenContext.setLineDash([0, 0]);

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CCrossLineTool.prototype.IsInMine = function (X, Y) {

    var nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;

    if (X < (this.m_EndXPos - nMargin) && Y > (this.m_EndYPos + nMargin)) {
        return false;
    }

    if (X > (this.m_EndXPos + nMargin) && Y > (this.m_EndYPos + nMargin)) {
        return false;
    }

    if (X < (this.m_EndXPos - nMargin) && Y < (this.m_EndYPos - nMargin)) {
        return false;
    }

    if (X > (this.m_EndXPos + nMargin) && Y < (this.m_EndYPos - nMargin)) {
        return false;
    }

    this.m_nHitTestPosInfo = LINE_POS;
    this.m_HitPosition = new CPoint(X, Y);

    return true;
}
CCrossLineTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {

            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();
            
            if (nGraphRegionWidth + nRightMargin > 0) {

                var rYScale = rSelectedGraph.GetYScale();
                var rRQSet = rSelectedGraph.GetRQSet();

                //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                    nFindXIndex = 0;

                if (this.m_nHitTestPosInfo === LINE_POS) {

                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X || rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y ) {
                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);
                }

                var strRQ = rRQSet.GetRQ();
                var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                if (rStartXIndexInBongRange) {
                    //console.log("CCrossLineTool.OnMouseMove FindStartXIndex [nFindXIndex:" + nFindXIndex + ", StartXIndexInBongRange:" + rStartXIndexInBongRange.m_nFindXIndex + "]");

                    this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                    this.m_ToolInfo.m_StartYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                    this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;

                    this.m_ToolInfo.m_EndXIndex = this.m_ToolInfo.m_StartXIndex;
                    this.m_ToolInfo.m_EndYValue = this.m_ToolInfo.m_StartYValue;
                    this.m_ToolInfo.m_EndDateTimeT = this.m_ToolInfo.m_StartDateTimeT;

                    this.m_rXScaleMng = rXScaleMng;
                    this.m_rChartBlock = rChartBlock;
                }
            }
        }
    }
}

export function CRectTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    var nXScaleType = rXScaleMng.m_nType;
    var KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    var Cycle = rRQSet.m_RQInfo.m_nCycle;
    var nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null;
    this.m_StartYPos = null;
    this.m_EndXPos = null;
    this.m_EndYPos = null;

    this.m_nIntervalBongCount = 0;//2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CBasicToolInfo(rXScaleMng.m_rChart.GetChartType(), RECT_TOOL, nXScaleType, KeyCode, Cycle, nInterval);
}
CRectTool.prototype = new CBaseTool();
CRectTool.prototype.constructor = CRectTool;

CRectTool.prototype.Copy = function (rCopy) {

    if (rCopy == undefined || rCopy == null) {
        rCopy = new CRectTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
            rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo;//도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition == null)
            rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
            rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    }
    else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}
CRectTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIndexIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
            (nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
            return;

        var tStartDateTime = this.m_ToolInfo.m_StartDateTimeT;
        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;

        var yStartPos = null;
        var xStartPos = null;
        var yEndPos = null;
        var xEndPos = null;

        var strRQ = this.m_rRQSet.GetRQ();
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;        
        else {

            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];
            if (rStartRQPackets === undefined)
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined)
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
        EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

        yStartPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;

        if (bInvert === true)
        {
            yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
            yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
        }

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        let XPos1 = Math.floor(xStartPos) + 0.5;
        let YPos1 = Math.floor(yStartPos) + 0.5;
        let XPos2 = Math.floor(xEndPos) + 0.5;
        let YPos2 = Math.floor(yEndPos) + 0.5;
        DrawingInfo.m_ScreenContext.strokeRect(XPos1, YPos1, XPos2 - XPos1, YPos2 - YPos1);        

        DrawingInfo.m_ScreenContext.restore();
    }
}

CRectTool.prototype.Draw = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    //x축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
        (nViewEndIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
        return;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;    

    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

    //y축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((StartYValue < yMin && EndYValue < yMin) ||
        (yMax < StartYValue && yMax < EndYValue))
        return;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        //라인추세선의 시작점 시간과 끝점 시간을 얻어낸다
        var tStartDateTime = this.m_ToolInfo.m_StartDateTimeT;
        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;

        var strRQ = this.m_rRQSet.GetRQ();

        //시작점 시간에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {
            
            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];

            //시작점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rStartRQPackets === undefined)
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //시작점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //시작점의 y값에 대한 좌표계산
        this.m_StartYPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;


        //끝점 시간에 대한 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];

            //끝점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rEndRQPackets === undefined)
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //끝점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //끝점 y값에 대한 좌표계산
        this.m_EndYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_EndYPos = rectGraphRegion.m_nBottom - this.m_EndYPos + rectGraphRegion.m_nTop;

        DrawingInfo.m_ScreenContext.beginPath();

        switch (this.m_ToolInfo.m_nToolLineType)
        {
            case PS_SOLID: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
            case PS_DASH: DrawingInfo.m_ScreenContext.setLineDash([8, 4]); break;
            case PS_DOT: DrawingInfo.m_ScreenContext.setLineDash([2, 3]); break;
            case PS_DASHDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]); break;
            case PS_DASHDOTDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]); break;
            default: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        }

        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        let XPos1 = Math.floor(this.m_StartXPos) + 0.5;
        let YPos1 = Math.floor(this.m_StartYPos) + 0.5;
        let XPos2 = Math.floor(this.m_EndXPos) + 0.5;
        let YPos2 = Math.floor(this.m_EndYPos) + 0.5;
        DrawingInfo.m_ScreenContext.strokeRect(XPos1, YPos1, XPos2 - XPos1, YPos2 - YPos1);

        if (this.m_bSelected) {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();
        DrawingInfo.m_ScreenContext.setLineDash([0, 0]);

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CRectTool.prototype.IsInMine = function (X, Y) {

    var nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;
    if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin))) {
        //왼쪽 위
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin))) {
        //오른쪾 아래
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin))) {
        var tmp = this.m_EndYPos;
        this.m_EndYPos = this.m_StartYPos;
        this.m_StartYPos = tmp;

        tmp = this.m_ToolInfo.m_EndYValue;
        this.m_ToolInfo.m_EndYValue = this.m_ToolInfo.m_StartYValue;
        this.m_ToolInfo.m_StartYValue = tmp;

        //오른쪽 위
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin))) {
        var tmp = this.m_EndYPos;
        this.m_EndYPos = this.m_StartYPos;
        this.m_StartYPos = tmp;

        tmp = this.m_ToolInfo.m_EndYValue;
        this.m_ToolInfo.m_EndYValue = this.m_ToolInfo.m_StartYValue;
        this.m_ToolInfo.m_StartYValue = tmp;

        //왼쪽 아래
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    }

    var minX, minY, maxX, maxY;
    if (this.m_StartXPos <= this.m_EndXPos) {
        minX = this.m_StartXPos;
        maxX = this.m_EndXPos;
    } else {
        minX = this.m_EndXPos;
        maxX = this.m_StartXPos;
    }

    if (this.m_StartYPos <= this.m_EndYPos) {
        minY = this.m_StartYPos;
        maxY = this.m_EndYPos;
    } else {
        minY = this.m_EndYPos;
        maxY = this.m_StartYPos;
    }

    if (X < minX-nMargin || X > maxX+nMargin || Y < minY-nMargin || Y > maxY+nMargin) {
        return false;
    }

    this.m_nHitTestPosInfo = LINE_POS;
    this.m_HitPosition = new CPoint(X, Y);

    return true;
}
CRectTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {

            var rChartBlockCol = rSelectedGraph.m_rRQInCol.m_rChartBlockCol;
            var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
            var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
            var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();            
            if (nGraphRegionWidth + nRightMargin > 0) {

                ///////////////////////////////////////////////
                //모양이 변경되는 그리기 모드인 경우                    
                ///////////////////////////////////////////////
                if (this.m_nHitTestPosInfo === START_POS || this.m_nHitTestPosInfo === END_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.m_nViewEndIndex - rXScaleMng.m_nViewStartIndex + 1;

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    //console.log("CLineTool.OnMouseMove [X:" + X + ", nFindXIndex:" + nFindXIndex + "]");

                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                    
                    var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                    if (rStartXIndexInBongRange) {
                        //console.log("CLineTool.OnMouseMove FindStartXIndex [nFindXIndex:" + nFindXIndex + ", StartXIndexInBongRange:" + rStartXIndexInBongRange.m_nFindXIndex + "]");

                        if (this.m_nHitTestPosInfo === START_POS) {
                            this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_StartYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }
                        else if (this.m_nHitTestPosInfo === END_POS) {
                            this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;
                    }                                        
                }
                else if (this.m_nHitTestPosInfo === LINE_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.GetViewDataCnt();

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
                    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
                    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X ||
                        rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y )
                    {

                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);

                    //if (this.m_HitPosition.m_X < rChartBlock.m_rectGraphRegion.m_nLeft)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nLeft;
                    //else if (rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < this.m_HitPosition.m_X)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin ;

                    //이전 클릭위치와 현재 클릭위치 차이로 이동거리와 방향 계산
                    var DeltaXPos = X - this.m_HitPosition.m_X;
                    var DeltaYPos = Y - this.m_HitPosition.m_Y;

                    var MaxXIndex = null, MinXIndex = null;
                    var NewMaxXIndex = null, NewMinXIndex = null;

                    var NewMaxDateTime = null, NewMinDateTime = null;
                    var MaxDateTime = null, MinDateTime = null;

                    var MaxY = null, MinY = null;
                    var NewMaxY = null, NewMinY = null;

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nHitXIndex = GetXIndexByXPos(this.m_HitPosition.m_X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    var nCurXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                        MaxXIndex = this.m_ToolInfo.m_EndXIndex;
                        MaxY = this.m_EndYPos;
                        MaxDateTime = this.m_ToolInfo.m_EndDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_StartXIndex;
                        MinY = this.m_StartYPos;
                        MinDateTime = this.m_ToolInfo.m_StartDateTimeT;
                    }
                    else {

                        MaxXIndex = this.m_ToolInfo.m_StartXIndex;
                        MaxY = this.m_StartYPos;
                        MaxDateTime = this.m_ToolInfo.m_StartDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_EndXIndex;
                        MinY = this.m_EndYPos;
                        MinDateTime = this.m_ToolInfo.m_EndDateTimeT;
                    }

                    //우측이동
                    if (DeltaXPos > 0) {

                        ////////////////////////////////////////////////////////////
                        //미래영역에서도 그려져야 하므로 이 부분 주석처리
                        //var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                        //현재 마우스 위치가 전체데이터 개수를 넘어가면 마지막 위치로 이동
                        //if (nCurXIndex >= nTotalCnt)
                        //    nCurXIndex = nTotalCnt - 1;
                        ////////////////////////////////////////////////////////////

                        //이전 클릭위치(nHitXIndex)가 속한 봉의 위치 찾기
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nHitXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 1번");
                            return;
                        }
                        nHitXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nHitXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //nHitXIndex부터 nCurXIndex까지의 이동 봉거리 계산

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        var nMoveBongCnt = this.CountMoveBongCnt(nHitXIndex, nCurXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {

                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //우측으로 이동시 우측 MaxIndex부터 카운트
                        var bIsUpper = (nHitXIndex <= MaxXIndex ? true : false);
                        var rResult = this.MoveUpperIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        //MinIndex를 우측으로 nMoveBongCnt 실봉개수만큼 이동                        
                        bIsUpper = (nHitXIndex <= MinXIndex ? true : false);
                        rResult = this.MoveUpperIndex(MinXIndex, MinDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;

                        //y pixel정보를 이용하여 y 가격 계산
                        NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMinXIndex + "," + NewMaxXIndex + ")");

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMaxXIndex + "," + NewMinXIndex + ")");

                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                    else if (DeltaXPos < 0) {
                        if (nCurXIndex < 0)
                            nCurXIndex = 0;

                        //현재 클릭위치(nCurXIndex)가 속한 봉의 위치찾기
                        //(nCurXIndex를 포함하고 있는 봉의 시작Index 찾아 nCurXIndex에 셋팅)
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nCurXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 2번");
                            return;
                        }
                        nCurXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nCurXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        //nCurXInde로 부터 nHitXIndex까지의 실제 봉의 개수 카운트(nCurXIndex 봉은 카운트하지 않고 nHitXIndex위치 봉은 카운트)
                        var nMoveBongCnt = this.CountMoveBongCnt(nCurXIndex, nHitXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {
                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }
                        
                        //nMoveBongCnt만큼 양 끝점 이동시키기
                        var bIsUpper = (nCurXIndex < MinXIndex) ? true : false;
                        var rResult = this.MoveLowerIndex(MinXIndex, MinDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        bIsUpper = (nCurXIndex < MaxXIndex) ? true : false;
                        rResult = this.MoveLowerIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;

                        NewMaxY = GetYValueByYPos((MaxY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos((MinY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                }
            }
        }
    }
}

export function CCircleTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    var nXScaleType = rXScaleMng.m_nType;
    var KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    var Cycle = rRQSet.m_RQInfo.m_nCycle;
    var nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null;
    this.m_StartYPos = null;
    this.m_EndXPos = null;
    this.m_EndYPos = null;

    this.m_nIntervalBongCount = 0;//2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CBasicToolInfo(rXScaleMng.m_rChart.GetChartType(), CIRCLE_TOOL, nXScaleType, KeyCode, Cycle, nInterval);
}
CCircleTool.prototype = new CBaseTool();
CCircleTool.prototype.constructor = CCircleTool;

CCircleTool.prototype.Copy = function (rCopy) {

    if (rCopy == undefined || rCopy == null) {
        rCopy = new CCircleTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
            rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo;//도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition == null)
            rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
            rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    }
    else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}
CCircleTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIndexIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
            (nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
            return;

        var tStartDateTime = this.m_ToolInfo.m_StartDateTimeT;
        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;

        var yStartPos = null;
        var xStartPos = null;
        var yEndPos = null;
        var xEndPos = null;

        var strRQ = this.m_rRQSet.GetRQ();
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;        
        else {

            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];
            if (rStartRQPackets === undefined)
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined)
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
        EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

        yStartPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;

        if (bInvert === true)
        {
            yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
            yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
        }

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        var x = xStartPos;
        var y = yStartPos;
        var w = xEndPos-xStartPos;
        var h = yEndPos-yStartPos;

        var kappa = .5522848;
        var ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = xEndPos,           // x-end
        ye = yEndPos,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle

        DrawingInfo.m_ScreenContext.moveTo(x, ym);
        DrawingInfo.m_ScreenContext.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        DrawingInfo.m_ScreenContext.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        DrawingInfo.m_ScreenContext.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        DrawingInfo.m_ScreenContext.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        DrawingInfo.m_ScreenContext.closePath();
        DrawingInfo.m_ScreenContext.stroke();

        DrawingInfo.m_ScreenContext.restore();
    }
}

CCircleTool.prototype.Draw = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    //x축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
        (nViewEndIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
        return;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;    

    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }
    
    StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

    //y축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((StartYValue < yMin && EndYValue < yMin) ||
        (yMax < StartYValue && yMax < EndYValue))
        return;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        //라인추세선의 시작점 시간과 끝점 시간을 얻어낸다
        var tStartDateTime = this.m_ToolInfo.m_StartDateTimeT;
        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;

        var strRQ = this.m_rRQSet.GetRQ();

        //시작점 시간에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {
            
            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];

            //시작점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rStartRQPackets === undefined)
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //시작점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //시작점의 y값에 대한 좌표계산
        this.m_StartYPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;

        //끝점 시간에 대한 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];

            //끝점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rEndRQPackets === undefined)
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //끝점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //끝점 y값에 대한 좌표계산
        this.m_EndYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_EndYPos = rectGraphRegion.m_nBottom - this.m_EndYPos + rectGraphRegion.m_nTop;

        DrawingInfo.m_ScreenContext.beginPath();

        switch (this.m_ToolInfo.m_nToolLineType)
        {
            case PS_SOLID: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
            case PS_DASH: DrawingInfo.m_ScreenContext.setLineDash([8, 4]); break;
            case PS_DOT: DrawingInfo.m_ScreenContext.setLineDash([2, 3]); break;
            case PS_DASHDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]); break;
            case PS_DASHDOTDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]); break;            
            default: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        }

        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        var x = this.m_StartXPos;
        var y = this.m_StartYPos;
        var w = this.m_EndXPos-this.m_StartXPos;
        var h = this.m_EndYPos-this.m_StartYPos;

        var kappa = .5522848;
        var ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa,     // control point offset vertical
        xe = this.m_EndXPos,      // x-end
        ye = this.m_EndYPos,      // y-end
        xm = x + w / 2,           // x-middle
        ym = y + h / 2;           // y-middle

        DrawingInfo.m_ScreenContext.moveTo(x, ym);
        DrawingInfo.m_ScreenContext.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        DrawingInfo.m_ScreenContext.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        DrawingInfo.m_ScreenContext.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        DrawingInfo.m_ScreenContext.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        DrawingInfo.m_ScreenContext.closePath();
        DrawingInfo.m_ScreenContext.stroke();

        if (this.m_bSelected) {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.setLineDash([0, 0]);

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CCircleTool.prototype.IsInMine = function (X, Y) {

    var nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;
    if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin))) {
        //왼쪽 위
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin))) {
        //오른쪾 아래
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin))) {
        var tmp = this.m_EndYPos;
        this.m_EndYPos = this.m_StartYPos;
        this.m_StartYPos = tmp;

        tmp = this.m_ToolInfo.m_EndYValue;
        this.m_ToolInfo.m_EndYValue = this.m_ToolInfo.m_StartYValue;
        this.m_ToolInfo.m_StartYValue = tmp;

        //오른쪽 위
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin))) {
        var tmp = this.m_EndYPos;
        this.m_EndYPos = this.m_StartYPos;
        this.m_StartYPos = tmp;

        tmp = this.m_ToolInfo.m_EndYValue;
        this.m_ToolInfo.m_EndYValue = this.m_ToolInfo.m_StartYValue;
        this.m_ToolInfo.m_StartYValue = tmp;

        //왼쪽 아래
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    }

    var minX, minY, maxX, maxY;
    if (this.m_StartXPos <= this.m_EndXPos) {
        minX = this.m_StartXPos;
        maxX = this.m_EndXPos;
    } else {
        minX = this.m_EndXPos;
        maxX = this.m_StartXPos;
    }

    if (this.m_StartYPos <= this.m_EndYPos) {
        minY = this.m_StartYPos;
        maxY = this.m_EndYPos;
    } else {
        minY = this.m_EndYPos;
        maxY = this.m_StartYPos;
    }

    if (X < minX-nMargin || X > maxX+nMargin || Y < minY-nMargin || Y > maxY+nMargin) {
        return false;
    }

    this.m_nHitTestPosInfo = LINE_POS;
    this.m_HitPosition = new CPoint(X, Y);

    return true;
}
CCircleTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {

            var rChartBlockCol = rSelectedGraph.m_rRQInCol.m_rChartBlockCol;
            var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
            var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
            var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();            
            if (nGraphRegionWidth + nRightMargin > 0) {

                ///////////////////////////////////////////////
                //모양이 변경되는 그리기 모드인 경우                    
                ///////////////////////////////////////////////
                if (this.m_nHitTestPosInfo === START_POS || this.m_nHitTestPosInfo === END_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.m_nViewEndIndex - rXScaleMng.m_nViewStartIndex + 1;

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    //console.log("CLineTool.OnMouseMove [X:" + X + ", nFindXIndex:" + nFindXIndex + "]");

                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                    
                    var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                    if (rStartXIndexInBongRange) {
                        //console.log("CLineTool.OnMouseMove FindStartXIndex [nFindXIndex:" + nFindXIndex + ", StartXIndexInBongRange:" + rStartXIndexInBongRange.m_nFindXIndex + "]");

                        if (this.m_nHitTestPosInfo === START_POS) {
                            this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_StartYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }
                        else if (this.m_nHitTestPosInfo === END_POS) {
                            this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;
                    }                                        
                }
                else if (this.m_nHitTestPosInfo === LINE_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.GetViewDataCnt();

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
                    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
                    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X ||
                        rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y )
                    {

                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);

                    //if (this.m_HitPosition.m_X < rChartBlock.m_rectGraphRegion.m_nLeft)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nLeft;
                    //else if (rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < this.m_HitPosition.m_X)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin ;

                    //이전 클릭위치와 현재 클릭위치 차이로 이동거리와 방향 계산
                    var DeltaXPos = X - this.m_HitPosition.m_X;
                    var DeltaYPos = Y - this.m_HitPosition.m_Y;

                    var MaxXIndex = null, MinXIndex = null;
                    var NewMaxXIndex = null, NewMinXIndex = null;

                    var NewMaxDateTime = null, NewMinDateTime = null;
                    var MaxDateTime = null, MinDateTime = null;

                    var MaxY = null, MinY = null;
                    var NewMaxY = null, NewMinY = null;

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nHitXIndex = GetXIndexByXPos(this.m_HitPosition.m_X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    var nCurXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                        MaxXIndex = this.m_ToolInfo.m_EndXIndex;
                        MaxY = this.m_EndYPos;
                        MaxDateTime = this.m_ToolInfo.m_EndDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_StartXIndex;
                        MinY = this.m_StartYPos;
                        MinDateTime = this.m_ToolInfo.m_StartDateTimeT;
                    }
                    else {

                        MaxXIndex = this.m_ToolInfo.m_StartXIndex;
                        MaxY = this.m_StartYPos;
                        MaxDateTime = this.m_ToolInfo.m_StartDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_EndXIndex;
                        MinY = this.m_EndYPos;
                        MinDateTime = this.m_ToolInfo.m_EndDateTimeT;
                    }

                    //우측이동
                    if (DeltaXPos > 0) {

                        ////////////////////////////////////////////////////////////
                        //미래영역에서도 그려져야 하므로 이 부분 주석처리
                        //var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                        //현재 마우스 위치가 전체데이터 개수를 넘어가면 마지막 위치로 이동
                        //if (nCurXIndex >= nTotalCnt)
                        //    nCurXIndex = nTotalCnt - 1;
                        ////////////////////////////////////////////////////////////

                        //이전 클릭위치(nHitXIndex)가 속한 봉의 위치 찾기
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nHitXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 1번");
                            return;
                        }
                        nHitXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nHitXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //nHitXIndex부터 nCurXIndex까지의 이동 봉거리 계산

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        var nMoveBongCnt = this.CountMoveBongCnt(nHitXIndex, nCurXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {

                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //우측으로 이동시 우측 MaxIndex부터 카운트
                        var bIsUpper = (nHitXIndex <= MaxXIndex ? true : false);
                        var rResult = this.MoveUpperIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        //MinIndex를 우측으로 nMoveBongCnt 실봉개수만큼 이동                        
                        bIsUpper = (nHitXIndex <= MinXIndex ? true : false);
                        rResult = this.MoveUpperIndex(MinXIndex, MinDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;

                        //y pixel정보를 이용하여 y 가격 계산
                        NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMinXIndex + "," + NewMaxXIndex + ")");

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMaxXIndex + "," + NewMinXIndex + ")");

                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                    else if (DeltaXPos < 0) {
                        if (nCurXIndex < 0)
                            nCurXIndex = 0;

                        //현재 클릭위치(nCurXIndex)가 속한 봉의 위치찾기
                        //(nCurXIndex를 포함하고 있는 봉의 시작Index 찾아 nCurXIndex에 셋팅)
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nCurXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 2번");
                            return;
                        }
                        nCurXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nCurXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        //nCurXInde로 부터 nHitXIndex까지의 실제 봉의 개수 카운트(nCurXIndex 봉은 카운트하지 않고 nHitXIndex위치 봉은 카운트)
                        var nMoveBongCnt = this.CountMoveBongCnt(nCurXIndex, nHitXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {
                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }
                        
                        //nMoveBongCnt만큼 양 끝점 이동시키기
                        var bIsUpper = (nCurXIndex < MinXIndex) ? true : false;
                        var rResult = this.MoveLowerIndex(MinXIndex, MinDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        bIsUpper = (nCurXIndex < MaxXIndex) ? true : false;
                        rResult = this.MoveLowerIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;

                        NewMaxY = GetYValueByYPos((MaxY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos((MinY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                }
            }
        }
    }
}

export function CTriangleTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    var nXScaleType = rXScaleMng.m_nType;
    var KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    var Cycle = rRQSet.m_RQInfo.m_nCycle;
    var nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null;
    this.m_StartYPos = null;
    this.m_EndXPos = null;
    this.m_EndYPos = null;

    this.m_nIntervalBongCount = 0;//2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CBasicToolInfo(rXScaleMng.m_rChart.GetChartType(), TRIANGLE_TOOL, nXScaleType, KeyCode, Cycle, nInterval);
}
CTriangleTool.prototype = new CBaseTool();
CTriangleTool.prototype.constructor = CTriangleTool;

CTriangleTool.prototype.Copy = function (rCopy) {

    if (rCopy == undefined || rCopy == null) {
        rCopy = new CTriangleTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
            rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo;//도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition == null)
            rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
            rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    }
    else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}
CTriangleTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIndexIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
            (nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIndexIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
            return;

        var tStartDateTime = this.m_ToolInfo.m_StartDateTimeT;
        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;

        var yStartPos = null;
        var xStartPos = null;
        var yEndPos = null;
        var xEndPos = null;

        var strRQ = this.m_rRQSet.GetRQ();
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;        
        else {

            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];
            if (rStartRQPackets === undefined)
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined)
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
        EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

        yStartPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;

        if (bInvert === true)
        {
            yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
            yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
        }

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        let XPos, YPos;
        XPos = Math.floor((xStartPos + xEndPos) / 2) + 0.5;
        YPos = Math.floor(yStartPos) + 0.5;
        DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

        XPos = Math.floor(xStartPos) + 0.5;
        YPos = Math.floor(yEndPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        XPos = Math.floor(xEndPos) + 0.5;
        YPos = Math.floor(yEndPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        XPos = Math.floor((xStartPos + xEndPos) / 2) + 0.5;
        YPos = Math.floor(yStartPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        DrawingInfo.m_ScreenContext.stroke();

        DrawingInfo.m_ScreenContext.restore();
    }
}

CTriangleTool.prototype.Draw = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    //x축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
        (nViewEndIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
        return;

    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;    

    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();  
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }
    
    StartYValue = bLog === true ? Log(this.m_ToolInfo.m_StartYValue) : this.m_ToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(this.m_ToolInfo.m_EndYValue) : this.m_ToolInfo.m_EndYValue;

    //y축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((StartYValue < yMin && EndYValue < yMin) ||
        (yMax < StartYValue && yMax < EndYValue))
        return;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        //라인추세선의 시작점 시간과 끝점 시간을 얻어낸다
        var tStartDateTime = this.m_ToolInfo.m_StartDateTimeT;
        var tEndDateTime = this.m_ToolInfo.m_EndDateTimeT;

        var strRQ = this.m_rRQSet.GetRQ();

        //시작점 시간에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {
            
            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];

            //시작점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rStartRQPackets === undefined)
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //시작점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //시작점의 y값에 대한 좌표계산
        this.m_StartYPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;


        //끝점 시간에 대한 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];

            //끝점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rEndRQPackets === undefined)
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //끝점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //끝점 y값에 대한 좌표계산
        this.m_EndYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_EndYPos = rectGraphRegion.m_nBottom - this.m_EndYPos + rectGraphRegion.m_nTop;

        DrawingInfo.m_ScreenContext.beginPath();

        switch (this.m_ToolInfo.m_nToolLineType)
        {
            case PS_SOLID: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
            case PS_DASH: DrawingInfo.m_ScreenContext.setLineDash([8, 4]); break;
            case PS_DOT: DrawingInfo.m_ScreenContext.setLineDash([2, 3]); break;
            case PS_DASHDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]); break;
            case PS_DASHDOTDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]); break;
            default: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        }

        DrawingInfo.m_ScreenContext.strokeStyle = this.m_ToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = this.m_ToolInfo.m_nThickness;

        let XPos, YPos;
        XPos = Math.floor((this.m_StartXPos + this.m_EndXPos) / 2) + 0.5;
        YPos = Math.floor(this.m_StartYPos) + 0.5;
        DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

        XPos = Math.floor(this.m_StartXPos) + 0.5;
        YPos = Math.floor(this.m_EndYPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        XPos = Math.floor(this.m_EndXPos) + 0.5;
        YPos = Math.floor(this.m_EndYPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        XPos = Math.floor((this.m_StartXPos + this.m_EndXPos) / 2) + 0.5;
        YPos = Math.floor(this.m_StartYPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);
        
        DrawingInfo.m_ScreenContext.stroke();

        if (this.m_bSelected) {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();
        DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
        
        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CTriangleTool.prototype.IsInMine = function (X, Y) {

    var nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;
    if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin))) {
        //왼쪽 위
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin))) {
        //오른쪾 아래
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    }

    var minX, minY, maxX, maxY;
    if (this.m_StartXPos <= this.m_EndXPos) {
        minX = this.m_StartXPos;
        maxX = this.m_EndXPos;
    } else {
        minX = this.m_EndXPos;
        maxX = this.m_StartXPos;
    }
    if (this.m_StartYPos <= this.m_EndYPos) {
        minY = this.m_StartYPos;
        maxY = this.m_EndYPos;
    } else {
        minY = this.m_EndYPos;
        maxY = this.m_StartYPos;
    }
    
    if (X < minX-nMargin || X > maxX+nMargin || Y < minY-nMargin || Y > maxY+nMargin) {
        return false;
    }

    this.m_nHitTestPosInfo = LINE_POS;
    this.m_HitPosition = new CPoint(X, Y);

    return true;
}
CTriangleTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {

            var rChartBlockCol = rSelectedGraph.m_rRQInCol.m_rChartBlockCol;
            var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
            var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
            var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();            
            if (nGraphRegionWidth + nRightMargin > 0) {

                ///////////////////////////////////////////////
                //모양이 변경되는 그리기 모드인 경우                    
                ///////////////////////////////////////////////
                if (this.m_nHitTestPosInfo === START_POS || this.m_nHitTestPosInfo === END_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.m_nViewEndIndex - rXScaleMng.m_nViewStartIndex + 1;

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    //console.log("CLineTool.OnMouseMove [X:" + X + ", nFindXIndex:" + nFindXIndex + "]");

                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                    
                    var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                    if (rStartXIndexInBongRange) {
                        //console.log("CLineTool.OnMouseMove FindStartXIndex [nFindXIndex:" + nFindXIndex + ", StartXIndexInBongRange:" + rStartXIndexInBongRange.m_nFindXIndex + "]");

                        if (this.m_nHitTestPosInfo === START_POS) {
                            this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_StartYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }
                        else if (this.m_nHitTestPosInfo === END_POS) {
                            this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;
                    }                                        
                }
                else if (this.m_nHitTestPosInfo === LINE_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.GetViewDataCnt();

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
                    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
                    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X ||
                        rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y )
                    {

                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);

                    //if (this.m_HitPosition.m_X < rChartBlock.m_rectGraphRegion.m_nLeft)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nLeft;
                    //else if (rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < this.m_HitPosition.m_X)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin ;

                    //이전 클릭위치와 현재 클릭위치 차이로 이동거리와 방향 계산
                    var DeltaXPos = X - this.m_HitPosition.m_X;
                    var DeltaYPos = Y - this.m_HitPosition.m_Y;

                    var MaxXIndex = null, MinXIndex = null;
                    var NewMaxXIndex = null, NewMinXIndex = null;

                    var NewMaxDateTime = null, NewMinDateTime = null;
                    var MaxDateTime = null, MinDateTime = null;

                    var MaxY = null, MinY = null;
                    var NewMaxY = null, NewMinY = null;

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nHitXIndex = GetXIndexByXPos(this.m_HitPosition.m_X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    var nCurXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                        MaxXIndex = this.m_ToolInfo.m_EndXIndex;
                        MaxY = this.m_EndYPos;
                        MaxDateTime = this.m_ToolInfo.m_EndDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_StartXIndex;
                        MinY = this.m_StartYPos;
                        MinDateTime = this.m_ToolInfo.m_StartDateTimeT;
                    }
                    else {

                        MaxXIndex = this.m_ToolInfo.m_StartXIndex;
                        MaxY = this.m_StartYPos;
                        MaxDateTime = this.m_ToolInfo.m_StartDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_EndXIndex;
                        MinY = this.m_EndYPos;
                        MinDateTime = this.m_ToolInfo.m_EndDateTimeT;
                    }

                    //우측이동
                    if (DeltaXPos > 0) {

                        ////////////////////////////////////////////////////////////
                        //미래영역에서도 그려져야 하므로 이 부분 주석처리
                        //var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                        //현재 마우스 위치가 전체데이터 개수를 넘어가면 마지막 위치로 이동
                        //if (nCurXIndex >= nTotalCnt)
                        //    nCurXIndex = nTotalCnt - 1;
                        ////////////////////////////////////////////////////////////

                        //이전 클릭위치(nHitXIndex)가 속한 봉의 위치 찾기
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nHitXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 1번");
                            return;
                        }
                        nHitXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nHitXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //nHitXIndex부터 nCurXIndex까지의 이동 봉거리 계산

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        var nMoveBongCnt = this.CountMoveBongCnt(nHitXIndex, nCurXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {

                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //우측으로 이동시 우측 MaxIndex부터 카운트
                        var bIsUpper = (nHitXIndex <= MaxXIndex ? true : false);
                        var rResult = this.MoveUpperIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        //MinIndex를 우측으로 nMoveBongCnt 실봉개수만큼 이동                        
                        bIsUpper = (nHitXIndex <= MinXIndex ? true : false);
                        rResult = this.MoveUpperIndex(MinXIndex, MinDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;

                        //y pixel정보를 이용하여 y 가격 계산
                        NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMinXIndex + "," + NewMaxXIndex + ")");

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMaxXIndex + "," + NewMinXIndex + ")");

                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                    else if (DeltaXPos < 0) {
                        if (nCurXIndex < 0)
                            nCurXIndex = 0;

                        //현재 클릭위치(nCurXIndex)가 속한 봉의 위치찾기
                        //(nCurXIndex를 포함하고 있는 봉의 시작Index 찾아 nCurXIndex에 셋팅)
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nCurXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 2번");
                            return;
                        }
                        nCurXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nCurXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        //nCurXInde로 부터 nHitXIndex까지의 실제 봉의 개수 카운트(nCurXIndex 봉은 카운트하지 않고 nHitXIndex위치 봉은 카운트)
                        var nMoveBongCnt = this.CountMoveBongCnt(nCurXIndex, nHitXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {
                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }
                        
                        //nMoveBongCnt만큼 양 끝점 이동시키기
                        var bIsUpper = (nCurXIndex < MinXIndex) ? true : false;
                        var rResult = this.MoveLowerIndex(MinXIndex, MinDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        bIsUpper = (nCurXIndex < MaxXIndex) ? true : false;
                        rResult = this.MoveLowerIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;

                        NewMaxY = GetYValueByYPos((MaxY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos((MinY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                }
            }
        }
    }
}

export function CTrisectionLineTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    const nXScaleType = rXScaleMng.m_nType;
    const KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    const Cycle = rRQSet.m_RQInfo.m_nCycle;
    const nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null; // 툴 시작지점 X
    this.m_StartYPos = null; // 툴 시작지점 Y
    this.m_EndXPos = null; // 툴 종료지점 X
    this.m_EndYPos = null; // 툴 종료지점 Y

    this.m_nIntervalBongCount = 0; //2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CBasicToolInfo(rXScaleMng.m_rChart.GetChartType(), TRISECT_LINE_TOOL, nXScaleType, KeyCode, Cycle, nInterval);

    this.m_arrEqualDivision = [ 0, 33, 67, 100 ];
    this.m_LineStartXPos = null; // 라인 시작지점 X
    this.m_LineEndXPos = null; // 라인 끝지점 X
    this.m_arrLineEndYPos = []; // 비율로 계산한 라인 끝지점 Y
    this.m_stArrLineYValue = [];
}

CTrisectionLineTool.prototype = new CBaseTool();
CTrisectionLineTool.prototype.constructor = this;

CTrisectionLineTool.prototype.Copy = function (rCopy) {

    if (rCopy === undefined || rCopy === null) {
        rCopy = new CTrisectionLineTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
        rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo; //도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition === null)
        rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
        rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    } else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}

CTrisectionLineTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

    const rXScaleMng = this.m_rXScaleMng;
    const rChartBlock = this.m_rChartBlock;
    const rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    const rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    const nViewStartIndex = rXScaleMng.m_nViewStartIndex;

    const rToolInfo = this.m_ToolInfo;
    const rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    const nGraphRegionHeight = rectGraphRegion.Height();
    const nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    const rYScale = rChartBlock.GetSelectedYScale();
    const bLog = rYScale.GetLog();
    const bInvert = rYScale.GetInvert();
    let yMin, yMax, yDiff, StartYValue, EndYValue;

    if (bLog === true)
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    if (rXScaleMng.GetType() === DATETIME_TYPE)
    {
        const tStartDateTime = rToolInfo.m_StartDateTimeT;
        const tEndDateTime = rToolInfo.m_EndDateTimeT;
        const nTextMargin = 10;

        let yStartPos = null;
        let xStartPos = null;
        let yEndPos = null;
        let xEndPos = null;

        const strRQ = this.m_rRQSet.GetRQ();
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else
        {
            const rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];
            if (rStartRQPackets === undefined)
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else
        {
            const rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined)
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        if( rToolInfo.m_bUsePriceRange === true && this.m_rRQSet.m_rPriceIndicator.m_rBlock === this.m_rChartBlock )
        {
            let nStartIndex = null, nEndIndex = null, bCheck = false;;
            if( rToolInfo.m_StartXIndex > rToolInfo.m_EndXIndex )
            {
                nStartIndex = rToolInfo.m_EndXIndex;
                nEndIndex = rToolInfo.m_StartXIndex;
                bCheck = true;
            }
            else
            {
                nStartIndex = rToolInfo.m_StartXIndex;
                nEndIndex = rToolInfo.m_EndXIndex;
            }

            gMinMaxInfo.Init();
            let Min = null, Max = null;
            if( rXScaleMng.ExtractMinMaxValueByIndex( strRQ, '_HIGH_', gMinMaxInfo, nStartIndex, nEndIndex ) === true )
                Max = gMinMaxInfo.m_Max;
            if( rXScaleMng.ExtractMinMaxValueByIndex( strRQ, '_LOW_', gMinMaxInfo, nStartIndex, nEndIndex ) === true )
                Min = gMinMaxInfo.m_Min;
            
            if( Max !== null && Min !== null )
            {
                if( bCheck === true )
                {
                    rToolInfo.m_StartYValue = Min;
                    rToolInfo.m_EndYValue = Max;
                }
                else
                {
                    rToolInfo.m_StartYValue = Max;
                    rToolInfo.m_EndYValue = Min;
                }
            }
        }

        StartYValue = bLog === true ? Log(rToolInfo.m_StartYValue) : rToolInfo.m_StartYValue;
        EndYValue = bLog === true ? Log(rToolInfo.m_EndYValue) : rToolInfo.m_EndYValue;

        yStartPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;

        if (bInvert === true)
        {
            yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
            yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
        }

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

        let bReverseIdx = false;
        let YPointDiff = 0, OrgYPos, strText, LeftTextXPos, RightTextXPos;
        let LineStartXPos, LineEndXPos, LineStartYPos, LineEndYPos, XPos, YPos;
        let nEqualDivisionValue = 0, LineStartYValue = 0, LineEndYValue = 0, YValueDiff = 0, nYScaleValue = 0;
        if (xEndPos >= xStartPos)
        {
            LeftTextXPos = LineStartXPos = xStartPos;
            LineStartYPos = yStartPos;
            RightTextXPos = LineEndXPos = xEndPos;
            LineEndYPos = OrgYPos = yEndPos;
            YPointDiff = yEndPos - yStartPos;

            LineStartYValue = rToolInfo.m_StartYValue;
            LineEndYValue = rToolInfo.m_EndYValue;
            YValueDiff = LineEndYValue - LineStartYValue;

            if( yEndPos < yStartPos )
                bReverseIdx = true;
        }
        else
        {
            LeftTextXPos = LineStartXPos = xEndPos;
            LineStartYPos = yEndPos;
            RightTextXPos = LineEndXPos = xStartPos;
            LineEndYPos = OrgYPos = yStartPos;
            YPointDiff = yStartPos - yEndPos;

            LineStartYValue = rToolInfo.m_EndYValue;
            LineEndYValue = rToolInfo.m_StartYValue;
            YValueDiff = LineEndYValue - LineStartYValue;

            if( yStartPos < yEndPos )
                bReverseIdx = true;
        }

        // 시작점 ~ 끝점을 연결하는 선
        XPos = Math.floor(LineStartXPos) + 0.5;
        YPos = Math.floor(LineStartYPos) + 0.5;
        DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

        XPos = Math.floor(LineEndXPos) + 0.5;
        YPos = Math.floor(LineEndYPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        const nLineCount = this.m_arrEqualDivision.length;
        let nRtextIndex = 0;
        if( bReverseIdx === true )
            nRtextIndex = nLineCount - 1;
        
        for (let i = 0; i < nLineCount; i++)
        {
            nEqualDivisionValue = this.m_arrEqualDivision[i];
            const length = YPointDiff * nEqualDivisionValue / 100;
            YPos = Math.floor(OrgYPos - length) + 0.5;

            if( rToolInfo.m_bExpandLeft === true )
                LineStartXPos = rectGraphRegion.m_nLeft;
            if( rToolInfo.m_bExpandRight === true )
                LineEndXPos = rectGraphRegion.m_nRight;
            
            DrawingInfo.m_ScreenContext.moveTo(LineStartXPos, YPos);
            DrawingInfo.m_ScreenContext.lineTo(LineEndXPos, YPos);

            if( rToolInfo.m_bShowLeftText === true )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "right";

                if (nEqualDivisionValue !== 0)
                {
                    if (nEqualDivisionValue > 100)
                         nYScaleValue = LineStartYValue + (YValueDiff * (nEqualDivisionValue - 100) / 100);
                    if (nEqualDivisionValue < 100)
                        nYScaleValue = LineStartYValue + (YValueDiff * (100 - nEqualDivisionValue) / 100);
                    else
                        nYScaleValue = LineStartYValue;
                }
                else
                    nYScaleValue = LineEndYValue;

                strText = ConvertNumToDigitText(nYScaleValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                DrawingInfo.m_ScreenContext.fillText(strText, LeftTextXPos - nTextMargin, YPos );
            }

            if( rToolInfo.m_bShowRightText === true )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "left";

                strText = "" + this.m_arrEqualDivision[nRtextIndex] + " %";
                DrawingInfo.m_ScreenContext.fillText(strText, RightTextXPos + nTextMargin, YPos);

                if( bReverseIdx === true )
                    nRtextIndex--;
                else
                    nRtextIndex++;
            }
        }

        DrawingInfo.m_ScreenContext.stroke();
        DrawingInfo.m_ScreenContext.restore();
    }
}

CTrisectionLineTool.prototype.Draw = function (DrawingInfo) {

    const rXScaleMng = this.m_rXScaleMng;
    const rChartBlock = this.m_rChartBlock;

    const rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    const rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;
    const nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    const rToolInfo = this.m_ToolInfo;
    const rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    const nGraphRegionHeight = rectGraphRegion.Height();
    const nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    const nTextMargin = 8;
    const rYScale = rChartBlock.GetSelectedYScale();
    const bLog = rYScale.GetLog();
    const bInvert = rYScale.GetInvert();
    const strRQ = this.m_rRQSet.GetRQ();
    let yMin, yMax, yDiff, StartYValue, EndYValue;

    if (bLog === true) {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    } else {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    if( rToolInfo.m_bUsePriceRange === true && this.m_bReCalc === true && rXScaleMng.GetType() === DATETIME_TYPE
        && this.m_rRQSet.m_rPriceIndicator.m_rBlock === this.m_rChartBlock )
    {
        let nStartIndex = null, nEndIndex = null, bCheck = false;;
        if( rToolInfo.m_StartXIndex > rToolInfo.m_EndXIndex )
        {
            nStartIndex = rToolInfo.m_EndXIndex;
            nEndIndex = rToolInfo.m_StartXIndex;
            bCheck = true;
        }
        else
        {
            nStartIndex = rToolInfo.m_StartXIndex;
            nEndIndex = rToolInfo.m_EndXIndex;
        }

        gMinMaxInfo.Init();
        let Min = null, Max = null;
        if( rXScaleMng.ExtractMinMaxValueByIndex( strRQ, '_HIGH_', gMinMaxInfo, nStartIndex, nEndIndex ) === true )
            Max = gMinMaxInfo.m_Max;
        if( rXScaleMng.ExtractMinMaxValueByIndex( strRQ, '_LOW_', gMinMaxInfo, nStartIndex, nEndIndex ) === true )
            Min = gMinMaxInfo.m_Min;
        
        if( Max !== null && Min !== null )
        {
            if( bCheck === true )
            {
                rToolInfo.m_StartYValue = Min;
                rToolInfo.m_EndYValue = Max;
            }
            else
            {
                rToolInfo.m_StartYValue = Max;
                rToolInfo.m_EndYValue = Min;
            }
        }
    }

    StartYValue = bLog === true ? Log(rToolInfo.m_StartYValue) : rToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(rToolInfo.m_EndYValue) : rToolInfo.m_EndYValue;

    //y축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((StartYValue < yMin && EndYValue < yMin) ||
        (yMax < StartYValue && yMax < EndYValue))
        return;

    var PreStartXPos = this.m_StartXPos;
    var PreStartYPos = this.m_StartYPos;
    var PreEndXPos = this.m_EndXPos;
    var PreEndYPos = this.m_EndYPos;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        //라인추세선의 시작점 시간과 끝점 시간을 얻어낸다
        const tStartDateTime = rToolInfo.m_StartDateTimeT;
        const tEndDateTime = rToolInfo.m_EndDateTimeT;        

        //시작점 시간에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

        const rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];

        //시작점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rStartRQPackets === undefined)
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        //시작점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
        else
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //시작점의 y값에 대한 좌표계산
        this.m_StartYPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;

        //끝점 시간에 대한 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else
        {
            const rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];

            //끝점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rEndRQPackets === undefined)
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //끝점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //끝점 y값에 대한 좌표계산
        this.m_EndYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_EndYPos = rectGraphRegion.m_nBottom - this.m_EndYPos + rectGraphRegion.m_nTop;

        DrawingInfo.m_ScreenContext.beginPath();

        switch (rToolInfo.m_nToolLineType) {
        case PS_SOLID:
            DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
            break;
        case PS_DASH:
            DrawingInfo.m_ScreenContext.setLineDash([8, 4]);
            break;
        case PS_DOT:
            DrawingInfo.m_ScreenContext.setLineDash([2, 3]);
            break;
        case PS_DASHDOT:
            DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]);
            break;
        case PS_DASHDOTDOT:
            DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]);
            break;
        default:
            DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
            break;
        }

        DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

        let bReverseIdx = false;
        let YPointDiff = 0, OrgYPos, strText, LeftTextXPos, RightTextXPos;
        let LineStartXPos, LineEndXPos, LineStartYPos, LineEndYPos, XPos, YPos;
        let nEqualDivisionValue = 0, LineStartYValue = 0, LineEndYValue = 0, YValueDiff = 0, nYScaleValue = 0;
        if (this.m_EndXPos >= this.m_StartXPos)
        {
            LeftTextXPos = LineStartXPos = this.m_StartXPos;
            LineStartYPos = this.m_StartYPos;
            RightTextXPos = LineEndXPos = this.m_EndXPos;
            LineEndYPos = OrgYPos = this.m_EndYPos;
            YPointDiff = this.m_EndYPos - this.m_StartYPos;

            LineStartYValue = rToolInfo.m_StartYValue;
            LineEndYValue = rToolInfo.m_EndYValue;
            YValueDiff = LineEndYValue - LineStartYValue;

            if( this.m_EndYPos < this.m_StartYPos )
                bReverseIdx = true;
        }
        else
        {
            LeftTextXPos = LineStartXPos = this.m_EndXPos;
            LineStartYPos = this.m_EndYPos;
            RightTextXPos = LineEndXPos = this.m_StartXPos;
            LineEndYPos = OrgYPos = this.m_StartYPos;
            YPointDiff = this.m_StartYPos - this.m_EndYPos;

            LineStartYValue = rToolInfo.m_EndYValue;
            LineEndYValue = rToolInfo.m_StartYValue;
            YValueDiff = LineEndYValue - LineStartYValue;

            if( this.m_StartYPos < this.m_EndYPos )
                bReverseIdx = true;
        }

        // 시작점 ~ 끝점을 연결하는 선
        if (this.m_bSelected)
        {
            XPos = Math.floor(LineStartXPos) + 0.5;
            YPos = Math.floor(LineStartYPos) + 0.5;
            DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

            XPos = Math.floor(LineEndXPos) + 0.5;
            YPos = Math.floor(LineEndYPos) + 0.5;
            DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);
        }

        const nLineCount = this.m_arrEqualDivision.length;
        let nRtextIndex = 0;
        if( bReverseIdx === true )
            nRtextIndex = nLineCount - 1;

        for (let i = 0; i < nLineCount; i++)
        {
             nEqualDivisionValue = this.m_arrEqualDivision[i];
            const length = YPointDiff * nEqualDivisionValue / 100;
            LineEndYPos = OrgYPos - length;

            if( rToolInfo.m_bExpandLeft === true )
                LineStartXPos = rectGraphRegion.m_nLeft;
            if( rToolInfo.m_bExpandRight === true )
                LineEndXPos = rectGraphRegion.m_nRight;

            this.m_LineStartXPos = LineStartXPos;
            this.m_LineEndXPos = LineEndXPos;
            this.m_arrLineEndYPos[i] = Math.floor(LineEndYPos) + 0.5;
            DrawingInfo.m_ScreenContext.moveTo(this.m_LineStartXPos, this.m_arrLineEndYPos[i]);
            DrawingInfo.m_ScreenContext.lineTo(this.m_LineEndXPos, this.m_arrLineEndYPos[i]);

            if( rToolInfo.m_bShowLeftText === true )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "right";

                if( this.m_StartYPos != PreStartYPos || this.m_EndYPos !== PreEndYPos || this.m_bReCalc === true ||
                    this.m_stArrLineYValue[i] === null || this.m_stArrLineYValue[i] === undefined )
                {
                    if (nEqualDivisionValue !== 0)
                    {
                        if (nEqualDivisionValue > 100)
                            nYScaleValue = LineStartYValue + (YValueDiff * (nEqualDivisionValue - 100) / 100);
                        if (nEqualDivisionValue < 100)
                            nYScaleValue = LineStartYValue + (YValueDiff * (100 - nEqualDivisionValue) / 100);
                        else
                            nYScaleValue = LineStartYValue;
                    }
                    else
                        nYScaleValue = LineEndYValue;
                    this.m_stArrLineYValue[i] = ConvertNumToDigitText(nYScaleValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                }
                
                DrawingInfo.m_ScreenContext.fillText(this.m_stArrLineYValue[i], LeftTextXPos - nTextMargin, this.m_arrLineEndYPos[i] );
            }

            if( rToolInfo.m_bShowRightText === true )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "left";

                strText = "" + this.m_arrEqualDivision[nRtextIndex] + " %";
                DrawingInfo.m_ScreenContext.fillText(strText, RightTextXPos + nTextMargin, this.m_arrLineEndYPos[i]);

                if( bReverseIdx === true )
                    nRtextIndex--;
                else
                    nRtextIndex++;
            }
        }

        DrawingInfo.m_ScreenContext.stroke();

        this.m_bReCalc = false;

        if (this.m_bSelected)
        {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CTrisectionLineTool.prototype.IsInMine = function (X, Y) {

    let bIsInMine = false;

    const nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;
    if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin)))
    {
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin)))
    {
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    }

    var DeltaX = this.m_StartXPos - this.m_EndXPos;
    if (this.m_StartXPos <= this.m_EndXPos) {
        if (X < (this.m_StartXPos - nMargin) || (this.m_EndXPos + nMargin) < X)
            return false;
    }
    else {
        if (X < (this.m_EndXPos - nMargin) || (this.m_StartXPos + nMargin) < X)
            return false;
    }

    if (this.m_StartYPos <= this.m_EndYPos) {
        if (Y < (this.m_StartYPos - nMargin) || (this.m_EndYPos + nMargin) < Y)
            return false;
    }
    else {
        if (Y < (this.m_EndYPos - nMargin) || (this.m_StartYPos + nMargin) < Y)
            return false;
    }

    if (Math.abs(DeltaX) > nMargin) {
        var a = (this.m_StartYPos - this.m_EndYPos) / DeltaX;//console.log("X:" + X + ", Y:" + Y + " " + "a(" + a + ")=(" + this.m_EndYPos + "-" + this.m_StartYPos + ")/(" + this.m_EndXPos + "-" + this.m_StartXPos + ")");
        var b = (this.m_StartYPos - a * this.m_StartXPos);//console.log("b(" + b + ")=(" + this.m_StartYPos + "-" + a + " * " + this.m_StartXPos + ")");
        var CalcY = a * X + b; //console.log("CalcY(" + CalcY + ")=(" + a + "*" + X + " + " + b + "), Y=" + Y);
        //console.log((CalcY - nMargin) + "<=" + Y + " && " + Y + "<=" + (CalcY + nMargin));
        if ((CalcY - nMargin) <= Y && Y <= (CalcY + nMargin)) { 
            bIsInMine = true;
        }
    } else {
        //수직으로 추세선이 그려진 경우는 상단 X, Y 범위 검사로 충분
        bIsInMine = true;
    }

    if (bIsInMine === true) {
        this.m_nHitTestPosInfo = LINE_POS;
        this.m_HitPosition = new CPoint(X, Y);
        return bIsInMine;
    }

    const nLineCount = this.m_arrEqualDivision.length;
    for (let i = 0; i < nLineCount; i++)
    {
        if ((this.m_LineStartXPos - nMargin) <= X && X <= (this.m_LineEndXPos + nMargin)
        && (this.m_arrLineEndYPos[i] - nMargin) <= Y && Y <= (this.m_arrLineEndYPos[i] + nMargin))
            bIsInMine = true;
    }

    if (bIsInMine)
    {
        this.m_nHitTestPosInfo = LINE_POS;
        this.m_HitPosition = new CPoint(X, Y);
    }

    return bIsInMine;
}

CTrisectionLineTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {

            var rChartBlockCol = rSelectedGraph.m_rRQInCol.m_rChartBlockCol;
            var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
            var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
            var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();
            if (nGraphRegionWidth + nRightMargin > 0) {

                ///////////////////////////////////////////////
                //모양이 변경되는 그리기 모드인 경우
                ///////////////////////////////////////////////
                if (this.m_nHitTestPosInfo === START_POS || this.m_nHitTestPosInfo === END_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.m_nViewEndIndex - rXScaleMng.m_nViewStartIndex + 1;

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    //console.log("CLineTool.OnMouseMove [X:" + X + ", nFindXIndex:" + nFindXIndex + "]");

                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                    
                    var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                    if (rStartXIndexInBongRange) {
                        //console.log("CLineTool.OnMouseMove FindStartXIndex [nFindXIndex:" + nFindXIndex + ", StartXIndexInBongRange:" + rStartXIndexInBongRange.m_nFindXIndex + "]");

                        if (this.m_nHitTestPosInfo === START_POS) {
                            this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_StartYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }
                        else if (this.m_nHitTestPosInfo === END_POS) {
                            this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;
                    }
                }
                else if (this.m_nHitTestPosInfo === LINE_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.GetViewDataCnt();

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
                    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
                    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X ||
                        rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y )
                    {

                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);

                    //if (this.m_HitPosition.m_X < rChartBlock.m_rectGraphRegion.m_nLeft)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nLeft;
                    //else if (rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < this.m_HitPosition.m_X)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin ;

                    //이전 클릭위치와 현재 클릭위치 차이로 이동거리와 방향 계산
                    var DeltaXPos = X - this.m_HitPosition.m_X;
                    var DeltaYPos = Y - this.m_HitPosition.m_Y;

                    var MaxXIndex = null, MinXIndex = null;
                    var NewMaxXIndex = null, NewMinXIndex = null;

                    var NewMaxDateTime = null, NewMinDateTime = null;
                    var MaxDateTime = null, MinDateTime = null;

                    var MaxY = null, MinY = null;
                    var NewMaxY = null, NewMinY = null;

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nHitXIndex = GetXIndexByXPos(this.m_HitPosition.m_X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    var nCurXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                        MaxXIndex = this.m_ToolInfo.m_EndXIndex;
                        MaxY = this.m_EndYPos;
                        MaxDateTime = this.m_ToolInfo.m_EndDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_StartXIndex;
                        MinY = this.m_StartYPos;
                        MinDateTime = this.m_ToolInfo.m_StartDateTimeT;
                    }
                    else {

                        MaxXIndex = this.m_ToolInfo.m_StartXIndex;
                        MaxY = this.m_StartYPos;
                        MaxDateTime = this.m_ToolInfo.m_StartDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_EndXIndex;
                        MinY = this.m_EndYPos;
                        MinDateTime = this.m_ToolInfo.m_EndDateTimeT;
                    }

                    //우측이동
                    if (DeltaXPos > 0) {

                        ////////////////////////////////////////////////////////////
                        //미래영역에서도 그려져야 하므로 이 부분 주석처리
                        //var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                        //현재 마우스 위치가 전체데이터 개수를 넘어가면 마지막 위치로 이동
                        //if (nCurXIndex >= nTotalCnt)
                        //    nCurXIndex = nTotalCnt - 1;
                        ////////////////////////////////////////////////////////////

                        //이전 클릭위치(nHitXIndex)가 속한 봉의 위치 찾기
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nHitXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 1번");
                            return;
                        }
                        nHitXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nHitXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //nHitXIndex부터 nCurXIndex까지의 이동 봉거리 계산

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        var nMoveBongCnt = this.CountMoveBongCnt(nHitXIndex, nCurXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {

                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //우측으로 이동시 우측 MaxIndex부터 카운트
                        var bIsUpper = (nHitXIndex <= MaxXIndex ? true : false);
                        var rResult = this.MoveUpperIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        //MinIndex를 우측으로 nMoveBongCnt 실봉개수만큼 이동
                        bIsUpper = (nHitXIndex <= MinXIndex ? true : false);
                        rResult = this.MoveUpperIndex(MinXIndex, MinDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;

                        //y pixel정보를 이용하여 y 가격 계산
                        NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMinXIndex + "," + NewMaxXIndex + ")");

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMaxXIndex + "," + NewMinXIndex + ")");

                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                    else if (DeltaXPos < 0) {
                        if (nCurXIndex < 0)
                            nCurXIndex = 0;

                        //현재 클릭위치(nCurXIndex)가 속한 봉의 위치찾기
                        //(nCurXIndex를 포함하고 있는 봉의 시작Index 찾아 nCurXIndex에 셋팅)
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nCurXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 2번");
                            return;
                        }
                        nCurXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nCurXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        //nCurXInde로 부터 nHitXIndex까지의 실제 봉의 개수 카운트(nCurXIndex 봉은 카운트하지 않고 nHitXIndex위치 봉은 카운트)
                        var nMoveBongCnt = this.CountMoveBongCnt(nCurXIndex, nHitXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {
                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }
                        
                        //nMoveBongCnt만큼 양 끝점 이동시키기
                        var bIsUpper = (nCurXIndex < MinXIndex) ? true : false;
                        var rResult = this.MoveLowerIndex(MinXIndex, MinDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        bIsUpper = (nCurXIndex < MaxXIndex) ? true : false;
                        rResult = this.MoveLowerIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;

                        NewMaxY = GetYValueByYPos((MaxY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos((MinY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                }
            }
        }
    }
}

export function CQuadrisectLineTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    const nXScaleType = rXScaleMng.m_nType;
    const KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    const Cycle = rRQSet.m_RQInfo.m_nCycle;
    const nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null; // 툴 시작지점 X
    this.m_StartYPos = null; // 툴 시작지점 Y
    this.m_EndXPos = null; // 툴 종료지점 X
    this.m_EndYPos = null; // 툴 종료지점 Y

    this.m_nIntervalBongCount = 0; //2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CBasicToolInfo(rXScaleMng.m_rChart.GetChartType(), QUARTER_LINE_TOOL, nXScaleType, KeyCode, Cycle, nInterval);

    this.m_arrEqualDivision = [ 0, 25, 50, 75, 100 ];
    this.m_LineStartXPos = null; // 라인 시작지점 X
    this.m_LineEndXPos = null; // 라인 끝지점 X
    this.m_arrLineEndYPos = []; // 비율로 계산한 라인 끝지점 Y
    this.m_stArrLineYValue = [];
}

CQuadrisectLineTool.prototype = new CBaseTool();
CQuadrisectLineTool.prototype.constructor = this;

CQuadrisectLineTool.prototype.Copy = function (rCopy) {

    if (rCopy === undefined || rCopy === null) {
        rCopy = new CQuadrisectLineTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
        rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo; //도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition === null)
        rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
        rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    } else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}

CQuadrisectLineTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

    const rXScaleMng = this.m_rXScaleMng;
    const rChartBlock = this.m_rChartBlock;
    const rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    const rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    const nViewStartIndex = rXScaleMng.m_nViewStartIndex;

    const rToolInfo = this.m_ToolInfo;
    const rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    const nGraphRegionHeight = rectGraphRegion.Height();
    const nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    const rYScale = rChartBlock.GetSelectedYScale();
    const bLog = rYScale.GetLog();
    const bInvert = rYScale.GetInvert();
    let yMin, yMax, yDiff, StartYValue, EndYValue;

    if (bLog === true)
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    if (rXScaleMng.GetType() === DATETIME_TYPE)
    {
        const tStartDateTime = rToolInfo.m_StartDateTimeT;
        const tEndDateTime = rToolInfo.m_EndDateTimeT;
        const nTextMargin = 10;

        let yStartPos = null;
        let xStartPos = null;
        let yEndPos = null;
        let xEndPos = null;

        const strRQ = this.m_rRQSet.GetRQ();
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else
        {
            const rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];
            if (rStartRQPackets === undefined)
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else
        {
            const rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined)
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        if( rToolInfo.m_bUsePriceRange === true && this.m_rRQSet.m_rPriceIndicator.m_rBlock === this.m_rChartBlock )
        {
            let nTotalDataCount = rXScaleMng.m_XScaleMergeArray.length;
            let nStartIndex = null, nEndIndex = null, bCheck = false;;
            if( rToolInfo.m_StartXIndex > rToolInfo.m_EndXIndex )
            {
                nStartIndex = rToolInfo.m_EndXIndex;
                nEndIndex = rToolInfo.m_StartXIndex;
                bCheck = true;
            }
            else
            {
                nStartIndex = rToolInfo.m_StartXIndex;
                nEndIndex = rToolInfo.m_EndXIndex;
            }

            if( nStartIndex > nTotalDataCount - 1 )
                nStartIndex = nTotalDataCount - 1;
            if( nEndIndex > nTotalDataCount - 1 )
                nEndIndex = nTotalDataCount - 1;

            gMinMaxInfo.Init();
            let Min = null, Max = null;
            if( rXScaleMng.ExtractMinMaxValueByIndex( strRQ, '_HIGH_', gMinMaxInfo, nStartIndex, nEndIndex ) === true )
                Max = gMinMaxInfo.m_Max;
            if( rXScaleMng.ExtractMinMaxValueByIndex( strRQ, '_LOW_', gMinMaxInfo, nStartIndex, nEndIndex ) === true )
                Min = gMinMaxInfo.m_Min;
            
            if( Max !== null && Min !== null )
            {
                if( bCheck === true )
                {
                    rToolInfo.m_StartYValue = Min;
                    rToolInfo.m_EndYValue = Max;
                }
                else
                {
                    rToolInfo.m_StartYValue = Max;
                    rToolInfo.m_EndYValue = Min;
                }
            }
        }

        StartYValue = bLog === true ? Log(rToolInfo.m_StartYValue) : rToolInfo.m_StartYValue;
        EndYValue = bLog === true ? Log(rToolInfo.m_EndYValue) : rToolInfo.m_EndYValue;

        yStartPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;

        if (bInvert === true)
        {
            yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
            yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
        }

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

        let bReverseIdx = false;
        let YPointDiff = 0, OrgYPos, strText, LeftTextXPos, RightTextXPos;
        let LineStartXPos, LineEndXPos, LineStartYPos, LineEndYPos, XPos, YPos;
        let nEqualDivisionValue = 0, LineStartYValue = 0, LineEndYValue = 0, YValueDiff = 0, nYScaleValue = 0;
        if (xEndPos >= xStartPos)
        {
            LeftTextXPos = LineStartXPos = xStartPos;
            LineStartYPos = yStartPos;
            RightTextXPos = LineEndXPos = xEndPos;
            LineEndYPos = OrgYPos = yEndPos;
            YPointDiff = yEndPos - yStartPos;

            LineStartYValue = rToolInfo.m_StartYValue;
            LineEndYValue = rToolInfo.m_EndYValue;
            YValueDiff = LineEndYValue - LineStartYValue;

            if( yEndPos < yStartPos )
                bReverseIdx = true;
        }
        else
        {
            LeftTextXPos = LineStartXPos = xEndPos;
            LineStartYPos = yEndPos;
            RightTextXPos = LineEndXPos = xStartPos;
            LineEndYPos = OrgYPos = yStartPos;
            YPointDiff = yStartPos - yEndPos;

            LineStartYValue = rToolInfo.m_EndYValue;
            LineEndYValue = rToolInfo.m_StartYValue;
            YValueDiff = LineEndYValue - LineStartYValue;

            if( yStartPos < yEndPos )
                bReverseIdx = true;
        }

        // 시작점 ~ 끝점을 연결하는 선
        XPos = Math.floor(LineStartXPos) + 0.5;
        YPos = Math.floor(LineStartYPos) + 0.5;
        DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

        XPos = Math.floor(LineEndXPos) + 0.5;
        YPos = Math.floor(LineEndYPos) + 0.5;
        DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

        const nLineCount = this.m_arrEqualDivision.length;
        let nRtextIndex = 0;
        if( bReverseIdx === true )
            nRtextIndex = nLineCount - 1;
        
        for (let i = 0; i < nLineCount; i++)
        {
            nEqualDivisionValue = this.m_arrEqualDivision[i];
            const length = YPointDiff * nEqualDivisionValue / 100;
            YPos = Math.floor(OrgYPos - length) + 0.5;

            if( rToolInfo.m_bExpandLeft === true )
                LineStartXPos = rectGraphRegion.m_nLeft;
            if( rToolInfo.m_bExpandRight === true )
                LineEndXPos = rectGraphRegion.m_nRight;
            
            DrawingInfo.m_ScreenContext.moveTo(LineStartXPos, YPos);
            DrawingInfo.m_ScreenContext.lineTo(LineEndXPos, YPos);

            if( rToolInfo.m_bShowLeftText === true )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "right";

                if (nEqualDivisionValue !== 0)
                {
                    if (nEqualDivisionValue > 100)
                         nYScaleValue = LineStartYValue + (YValueDiff * (nEqualDivisionValue - 100) / 100);
                    if (nEqualDivisionValue < 100)
                        nYScaleValue = LineStartYValue + (YValueDiff * (100 - nEqualDivisionValue) / 100);
                    else
                        nYScaleValue = LineStartYValue;
                }
                else
                    nYScaleValue = LineEndYValue;

                strText = ConvertNumToDigitText(nYScaleValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                DrawingInfo.m_ScreenContext.fillText(strText, LeftTextXPos - nTextMargin, YPos );
            }

            if( rToolInfo.m_bShowRightText === true )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "left";

                strText = "" + this.m_arrEqualDivision[nRtextIndex] + " %";
                DrawingInfo.m_ScreenContext.fillText(strText, RightTextXPos + nTextMargin, YPos);

                if( bReverseIdx === true )
                    nRtextIndex--;
                else
                    nRtextIndex++;
            }
        }

        DrawingInfo.m_ScreenContext.stroke();
        DrawingInfo.m_ScreenContext.restore();
    }
}

CQuadrisectLineTool.prototype.Draw = function (DrawingInfo) {

    const rXScaleMng = this.m_rXScaleMng;
    const rChartBlock = this.m_rChartBlock;

    const rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    const rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;
    const nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    const rToolInfo = this.m_ToolInfo;
    const rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    const nGraphRegionHeight = rectGraphRegion.Height();
    const nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    const nTextMargin = 8;
    const rYScale = rChartBlock.GetSelectedYScale();
    const bLog = rYScale.GetLog();
    const bInvert = rYScale.GetInvert();
    const strRQ = this.m_rRQSet.GetRQ();
    let yMin, yMax, yDiff, StartYValue, EndYValue;

    if (bLog === true) {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    } else {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    if( rToolInfo.m_bUsePriceRange === true && this.m_bReCalc === true && rXScaleMng.GetType() === DATETIME_TYPE
        && this.m_rRQSet.m_rPriceIndicator.m_rBlock === this.m_rChartBlock )
    {
        let nStartIndex = null, nEndIndex = null, bCheck = false;;
        if( rToolInfo.m_StartXIndex > rToolInfo.m_EndXIndex )
        {
            nStartIndex = rToolInfo.m_EndXIndex;
            nEndIndex = rToolInfo.m_StartXIndex;
            bCheck = true;
        }
        else
        {
            nStartIndex = rToolInfo.m_StartXIndex;
            nEndIndex = rToolInfo.m_EndXIndex;
        }

        gMinMaxInfo.Init();
        let Min = null, Max = null;
        if( rXScaleMng.ExtractMinMaxValueByIndex( strRQ, '_HIGH_', gMinMaxInfo, nStartIndex, nEndIndex ) === true )
            Max = gMinMaxInfo.m_Max;
        if( rXScaleMng.ExtractMinMaxValueByIndex( strRQ, '_LOW_', gMinMaxInfo, nStartIndex, nEndIndex ) === true )
            Min = gMinMaxInfo.m_Min;
        
        if( Max !== null && Min !== null )
        {
            if( bCheck === true )
            {
                rToolInfo.m_StartYValue = Min;
                rToolInfo.m_EndYValue = Max;
            }
            else
            {
                rToolInfo.m_StartYValue = Max;
                rToolInfo.m_EndYValue = Min;
            }
        }
    }

    StartYValue = bLog === true ? Log(rToolInfo.m_StartYValue) : rToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(rToolInfo.m_EndYValue) : rToolInfo.m_EndYValue;

    //y축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((StartYValue < yMin && EndYValue < yMin) ||
        (yMax < StartYValue && yMax < EndYValue))
        return;

    var PreStartXPos = this.m_StartXPos;
    var PreStartYPos = this.m_StartYPos;
    var PreEndXPos = this.m_EndXPos;
    var PreEndYPos = this.m_EndYPos;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        //라인추세선의 시작점 시간과 끝점 시간을 얻어낸다
        const tStartDateTime = rToolInfo.m_StartDateTimeT;
        const tEndDateTime = rToolInfo.m_EndDateTimeT;        

        //시작점 시간에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

        const rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];

        //시작점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rStartRQPackets === undefined)
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        //시작점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
        else
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //시작점의 y값에 대한 좌표계산
        this.m_StartYPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;

        //끝점 시간에 대한 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else
        {
            const rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];

            //끝점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rEndRQPackets === undefined)
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //끝점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //끝점 y값에 대한 좌표계산
        this.m_EndYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_EndYPos = rectGraphRegion.m_nBottom - this.m_EndYPos + rectGraphRegion.m_nTop;

        DrawingInfo.m_ScreenContext.beginPath();

        switch (rToolInfo.m_nToolLineType) {
        case PS_SOLID:
            DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
            break;
        case PS_DASH:
            DrawingInfo.m_ScreenContext.setLineDash([8, 4]);
            break;
        case PS_DOT:
            DrawingInfo.m_ScreenContext.setLineDash([2, 3]);
            break;
        case PS_DASHDOT:
            DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]);
            break;
        case PS_DASHDOTDOT:
            DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]);
            break;
        default:
            DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
            break;
        }

        DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

        let bReverseIdx = false;
        let YPointDiff = 0, OrgYPos, strText, LeftTextXPos, RightTextXPos;
        let LineStartXPos, LineEndXPos, LineStartYPos, LineEndYPos, XPos, YPos;
        let nEqualDivisionValue = 0, LineStartYValue = 0, LineEndYValue = 0, YValueDiff = 0, nYScaleValue = 0;
        if (this.m_EndXPos >= this.m_StartXPos)
        {
            LeftTextXPos = LineStartXPos = this.m_StartXPos;
            LineStartYPos = this.m_StartYPos;
            RightTextXPos = LineEndXPos = this.m_EndXPos;
            LineEndYPos = OrgYPos = this.m_EndYPos;
            YPointDiff = this.m_EndYPos - this.m_StartYPos;

            LineStartYValue = rToolInfo.m_StartYValue;
            LineEndYValue = rToolInfo.m_EndYValue;
            YValueDiff = LineEndYValue - LineStartYValue;

            if( this.m_EndYPos < this.m_StartYPos )
                bReverseIdx = true;
        }
        else
        {
            LeftTextXPos = LineStartXPos = this.m_EndXPos;
            LineStartYPos = this.m_EndYPos;
            RightTextXPos = LineEndXPos = this.m_StartXPos;
            LineEndYPos = OrgYPos = this.m_StartYPos;
            YPointDiff = this.m_StartYPos - this.m_EndYPos;

            LineStartYValue = rToolInfo.m_EndYValue;
            LineEndYValue = rToolInfo.m_StartYValue;
            YValueDiff = LineEndYValue - LineStartYValue;

            if( this.m_StartYPos < this.m_EndYPos )
                bReverseIdx = true;
        }

        // 시작점 ~ 끝점을 연결하는 선
        if (this.m_bSelected)
        {
            XPos = Math.floor(LineStartXPos) + 0.5;
            YPos = Math.floor(LineStartYPos) + 0.5;
            DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

            XPos = Math.floor(LineEndXPos) + 0.5;
            YPos = Math.floor(LineEndYPos) + 0.5;
            DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);
        }

        const nLineCount = this.m_arrEqualDivision.length;
        let nRtextIndex = 0;
        if( bReverseIdx === true )
            nRtextIndex = nLineCount - 1;

        for (let i = 0; i < nLineCount; i++)
        {
             nEqualDivisionValue = this.m_arrEqualDivision[i];
            const length = YPointDiff * nEqualDivisionValue / 100;
            LineEndYPos = OrgYPos - length;

            if( rToolInfo.m_bExpandLeft === true )
                LineStartXPos = rectGraphRegion.m_nLeft;
            if( rToolInfo.m_bExpandRight === true )
                LineEndXPos = rectGraphRegion.m_nRight;

            this.m_LineStartXPos = LineStartXPos;
            this.m_LineEndXPos = LineEndXPos;
            this.m_arrLineEndYPos[i] = Math.floor(LineEndYPos) + 0.5;
            DrawingInfo.m_ScreenContext.moveTo(this.m_LineStartXPos, this.m_arrLineEndYPos[i]);
            DrawingInfo.m_ScreenContext.lineTo(this.m_LineEndXPos, this.m_arrLineEndYPos[i]);

            if( rToolInfo.m_bShowLeftText === true )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "right";

                if( this.m_StartYPos != PreStartYPos || this.m_EndYPos !== PreEndYPos || this.m_bReCalc === true ||
                    this.m_stArrLineYValue[i] === null || this.m_stArrLineYValue[i] === undefined )
                {
                    if (nEqualDivisionValue !== 0)
                    {
                        if (nEqualDivisionValue > 100)
                            nYScaleValue = LineStartYValue + (YValueDiff * (nEqualDivisionValue - 100) / 100);
                        if (nEqualDivisionValue < 100)
                            nYScaleValue = LineStartYValue + (YValueDiff * (100 - nEqualDivisionValue) / 100);
                        else
                            nYScaleValue = LineStartYValue;
                    }
                    else
                        nYScaleValue = LineEndYValue;
                    this.m_stArrLineYValue[i] = ConvertNumToDigitText(nYScaleValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
                }
                
                DrawingInfo.m_ScreenContext.fillText(this.m_stArrLineYValue[i], LeftTextXPos - nTextMargin, this.m_arrLineEndYPos[i] );
            }

            if( rToolInfo.m_bShowRightText === true )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "left";

                strText = "" + this.m_arrEqualDivision[nRtextIndex] + " %";
                DrawingInfo.m_ScreenContext.fillText(strText, RightTextXPos + nTextMargin, this.m_arrLineEndYPos[i]);

                if( bReverseIdx === true )
                    nRtextIndex--;
                else
                    nRtextIndex++;
            }
        }

        DrawingInfo.m_ScreenContext.stroke();

        this.m_bReCalc = false;

        if (this.m_bSelected)
        {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CQuadrisectLineTool.prototype.IsInMine = function (X, Y) {

    let bIsInMine = false;

    const nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;
    if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin)))
    {
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin)))
    {
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    }

    var DeltaX = this.m_StartXPos - this.m_EndXPos;
    if (this.m_StartXPos <= this.m_EndXPos) {
        if (X < (this.m_StartXPos - nMargin) || (this.m_EndXPos + nMargin) < X)
            return false;
    }
    else {
        if (X < (this.m_EndXPos - nMargin) || (this.m_StartXPos + nMargin) < X)
            return false;
    }

    if (this.m_StartYPos <= this.m_EndYPos) {
        if (Y < (this.m_StartYPos - nMargin) || (this.m_EndYPos + nMargin) < Y)
            return false;
    }
    else {
        if (Y < (this.m_EndYPos - nMargin) || (this.m_StartYPos + nMargin) < Y)
            return false;
    }

    if (Math.abs(DeltaX) > nMargin) {
        var a = (this.m_StartYPos - this.m_EndYPos) / DeltaX;//console.log("X:" + X + ", Y:" + Y + " " + "a(" + a + ")=(" + this.m_EndYPos + "-" + this.m_StartYPos + ")/(" + this.m_EndXPos + "-" + this.m_StartXPos + ")");
        var b = (this.m_StartYPos - a * this.m_StartXPos);//console.log("b(" + b + ")=(" + this.m_StartYPos + "-" + a + " * " + this.m_StartXPos + ")");
        var CalcY = a * X + b; //console.log("CalcY(" + CalcY + ")=(" + a + "*" + X + " + " + b + "), Y=" + Y);
        //console.log((CalcY - nMargin) + "<=" + Y + " && " + Y + "<=" + (CalcY + nMargin));
        if ((CalcY - nMargin) <= Y && Y <= (CalcY + nMargin)) { 
            bIsInMine = true;
        }
    } else {
        //수직으로 추세선이 그려진 경우는 상단 X, Y 범위 검사로 충분
        bIsInMine = true;
    }

    if (bIsInMine === true) {
        this.m_nHitTestPosInfo = LINE_POS;
        this.m_HitPosition = new CPoint(X, Y);
        return bIsInMine;
    }
    
    const nLineCount = this.m_arrEqualDivision.length;
    for (let i = 0; i < nLineCount; i++)
    {
        if ((this.m_LineStartXPos - nMargin) <= X && X <= (this.m_LineEndXPos + nMargin)
        && (this.m_arrLineEndYPos[i] - nMargin) <= Y && Y <= (this.m_arrLineEndYPos[i] + nMargin))
            bIsInMine = true;
    }

    if (bIsInMine)
    {
        this.m_nHitTestPosInfo = LINE_POS;
        this.m_HitPosition = new CPoint(X, Y);
    }

    return bIsInMine;
}

CQuadrisectLineTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {

            var rChartBlockCol = rSelectedGraph.m_rRQInCol.m_rChartBlockCol;
            var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
            var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
            var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();
            if (nGraphRegionWidth + nRightMargin > 0) {

                ///////////////////////////////////////////////
                //모양이 변경되는 그리기 모드인 경우
                ///////////////////////////////////////////////
                if (this.m_nHitTestPosInfo === START_POS || this.m_nHitTestPosInfo === END_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.m_nViewEndIndex - rXScaleMng.m_nViewStartIndex + 1;

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    //console.log("CLineTool.OnMouseMove [X:" + X + ", nFindXIndex:" + nFindXIndex + "]");

                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                    
                    var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                    if (rStartXIndexInBongRange) {
                        //console.log("CLineTool.OnMouseMove FindStartXIndex [nFindXIndex:" + nFindXIndex + ", StartXIndexInBongRange:" + rStartXIndexInBongRange.m_nFindXIndex + "]");

                        if (this.m_nHitTestPosInfo === START_POS) {
                            this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_StartYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }
                        else if (this.m_nHitTestPosInfo === END_POS) {
                            this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;
                    }
                }
                else if (this.m_nHitTestPosInfo === LINE_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.GetViewDataCnt();

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
                    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
                    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X ||
                        rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y )
                    {

                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);

                    //if (this.m_HitPosition.m_X < rChartBlock.m_rectGraphRegion.m_nLeft)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nLeft;
                    //else if (rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < this.m_HitPosition.m_X)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin ;

                    //이전 클릭위치와 현재 클릭위치 차이로 이동거리와 방향 계산
                    var DeltaXPos = X - this.m_HitPosition.m_X;
                    var DeltaYPos = Y - this.m_HitPosition.m_Y;

                    var MaxXIndex = null, MinXIndex = null;
                    var NewMaxXIndex = null, NewMinXIndex = null;

                    var NewMaxDateTime = null, NewMinDateTime = null;
                    var MaxDateTime = null, MinDateTime = null;

                    var MaxY = null, MinY = null;
                    var NewMaxY = null, NewMinY = null;

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nHitXIndex = GetXIndexByXPos(this.m_HitPosition.m_X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    var nCurXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                        MaxXIndex = this.m_ToolInfo.m_EndXIndex;
                        MaxY = this.m_EndYPos;
                        MaxDateTime = this.m_ToolInfo.m_EndDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_StartXIndex;
                        MinY = this.m_StartYPos;
                        MinDateTime = this.m_ToolInfo.m_StartDateTimeT;
                    }
                    else {

                        MaxXIndex = this.m_ToolInfo.m_StartXIndex;
                        MaxY = this.m_StartYPos;
                        MaxDateTime = this.m_ToolInfo.m_StartDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_EndXIndex;
                        MinY = this.m_EndYPos;
                        MinDateTime = this.m_ToolInfo.m_EndDateTimeT;
                    }

                    //우측이동
                    if (DeltaXPos > 0) {

                        ////////////////////////////////////////////////////////////
                        //미래영역에서도 그려져야 하므로 이 부분 주석처리
                        //var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                        //현재 마우스 위치가 전체데이터 개수를 넘어가면 마지막 위치로 이동
                        //if (nCurXIndex >= nTotalCnt)
                        //    nCurXIndex = nTotalCnt - 1;
                        ////////////////////////////////////////////////////////////

                        //이전 클릭위치(nHitXIndex)가 속한 봉의 위치 찾기
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nHitXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 1번");
                            return;
                        }
                        nHitXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nHitXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //nHitXIndex부터 nCurXIndex까지의 이동 봉거리 계산

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        var nMoveBongCnt = this.CountMoveBongCnt(nHitXIndex, nCurXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {

                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //우측으로 이동시 우측 MaxIndex부터 카운트
                        var bIsUpper = (nHitXIndex <= MaxXIndex ? true : false);
                        var rResult = this.MoveUpperIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        //MinIndex를 우측으로 nMoveBongCnt 실봉개수만큼 이동
                        bIsUpper = (nHitXIndex <= MinXIndex ? true : false);
                        rResult = this.MoveUpperIndex(MinXIndex, MinDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;

                        //y pixel정보를 이용하여 y 가격 계산
                        NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMinXIndex + "," + NewMaxXIndex + ")");

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMaxXIndex + "," + NewMinXIndex + ")");

                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                    else if (DeltaXPos < 0) {
                        if (nCurXIndex < 0)
                            nCurXIndex = 0;

                        //현재 클릭위치(nCurXIndex)가 속한 봉의 위치찾기
                        //(nCurXIndex를 포함하고 있는 봉의 시작Index 찾아 nCurXIndex에 셋팅)
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nCurXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 2번");
                            return;
                        }
                        nCurXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nCurXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        //nCurXInde로 부터 nHitXIndex까지의 실제 봉의 개수 카운트(nCurXIndex 봉은 카운트하지 않고 nHitXIndex위치 봉은 카운트)
                        var nMoveBongCnt = this.CountMoveBongCnt(nCurXIndex, nHitXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {
                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }
                        
                        //nMoveBongCnt만큼 양 끝점 이동시키기
                        var bIsUpper = (nCurXIndex < MinXIndex) ? true : false;
                        var rResult = this.MoveLowerIndex(MinXIndex, MinDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        bIsUpper = (nCurXIndex < MaxXIndex) ? true : false;
                        rResult = this.MoveLowerIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;

                        NewMaxY = GetYValueByYPos((MaxY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos((MinY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                }
            }
        }
    }
}

export function CFiboFanTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    var nXScaleType = rXScaleMng.m_nType;
    var KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    var Cycle = rRQSet.m_RQInfo.m_nCycle;
    var nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null;    // 툴 시작지점 X
    this.m_StartYPos = null;    // 툴 시작지점 Y
    this.m_EndXPos = null;      // 툴 종료지점 X
    this.m_EndYPos = null;      // 툴 종료지점 Y

    this.m_nIntervalBongCount = 0;//2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CFiboToolInfo(rXScaleMng.m_rChart.GetChartType(), FIBONACCI_FAN_TOOL, nXScaleType, KeyCode, Cycle, nInterval);

    this.m_FiboLineStartXPos = null;       // 라인 시작지점 X
    this.m_FiboLineStartYPos = null;       // 라인 시작지점 Y
    this.m_arrFiboLineEndXPos = [];        // 피보나치 비율로 계산한 라인 끝지점 X
    this.m_arrFiboLineEndYPos = [];        // 피보나치 비율로 계산한 라인 끝지점 Y
    this.m_arrFiboLineExpEndXPos = [];     // 피보나치 비율로 계산 후 우측확장 적용한 끝지점 X - 실제 Draw point
    this.m_arrFiboLineExpEndYPos = [];     // 피보나치 비율로 계산 후 우측확장 적용한 끝지점 Y - 실제 Draw point
}
CFiboFanTool.prototype = new CBaseTool();
CFiboFanTool.prototype.constructor = CFiboFanTool;

CFiboFanTool.prototype.Copy = function (rCopy) {

    if (rCopy == undefined || rCopy == null) {
        rCopy = new CFiboFanTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
            rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo;//도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition == null)
            rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
            rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    }
    else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}

CFiboFanTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;
    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIndexIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    var rToolInfo = this.m_ToolInfo;
    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        /*if ((rToolInfo.m_StartXIndex < nViewStartIndex && rToolInfo.m_EndXIndex < nViewStartIndex) ||
            (nViewEndIndexIncludeRightMargin < rToolInfo.m_StartXIndex && nViewEndIndexIncludeRightMargin < rToolInfo.m_EndXIndex))
            return;
        */

        var tStartDateTime = rToolInfo.m_StartDateTimeT;
        var tEndDateTime = rToolInfo.m_EndDateTimeT;
        var nTextMargin = 10;

        var yStartPos = null;
        var xStartPos = null;
        var yEndPos = null;
        var xEndPos = null;

        var PreStartXPos = this.m_StartXPos;
        var PreStartYPos = this.m_StartYPos;
        var PreEndXPos = this.m_EndXPos;
        var PreEndYPos = this.m_EndYPos;

        var strRQ = this.m_rRQSet.GetRQ();
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];
            if (rStartRQPackets === undefined)
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined)
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        StartYValue = bLog === true ? Log(rToolInfo.m_StartYValue) : rToolInfo.m_StartYValue;
        EndYValue = bLog === true ? Log(rToolInfo.m_EndYValue) : rToolInfo.m_EndYValue;

        yStartPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;

        if (bInvert === true)
        {
            yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
            yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
        }

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

        var YPointDiff = 0, OrgYPos, strText;
        var FiboStartXPos, FiboEndXPos, FiboStartYPos, FiboEndYPos;
        let XPos, YPos;
        if( xEndPos >= xStartPos )
        {
            FiboStartXPos = xStartPos;
            FiboStartYPos = yStartPos;
            FiboEndXPos = xEndPos;
            FiboEndYPos = OrgYPos = yEndPos;
            YPointDiff =  yEndPos - yStartPos;
        }
        else
        {
            FiboStartXPos = xEndPos;
            FiboStartYPos = yEndPos;
            FiboEndXPos = xStartPos;
            FiboEndYPos = OrgYPos = yStartPos;
            YPointDiff =  yStartPos - yEndPos;
        }

        var nLineCount = rToolInfo.m_arrShowFiboLine.length;
        for( var i = 0; i < nLineCount; i++ )
        {
            if( rToolInfo.m_arrShowFiboLine[i] === false )
                continue;

            if( rToolInfo.m_arrFiboValue[i] !== 0 )
            {
                var length = YPointDiff * rToolInfo.m_arrFiboValue[i] / 100;
                FiboEndYPos = OrgYPos - length;
            }

            if( FiboStartXPos !== PreStartXPos || FiboStartYPos != PreStartYPos
                || FiboEndXPos !== PreEndXPos || FiboEndYPos !== PreEndYPos )
            {
                gPointStart.m_X = FiboStartXPos;
                gPointStart.m_Y = FiboStartYPos;
                gPointEnd.m_X = FiboEndXPos;
                gPointEnd.m_Y = FiboEndYPos;

                this.m_FiboLineStartXPos = FiboStartXPos;
                this.m_FiboLineStartYPos = FiboStartYPos;
                this.m_arrFiboLineEndXPos[i] = FiboEndXPos;
                this.m_arrFiboLineEndYPos[i] = FiboEndYPos;

                CalcExpandLinePoint( gPointStart, gPointEnd, false, true );

                this.m_arrFiboLineExpEndXPos[i] = gPointEnd.m_X;
                this.m_arrFiboLineExpEndYPos[i] = gPointEnd.m_Y;
            }
            
            XPos = Math.floor(this.m_FiboLineStartXPos) + 0.5;
            YPos = Math.floor(this.m_FiboLineStartYPos) + 0.5;            
            DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

            XPos = Math.floor(this.m_arrFiboLineExpEndXPos[i]) + 0.5;
            YPos = Math.floor(this.m_arrFiboLineExpEndYPos[i]) + 0.5;
            DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);            

            if( rToolInfo.m_bShowLeftText )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "left";

                strText = "" + rToolInfo.m_arrFiboValue[i].toFixed(1) + " %";
                DrawingInfo.m_ScreenContext.fillText(strText, this.m_arrFiboLineEndXPos[i] + nTextMargin, this.m_arrFiboLineEndYPos[i] );
            }
        }

        DrawingInfo.m_ScreenContext.stroke();
        DrawingInfo.m_ScreenContext.restore();
    }
}

CFiboFanTool.prototype.Draw = function (DrawingInfo) {

var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    /*//x축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
        (nViewEndIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
        return;
    */

    var rToolInfo = this.m_ToolInfo;
    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    var nTextMargin = 8;
    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    StartYValue = bLog === true ? Log(rToolInfo.m_StartYValue) : rToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(rToolInfo.m_EndYValue) : rToolInfo.m_EndYValue;

    //y축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((StartYValue < yMin && EndYValue < yMin) ||
        (yMax < StartYValue && yMax < EndYValue))
        return;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        //라인추세선의 시작점 시간과 끝점 시간을 얻어낸다
        var tStartDateTime = rToolInfo.m_StartDateTimeT;
        var tEndDateTime = rToolInfo.m_EndDateTimeT;

        var strRQ = this.m_rRQSet.GetRQ();

        //시작점 시간에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];

            //시작점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rStartRQPackets === undefined)
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //시작점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //시작점의 y값에 대한 좌표계산
        this.m_StartYPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;

        //끝점 시간에 대한 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];

            //끝점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rEndRQPackets === undefined)
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //끝점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //끝점 y값에 대한 좌표계산
        this.m_EndYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_EndYPos = rectGraphRegion.m_nBottom - this.m_EndYPos + rectGraphRegion.m_nTop;

        DrawingInfo.m_ScreenContext.beginPath();

        switch (rToolInfo.m_nToolLineType)
        {
            case PS_SOLID: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
            case PS_DASH: DrawingInfo.m_ScreenContext.setLineDash([8, 4]); break;
            case PS_DOT: DrawingInfo.m_ScreenContext.setLineDash([2, 3]); break;
            case PS_DASHDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]); break;
            case PS_DASHDOTDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]); break;
            default: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        }

        DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

        var YPointDiff = 0, OrgYPos, strText;
        var FiboStartXPos, FiboEndXPos, FiboStartYPos, FiboEndYPos;
        let XPos, YPos;
        if( this.m_EndXPos >= this.m_StartXPos )
        {
            FiboStartXPos = this.m_StartXPos;
            FiboStartYPos = this.m_StartYPos;
            FiboEndXPos = this.m_EndXPos;
            FiboEndYPos = OrgYPos = this.m_EndYPos;
            YPointDiff =  this.m_EndYPos - this.m_StartYPos;
        }
        else
        {
            FiboStartXPos = this.m_EndXPos;
            FiboStartYPos = this.m_EndYPos;
            FiboEndXPos = this.m_StartXPos;
            FiboEndYPos = OrgYPos = this.m_StartYPos;
            YPointDiff =  this.m_StartYPos - this.m_EndYPos;
        }

        var nLineCount = rToolInfo.m_arrShowFiboLine.length;
        for( var i = 0; i < nLineCount; i++ )
        {
            if( rToolInfo.m_arrShowFiboLine[i] === false )
                continue;

            if( rToolInfo.m_arrFiboValue[i] !== 0 )
            {
                var length = YPointDiff * rToolInfo.m_arrFiboValue[i] / 100;
                FiboEndYPos = OrgYPos - length;
            }

            if( this.m_FiboLineStartXPos !== FiboStartXPos || this.m_FiboLineStartYPos != FiboStartYPos
                || this.m_arrFiboLineEndXPos[i] !== FiboEndXPos || this.m_arrFiboLineEndYPos[i] !== FiboEndYPos || this.m_bReCalc === true )
            {
                gPointStart.m_X = FiboStartXPos;
                gPointStart.m_Y = FiboStartYPos;
                gPointEnd.m_X = FiboEndXPos;
                gPointEnd.m_Y = FiboEndYPos;

                this.m_FiboLineStartXPos = FiboStartXPos;
                this.m_FiboLineStartYPos = FiboStartYPos;
                this.m_arrFiboLineEndXPos[i] = FiboEndXPos;
                this.m_arrFiboLineEndYPos[i] = FiboEndYPos;

                CalcExpandLinePoint( gPointStart, gPointEnd, false, true );

                this.m_arrFiboLineExpEndXPos[i] = gPointEnd.m_X;
                this.m_arrFiboLineExpEndYPos[i] = gPointEnd.m_Y;
            }

            XPos = Math.floor(this.m_FiboLineStartXPos) + 0.5;
            YPos = Math.floor(this.m_FiboLineStartYPos) + 0.5;
            DrawingInfo.m_ScreenContext.moveTo(XPos, YPos);

            XPos = Math.floor(this.m_arrFiboLineExpEndXPos[i]) + 0.5;
            YPos = Math.floor(this.m_arrFiboLineExpEndYPos[i]) + 0.5;
            DrawingInfo.m_ScreenContext.lineTo(XPos, YPos);

            if( rToolInfo.m_bShowLeftText )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "left";

                strText = "" + rToolInfo.m_arrFiboValue[i].toFixed(1) + " %";
                DrawingInfo.m_ScreenContext.fillText(strText, this.m_arrFiboLineEndXPos[i] + nTextMargin, this.m_arrFiboLineEndYPos[i] );
            }
        }

        DrawingInfo.m_ScreenContext.stroke();

        this.m_bReCalc = false;

        if (this.m_bSelected) {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CFiboFanTool.prototype.IsInMine = function (X, Y) {

    var nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;
    if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin))) {
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin))) {
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    }

    var rToolInfo = this.m_ToolInfo;
    var nLineCount = rToolInfo.m_arrShowFiboLine.length;
    for( var i = 0; i < nLineCount; i++ )
    {
        if( rToolInfo.m_arrShowFiboLine[i] === false )
            continue;

        var DeltaX = this.m_FiboLineStartXPos - this.m_arrFiboLineExpEndXPos[i];
        if (this.m_FiboLineStartXPos <= this.m_arrFiboLineExpEndXPos[i]) {
            if (X < (this.m_FiboLineStartXPos - nMargin) || (this.m_arrFiboLineExpEndXPos[i] + nMargin) < X)
                continue;
        }
        else {
            if (X < (this.m_arrFiboLineExpEndXPos[i] - nMargin) || (this.m_FiboLineStartXPos + nMargin) < X)
                continue;
        }

        if (this.m_FiboLineStartYPos <= this.m_arrFiboLineExpEndYPos[i]) {
            if (Y < (this.m_FiboLineStartYPos - nMargin) || (this.m_arrFiboLineExpEndYPos[i] + nMargin) < Y)
                continue;
        }
        else {
            if (Y < (this.m_arrFiboLineExpEndYPos[i] - nMargin) || (this.m_FiboLineStartYPos + nMargin) < Y)
                continue;
        }

        var bIsInMine = false;
        if (Math.abs(DeltaX) > nMargin) {
            var a = (this.m_FiboLineStartYPos - this.m_arrFiboLineExpEndYPos[i]) / DeltaX;//console.log("X:" + X + ", Y:" + Y + " " + "a(" + a + ")=(" + this.m_EndYPos + "-" + this.m_StartYPos + ")/(" + this.m_EndXPos + "-" + this.m_StartXPos + ")");
            var b = (this.m_FiboLineStartYPos - a * this.m_FiboLineStartXPos);//console.log("b(" + b + ")=(" + this.m_StartYPos + "-" + a + " * " + this.m_StartXPos + ")");
            var CalcY = a * X + b; //console.log("CalcY(" + CalcY + ")=(" + a + "*" + X + " + " + b + "), Y=" + Y);
            //console.log((CalcY - nMargin) + "<=" + Y + " && " + Y + "<=" + (CalcY + nMargin));
            if ((CalcY - nMargin) <= Y && Y <= (CalcY + nMargin)) {
                bIsInMine = true;
            }
        } else {
            //수직으로 추세선이 그려진 경우는 상단 X, Y 범위 검사로 충분
            bIsInMine = true;
        }

        if (bIsInMine === true) {
            this.m_nHitTestPosInfo = LINE_POS;
            this.m_HitPosition = new CPoint(X, Y);
            return bIsInMine;
        }
    }

    return bIsInMine;
}

CFiboFanTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {

            var rChartBlockCol = rSelectedGraph.m_rRQInCol.m_rChartBlockCol;
            var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
            var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
            var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();
            if (nGraphRegionWidth + nRightMargin > 0) {

                ///////////////////////////////////////////////
                //모양이 변경되는 그리기 모드인 경우
                ///////////////////////////////////////////////
                if (this.m_nHitTestPosInfo === START_POS || this.m_nHitTestPosInfo === END_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.m_nViewEndIndex - rXScaleMng.m_nViewStartIndex + 1;

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    //console.log("CLineTool.OnMouseMove [X:" + X + ", nFindXIndex:" + nFindXIndex + "]");

                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nTotalCnt = rXScaleMng.GetMergeDataCnt();

                    var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                    if (rStartXIndexInBongRange) {
                        //console.log("CLineTool.OnMouseMove FindStartXIndex [nFindXIndex:" + nFindXIndex + ", StartXIndexInBongRange:" + rStartXIndexInBongRange.m_nFindXIndex + "]");

                        if (this.m_nHitTestPosInfo === START_POS) {
                            this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_StartYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }
                        else if (this.m_nHitTestPosInfo === END_POS) {
                            this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;
                    }
                }
                else if (this.m_nHitTestPosInfo === LINE_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.GetViewDataCnt();

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
                    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
                    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X ||
                        rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y )
                    {

                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);

                    //if (this.m_HitPosition.m_X < rChartBlock.m_rectGraphRegion.m_nLeft)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nLeft;
                    //else if (rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < this.m_HitPosition.m_X)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin ;

                    //이전 클릭위치와 현재 클릭위치 차이로 이동거리와 방향 계산
                    var DeltaXPos = X - this.m_HitPosition.m_X;
                    var DeltaYPos = Y - this.m_HitPosition.m_Y;

                    var MaxXIndex = null, MinXIndex = null;
                    var NewMaxXIndex = null, NewMinXIndex = null;

                    var NewMaxDateTime = null, NewMinDateTime = null;
                    var MaxDateTime = null, MinDateTime = null;

                    var MaxY = null, MinY = null;
                    var NewMaxY = null, NewMinY = null;

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nHitXIndex = GetXIndexByXPos(this.m_HitPosition.m_X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    var nCurXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                        MaxXIndex = this.m_ToolInfo.m_EndXIndex;
                        MaxY = this.m_EndYPos;
                        MaxDateTime = this.m_ToolInfo.m_EndDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_StartXIndex;
                        MinY = this.m_StartYPos;
                        MinDateTime = this.m_ToolInfo.m_StartDateTimeT;
                    }
                    else {

                        MaxXIndex = this.m_ToolInfo.m_StartXIndex;
                        MaxY = this.m_StartYPos;
                        MaxDateTime = this.m_ToolInfo.m_StartDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_EndXIndex;
                        MinY = this.m_EndYPos;
                        MinDateTime = this.m_ToolInfo.m_EndDateTimeT;
                    }

                    //우측이동
                    if (DeltaXPos > 0) {

                        ////////////////////////////////////////////////////////////
                        //미래영역에서도 그려져야 하므로 이 부분 주석처리
                        //var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                        //현재 마우스 위치가 전체데이터 개수를 넘어가면 마지막 위치로 이동
                        //if (nCurXIndex >= nTotalCnt)
                        //    nCurXIndex = nTotalCnt - 1;
                        ////////////////////////////////////////////////////////////

                        //이전 클릭위치(nHitXIndex)가 속한 봉의 위치 찾기
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nHitXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 1번");
                            return;
                        }
                        nHitXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nHitXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //nHitXIndex부터 nCurXIndex까지의 이동 봉거리 계산

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        var nMoveBongCnt = this.CountMoveBongCnt(nHitXIndex, nCurXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {

                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //우측으로 이동시 우측 MaxIndex부터 카운트
                        var bIsUpper = (nHitXIndex <= MaxXIndex ? true : false);
                        var rResult = this.MoveUpperIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        //MinIndex를 우측으로 nMoveBongCnt 실봉개수만큼 이동
                        bIsUpper = (nHitXIndex <= MinXIndex ? true : false);
                        rResult = this.MoveUpperIndex(MinXIndex, MinDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;

                        //y pixel정보를 이용하여 y 가격 계산
                        NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMinXIndex + "," + NewMaxXIndex + ")");

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMaxXIndex + "," + NewMinXIndex + ")");

                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                    else if (DeltaXPos < 0) {
                        if (nCurXIndex < 0)
                            nCurXIndex = 0;

                        //현재 클릭위치(nCurXIndex)가 속한 봉의 위치찾기
                        //(nCurXIndex를 포함하고 있는 봉의 시작Index 찾아 nCurXIndex에 셋팅)
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nCurXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 2번");
                            return;
                        }
                        nCurXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nCurXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        //nCurXInde로 부터 nHitXIndex까지의 실제 봉의 개수 카운트(nCurXIndex 봉은 카운트하지 않고 nHitXIndex위치 봉은 카운트)
                        var nMoveBongCnt = this.CountMoveBongCnt(nCurXIndex, nHitXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {
                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //nMoveBongCnt만큼 양 끝점 이동시키기
                        var bIsUpper = (nCurXIndex < MinXIndex) ? true : false;
                        var rResult = this.MoveLowerIndex(MinXIndex, MinDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        bIsUpper = (nCurXIndex < MaxXIndex) ? true : false;
                        rResult = this.MoveLowerIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;

                        NewMaxY = GetYValueByYPos((MaxY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos((MinY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                }
            }
        }
    }
}

export function CFiboArcTool(rXScaleMng, rRQSet, rChartBlock) {

    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    var nXScaleType = rXScaleMng.m_nType;
    var KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    var Cycle = rRQSet.m_RQInfo.m_nCycle;
    var nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null;    // 툴 시작지점 X
    this.m_StartYPos = null;    // 툴 시작지점 Y
    this.m_EndXPos = null;      // 툴 종료지점 X
    this.m_EndYPos = null;      // 툴 종료지점 Y

    this.m_nIntervalBongCount = 0;//2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CFiboToolInfo(rXScaleMng.m_rChart.GetChartType(), TOOL_TYPE['FIBONACCI_ARC_TOOL'], nXScaleType, KeyCode, Cycle, nInterval);

    this.m_ArcAngle = (Math.PI/180)*180;
    this.m_FiboArcRadius = [];
}
CFiboArcTool.prototype = new CBaseTool();
CFiboArcTool.prototype.constructor = CFiboArcTool;

CFiboArcTool.prototype.Copy = function (rCopy) {

    if (rCopy == undefined || rCopy == null) {
        rCopy = new CFiboArcTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
            rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo;//도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition == null)
            rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
            rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    }
    else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}

CFiboArcTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;
    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIndexIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    var rToolInfo = this.m_ToolInfo;
    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        /*if ((rToolInfo.m_StartXIndex < nViewStartIndex && rToolInfo.m_EndXIndex < nViewStartIndex) ||
            (nViewEndIndexIncludeRightMargin < rToolInfo.m_StartXIndex && nViewEndIndexIncludeRightMargin < rToolInfo.m_EndXIndex))
            return;
        */

        var tStartDateTime = rToolInfo.m_StartDateTimeT;
        var tEndDateTime = rToolInfo.m_EndDateTimeT;
        var nTextMargin = 10;

        var yStartPos = null;
        var xStartPos = null;
        var yEndPos = null;
        var xEndPos = null;

        var PreStartXPos = this.m_StartXPos;
        var PreStartYPos = this.m_StartYPos;
        var PreEndXPos = this.m_EndXPos;
        var PreEndYPos = this.m_EndYPos;

        var strRQ = this.m_rRQSet.GetRQ();
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];
            if (rStartRQPackets === undefined)
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
            if (rEndRQPackets === undefined)
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            else
                xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }

        StartYValue = bLog === true ? Log(rToolInfo.m_StartYValue) : rToolInfo.m_StartYValue;
        EndYValue = bLog === true ? Log(rToolInfo.m_EndYValue) : rToolInfo.m_EndYValue;

        yStartPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;

        if (bInvert === true)
        {
            yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
            yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
        }

        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

        DrawingInfo.m_ScreenContext.moveTo(xStartPos, yStartPos);
        DrawingInfo.m_ScreenContext.lineTo(xEndPos, yEndPos);
        DrawingInfo.m_ScreenContext.stroke();
        DrawingInfo.m_ScreenContext.closePath();

        var Distance = 0, Radius = 0, TextYPos, strText;
        Distance = Math.sqrt( Math.pow( xEndPos - xStartPos, 2 ) + Math.pow( yEndPos - yStartPos, 2 ), 2);

        var nLineCount = rToolInfo.m_arrShowFiboLine.length;
        for( var i = 0; i < nLineCount; i++ )
        {
            if( rToolInfo.m_arrShowFiboLine[i] === false )
                continue;

            if( rToolInfo.m_arrFiboValue[i] !== 0 )
            {
                Radius = Distance * ( rToolInfo.m_arrFiboValue[i] / 100 );
                TextYPos = yStartPos > yEndPos ? yEndPos + Radius - nTextMargin : yEndPos - Radius + nTextMargin;
            }
            else
            {
                Radius = 0;
                TextYPos = yStartPos > yEndPos ? yEndPos + nTextMargin : yEndPos - nTextMargin;
            }

            this.m_FiboArcRadius[i] = Radius;

            DrawingInfo.m_ScreenContext.beginPath();
            DrawingInfo.m_ScreenContext.arc( xEndPos, yEndPos, Radius, 0, this.m_ArcAngle, yStartPos > yEndPos ? false : true );
            DrawingInfo.m_ScreenContext.stroke();
            DrawingInfo.m_ScreenContext.closePath();
            
            if( rToolInfo.m_bShowLeftText )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "center";
                
                strText = "" + rToolInfo.m_arrFiboValue[i].toFixed(1) + " %";
                DrawingInfo.m_ScreenContext.fillText(strText, xEndPos, TextYPos);
            }
        }

        DrawingInfo.m_ScreenContext.restore();
    }
}

CFiboArcTool.prototype.Draw = function (DrawingInfo) {

    var rXScaleMng = this.m_rXScaleMng;
    var rChartBlock = this.m_rChartBlock;

    var rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    var rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

    /*//x축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((this.m_ToolInfo.m_StartXIndex < nViewStartIndex && this.m_ToolInfo.m_EndXIndex < nViewStartIndex) ||
        (nViewEndIncludeRightMargin < this.m_ToolInfo.m_StartXIndex && nViewEndIncludeRightMargin < this.m_ToolInfo.m_EndXIndex))
        return;
    */

    var rToolInfo = this.m_ToolInfo;
    var rectGraphRegion = DrawingInfo.m_rectGraphRegion;
    var nGraphRegionWidth = rectGraphRegion.Width();
    var nGraphRegionHeight = rectGraphRegion.Height();
    var nViewDataCnt = nViewEndIndex - nViewStartIndex + 1;
    var nBongMinWidth = rChartBlockCol.m_BongMinWidth;

    var nTextMargin = 8;
    var rYScale = rChartBlock.GetSelectedYScale();
    var bLog = rYScale.GetLog();
    var bInvert = rYScale.GetInvert();
    var yMin, yMax, yDiff, StartYValue, EndYValue;

    if( bLog === true )
    {
        yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
        yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
        yDiff = yMax - yMin;
    }
    else
    {
        yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
        yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
        yDiff = yMax - yMin;
    }
    
    StartYValue = bLog === true ? Log(rToolInfo.m_StartYValue) : rToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(rToolInfo.m_EndYValue) : rToolInfo.m_EndYValue;

    //y축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
    if ((StartYValue < yMin && EndYValue < yMin) ||
        (yMax < StartYValue && yMax < EndYValue))
        return;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        //라인추세선의 시작점 시간과 끝점 시간을 얻어낸다
        var tStartDateTime = rToolInfo.m_StartDateTimeT;
        var tEndDateTime = rToolInfo.m_EndDateTimeT;

        var strRQ = this.m_rRQSet.GetRQ();

        //시작점 시간에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
            this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {
            
            var rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];

            //시작점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rStartRQPackets === undefined)
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //시작점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //시작점의 y값에 대한 좌표계산
        this.m_StartYPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;

        //끝점 시간에 대한 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
        if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
            this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        else {

            var rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];

            //끝점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
            if (rEndRQPackets === undefined)
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            //끝점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
            else
                this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
        }
        //끝점 y값에 대한 좌표계산
        this.m_EndYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
        if (bInvert === true)
            this.m_EndYPos = rectGraphRegion.m_nBottom - this.m_EndYPos + rectGraphRegion.m_nTop;

        switch (rToolInfo.m_nToolLineType)
        {
            case PS_SOLID: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
            case PS_DASH: DrawingInfo.m_ScreenContext.setLineDash([8, 4]); break;
            case PS_DOT: DrawingInfo.m_ScreenContext.setLineDash([2, 3]); break;
            case PS_DASHDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]); break;
            case PS_DASHDOTDOT:DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]); break;
            default: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        }

        DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

        if (this.m_bSelected)
        {
            DrawingInfo.m_ScreenContext.beginPath();
            DrawingInfo.m_ScreenContext.moveTo(this.m_StartXPos, this.m_StartYPos);
            DrawingInfo.m_ScreenContext.lineTo(this.m_EndXPos, this.m_EndYPos);
            DrawingInfo.m_ScreenContext.stroke();
            DrawingInfo.m_ScreenContext.closePath();
        }

        var Distance = 0, Radius = 0, TextYPos, strText;
        Distance = Math.sqrt( Math.pow( this.m_EndXPos - this.m_StartXPos, 2 ) + Math.pow( this.m_EndYPos - this.m_StartYPos, 2 ), 2);

        var nLineCount = rToolInfo.m_arrShowFiboLine.length;
        for( var i = 0; i < nLineCount; i++ )
        {
            if( rToolInfo.m_arrShowFiboLine[i] === false )
                continue;

            if( rToolInfo.m_arrFiboValue[i] !== 0 )
            {
                Radius = Distance * ( rToolInfo.m_arrFiboValue[i] / 100 );
                TextYPos = this.m_StartYPos > this.m_EndYPos ? this.m_EndYPos + Radius - nTextMargin : this.m_EndYPos - Radius + nTextMargin;
            }
            else
            {
                Radius = 0;
                TextYPos = this.m_StartYPos > this.m_EndYPos ? this.m_EndYPos + nTextMargin : this.m_EndYPos - nTextMargin;
            }

            this.m_FiboArcRadius[i] = Radius;

            DrawingInfo.m_ScreenContext.beginPath();
            DrawingInfo.m_ScreenContext.arc( this.m_EndXPos, this.m_EndYPos, Radius, 0, this.m_ArcAngle, this.m_StartYPos > this.m_EndYPos ? false : true );
            DrawingInfo.m_ScreenContext.stroke();
            DrawingInfo.m_ScreenContext.closePath();

            if( rToolInfo.m_bShowLeftText )
            {
                DrawingInfo.m_ScreenContext.textBaseline = "middle";
                DrawingInfo.m_ScreenContext.textAlign = "center";
                
                strText = "" + rToolInfo.m_arrFiboValue[i].toFixed(1) + " %";
                DrawingInfo.m_ScreenContext.fillText(strText, this.m_EndXPos, TextYPos);
            }
        }

        this.m_bReCalc = false;

        if (this.m_bSelected) {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CFiboArcTool.prototype.IsInMine = function (X, Y) {

    var nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;
    if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin))) {
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin))) {
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    }

    var DeltaX = this.m_StartXPos - this.m_EndXPos;
    var bIsInMine = false;
    if (Math.abs(DeltaX) > nMargin) {
        var a = (this.m_StartYPos - this.m_EndYPos) / DeltaX;//console.log("X:" + X + ", Y:" + Y + " " + "a(" + a + ")=(" + this.m_EndYPos + "-" + this.m_StartYPos + ")/(" + this.m_EndXPos + "-" + this.m_StartXPos + ")");
        var b = (this.m_StartYPos - a * this.m_StartXPos);//console.log("b(" + b + ")=(" + this.m_StartYPos + "-" + a + " * " + this.m_StartXPos + ")");
        var CalcY = a * X + b; //console.log("CalcY(" + CalcY + ")=(" + a + "*" + X + " + " + b + "), Y=" + Y);
        //console.log((CalcY - nMargin) + "<=" + Y + " && " + Y + "<=" + (CalcY + nMargin));
        if ((CalcY - nMargin) <= Y && Y <= (CalcY + nMargin)) {
            bIsInMine = true;
        }
    } else {
        //수직으로 추세선이 그려진 경우는 상단 X, Y 범위 검사로 충분
        bIsInMine = true;
    }

    if (bIsInMine === true) {
        this.m_nHitTestPosInfo = LINE_POS;
        this.m_HitPosition = new CPoint(X, Y);
        return bIsInMine;
    }

    var Distance = 0, Radius = 0, TextYPos, strText;
    Distance = Math.sqrt( Math.pow( this.m_EndXPos - X, 2 ) + Math.pow( this.m_EndYPos - Y, 2 ), 2);
    if( Distance <= 0 )
        return false;

    var rToolInfo = this.m_ToolInfo;
    var nLineCount = rToolInfo.m_arrShowFiboLine.length;
    for( var i = 0; i < nLineCount; i++ )
    {
        if( rToolInfo.m_arrShowFiboLine[i] === false )
            continue;

        if( this.m_FiboArcRadius[i] >= Distance - nMargin && this.m_FiboArcRadius[i] <= Distance + nMargin )
        {
            bIsInMine = true;
            break;
        }
    }

    if (bIsInMine === true)
    {
        this.m_nHitTestPosInfo = LINE_POS;
        this.m_HitPosition = new CPoint(X, Y);
        return bIsInMine;
    }

    return bIsInMine;
}

CFiboArcTool.prototype.OnMouseMove = function (e, rCurChartBlock) {

    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {

            var rChartBlockCol = rSelectedGraph.m_rRQInCol.m_rChartBlockCol;
            var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
            var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
            var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();
            if (nGraphRegionWidth + nRightMargin > 0) {

                ///////////////////////////////////////////////
                //모양이 변경되는 그리기 모드인 경우
                ///////////////////////////////////////////////
                if (this.m_nHitTestPosInfo === START_POS || this.m_nHitTestPosInfo === END_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.m_nViewEndIndex - rXScaleMng.m_nViewStartIndex + 1;

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    //console.log("CLineTool.OnMouseMove [X:" + X + ", nFindXIndex:" + nFindXIndex + "]");

                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                    
                    var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                    if (rStartXIndexInBongRange) {
                        //console.log("CLineTool.OnMouseMove FindStartXIndex [nFindXIndex:" + nFindXIndex + ", StartXIndexInBongRange:" + rStartXIndexInBongRange.m_nFindXIndex + "]");

                        if (this.m_nHitTestPosInfo === START_POS) {
                            this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_StartYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }
                        else if (this.m_nHitTestPosInfo === END_POS) {
                            this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                            this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;
                    }
                }
                else if (this.m_nHitTestPosInfo === LINE_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.GetViewDataCnt();

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
                    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
                    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X ||
                        rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y )
                    {

                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);

                    //if (this.m_HitPosition.m_X < rChartBlock.m_rectGraphRegion.m_nLeft)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nLeft;
                    //else if (rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < this.m_HitPosition.m_X)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin ;

                    //이전 클릭위치와 현재 클릭위치 차이로 이동거리와 방향 계산
                    var DeltaXPos = X - this.m_HitPosition.m_X;
                    var DeltaYPos = Y - this.m_HitPosition.m_Y;

                    var MaxXIndex = null, MinXIndex = null;
                    var NewMaxXIndex = null, NewMinXIndex = null;

                    var NewMaxDateTime = null, NewMinDateTime = null;
                    var MaxDateTime = null, MinDateTime = null;

                    var MaxY = null, MinY = null;
                    var NewMaxY = null, NewMinY = null;

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nHitXIndex = GetXIndexByXPos(this.m_HitPosition.m_X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    var nCurXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                        MaxXIndex = this.m_ToolInfo.m_EndXIndex;
                        MaxY = this.m_EndYPos;
                        MaxDateTime = this.m_ToolInfo.m_EndDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_StartXIndex;
                        MinY = this.m_StartYPos;
                        MinDateTime = this.m_ToolInfo.m_StartDateTimeT;
                    }
                    else {

                        MaxXIndex = this.m_ToolInfo.m_StartXIndex;
                        MaxY = this.m_StartYPos;
                        MaxDateTime = this.m_ToolInfo.m_StartDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_EndXIndex;
                        MinY = this.m_EndYPos;
                        MinDateTime = this.m_ToolInfo.m_EndDateTimeT;
                    }

                    //우측이동
                    if (DeltaXPos > 0) {

                        ////////////////////////////////////////////////////////////
                        //미래영역에서도 그려져야 하므로 이 부분 주석처리
                        //var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                        //현재 마우스 위치가 전체데이터 개수를 넘어가면 마지막 위치로 이동
                        //if (nCurXIndex >= nTotalCnt)
                        //    nCurXIndex = nTotalCnt - 1;
                        ////////////////////////////////////////////////////////////

                        //이전 클릭위치(nHitXIndex)가 속한 봉의 위치 찾기
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nHitXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 1번");
                            return;
                        }
                        nHitXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nHitXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //nHitXIndex부터 nCurXIndex까지의 이동 봉거리 계산

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        var nMoveBongCnt = this.CountMoveBongCnt(nHitXIndex, nCurXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {

                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //우측으로 이동시 우측 MaxIndex부터 카운트
                        var bIsUpper = (nHitXIndex <= MaxXIndex ? true : false);
                        var rResult = this.MoveUpperIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        //MinIndex를 우측으로 nMoveBongCnt 실봉개수만큼 이동
                        bIsUpper = (nHitXIndex <= MinXIndex ? true : false);
                        rResult = this.MoveUpperIndex(MinXIndex, MinDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;

                        //y pixel정보를 이용하여 y 가격 계산
                        NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMinXIndex + "," + NewMaxXIndex + ")");

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMaxXIndex + "," + NewMinXIndex + ")");

                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                    else if (DeltaXPos < 0) {
                        if (nCurXIndex < 0)
                            nCurXIndex = 0;

                        //현재 클릭위치(nCurXIndex)가 속한 봉의 위치찾기
                        //(nCurXIndex를 포함하고 있는 봉의 시작Index 찾아 nCurXIndex에 셋팅)
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nCurXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 2번");
                            return;
                        }
                        nCurXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nCurXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        //nCurXInde로 부터 nHitXIndex까지의 실제 봉의 개수 카운트(nCurXIndex 봉은 카운트하지 않고 nHitXIndex위치 봉은 카운트)
                        var nMoveBongCnt = this.CountMoveBongCnt(nCurXIndex, nHitXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {
                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }
                        
                        //nMoveBongCnt만큼 양 끝점 이동시키기
                        var bIsUpper = (nCurXIndex < MinXIndex) ? true : false;
                        var rResult = this.MoveLowerIndex(MinXIndex, MinDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        bIsUpper = (nCurXIndex < MaxXIndex) ? true : false;
                        rResult = this.MoveLowerIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;

                        NewMaxY = GetYValueByYPos((MaxY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos((MinY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                }
            }
        }
    }
}

export function CFiboRetraceTool(rXScaleMng, rRQSet, rChartBlock) {

  CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

  const nXScaleType = rXScaleMng.m_nType;
  const KeyCode = rRQSet.m_RQInfo.m_strItemCode;
  const Cycle = rRQSet.m_RQInfo.m_nCycle;
  const nInterval = rRQSet.m_RQInfo.m_nInterval;

  //실제 좌표
  this.m_StartXPos = null; // 툴 시작지점 X
  this.m_StartYPos = null; // 툴 시작지점 Y
  this.m_EndXPos = null; // 툴 종료지점 X
  this.m_EndYPos = null; // 툴 종료지점 Y

  this.m_nIntervalBongCount = 0; //2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

  this.m_ToolInfo = new CFiboToolInfo(rXScaleMng.m_rChart.GetChartType(), TOOL_TYPE['FIBONACCI_RETRACE_TOOL'], nXScaleType, KeyCode, Cycle, nInterval);

  this.m_FiboLineStartXPos = null; // 라인 시작지점 X
  this.m_FiboLineStartYPos = null; // 라인 시작지점 Y
  this.m_arrFiboLineEndXPos = []; // 피보나치 비율로 계산한 라인 끝지점 X
  this.m_arrFiboLineEndYPos = []; // 피보나치 비율로 계산한 라인 끝지점 Y
}

CFiboRetraceTool.prototype = new CBaseTool();
CFiboRetraceTool.prototype.constructor = CFiboRetraceTool;

CFiboRetraceTool.prototype.Copy = function (rCopy) {

  if (rCopy === undefined || rCopy === null) {
    rCopy = new CFiboRetraceTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
  }
  this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

  if (this.m_rectClip) {
    if (!rCopy.m_rectClip)
      rCopy.m_rectClip = new CRect();

    rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
    rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
    rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
    rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
  }

  rCopy.m_bSelected = this.m_bSelected;
  rCopy.m_srcTool = this;

  //클릭한 위치정보
  rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo; //도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

  if (this.m_HitPosition) {
    if (rCopy.m_HitPosition === null)
      rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    else
      rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
  } else
    rCopy.m_HitPosition = this.m_HitPosition;


  //라인추세선의 시작점과 끝나는 점 복사
  rCopy.m_StartXPos = this.m_StartXPos;
  rCopy.m_StartYPos = this.m_StartYPos;
  rCopy.m_EndXPos = this.m_EndXPos;
  rCopy.m_EndYPos = this.m_EndYPos;

  return rCopy;
}

CFiboRetraceTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {

  const rXScaleMng = this.m_rXScaleMng;
  const rChartBlock = this.m_rChartBlock;
  const rSelectGraph = rChartBlock.GetSelectedGraph();
  if (rSelectGraph === null)
    return;

  const rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

  DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
  DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

  const nViewStartIndex = rXScaleMng.m_nViewStartIndex;

  const rToolInfo = this.m_ToolInfo;
  const rectGraphRegion = DrawingInfo.m_rectGraphRegion;
  const nGraphRegionHeight = rectGraphRegion.Height();
  const nBongMinWidth = rChartBlockCol.m_BongMinWidth;

  const rYScale = rChartBlock.GetSelectedYScale();
  const bLog = rYScale.GetLog();
  const bInvert = rYScale.GetInvert();
  let yMin, yMax, yDiff, StartYValue, EndYValue;

  if (bLog) {
    yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
    yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
    yDiff = yMax - yMin;
  } else {
    yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
    yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
    yDiff = yMax - yMin;
  }

  if (rXScaleMng.GetType() === DATETIME_TYPE) {

    const tStartDateTime = rToolInfo.m_StartDateTimeT;
    const tEndDateTime = rToolInfo.m_EndDateTimeT;
    const nTextMargin = 10;

    let yStartPos = null;
    let xStartPos = null;
    let yEndPos = null;
    let xEndPos = null;

    const strRQ = this.m_rRQSet.GetRQ();
    if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
      xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
    else {

      const rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];
      if (rStartRQPackets === undefined)
        xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
      else
        xStartPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
    }

    if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
      xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
    else {

      const rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];
      if (rEndRQPackets === undefined)
        xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
      else
        xEndPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
    }

    StartYValue = bLog === true ? Log(rToolInfo.m_StartYValue) : rToolInfo.m_StartYValue;
    EndYValue = bLog === true ? Log(rToolInfo.m_EndYValue) : rToolInfo.m_EndYValue;

    yStartPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
    yEndPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;

    if (bInvert === true) {
      yStartPos = rectGraphRegion.m_nBottom - yStartPos + rectGraphRegion.m_nTop;
      yEndPos = rectGraphRegion.m_nBottom - yEndPos + rectGraphRegion.m_nTop;
    }

    DrawingInfo.m_ScreenContext.save();

    DrawingInfo.m_ScreenContext.beginPath();
    DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
    DrawingInfo.m_ScreenContext.clip();

    DrawingInfo.m_ScreenContext.beginPath();
    switch(rToolInfo.m_nToolLineType) {
      case PS_SOLID:
        DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
      break;
      case PS_DASH:
        DrawingInfo.m_ScreenContext.setLineDash([8, 4]);
      break;
      case PS_DOT:
        DrawingInfo.m_ScreenContext.setLineDash([2, 3]);
      break;
      case PS_DASHDOT:
        DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]);
      break;
      case PS_DASHDOTDOT:
        DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]);
      break;
      default:
      DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
      break;
    }
    DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
    DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
    DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;
    
    let FiboStartXPos, FiboEndXPos, FiboStartYPos, FiboEndYPos, YPos;
    let nFiboValue, nFiboCoef, nYScaleValue, 
        nYDiffValue = Math.abs(rToolInfo.m_StartYValue - rToolInfo.m_EndYValue);
    let strLeftText, strRightText;
      
    if (xStartPos <= xEndPos) {
      FiboStartXPos = Math.floor(xStartPos) + 0.5;
      FiboStartYPos = Math.floor(yStartPos) + 0.5;
      FiboEndXPos = Math.floor(xEndPos) + 0.5;
      FiboEndYPos = Math.floor(yEndPos) + 0.5;
    } else {
      FiboStartXPos = Math.floor(xEndPos) + 0.5;
      FiboStartYPos = Math.floor(yEndPos) + 0.5;
      FiboEndXPos = Math.floor(xStartPos) + 0.5;
      FiboEndYPos = Math.floor(yStartPos) + 0.5;
    }

    // 시작점 ~ 끝점을 연결하는 선
    DrawingInfo.m_ScreenContext.moveTo(FiboStartXPos, FiboStartYPos);
    DrawingInfo.m_ScreenContext.lineTo(FiboEndXPos, FiboEndYPos);

    const nLineCount = rToolInfo.m_arrShowFiboLine.length;
    for (let i = 0; i < nLineCount; i++) {
      if (!rToolInfo.m_arrShowFiboLine[i]) {
        continue;
      }

      nFiboValue = rToolInfo.m_arrFiboValue[i];
      nFiboCoef = (yEndPos - yStartPos) * nFiboValue / 100;

      YPos = Math.floor(yEndPos - nFiboCoef) + 0.5;
      DrawingInfo.m_ScreenContext.moveTo(FiboStartXPos, YPos);
      DrawingInfo.m_ScreenContext.lineTo(FiboEndXPos, YPos);

      // 텍스트
      if (rToolInfo.m_bShowLeftText) {

        DrawingInfo.m_ScreenContext.textBaseline = "middle";

        // Y-scale
        if (nFiboValue === 0) {
            nYScaleValue = rToolInfo.m_EndYValue;
        } else if (nFiboValue === 100) {
            nYScaleValue = rToolInfo.m_StartYValue;
        } else if (nFiboValue < 100) {
            nYScaleValue = rToolInfo.m_StartYValue - (nYDiffValue * Math.abs(nFiboValue - 100) / 100);
        } else {
            nYScaleValue = rToolInfo.m_StartYValue + (nYDiffValue * Math.abs(nFiboValue - 100) / 100);
        }

        strLeftText = ConvertNumToDigitText(nYScaleValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
        DrawingInfo.m_ScreenContext.textAlign = "right";
        DrawingInfo.m_ScreenContext.fillText(strLeftText, FiboStartXPos - nTextMargin, YPos);

        // 피보나치 계수
        strRightText = `${nFiboValue.toFixed(1)} %`;
        DrawingInfo.m_ScreenContext.textAlign = "left";
        DrawingInfo.m_ScreenContext.fillText(strRightText, FiboEndXPos + nTextMargin, YPos);
      }
    }

    DrawingInfo.m_ScreenContext.stroke();
    DrawingInfo.m_ScreenContext.restore();
  }
}

CFiboRetraceTool.prototype.Draw = function (DrawingInfo) {

  const rXScaleMng = this.m_rXScaleMng;
  const rChartBlock = this.m_rChartBlock;

  const rSelectGraph = rChartBlock.GetSelectedGraph();
  if (rSelectGraph === null)
    return;

  const rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;
  const nViewStartIndex = rXScaleMng.m_nViewStartIndex;
  const rToolInfo = this.m_ToolInfo;
  const rectGraphRegion = DrawingInfo.m_rectGraphRegion;
  const nGraphRegionHeight = rectGraphRegion.Height();
  const nBongMinWidth = rChartBlockCol.m_BongMinWidth;

  const nTextMargin = 8;
  const rYScale = rChartBlock.GetSelectedYScale();
  const bLog = rYScale.GetLog();
  const bInvert = rYScale.GetInvert();
  let yMin, yMax, yDiff, StartYValue, EndYValue;

  if (bLog) {
    yMin = Log(rYScale.m_MinMaxInfo.m_LowerLimit);
    yMax = Log(rYScale.m_MinMaxInfo.m_UpperLimit);
    yDiff = yMax - yMin;
  } else {
    yMin = rYScale.m_MinMaxInfo.m_LowerLimit;
    yMax = rYScale.m_MinMaxInfo.m_UpperLimit;
    yDiff = yMax - yMin;
  }

  StartYValue = bLog ? Log(rToolInfo.m_StartYValue) : rToolInfo.m_StartYValue;
  EndYValue = bLog ? Log(rToolInfo.m_EndYValue) : rToolInfo.m_EndYValue;

  //y축 보이는 공간에 분석도구 존재하지 않는 경우는 그리기 처리 하지 않는다
  if ((StartYValue < yMin && EndYValue < yMin) ||
    (yMax < StartYValue && yMax < EndYValue))
    return;

  if (rXScaleMng.GetType() === DATETIME_TYPE) {

    //라인추세선의 시작점 시간과 끝점 시간을 얻어낸다
    const tStartDateTime = rToolInfo.m_StartDateTimeT;
    const tEndDateTime = rToolInfo.m_EndDateTimeT;

    const strRQ = this.m_rRQSet.GetRQ();

    //시작점 시간에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
    if (rXScaleMng.m_tTimeArray[tStartDateTime] === undefined)
      this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
    else {

      const rStartRQPackets = rXScaleMng.m_tTimeArray[tStartDateTime][strRQ];

      //시작점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
      if (rStartRQPackets === undefined)
        this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + nBongMinWidth / 2;
      //시작점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
      else
        this.m_StartXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_StartXIndex - nViewStartIndex) + rStartRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
    }
    //시작점의 y값에 대한 좌표계산
    this.m_StartYPos = rectGraphRegion.m_nBottom - (StartYValue - yMin) / yDiff * nGraphRegionHeight;
    if (bInvert === true)
      this.m_StartYPos = rectGraphRegion.m_nBottom - this.m_StartYPos + rectGraphRegion.m_nTop;

    //끝점 시간에 대한 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
    if (rXScaleMng.m_tTimeArray[tEndDateTime] === undefined)
      this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
    else {

      const rEndRQPackets = rXScaleMng.m_tTimeArray[tEndDateTime][strRQ];

      //끝점 시간 해당rq에 데이터가 존재하지 않더라도 그리기를 하기 위해 좌표계산
      if (rEndRQPackets === undefined)
        this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
      //끝점 시간 해당rq에 데이터가 존재하는 경우에 대한 좌표계산
      else
        this.m_EndXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (rToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
    }
    //끝점 y값에 대한 좌표계산
    this.m_EndYPos = rectGraphRegion.m_nBottom - (EndYValue - yMin) / yDiff * nGraphRegionHeight;
    if (bInvert === true)
      this.m_EndYPos = rectGraphRegion.m_nBottom - this.m_EndYPos + rectGraphRegion.m_nTop;

    DrawingInfo.m_ScreenContext.beginPath();

    switch (rToolInfo.m_nToolLineType) {
      case PS_SOLID:
        DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
        break;
      case PS_DASH:
        DrawingInfo.m_ScreenContext.setLineDash([8, 4]);
        break;
      case PS_DOT:
        DrawingInfo.m_ScreenContext.setLineDash([2, 3]);
        break;
      case PS_DASHDOT:
        DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]);
        break;
      case PS_DASHDOTDOT:
        DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]);
        break;
      default:
        DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
        break;
    }

    DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
    DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
    DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

    let FiboStartXPos, FiboEndXPos, FiboStartYPos, FiboEndYPos, YPos;
    let nFiboValue, nFiboCoef, nYScaleValue,
      nYDiffValue = Math.abs(rToolInfo.m_StartYValue - rToolInfo.m_EndYValue);
    let strLeftText, strRightText;

    if (this.m_StartXPos <= this.m_EndXPos) {
      FiboStartXPos = Math.floor(this.m_StartXPos) + 0.5;
      FiboStartYPos = Math.floor(this.m_StartYPos) + 0.5;
      FiboEndXPos = Math.floor(this.m_EndXPos) + 0.5;
      FiboEndYPos = Math.floor(this.m_EndYPos) + 0.5;
    } else {
      FiboStartXPos = Math.floor(this.m_EndXPos) + 0.5;
      FiboStartYPos = Math.floor(this.m_EndYPos) + 0.5;
      FiboEndXPos = Math.floor(this.m_StartXPos) + 0.5;
      FiboEndYPos = Math.floor(this.m_StartYPos) + 0.5;
    }

    // 시작점 ~ 끝점을 연결하는 선
    if (this.m_bSelected) {
        DrawingInfo.m_ScreenContext.moveTo(FiboStartXPos, FiboStartYPos);
        DrawingInfo.m_ScreenContext.lineTo(FiboEndXPos, FiboEndYPos);
    }

    const nLineCount = rToolInfo.m_arrShowFiboLine.length;
    for (let i = 0; i < nLineCount; i++) {
      if (!rToolInfo.m_arrShowFiboLine[i]) {
        continue;
      }

      nFiboValue = rToolInfo.m_arrFiboValue[i];
      nFiboCoef = (this.m_EndYPos - this.m_StartYPos) * nFiboValue / 100;

      YPos = Math.floor(this.m_EndYPos - nFiboCoef) + 0.5;
      DrawingInfo.m_ScreenContext.moveTo(FiboStartXPos, YPos);
      DrawingInfo.m_ScreenContext.lineTo(FiboEndXPos, YPos);

      // 텍스트
      if (rToolInfo.m_bShowLeftText) {

        DrawingInfo.m_ScreenContext.textBaseline = "middle";

        // Y-scale
        if (nFiboValue === 0) {
          nYScaleValue = rToolInfo.m_EndYValue;
        } else if (nFiboValue === 100) {
          nYScaleValue = rToolInfo.m_StartYValue;
        } else if (nFiboValue < 100) {
          nYScaleValue = rToolInfo.m_StartYValue - (nYDiffValue * Math.abs(nFiboValue - 100) / 100);
        } else {
          nYScaleValue = rToolInfo.m_StartYValue + (nYDiffValue * Math.abs(nFiboValue - 100) / 100);
        }

        strLeftText = ConvertNumToDigitText(nYScaleValue, rYScale.m_nDec, 1, rYScale.m_nDigit, -1, rChartBlock.m_rGlobalProperty.m_bShowThousandComma);
        DrawingInfo.m_ScreenContext.textAlign = "right";
        DrawingInfo.m_ScreenContext.fillText(strLeftText, FiboStartXPos - nTextMargin, YPos);

        // 피보나치 계수
        strRightText = `${nFiboValue.toFixed(1)} %`;
        DrawingInfo.m_ScreenContext.textAlign = "left";
        DrawingInfo.m_ScreenContext.fillText(strRightText, FiboEndXPos + nTextMargin, YPos);
      }

      // 저장
      this.m_FiboLineStartXPos = FiboStartXPos;
      this.m_FiboLineStartYPos = YPos;
      this.m_arrFiboLineEndXPos[i] = FiboEndXPos;
      this.m_arrFiboLineEndYPos[i] = YPos;
    }

    DrawingInfo.m_ScreenContext.stroke();

    this.m_bReCalc = false;

    if (this.m_bSelected) {
        DrawSelectRect(this, DrawingInfo);
    }
    DrawingInfo.m_ScreenContext.closePath();

    rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
  }
}

CFiboRetraceTool.prototype.IsInMine = function (X, Y) {

  let bIsInMine = false;

  const nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;
  if (((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) && ((this.m_StartYPos - nMargin) <= Y && Y <= (this.m_StartYPos + nMargin))) {
    this.m_nHitTestPosInfo = START_POS;
    this.m_HitPosition = null;
    return true;
  } else if (((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) && ((this.m_EndYPos - nMargin) <= Y && Y <= (this.m_EndYPos + nMargin))) {
    this.m_nHitTestPosInfo = END_POS;
    this.m_HitPosition = null;
    return true;
  }

  const rToolInfo = this.m_ToolInfo;
  const nLineCount = rToolInfo.m_arrShowFiboLine.length;
  for (let i = 0; i < nLineCount; i++) {
    if (rToolInfo.m_arrShowFiboLine[i] === false) {
      continue;
    }

    if ((this.m_FiboLineStartXPos - nMargin) <= X && X <= (this.m_arrFiboLineEndXPos[i] + nMargin) &&
      (this.m_arrFiboLineEndYPos[i] - nMargin) <= Y && Y <= (this.m_arrFiboLineEndYPos[i] + nMargin)) {
      bIsInMine = true;
    }
  }

  if (bIsInMine) {
    this.m_nHitTestPosInfo = LINE_POS;
    this.m_HitPosition = new CPoint(X, Y);
  }

  return bIsInMine;
}

CFiboRetraceTool.prototype.OnMouseMove = function (e) {

  const X = e.ChartXPos;
  const Y = e.ChartYPos;

  if (this.m_nHitTestPosInfo !== 0) {

    const rChartBlock = this.m_rChartBlock;
    const rSelectedGraph = rChartBlock.GetSelectedGraph();
    const rXScaleMng = rSelectedGraph.GetXScaleMng();
    const nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

    if (rXScaleMng.m_nType === DATETIME_TYPE) {
      const nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();
      if (nGraphRegionWidth + nRightMargin > 0) {

        ///////////////////////////////////////////////
        //모양이 변경되는 그리기 모드인 경우
        ///////////////////////////////////////////////
        if (this.m_nHitTestPosInfo === START_POS || this.m_nHitTestPosInfo === END_POS) {

          const rYScale = rSelectedGraph.GetYScale();
          const rRQSet = rSelectedGraph.GetRQSet();
          const strRQ = rRQSet.GetRQ();

          //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
          let nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

          if (nFindXIndex < 0) //과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
            nFindXIndex = 0;

          const rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
          if (rStartXIndexInBongRange) {
            if (this.m_nHitTestPosInfo === START_POS) {
              this.m_ToolInfo.m_StartXIndex = rStartXIndexInBongRange.m_nFindXIndex;
              this.m_ToolInfo.m_StartYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
              this.m_ToolInfo.m_StartDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
            } else if (this.m_nHitTestPosInfo === END_POS) {
              this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
              this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
              this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;
            }

            this.m_rXScaleMng = rXScaleMng;
            this.m_rChartBlock = rChartBlock;
          }
        } else if (this.m_nHitTestPosInfo === LINE_POS) {

          const rYScale = rSelectedGraph.GetYScale();
          const rRQSet = rSelectedGraph.GetRQSet();
          const strRQ = rRQSet.GetRQ();

          //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
          let nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
          if (nFindXIndex < 0) //과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
            nFindXIndex = 0;

          //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
          if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X ||
            rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y) {

            this.m_HitPosition.m_X = X;
            this.SetDelete(true);
            return;
          }

          this.SetDelete(false);

          //이전 클릭위치와 현재 클릭위치 차이로 이동거리와 방향 계산
          const DeltaXPos = X - this.m_HitPosition.m_X;
          const DeltaYPos = Y - this.m_HitPosition.m_Y;

          let MaxXIndex = null,
            MinXIndex = null;
          let NewMaxXIndex = null,
            NewMinXIndex = null;

          let NewMaxDateTime = null,
            NewMinDateTime = null;
          let MaxDateTime = null,
            MinDateTime = null;

          let MaxY = null,
            MinY = null;
          let NewMaxY = null,
            NewMinY = null;

          //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
          let nHitXIndex = GetXIndexByXPos(this.m_HitPosition.m_X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
          let nCurXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

          if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

            MaxXIndex = this.m_ToolInfo.m_EndXIndex;
            MaxY = this.m_EndYPos;
            MaxDateTime = this.m_ToolInfo.m_EndDateTimeT;

            MinXIndex = this.m_ToolInfo.m_StartXIndex;
            MinY = this.m_StartYPos;
            MinDateTime = this.m_ToolInfo.m_StartDateTimeT;
          } else {

            MaxXIndex = this.m_ToolInfo.m_StartXIndex;
            MaxY = this.m_StartYPos;
            MaxDateTime = this.m_ToolInfo.m_StartDateTimeT;

            MinXIndex = this.m_ToolInfo.m_EndXIndex;
            MinY = this.m_EndYPos;
            MinDateTime = this.m_ToolInfo.m_EndDateTimeT;
          }

          //우측이동
          if (DeltaXPos > 0) {

            ////////////////////////////////////////////////////////////
            //미래영역에서도 그려져야 하므로 이 부분 주석처리
            //var nTotalCnt = rXScaleMng.GetMergeDataCnt();
            //현재 마우스 위치가 전체데이터 개수를 넘어가면 마지막 위치로 이동
            //if (nCurXIndex >= nTotalCnt)
            //    nCurXIndex = nTotalCnt - 1;
            ////////////////////////////////////////////////////////////

            //이전 클릭위치(nHitXIndex)가 속한 봉의 위치 찾기
            const rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nHitXIndex);
            if (rStartXIndexInBongRange === null) {
              console.log("Fail to FindStartXIndexInBongRange 1번");
              return;
            }
            nHitXIndex = rStartXIndexInBongRange.m_nFindXIndex;
            const nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
            const nHitXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

            //nHitXIndex부터 nCurXIndex까지의 이동 봉거리 계산

            let nMoveBongCnt = this.CountMoveBongCnt(nHitXIndex, nCurXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);
            if (nMoveBongCnt === 0) //실제 봉의 이동거리가 없으므로 리턴
            {
              NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
              NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

              if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                this.m_ToolInfo.m_StartYValue = NewMinY;
                this.m_ToolInfo.m_EndYValue = NewMaxY;
              } else {

                this.m_ToolInfo.m_EndYValue = NewMinY;
                this.m_ToolInfo.m_StartYValue = NewMaxY;
              }

              this.m_rXScaleMng = rXScaleMng;
              this.m_rChartBlock = rChartBlock;

              return;
            }

            //우측으로 이동시 우측 MaxIndex부터 카운트
            let bIsUpper = (nHitXIndex <= MaxXIndex ? true : false);
            let rResult = this.MoveUpperIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
            if (rResult === null)
              return;
            NewMaxXIndex = rResult.m_nNewIndex;
            NewMaxDateTime = rResult.m_tNewDateTime;
            if (rResult.m_nBongCnt < nMoveBongCnt) //이동거리가 부족한 경우
              nMoveBongCnt = rResult.m_nBongCnt;

            //MinIndex를 우측으로 nMoveBongCnt 실봉개수만큼 이동
            bIsUpper = (nHitXIndex <= MinXIndex ? true : false);
            rResult = this.MoveUpperIndex(MinXIndex, MinDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
            if (rResult === null)
              return;
            NewMinXIndex = rResult.m_nNewIndex;
            NewMinDateTime = rResult.m_tNewDateTime;

            //y pixel정보를 이용하여 y 가격 계산
            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
              //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMinXIndex + "," + NewMaxXIndex + ")");

              this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
              this.m_ToolInfo.m_StartYValue = NewMinY;
              this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

              this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
              this.m_ToolInfo.m_EndYValue = NewMaxY;
              this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
            } else {
              //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMaxXIndex + "," + NewMinXIndex + ")");

              this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
              this.m_ToolInfo.m_EndYValue = NewMinY
              this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

              this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
              this.m_ToolInfo.m_StartYValue = NewMaxY;
              this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
            }

            this.m_rXScaleMng = rXScaleMng;
            this.m_rChartBlock = rChartBlock;

            this.m_HitPosition.m_X = X;
          } else if (DeltaXPos < 0) {
            if (nCurXIndex < 0)
              nCurXIndex = 0;

            //현재 클릭위치(nCurXIndex)가 속한 봉의 위치찾기
            //(nCurXIndex를 포함하고 있는 봉의 시작Index 찾아 nCurXIndex에 셋팅)
            const rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nCurXIndex);
            if (rStartXIndexInBongRange === null) {
              console.log("Fail to FindStartXIndexInBongRange 2번");
              return;
            }
            nCurXIndex = rStartXIndexInBongRange.m_nFindXIndex;
            const nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
            const nCurXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

            //nCurXInde로 부터 nHitXIndex까지의 실제 봉의 개수 카운트(nCurXIndex 봉은 카운트하지 않고 nHitXIndex위치 봉은 카운트)
            let nMoveBongCnt = this.CountMoveBongCnt(nCurXIndex, nHitXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);
            if (nMoveBongCnt === 0) //실제 봉의 이동거리가 없으므로 리턴
            {
              NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
              NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

              if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                this.m_ToolInfo.m_StartYValue = NewMinY;
                this.m_ToolInfo.m_EndYValue = NewMaxY;
              } else {
                this.m_ToolInfo.m_EndYValue = NewMinY;
                this.m_ToolInfo.m_StartYValue = NewMaxY;
              }

              this.m_rXScaleMng = rXScaleMng;
              this.m_rChartBlock = rChartBlock;

              return;
            }

            //nMoveBongCnt만큼 양 끝점 이동시키기
            let bIsUpper = (nCurXIndex < MinXIndex) ? true : false;
            let rResult = this.MoveLowerIndex(MinXIndex, MinDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
            if (rResult === null)
              return;
            NewMinXIndex = rResult.m_nNewIndex;
            NewMinDateTime = rResult.m_tNewDateTime;
            if (rResult.m_nBongCnt < nMoveBongCnt) //이동거리가 부족한 경우
              nMoveBongCnt = rResult.m_nBongCnt;

            bIsUpper = (nCurXIndex < MaxXIndex) ? true : false;
            rResult = this.MoveLowerIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
            if (rResult === null)
              return;
            NewMaxXIndex = rResult.m_nNewIndex;
            NewMaxDateTime = rResult.m_tNewDateTime;

            NewMaxY = GetYValueByYPos((MaxY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
            NewMinY = GetYValueByYPos((MinY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

              this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
              this.m_ToolInfo.m_StartYValue = NewMinY;
              this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

              this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
              this.m_ToolInfo.m_EndYValue = NewMaxY;
              this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
            } else {
              this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
              this.m_ToolInfo.m_EndYValue = NewMinY;
              this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

              this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
              this.m_ToolInfo.m_StartYValue = NewMaxY;
              this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
            }

            this.m_rXScaleMng = rXScaleMng;
            this.m_rChartBlock = rChartBlock;

            this.m_HitPosition.m_X = X;
          }
        }
      }
    }
  }
}

export function CFiboTimeTool(rXScaleMng, rRQSet, rChartBlock) {
    CBaseTool.call(this, rXScaleMng, rRQSet, rChartBlock);

    const nXScaleType = rXScaleMng.m_nType;
    const KeyCode = rRQSet.m_RQInfo.m_strItemCode;
    const Cycle = rRQSet.m_RQInfo.m_nCycle;
    const nInterval = rRQSet.m_RQInfo.m_nInterval;

    //실제 좌표
    this.m_StartXPos = null; // 툴 시작지점 X
    this.m_StartYPos = null; // 툴 시작지점 Y
    this.m_EndXPos = null; // 툴 종료지점 X
    this.m_EndYPos = null; // 툴 종료지점 Y

    this.m_nIntervalBongCount = 0;//2점 사이의 봉개수(Start봉, End봉 모두 포함)-이동할 때 기준이 됨(봉간격 유지)

    this.m_ToolInfo = new CFiboTimeToolInfo(rXScaleMng.m_rChart.GetChartType(), TOOL_TYPE['FIBONACCI_TIME_TOOL'], nXScaleType, KeyCode, Cycle, nInterval);

    this.m_FiboLineStartXPos = null; // 라인 시작지점 X
    this.m_FiboLineStartYPos = null; // 라인 시작지점 Y
    this.m_arrFiboLineEndXPos = []; // 피보나치 비율로 계산한 라인 끝지점 X
    this.m_arrFiboLineEndYPos = []; // 피보나치 비율로 계산한 라인 끝지점 Y
    this.m_arrFiboLineExpEndXPos = []; // 피보나치 비율로 계산 후 우측확장 적용한 끝지점 X - 실제 Draw point
    this.m_arrFiboLineExpEndYPos = []; // 피보나치 비율로 계산 후 우측확장 적용한 끝지점 Y - 실제 Draw point
}
CFiboTimeTool.prototype = new CBaseTool();
CFiboTimeTool.prototype.constructor = CFiboTimeTool;

CFiboTimeTool.prototype.Copy = function (rCopy) {

    if (rCopy == undefined || rCopy == null) {
        rCopy = new CFiboTimeTool(this.m_rXScaleMng, this.m_rRQSet, this.m_rChartBlock);
    }
    this.m_ToolInfo.Copy(rCopy.m_ToolInfo);

    if (this.m_rectClip) {
        if (!rCopy.m_rectClip)
            rCopy.m_rectClip = new CRect();

        rCopy.m_rectClip.m_nLeft = this.m_rectClip.m_nLeft;
        rCopy.m_rectClip.m_nTop = this.m_rectClip.m_nTop;
        rCopy.m_rectClip.m_nRight = this.m_rectClip.m_nRight;
        rCopy.m_rectClip.m_nBottom = this.m_rectClip.m_nBottom;
    }

    rCopy.m_bSelected = this.m_bSelected;
    rCopy.m_srcTool = this;

    //클릭한 위치정보
    rCopy.m_nHitTestPosInfo = this.m_nHitTestPosInfo;//도형에 따라 정보값은 달라진다 (예:선인 경우=>START_POS(클릭한 위치가 시작점), END_POS(클릭한 위치가 끝점), LINE_POS(클릭한 위치가 선분))

    if (this.m_HitPosition) {
        if (rCopy.m_HitPosition == null)
            rCopy.m_HitPosition = new CPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
        else
            rCopy.m_HitPosition.SetPoint(this.m_HitPosition.m_X, this.m_HitPosition.m_Y);
    }
    else
        rCopy.m_HitPosition = this.m_HitPosition;


    //라인추세선의 시작점과 끝나는 점 복사
    rCopy.m_StartXPos = this.m_StartXPos;
    rCopy.m_StartYPos = this.m_StartYPos;
    rCopy.m_EndXPos = this.m_EndXPos;
    rCopy.m_EndYPos = this.m_EndYPos;

    return rCopy;
}

CFiboTimeTool.prototype.DrawToolOnMouseMove = function (DrawingInfo) {
    const rXScaleMng = this.m_rXScaleMng;
    const rChartBlock = this.m_rChartBlock;

    const rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    const rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    const rToolInfo = this.m_ToolInfo;
    const rectGraphRegion = DrawingInfo.m_rectGraphRegion;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {
        DrawingInfo.m_ScreenContext.save();

        DrawingInfo.m_ScreenContext.beginPath();
        DrawingInfo.m_ScreenContext.rect(rectGraphRegion.m_nLeft, rectGraphRegion.m_nTop, rectGraphRegion.Width(), rectGraphRegion.Height());
        DrawingInfo.m_ScreenContext.clip();

        DrawingInfo.m_ScreenContext.beginPath();
        switch (rToolInfo.m_nToolLineType) {
        case PS_SOLID:
            DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
            break;
        case PS_DASH:
            DrawingInfo.m_ScreenContext.setLineDash([8, 4]);
            break;
        case PS_DOT:
            DrawingInfo.m_ScreenContext.setLineDash([2, 3]);
            break;
        case PS_DASHDOT:
            DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]);
            break;
        case PS_DASHDOTDOT:
            DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]);
            break;
        default:
            DrawingInfo.m_ScreenContext.setLineDash([0, 0]);
            break;
        }
        DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

        const nViewStartIndex = rXScaleMng.m_nViewStartIndex;
        const tEndDateTime = rXScaleMng.m_tTimeArray[rToolInfo.m_EndDateTimeT];
        const nBongMinWidth = rChartBlockCol.m_BongMinWidth;
        let startXPos, XPos;
        if (!tEndDateTime) {
            startXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        } else {
            const strRQ = this.m_rRQSet.GetRQ();
            const rEndRQPackets = tEndDateTime[strRQ];
            if (!rEndRQPackets) {
                startXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            } else {
                startXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
            }
        }
        const yStartPos = rectGraphRegion.m_nTop;
        const yEndPos = rectGraphRegion.m_nBottom;

        const nTextMargin = 5;
        const nLineCount = rToolInfo.m_arrShowFiboLine.length;
        let fiboXpos = startXPos;
        for (let i = 0; i < nLineCount; i++) {
            const value = rToolInfo.m_arrFiboValue[i];
            if (value) {
                fiboXpos += value * 2 * nBongMinWidth / 2;
            }

            if (!rToolInfo.m_arrShowFiboLine[i]) {
              continue;
            }

            XPos = Math.floor(fiboXpos) + 0.5;
            DrawingInfo.m_ScreenContext.moveTo(XPos, yStartPos);
            DrawingInfo.m_ScreenContext.lineTo(XPos, yEndPos);            

            if (rToolInfo.m_bShowLeftText) {
                DrawingInfo.m_ScreenContext.textBaseline = 'middle';
                DrawingInfo.m_ScreenContext.textAlign = 'left';
                DrawingInfo.m_ScreenContext.fillText(value, fiboXpos + nTextMargin, yEndPos / 2);
            }            

            // 저장
            this.m_FiboLineStartXPos = fiboXpos;
            this.m_FiboLineStartYPos = yStartPos;
            this.m_arrFiboLineEndXPos[i] = fiboXpos;
            this.m_arrFiboLineEndYPos[i] = yEndPos;
            this.m_arrFiboLineExpEndXPos[i] = fiboXpos;
            this.m_arrFiboLineExpEndYPos[i] = yEndPos;
        }

        DrawingInfo.m_ScreenContext.stroke();
        DrawingInfo.m_ScreenContext.restore();
    }
}

CFiboTimeTool.prototype.Draw = function (DrawingInfo) {
    
    const rXScaleMng = this.m_rXScaleMng;
    const rChartBlock = this.m_rChartBlock;
    const rSelectGraph = rChartBlock.GetSelectedGraph();
    if (rSelectGraph === null)
        return;

    const rChartBlockCol = rSelectGraph.m_rRQInCol.m_rChartBlockCol;

    DrawingInfo.m_rectGraphRegion.SetRect(rChartBlock.m_rectGraphRegion.m_nLeft, rChartBlock.m_rectGraphRegion.m_nTop, rChartBlock.m_rectGraphRegion.m_nRight + rChartBlock.m_rGlobalProperty.GetRightMargin(), rChartBlock.m_rectGraphRegion.m_nBottom);
    DrawingInfo.m_rectGraphBackground.SetRect(rChartBlock.m_rectGraphBackground.m_nLeft, rChartBlock.m_rectGraphBackground.m_nTop, rChartBlock.m_rectGraphBackground.m_nRight, rChartBlock.m_rectGraphBackground.m_nBottom);

    const rToolInfo = this.m_ToolInfo;
    const rectGraphRegion = DrawingInfo.m_rectGraphRegion;

    if (rXScaleMng.GetType() === DATETIME_TYPE) {

        DrawingInfo.m_ScreenContext.beginPath();

        switch (rToolInfo.m_nToolLineType)
        {
        case PS_SOLID: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        case PS_DASH: DrawingInfo.m_ScreenContext.setLineDash([8, 4]); break;
        case PS_DOT: DrawingInfo.m_ScreenContext.setLineDash([2, 3]); break;
        case PS_DASHDOT: DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3]); break;
        case PS_DASHDOTDOT: DrawingInfo.m_ScreenContext.setLineDash([15, 3, 3, 3, 3, 3]); break;
        default: DrawingInfo.m_ScreenContext.setLineDash([0, 0]); break;
        }

        DrawingInfo.m_ScreenContext.fillStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.strokeStyle = rToolInfo.m_clrTool;
        DrawingInfo.m_ScreenContext.lineWidth = rToolInfo.m_nThickness;

        const nViewStartIndex = rXScaleMng.m_nViewStartIndex;
        const tEndDateTime = rXScaleMng.m_tTimeArray[rToolInfo.m_EndDateTimeT];
        const nBongMinWidth = rChartBlockCol.m_BongMinWidth;
        let startXPos, XPos;
        if (!tEndDateTime) {
            startXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
        } else {
            const strRQ = this.m_rRQSet.GetRQ();
            const rEndRQPackets = tEndDateTime[strRQ];
            if (!rEndRQPackets) {
                startXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + nBongMinWidth / 2;
            } else {
                startXPos = rectGraphRegion.m_nLeft + nBongMinWidth * (this.m_ToolInfo.m_EndXIndex - nViewStartIndex) + rEndRQPackets.m_nRelativeEndIndex * nBongMinWidth / 2;
            }
        }
        const yStartPos = rectGraphRegion.m_nTop;
        const yEndPos = rectGraphRegion.m_nBottom;

        this.m_StartXPos = startXPos;
        this.m_StartYPos = yEndPos;
        this.m_EndYPos = yEndPos;

        const nTextMargin = 5;
        const nLineCount = rToolInfo.m_arrShowFiboLine.length;
        let fiboXpos = startXPos;
        for (let i = 0; i < nLineCount; i++) {
            const value = rToolInfo.m_arrFiboValue[i];
            if (value) {
                fiboXpos += value * 2 * nBongMinWidth / 2;
            }

            if (!rToolInfo.m_arrShowFiboLine[i]) {
              continue;
            }

            XPos = Math.floor(fiboXpos) + 0.5;
            DrawingInfo.m_ScreenContext.moveTo(XPos, yStartPos);
            DrawingInfo.m_ScreenContext.lineTo(XPos, yEndPos);

            if (rToolInfo.m_bShowLeftText) {
                DrawingInfo.m_ScreenContext.textBaseline = 'middle';
                DrawingInfo.m_ScreenContext.textAlign = 'left';
                DrawingInfo.m_ScreenContext.fillText(value, fiboXpos + nTextMargin, yEndPos / 2);
            }            

            // 저장
            this.m_FiboLineStartXPos = fiboXpos;
            this.m_FiboLineStartYPos = yStartPos;
            this.m_arrFiboLineEndXPos[i] = fiboXpos;
            this.m_arrFiboLineEndYPos[i] = yEndPos;
            this.m_arrFiboLineExpEndXPos[i] = fiboXpos;
            this.m_arrFiboLineExpEndYPos[i] = yEndPos;
        }

        DrawingInfo.m_ScreenContext.stroke();

        this.m_EndXPos = fiboXpos;
        this.m_bReCalc = false;

        if (this.m_bSelected) {
            DrawSelectRect(this, DrawingInfo);
        }
        DrawingInfo.m_ScreenContext.closePath();

        rChartBlock.m_ShowToolArray[rChartBlock.m_ShowToolArray.length] = this;
    }
}

CFiboTimeTool.prototype.IsInMine = function (X, Y) {
  const nMargin = this.m_ToolInfo.m_nThickness + this.m_rChartBlock.m_rChart.m_ToolMargin;

    if ((this.m_StartXPos - nMargin) <= X && X <= (this.m_StartXPos + nMargin)) {
        this.m_nHitTestPosInfo = START_POS;
        this.m_HitPosition = null;
        return true;
    } else if ((this.m_EndXPos - nMargin) <= X && X <= (this.m_EndXPos + nMargin)) {
        this.m_nHitTestPosInfo = END_POS;
        this.m_HitPosition = null;
        return true;
    }

    const arrFiboLineExpEndXPos = this.m_arrFiboLineExpEndXPos;
    const rToolInfo = this.m_ToolInfo;
    const arrShowFiboLine = rToolInfo.m_arrShowFiboLine;
    const nLineCount = arrShowFiboLine.length;
    for (let i = 0; i < nLineCount; i++) {
        if (!arrShowFiboLine[i]) {
            continue;
        }

        const endXPos = arrFiboLineExpEndXPos[i];
        if (X < (endXPos - nMargin) || X > (endXPos + nMargin)) {
            continue;
        }
        this.m_nHitTestPosInfo = LINE_POS;
        this.m_HitPosition = new CPoint(X, Y);
        return true;
    }
    return false;
}

CFiboTimeTool.prototype.OnMouseMove = function (e, rCurChartBlock) {
    
    var X = e.ChartXPos;
    var Y = e.ChartYPos;

    if (this.m_nHitTestPosInfo !== 0) {

        var rChartBlock = this.m_rChartBlock;
        var rSelectedGraph = rChartBlock.GetSelectedGraph();
        var rXScaleMng = rSelectedGraph.GetXScaleMng();
        var nGraphRegionWidth = rChartBlock.m_rectGraphRegion.Width();

        if (rXScaleMng.m_nType === DATETIME_TYPE) {

            var rChartBlockCol = rSelectedGraph.m_rRQInCol.m_rChartBlockCol;
            var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
            var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
            var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;
            var nRightMargin = rChartBlock.m_rChart.GetGlobalProperty().GetRightMargin();
            if (nGraphRegionWidth + nRightMargin > 0) {

                ///////////////////////////////////////////////
                //모양이 변경되는 그리기 모드인 경우
                ///////////////////////////////////////////////
                if (this.m_nHitTestPosInfo === START_POS || this.m_nHitTestPosInfo === END_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.m_nViewEndIndex - rXScaleMng.m_nViewStartIndex + 1;

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    //console.log("CLineTool.OnMouseMove [X:" + X + ", nFindXIndex:" + nFindXIndex + "]");

                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nTotalCnt = rXScaleMng.GetMergeDataCnt();

                    var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nFindXIndex);
                    if (rStartXIndexInBongRange) {
                        //console.log("CLineTool.OnMouseMove FindStartXIndex [nFindXIndex:" + nFindXIndex + ", StartXIndexInBongRange:" + rStartXIndexInBongRange.m_nFindXIndex + "]");

                        this.m_ToolInfo.m_EndXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        this.m_ToolInfo.m_EndYValue = GetYValueByYPos(Y, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        this.m_ToolInfo.m_EndDateTimeT = rStartXIndexInBongRange.m_tFindDateTime;

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;
                    }
                }
                else if (this.m_nHitTestPosInfo === LINE_POS) {

                    var rYScale = rSelectedGraph.GetYScale();
                    var rRQSet = rSelectedGraph.GetRQSet();

                    var nViewDataCnt = rXScaleMng.GetViewDataCnt();

                    var strRQ = rRQSet.GetRQ();

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nFindXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    if (nFindXIndex < 0)//과거 데이터를 지나쳐 지정된 경우는 가장 먼 과거데이터 위치로 강제셋팅
                        nFindXIndex = 0;

                    var nViewStartIndex = rXScaleMng.m_nViewStartIndex;
                    var nViewEndIndex = rXScaleMng.m_nViewEndIndex;
                    var nViewEndIncludeRightMargin = rChartBlockCol.m_nViewEndIndexIncludeRightMargin;

                    //클릭한 지점(X,Y)을 차트 영역 밖으로 드래그 이동시킨 경우 삭제처리
                    if (X < rChartBlock.m_rectGraphRegion.m_nLeft || rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < X ||
                        rChartBlock.m_rectGraphRegion.m_nTop > Y || rChartBlock.m_rectGraphRegion.m_nBottom < Y )
                    {

                        this.m_HitPosition.m_X = X;
                        this.SetDelete(true);
                        return;
                    }

                    this.SetDelete(false);

                    //if (this.m_HitPosition.m_X < rChartBlock.m_rectGraphRegion.m_nLeft)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nLeft;
                    //else if (rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin < this.m_HitPosition.m_X)
                    //    this.m_HitPosition.m_X = rChartBlock.m_rectGraphRegion.m_nRight + nRightMargin ;

                    //이전 클릭위치와 현재 클릭위치 차이로 이동거리와 방향 계산
                    var DeltaXPos = X - this.m_HitPosition.m_X;
                    var DeltaYPos = Y - this.m_HitPosition.m_Y;

                    var MaxXIndex = null, MinXIndex = null;
                    var NewMaxXIndex = null, NewMinXIndex = null;

                    var NewMaxDateTime = null, NewMinDateTime = null;
                    var MaxDateTime = null, MinDateTime = null;

                    var MaxY = null, MinY = null;
                    var NewMaxY = null, NewMinY = null;

                    //X pixel 좌표값으로부터 최소시간단위봉의 index 얻어냄
                    var nHitXIndex = GetXIndexByXPos(this.m_HitPosition.m_X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);
                    var nCurXIndex = GetXIndexByXPos(X, rChartBlock.m_rectGraphRegion, rXScaleMng.m_nViewStartIndex, rXScaleMng.m_nViewEndIndex);

                    if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                        MaxXIndex = this.m_ToolInfo.m_EndXIndex;
                        MaxY = this.m_EndYPos;
                        MaxDateTime = this.m_ToolInfo.m_EndDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_StartXIndex;
                        MinY = this.m_StartYPos;
                        MinDateTime = this.m_ToolInfo.m_StartDateTimeT;
                    }
                    else {

                        MaxXIndex = this.m_ToolInfo.m_StartXIndex;
                        MaxY = this.m_StartYPos;
                        MaxDateTime = this.m_ToolInfo.m_StartDateTimeT;

                        MinXIndex = this.m_ToolInfo.m_EndXIndex;
                        MinY = this.m_EndYPos;
                        MinDateTime = this.m_ToolInfo.m_EndDateTimeT;
                    }

                    //우측이동
                    if (DeltaXPos > 0) {

                        ////////////////////////////////////////////////////////////
                        //미래영역에서도 그려져야 하므로 이 부분 주석처리
                        //var nTotalCnt = rXScaleMng.GetMergeDataCnt();
                        //현재 마우스 위치가 전체데이터 개수를 넘어가면 마지막 위치로 이동
                        //if (nCurXIndex >= nTotalCnt)
                        //    nCurXIndex = nTotalCnt - 1;
                        ////////////////////////////////////////////////////////////

                        //이전 클릭위치(nHitXIndex)가 속한 봉의 위치 찾기
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nHitXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 1번");
                            return;
                        }
                        nHitXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nHitXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //nHitXIndex부터 nCurXIndex까지의 이동 봉거리 계산

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        var nMoveBongCnt = this.CountMoveBongCnt(nHitXIndex, nCurXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {

                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //우측으로 이동시 우측 MaxIndex부터 카운트
                        var bIsUpper = (nHitXIndex <= MaxXIndex ? true : false);
                        var rResult = this.MoveUpperIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        //MinIndex를 우측으로 nMoveBongCnt 실봉개수만큼 이동
                        bIsUpper = (nHitXIndex <= MinXIndex ? true : false);
                        rResult = this.MoveUpperIndex(MinXIndex, MinDateTime, nMoveBongCnt, nHitXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;

                        //y pixel정보를 이용하여 y 가격 계산
                        NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMinXIndex + "," + NewMaxXIndex + ")");

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            //console.log("OnMouseMove 이전StartIndex,EndIndex:(" + this.m_ToolInfo.m_StartXIndex + "," + this.m_ToolInfo.m_EndXIndex + "), 새 StartIndex, EndIndex(" + NewMaxXIndex + "," + NewMinXIndex + ")");

                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                    else if (DeltaXPos < 0) {
                        if (nCurXIndex < 0)
                            nCurXIndex = 0;

                        //현재 클릭위치(nCurXIndex)가 속한 봉의 위치찾기
                        //(nCurXIndex를 포함하고 있는 봉의 시작Index 찾아 nCurXIndex에 셋팅)
                        var rStartXIndexInBongRange = this.FindStartXIndexInBongRange(strRQ, rXScaleMng, nCurXIndex);
                        if (rStartXIndexInBongRange === null) {
                            console.log("Fail to FindStartXIndexInBongRange 2번");
                            return;
                        }
                        nCurXIndex = rStartXIndexInBongRange.m_nFindXIndex;
                        var nXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;
                        var nCurXScaleItemArrayIndex = rStartXIndexInBongRange.m_nXScaleItemArrayIndex;

                        //test
                        if (nHitXIndex !== nCurXIndex)
                            var a = 0;

                        //nCurXInde로 부터 nHitXIndex까지의 실제 봉의 개수 카운트(nCurXIndex 봉은 카운트하지 않고 nHitXIndex위치 봉은 카운트)
                        var nMoveBongCnt = this.CountMoveBongCnt(nCurXIndex, nHitXIndex, nXScaleItemArrayIndex, rXScaleMng, strRQ);

                        console.log("CLineTool.OnMouseMove nHitXIndex=" + nHitXIndex + ", nCurXIndex=" + nCurXIndex + ", nMoveBongCnt=" + nMoveBongCnt);

                        if (nMoveBongCnt === 0)//실제 봉의 이동거리가 없으므로 리턴
                        {
                            NewMaxY = GetYValueByYPos(MaxY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                            NewMinY = GetYValueByYPos(MinY + DeltaYPos, rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                            if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {
                                this.m_ToolInfo.m_StartYValue = NewMinY;
                                this.m_ToolInfo.m_EndYValue = NewMaxY;
                            }
                            else {
                                this.m_ToolInfo.m_EndYValue = NewMinY;
                                this.m_ToolInfo.m_StartYValue = NewMaxY;
                            }

                            this.m_rXScaleMng = rXScaleMng;
                            this.m_rChartBlock = rChartBlock;

                            return;
                        }

                        //nMoveBongCnt만큼 양 끝점 이동시키기
                        var bIsUpper = (nCurXIndex < MinXIndex) ? true : false;
                        var rResult = this.MoveLowerIndex(MinXIndex, MinDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMinXIndex = rResult.m_nNewIndex;
                        NewMinDateTime = rResult.m_tNewDateTime;
                        if (rResult.m_nBongCnt < nMoveBongCnt)//이동거리가 부족한 경우
                            nMoveBongCnt = rResult.m_nBongCnt;

                        bIsUpper = (nCurXIndex < MaxXIndex) ? true : false;
                        rResult = this.MoveLowerIndex(MaxXIndex, MaxDateTime, nMoveBongCnt, nCurXScaleItemArrayIndex, bIsUpper, rXScaleMng, strRQ);
                        if (rResult === null)
                            return;
                        NewMaxXIndex = rResult.m_nNewIndex;
                        NewMaxDateTime = rResult.m_tNewDateTime;

                        NewMaxY = GetYValueByYPos((MaxY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());
                        NewMinY = GetYValueByYPos((MinY + DeltaYPos), rChartBlock.m_rectGraphRegion, rYScale.m_MinMaxInfo, rYScale.GetLog(), rYScale.GetInvert());

                        if (this.m_ToolInfo.m_StartXIndex < this.m_ToolInfo.m_EndXIndex) {

                            this.m_ToolInfo.m_StartXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMinY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_EndXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMaxY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMaxDateTime;
                        }
                        else {
                            this.m_ToolInfo.m_EndXIndex = NewMinXIndex;
                            this.m_ToolInfo.m_EndYValue = NewMinY;
                            this.m_ToolInfo.m_EndDateTimeT = NewMinDateTime;

                            this.m_ToolInfo.m_StartXIndex = NewMaxXIndex;
                            this.m_ToolInfo.m_StartYValue = NewMaxY;
                            this.m_ToolInfo.m_StartDateTimeT = NewMaxDateTime;
                        }

                        this.m_rXScaleMng = rXScaleMng;
                        this.m_rChartBlock = rChartBlock;

                        this.m_HitPosition.m_X = X;
                    }
                }
            }
        }
    }
}
