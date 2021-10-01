
import {
    CFindInfo,
    CHogaDepthSubGraph,
    CHogaDepthDepthTypeInfo,
    CHogaDepthSubGraphPropertyInfo,
    CPriceSubGraph,
    CPriceSubGraphPropertyInfo,    
    CVolumeSubGraph,
	CVolumeSubGraphPropertyInfo,
    CGraph,
    CIndicatorSubGraphPropertyInfo,
    CIndicatorLineTypeInfo,
    CIndicatorBarTypeInfo,
    CIndicatorSubGraph,
    CGraphPropertyInfo,
    CVariable,
    CIndiPropertyInfo,
    NUMERIC_TYPE,
    CGraphTitleInfo,
    CBaseLine,
    INPUT_PACKET_USE_TYPE,
    CALC_PACKET_USE_TYPE,
    INDICATOR_PACKET_USE_TYPE,
    INDICATOR_SUBGRAPH_BAR_TYPE,
    INDICATOR_SUBGRAPH_LINE_TYPE,
    PRICE_SUBGRAPH_CANDLE_TYPE,
    PRICE_SUBGRAPH_LINE_TYPE,
    PRICE_SUBGRAPH_BAR_TYPE,
    PRICE_SUBGRAPH_PANDF_TYPE,
    PRICE_SUBGRAPH_THREEELINE_TYPE,
    ConvertNumToDigitText,
    CSignalItemData,
    CHTMLChart,
    PRICE_TYPE_GROUPS,
    OVERLAY_TYPE,
    DATETIME_TYPE,
    ChangeGlobalTime,
    TYPE_FIND_SIGNAL,
    CFindSignalSubInfo,
    CYCLE_DAY,
    CYCLE_WEEK,
    CYCLE_MONTH,
    CYCLE_YEAR,
    CYCLE_MIN,
    CYCLE_SECOND,
    CPAndFSubGraph,
    CRQPacketsItem,
	CThreeLineSubGraph,
    floor,    
    UPDATE_MINMAXITEM_MAX,
    UPDATE_MINMAXITEM_MIN,
    UPDATE_VIEW_MAX,
    UPDATE_VIEW_MIN,
    UPDATE_FULL_MAX,
    UPDATE_FULL_MIN,
    UPDATE_APPEND_DATA,
    RECALC_SPECIALCHART,
    REALCALC_SUCCESS,
    REALCALC_FAIL
} from './kfitsChart.js'

import t from '../common/i18n'
import { sprintf } from '../common/utils.js'

function CIndicator(rRQSet, strIndicatorName, strKey) {
    CGraph.call(this, rRQSet, strIndicatorName, strKey);
    this.m_nDigit = -2;//지표소수점자리수(기본적으로 소수점 2자리표현 -예외: 채널지표는 해당종목 자리수를 따라가며 가격이평은 가격자리수, 거래량이평은 거래량자리수 따라간다)
	this.m_InputPacketDataArray = [];//계산시에 입력으로 사용될 패킷명 배열
    this.m_VariableArray = [];//계산시에 사용될 변수 배열
    this.m_SaveData = [];//지표들의 실시간 계산속도개선을 위한 임시데이터 저장 공간    
    this.m_bSpecialIndicator = false;
}
CIndicator.prototype = new CGraph();
CIndicator.prototype.constructor = CIndicator;

CIndicator.prototype.ChangeLang = function(){

    CGraph.prototype.ChangeLang.call(this);
    
    var i, rVariable, nLen = this.m_VariableArray.length;
    for( i = 0 ; i < nLen; i++ )
    {
        rVariable = this.m_VariableArray[i];
        rVariable.ChangeLang();
    }
}
CIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var nLength = this.m_SubGraphArray.length;        
    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorParameter = this.m_rGlobalProperty.m_bShowIndicatorParameter;
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    let rSubGraph;
    let i, rShowGraphArray = [];
    var strTitle, strLastestData, rLastestPacketItemData = null;
    for(i = 0 ; i < nLength ; i++ )
    {
        rSubGraph = this.m_SubGraphArray[i];
        if(rSubGraph.m_bShow)
            rShowGraphArray[ rShowGraphArray.length ] = rSubGraph;
        else
            rSubGraph.HideTitle();
    }

    //Show상태 서브그래프가 없는 경우
    nLength = rShowGraphArray.length;
    if(nLength <= 0)
    {
        rSubGraph = this.m_SubGraphArray[0];
        if (bShowIndicatorName === true) {

            strTitle = this.m_strTitle;

            if (bShowIndicatorParameter === true) {
                
                var nVLength = this.m_VariableArray.length;
                if (nVLength > 0) {
                    strTitle += "(";
                    for (var j = 0; j < nVLength; j++) {
                        var rVariable = this.m_VariableArray[j];
                        strTitle += rVariable.m_strData;
                        if (j < nVLength - 1)
                            strTitle += ",";
                    }
                    strTitle += ")";
                }
            }
            rSubGraph.SetTitle(strTitle);
            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
        else
            this.HideTitle();
    }
    else
    {        
        for( i = 0; i < nLength; i++ )
        {
            rSubGraph = rShowGraphArray[i];
            
            if (i === 0) {

                if (bShowIndicatorName === true) {
    
                    strTitle = rSubGraph.m_strSubGraphTitle;
    
                    if (bShowIndicatorParameter === true) {
                        
                        var nVLength = this.m_VariableArray.length;
                        if (nVLength > 0) {
                            strTitle += "(";
                            for (var j = 0; j < nVLength; j++) {
                                var rVariable = this.m_VariableArray[j];
                                strTitle += rVariable.m_strData;
                                if (j < nVLength - 1)
                                    strTitle += ",";
                            }
                            strTitle += ")";
                        }
                    }
                }
                else
                    strTitle = "";
            }
            else {
    
                if (bShowIndicatorName === true)
                    strTitle = rSubGraph.m_strSubGraphTitle;
                else
                    strTitle = "";
            }
            if (bShowIndicatorValue === true) {

                rLastestPacketItemData = rSubGraph.m_rPacketData.GetLastestPacketItemData();
                if (rLastestPacketItemData !== null) {

                    if (rLastestPacketItemData.GetPacketType() === NUMERIC_TYPE) {
                        strLastestData = ConvertNumToDigitText(rLastestPacketItemData.m_Data, rLastestPacketItemData.m_rPacketData.m_nDec, 1, rLastestPacketItemData.m_rPacketData.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                        strTitle += "(" + strLastestData + ")";
                    }
                    else
                        strTitle += "(" + rLastestPacketItemData.m_Data + ")";
                }
            }
            rSubGraph.SetTitle(strTitle);            
    
            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
    }
}
CIndicator.prototype.SetPropertyInfo = function (strKey, PropertyInfo, bSetup) {

    if (this.m_strKey !== strKey)
        return false;

    if (!CGraph.prototype.SetPropertyInfo.call(this, strKey, PropertyInfo, bSetup))
        return false;

    this.m_bSpecialIndicator = PropertyInfo.m_bSpecialIndicator;

    var i, j;
    var rVariable, rPropVariable;
    var nVarLength = this.m_VariableArray.length;
    var nPropLength = PropertyInfo.m_VariableArray.length;
    var nMinLength = nPropLength > nVarLength ? nVarLength : nPropLength;

    var bCalc = false;
    for (i = 0; i < nMinLength; i++) {

        rPropVariable = PropertyInfo.m_VariableArray[i];
        rVariable = this.m_VariableArray[i];
        rVariable.SetPropertyInfo(rPropVariable, bSetup);
        if (rVariable.m_bCalc)
            bCalc = true;
    }
    if (bSetup === true && bCalc === true) {
        this.Calc(bSetup);
        if(this.m_bSpecialIndicator)
        {
            let rXScaleMng = this.GetXScaleMng();
            if(rXScaleMng)
            {
                let nDataLen = this.m_rXAxisPacket.GetDataArraySize();
                rXScaleMng.Merge(this.m_rXAxisPacket, false, nDataLen);
                rXScaleMng.Arrange();                
                this.m_rChart.InitialViewInfo(100);
                this.m_rChart.ExtractYScaleMinMax(true);
            }            
        }
        else{
            this.m_rBlock.ExtractYScaleMinMax(true);
        }
    }

    return true;
}
CIndicator.prototype.GetPropertyInfo = function (strKey, rIndiPropertyInfo) {

    var i, j;

    if (strKey !== undefined && this.m_strKey !== strKey)
        return null;

    if (rIndiPropertyInfo === undefined)
        rIndiPropertyInfo = new CIndiPropertyInfo();

    CGraph.prototype.GetPropertyInfo.call(this, strKey, rIndiPropertyInfo);
    
    rIndiPropertyInfo.m_VariableArray.length = 0;
    var length = this.m_VariableArray.length;
    for (i = 0; i < length; i++) {
        rIndiPropertyInfo.m_VariableArray[i] = this.m_VariableArray[i];
    }

    rIndiPropertyInfo.m_bSpecialIndicator = this.m_bSpecialIndicator;

    return rIndiPropertyInfo;
}
CIndicator.prototype.GetGraphTitleInfo = function () {

    //그래프명 저장
    var GraphTitleInfo = new CGraphTitleInfo();
    GraphTitleInfo.m_strGraphTitle = this.m_strName;

    //입력변수배열 저장
    var i, vlength = this.m_VariableArray.length;
    for (i = 0; i < vlength; i++) {
        GraphTitleInfo.m_VariableArray[GraphTitleInfo.m_VariableArray.length] = this.m_VariableArray[i];
    }

    //서브그래프 타이틀 관련 정보 저장
    var length = this.m_SubGraphArray.length;
    for (i = 0; i < length; i++) {
        var SubGraph = this.m_SubGraphArray[i];
        var SubGraphTitleInfo = SubGraph.GetSubGraphTitleInfo();
        if (this.m_SubGraphArray[i].m_bShow == false) continue;
        GraphTitleInfo.m_SubGraphTitleInfoArray[GraphTitleInfo.m_SubGraphTitleInfoArray.length] = SubGraphTitleInfo;
    }

    return GraphTitleInfo;
}

//지표계산을 위한 PacketData 등록
CIndicator.prototype.AddInputPacket = function (strInputPacketNameArray) {
    //console.log("________AddInputPacket Start____________");
    if (!this.m_rRQSet)
        return false;

    for (var i = 0; i < strInputPacketNameArray.length; i++) {
        var rPacketData = this.m_rRQSet.GetPacketData(strInputPacketNameArray[i]);
        //console.log(rPacketData);
        if (rPacketData)
            this.m_InputPacketDataArray[this.m_InputPacketDataArray.length] = rPacketData;
    }
    //console.log("________AddInputPacket End____________");
    return true;
}

//지표계산을 위한 변수 등록
CIndicator.prototype.AddVariable = function (VariableName, VariableType, VariableValue, VariableTitle , VariableTitleLangKey) {

    var Variable = new CVariable();
    Variable.m_strName = VariableName;
    Variable.m_nType = VariableType;
    Variable.m_strData = VariableValue;

    if(VariableTitleLangKey && VariableTitleLangKey.length > 0)
        Variable.m_strTitle = t(VariableTitleLangKey);
    else
        Variable.m_strTitle = VariableTitle === undefined ? VariableName : VariableTitle;   

    this.m_VariableArray[this.m_VariableArray.length] = Variable;
}

//지표계산 함수(상속받은 클래스에 실제 계산함수 추가할 것!!!)
CIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    if (!this.m_rRQSet)
        return false;

    if(this.m_strGroup === "PRICE")
        this.m_nDigit = this.m_rRQSet.m_nPriceDigit;
    else if(this.m_strGroup === "VOLUME")
        this.m_nDigit = this.m_rRQSet.m_nOrderUnitQty;
    
    var nDataCnt = this.m_rXAxisPacket.GetDataArraySize();
    var i, nLength = this.m_SubGraphArray.length;
    for (i = 0; i < nLength; i++) {
        var rSubGraph = this.m_SubGraphArray[i];
        rSubGraph.m_rPacketData.AppendPacketStartIndexObj(0);
        rSubGraph.m_rPacketData.CalcMinMaxItemCnt(nDataCnt, false);
        rSubGraph.m_rPacketData.SetDataFormat(10, null, this.m_nDigit);//지표 Y축의 눈금간격 제어시 PriceDigit를 사용토록 하기 위해 Unit값 null 셋팅
    }

    return true;
}

//bAddData : true(봉이 추가되는 상황), false(마지막 봉이 업데이트 되는 상황)
CIndicator.prototype.RealCalc = function (bAddData) {
    if (!this.m_rRQSet)
        return false;
    return true;
}

CIndicator.prototype.Draw = function (DrawingInfo) {

    for (var i = 0; i < this.m_SubGraphArray.length; i++) {
        var rSubGraph = this.m_SubGraphArray[i];
        if (rSubGraph.m_bShow === false) continue;
        rSubGraph.Draw(DrawingInfo);
    }

    this.DrawBaseLine(DrawingInfo);
}

//Price
function CPriceIndicator(rRQSet, strIndicatorName, strKey) {

    CGraph.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rChart.SetChartType("StockChart");

    this.m_strGroup = "PRICE";

    this.m_nAddType = OVERLAY_TYPE;
    this.m_strOverlayGraphName = "_MA_";

    this.m_rRQSet = rRQSet;
    rRQSet.m_rPriceIndicator = this;

    this.SetTitle(this.m_rRQSet.m_RQInfo.m_strItemName);

    //서브그래프 추가 및 서브그래프 패킷데이터 추가
    var strPacketNameArray = ["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_"];
    var PriceSubGraph = new CPriceSubGraph(this);
    PriceSubGraph.m_rRQSet = rRQSet;
    PriceSubGraph.SetSubGraphName("_CLOSE_");
    PriceSubGraph.m_strSubGraphTitle = "종가";
    PriceSubGraph.SetPacketData(strPacketNameArray);

    //console.log("______nCycle:"+this.m_rRQSet.m_RQInfo.m_nCycle);

    // 임시소스 >>>
    //var rPriceCandleInfo = rRQSet.GetCommonInfo("PriceCandleInfo");
    var PriceSubGraphPropertyInfo = new CPriceSubGraphPropertyInfo();
    PriceSubGraphPropertyInfo = PriceSubGraph.GetPropertyInfo( PriceSubGraphPropertyInfo );
    rRQSet.SetCommonInfo("PriceSubGraphPropertyInfo", PriceSubGraphPropertyInfo);
    // 임시소스 <<<    

    this.m_SubGraphArray[this.m_SubGraphArray.length] = PriceSubGraph;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_rSmartSignalMng = null;
}
CPriceIndicator.prototype = new CGraph();
CPriceIndicator.prototype.constructor = CPriceIndicator;


CPriceIndicator.prototype.GetExcelTitle = function(TitleArray){    
    
    let i, rPriceSubGraph = this.m_SubGraphArray[0];
    let nTitleArrayLen = rPriceSubGraph.m_strSubGraphTitleArray.length;
    for( i = 0 ; i < nTitleArrayLen - 1; i++ )//거래량은 제외
    {
        TitleArray[TitleArray.length] = rPriceSubGraph.m_strSubGraphTitleArray[i];    
    }
}

CPriceIndicator.prototype.GetExcelData = function(nIndex, ColDataArray){

    this.m_SubGraphArray[0].GetExcelData(nIndex, ColDataArray);
}

CPriceIndicator.prototype.ChangeLang = function(){

    CGraph.prototype.ChangeLang.call(this);
}
CPriceIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    var nLength = this.m_SubGraphArray.length;
    var strTitle, strLastestCloseData, rClosePacket, rLastestClosePacketItemData = null;

    for (var i = 0; i < nLength; i++) {
        var rSubGraph = this.m_SubGraphArray[i];

        if (bShowIndicatorName === true)
            strTitle = this.m_strTitle;
        else
            strTitle = "";

        if (bShowIndicatorValue === true) {

            rClosePacket = this.m_rRQSet.GetPacketDataByIndex(this.m_rRQSet.m_nClosePacketIndex);
            rLastestClosePacketItemData = rClosePacket.GetLastestPacketItemData();
            if (rLastestClosePacketItemData !== null) {
                strLastestCloseData = ConvertNumToDigitText(rLastestClosePacketItemData.m_Data, rClosePacket.m_nDec, 1, rClosePacket.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                strTitle += "(" + strLastestCloseData + ")";
            }
        }
        rSubGraph.SetTitle(strTitle);
        var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
        if (rTitleDiv)
            TitleDivArray[TitleDivArray.length] = rTitleDiv;
    }
}
CPriceIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CGraph.prototype.Calc.call(this, bSetup);

    this.SetTitle(this.m_rRQSet.m_RQInfo.m_strItemName);
}

CPriceIndicator.prototype.ArrangeSignalInfo = function(){

    var strRQ = this.m_rRQSet.GetRQ();
    var nDataCnt = this.m_rXAxisPacket.GetDataArraySize();
    var rDateTimePacketData = this.m_rXAxisPacket;
    var rXScaleMng = this.GetXScaleMng();

    if( this.m_rSmartSignalMng === null){
        return;
    }
    var nSmartSignalCnt = this.m_rSmartSignalMng.m_SmartSignalInfoArray.length;
    
    var i, j;
    j = nSmartSignalCnt -1;
    var PrevRQPacketsItem = null;
    for(i = 0; i < nDataCnt; i ++){

        var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
            continue;
        }

        
        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }

        var rDateTimePacket = this.m_rXAxisPacket.m_DataArray[i];
        var strDateTime = rDateTimePacket.m_strDateTime;

        for(j; j >= 0; j--){
            var rSmartSignalInfo = this.m_rSmartSignalMng.m_SmartSignalInfoArray[j];

            if(rSmartSignalInfo.m_strDateTime < strDateTime){

                if(PrevRQPacketsItem === null)
                    break;

                if(PrevRQPacketsItem.m_Packets[this.m_rRQSet.m_nClosePacketIndex].m_SignalItemData === null)
                    PrevRQPacketsItem.m_Packets[this.m_rRQSet.m_nClosePacketIndex].m_SignalItemData = new CSignalItemData();
                if(rSmartSignalInfo.m_strSignalType === "0"){
                    PrevRQPacketsItem.m_Packets[this.m_rRQSet.m_nClosePacketIndex].m_SignalItemData.AddSignalInfo(0, rSmartSignalInfo);
                }
                else if(rSmartSignalInfo.m_strSignalType === "1"){
                    PrevRQPacketsItem.m_Packets[this.m_rRQSet.m_nClosePacketIndex].m_SignalItemData.AddSignalInfo(1, rSmartSignalInfo);
                }
            }
            else
                break;
        }

        PrevRQPacketsItem = RQPacketsItem;
    }
}
// 20190212 공현욱 : 스마트시그널 신호 실시간 작업 >>
CPriceIndicator.prototype.RealArrangeSignalInfo = function(){

    var strRQ = this.m_rRQSet.GetRQ();
    var nDataCnt = this.m_rXAxisPacket.GetDataArraySize();
    var rDateTimePacketData = this.m_rXAxisPacket;
    var rXScaleMng = this.GetXScaleMng();

    if( this.m_rSmartSignalMng === null){
        return;
    }
    
    var rSmartSignalInfo = this.m_rSmartSignalMng.m_SmartSignalInfoArray[0];
    
    var i
    for(i = nDataCnt-1; i >= 0; i--){

        var rDateTimePacketItemData = this.m_rXAxisPacket.m_DataArray[i];
        
        var tDateTime = rDateTimePacketItemData.GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
            continue;
        }
        
        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }

        var bFind = false;
        var strDateTime = rDateTimePacketItemData.m_strDateTime;

        if(rSmartSignalInfo.m_strDateTime >= strDateTime){

            if(RQPacketsItem !== null)
            {
                if(RQPacketsItem.m_Packets[this.m_rRQSet.m_nClosePacketIndex].m_SignalItemData === null)
                    RQPacketsItem.m_Packets[this.m_rRQSet.m_nClosePacketIndex].m_SignalItemData = new CSignalItemData();

                if(rSmartSignalInfo.m_strSignalType === "0")
                    RQPacketsItem.m_Packets[this.m_rRQSet.m_nClosePacketIndex].m_SignalItemData.AddSignalInfo(0, rSmartSignalInfo);
                else if(rSmartSignalInfo.m_strSignalType === "1")
                    RQPacketsItem.m_Packets[this.m_rRQSet.m_nClosePacketIndex].m_SignalItemData.AddSignalInfo(1, rSmartSignalInfo);
            }
            bFind = true;  
            break;
        }

        if( bFind === true)
            break;
    }
}
// 20190212 공현욱 : 스마트시그널 신호 실시간 작업 <<

// 스마트 시그널 화살표 툴팁기능 구현 >>
CPriceIndicator.prototype.FindSignalDataPerXScaleMng = function (X, Y, nFindXIndex, rXScaleMng, rFindInfo) {

    if( this.m_rSmartSignalMng === null )
        return null;

    if( this.m_rRQSet.m_RQInfo.m_nCycle !== CYCLE_MIN || this.m_rRQSet.m_RQInfo.m_nInterval > 60 )
        return null;

    var rGraphXScaleMng = this.GetXScaleMng();
    if (rGraphXScaleMng !== undefined && rXScaleMng === rGraphXScaleMng) {

        if (rXScaleMng.GetType() === DATETIME_TYPE) {

            var strRQ = this.m_rRQSet.GetRQ();
            var rXScaleMergeIndex = rXScaleMng.m_XScaleMergeArray[nFindXIndex];
            if (rXScaleMergeIndex !== undefined)
            {
                rXScaleMng.m_tFindDateTime = rXScaleMergeIndex.m_tStart;

                var rRQPackets = rXScaleMergeIndex.m_mapRQPacketsItem[strRQ];

                if (rRQPackets === undefined) {

                    var strKey = strRQ + "_TIME";
                    var tPrevStartDateTime = rXScaleMng.m_tTimeArray[rXScaleMergeIndex.m_tStart][strKey];
                    if (tPrevStartDateTime !== undefined) {

                        if (rXScaleMng.m_tTimeArray[tPrevStartDateTime] !== undefined) {
                            rRQPackets = rXScaleMng.m_tTimeArray[tPrevStartDateTime][strRQ];
                        }
                    }
                }

                if (rRQPackets !== undefined) {

                    if (!rFindInfo) {

                        rFindInfo = new CFindInfo();
                        rFindInfo.m_strRQ = strRQ;
                        rFindInfo.m_XDataInfo = rRQPackets;
                        rFindInfo.m_strXTitle = rXScaleMng.GetTitle();

                        var DateTimeItem = rRQPackets.m_Packets[this.m_rXAxisPacket.m_nPacketIndex];

                        let ChangeDateTime = null;
                        let nYear, nMon, nDay, nHour, nMin, nSecond;

                        switch (rRQPackets.m_nCycle) {
                            case 1://일
                            case 2://주
								gTempDate.setTime(DateTimeItem.m_tDateTime * 1000);
		                        nYear = gTempDate.getFullYear();
		                        nMon = gTempDate.getMonth() + 1;
		                        nDay = gTempDate.getDate();
                                rFindInfo.m_strXData = nYear + "/" + (nMon > 9 ? nMon : "0" + nMon) + "/" + (nDay > 9 ? nDay : "0" + nDay); break;
                            case 3://월
								gTempDate.setTime(DateTimeItem.m_tDateTime * 1000);
		                        nYear = gTempDate.getFullYear();
		                        nMon = gTempDate.getMonth() + 1;		                        
                                rFindInfo.m_strXData = nYear + "/" + (nMon > 9 ? nMon : "0" + nMon); break;
                            case 4://년
								gTempDate.setTime(DateTimeItem.m_tDateTime * 1000);
								nYear = gTempDate.getFullYear();
                                rFindInfo.m_strXData = nYear; break;
                            case 5://분
								ChangeDateTime = ChangeGlobalTime(this.m_rGlobalProperty.GetTimeZone(), DateTimeItem.m_tDateTime);
		                        nYear = ChangeDateTime.getFullYear();
		                        nMon = ChangeDateTime.getMonth() + 1;
		                        nDay = ChangeDateTime.getDate();
		                        nHour = ChangeDateTime.getHours();
		                        nMin = ChangeDateTime.getMinutes();		                        
                                rFindInfo.m_strXData = nYear + "/" + (nMon > 9 ? nMon : "0" + nMon) + "/" + (nDay > 9 ? nDay : "0" + nDay) 
									+ " " + (nHour > 9 ? nHour : "0" + nHour) + ":" + (nMin > 9 ? nMin : "0" + nMin); break;
                            case 6://초
								ChangeDateTime = ChangeGlobalTime(this.m_rGlobalProperty.GetTimeZone(), DateTimeItem.m_tDateTime);
								nYear = ChangeDateTime.getFullYear();
		                        nMon = ChangeDateTime.getMonth() + 1;
		                        nDay = ChangeDateTime.getDate();
		                        nHour = ChangeDateTime.getHours();
		                        nMin = ChangeDateTime.getMinutes();
								nSecond = ChangeDateTime.getSeconds();
                                rFindInfo.m_strXData = nYear + "/" + (nMon > 9 ? nMon : "0" + nMon) + "/" + (nDay > 9 ? nDay : "0" + nDay) 
									+ " " + (nHour > 9 ? nHour : "0" + nHour) + ":" + (nMin > 9 ? nMin : "0" + nMin) + ":" + (nSecond > 9 ? nSecond : "0" + nSecond); break;
                            default://기본주기 => 일주기
								gTempDate.setTime(DateTimeItem.m_tDateTime * 1000);
                                nYear = gTempDate.getFullYear();
		                        nMon = gTempDate.getMonth() + 1;
		                        nDay = gTempDate.getDate();
                                rFindInfo.m_strXData = nYear + "/" + (nMon > 9 ? nMon : "0" + nMon) + "/" + (nDay > 9 ? nDay : "0" + nDay); break;
                        }
                    }

                    var GraphFindData = null;
                    var i, length = this.m_SubGraphArray.length;
                    for (i = length - 1; i >= 0; i--) {

                        var rSubGraph = this.m_SubGraphArray[i];
                        if (rSubGraph.m_bShow === false)
                            continue;

                        var nSignalType = rSubGraph.FindSignalDataPerXScaleMng(X, Y, rRQPackets, rXScaleMng, this.m_rBlock.m_rectGraphRegion)
                        if (nSignalType > 0 ) {
                           
                            rFindInfo.m_rFindSubGraph = rSubGraph;//마우스 위치에 서브그래프가 존재하는 경우 찾은 서브그래프를 변수에 저장한다
                            rFindInfo.m_rFindSubInfo = new CFindSignalSubInfo();
                            rFindInfo.m_rFindSubInfo.m_nFindType = TYPE_FIND_SIGNAL;
                            rFindInfo.m_rFindSubInfo.m_nSignalType = nSignalType;
                            break;
                        }
                    }
                    return rFindInfo;
                }
            }
        }
    }

    return null;
}
// 스마트 시그널 화살표 툴팁기능 구현 <<

//Volume
function CVolumeIndicator(rRQSet, strIndicatorName, strKey) {

    CGraph.call(this, rRQSet, strIndicatorName, strKey);

    this.m_strGroup = "VOLUME";

    this.m_nAddType = OVERLAY_TYPE;
    this.m_strOverlayGraphName = "_VMA_";

    this.m_rRQSet = rRQSet;

    this.SetTitle("거래량차트");

    //서브그래프 추가 및 서브그래프 패킷데이터 추가
    var VolumeSubGraph = new CVolumeSubGraph(this);

    //VolumeSubGraph.m_nSubGraphType = 2;//막대모양
    //VolumeSubGraph.m_nSubGraphSubType = 0;//거래량 막대

    VolumeSubGraph.m_rRQSet = rRQSet;

    VolumeSubGraph.SetPacketData("_VOLUME_");
    VolumeSubGraph.SetSubGraphName("_VOLUME_");
    VolumeSubGraph.m_strSubGraphTitle = "거래량";

    this.m_SubGraphArray.push(VolumeSubGraph);

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
}
CVolumeIndicator.prototype = new CGraph();
CVolumeIndicator.prototype.constructor = CVolumeIndicator;

CVolumeIndicator.prototype.ChangeLang = function(){

    CGraph.prototype.ChangeLang.call(this);
}
CVolumeIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;    
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    var nLength = this.m_SubGraphArray.length;
    var strTitle, strLastestData, rLastestPacketItemData = null;

    for (var i = 0; i < nLength; i++) {
        var rSubGraph = this.m_SubGraphArray[i];

        if (bShowIndicatorName === true)
            strTitle = rSubGraph.m_strSubGraphTitle;
        else
            strTitle = "";

        if (bShowIndicatorValue === true) {

            rLastestPacketItemData = rSubGraph.m_rPacketData.GetLastestPacketItemData();
            if (rLastestPacketItemData !== null) {
                if (rLastestPacketItemData.GetPacketType() === NUMERIC_TYPE) {
                    strLastestData = ConvertNumToDigitText(rLastestPacketItemData.m_Data, rLastestPacketItemData.m_rPacketData.m_nDec, 1, rLastestPacketItemData.m_rPacketData.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                    strTitle += "(" + strLastestData + ")";
                }
                else
                    strTitle += "(" + rLastestPacketItemData.m_Data + ")";
            }
        }
        rSubGraph.SetTitle(strTitle);
        var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
        if (rTitleDiv)
            TitleDivArray[TitleDivArray.length] = rTitleDiv;
    }
}

/*
function CGraphPropertyInfo() {
    this.m_strKey = "";
    this.m_strGroup = null;
    this.m_strName = "";
    this.m_strTitle = "";
    this.m_BaseLineArray = [];
    this.m_SubGraphPropertyInfoArray = [];

   	this.m_nBasePriceTextAlign = TEXT_RIGHT_ALIGN;
    this.m_bShowBasePrice = true;//기준선위에 기준가표시여부(우측표시)

    this.m_nShowLatestDataType = 0;//마지막값 표시 (0:보이지 않음, 1: 보이는 영역에서 최근봉 데이터 보기, 2: 현재시세 또는 현재값 보기)
    this.m_bShowLatestDataOfAllSubGraph = false;//모든 라인 표시
    this.m_nDataChangeRatioType = 0; //등락률 표시
}
 */

/////////////////////////////////////////////////////////////////
// MA Group Property(가격이평, 거래량이평 속성)
export function CMAGroupPropertyInfo() {

    CGraphPropertyInfo.call(this);

    this.m_strGroup = "";
    this.m_strName = "";
    this.m_strTitle = "";
    this.m_strTitleLangKey = "";

    this.m_MAPropertyInfoArray = [];
}
CMAGroupPropertyInfo.prototype = new CGraphPropertyInfo();
CMAGroupPropertyInfo.prototype.constructor = CMAGroupPropertyInfo;

CMAGroupPropertyInfo.prototype.ChangeLang = function(){

    CGraphPropertyInfo.prototype.ChangeLang.call(this);    

    var i, rMAPropertyInfo, nPropertyInfoArrayLen = this.m_MAPropertyInfoArray.length;
    for( i = 0 ; i < nPropertyInfoArrayLen; i++ )
    {
        rMAPropertyInfo = this.m_MAPropertyInfoArray[i];
        rMAPropertyInfo.ChangeLang();
    }
}

CMAGroupPropertyInfo.prototype.SetMAPropertyInfo = function (nIndex, nMA, nInputPacketDataType, nMAType, clrLine, nThickness, nLineType, bShow) {
    
    var MAPropertyInfo = this.m_MAPropertyInfoArray[nIndex];
    if (MAPropertyInfo === undefined) {
        MAPropertyInfo = new CMAPropertyInfo(nIndex, nMA, nInputPacketDataType, nMAType, clrLine, nThickness, nLineType, bShow);
        this.m_MAPropertyInfoArray[nIndex] = MAPropertyInfo;
    }
    else 
        MAPropertyInfo.SetProperty(nIndex, nMA, nInputPacketDataType, nMAType, clrLine, nThickness, nLineType, bShow);    
}
CMAGroupPropertyInfo.prototype.Copy = function ( rCopyPropertyInfo ) {

    if (rCopyPropertyInfo === undefined)
        rCopyPropertyInfo = new CMAGroupPropertyInfo();

    rCopyPropertyInfo = CGraphPropertyInfo.prototype.Copy.call(this, rCopyPropertyInfo);

    rCopyPropertyInfo.m_MAPropertyInfoArray.length = 0;
    var i, nLength = this.m_MAPropertyInfoArray.length;
    for (i = 0; i < nLength; i++) {

        var rMAPropertyInfo = this.m_MAPropertyInfoArray[i];
        rCopyPropertyInfo.m_MAPropertyInfoArray[i] = rMAPropertyInfo.Copy();
    }
    return rCopyPropertyInfo;
}
CMAGroupPropertyInfo.prototype.SetPropertyInfo = function (rPropertyInfo, strThemeName) {

    if (!CGraphPropertyInfo.prototype.SetPropertyInfo.call(this, rPropertyInfo))
        return false;

    this.m_MAPropertyInfoArray.length = 0;
    var i, nLength = rPropertyInfo.m_MAPropertyInfoArray.length;
    for (i = 0; i < nLength; i++) {

        var NewMAProp = new CMAPropertyInfo();
        NewMAProp.SetPropertyInfo(rPropertyInfo.m_MAPropertyInfoArray[i], false, strThemeName);
        this.m_MAPropertyInfoArray[this.m_MAPropertyInfoArray.length] = NewMAProp;
    }
    return true;
}
///////////////////////////////////////////////////////////////
//MAProperty
function CMAPropertyInfo(nIndex, nMA, nInputPacketDataType, nMAType, clrLine, nThickness, nLineType, bShow) {

    this.m_nIndex = nIndex;
    this.m_nMA = nMA;
    this.m_nInputPacketDataType = nInputPacketDataType;//0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3    
    this.m_nMAType = nMAType;//0:단순, 1:지수, 2:가중, 3:기하, 4:조화, 5:삼각, 6:적합

    this.m_MASubGraphPropertyInfo = new CIndicatorSubGraphPropertyInfo();

    this.m_MASubGraphPropertyInfo.m_strSubGraphName = "" + nIndex;

    var strKeyOfClrLine = "MA" + nIndex;
    this.m_MASubGraphPropertyInfo.SetLineProperty(strKeyOfClrLine, clrLine, nThickness, nLineType);
    this.m_MASubGraphPropertyInfo.m_bShow = bShow;    

    this.m_bCalc = false;//설정변경시 재계산을 해야 하는지 여부, 설정창에서 설정을 셋팅하는 과정에서만 사용된다
}

CMAPropertyInfo.prototype.ChangeLang = function(){

    this.m_MASubGraphPropertyInfo.ChangeLang();
}

CMAPropertyInfo.prototype.SetProperty = function (nIndex, nMA, nInputPacketDataType, nMAType, clrLine, nThickness, nLineType, bShow) {

    this.m_nIndex = nIndex;
    this.m_nMA = nMA;
    this.m_nInputPacketDataType = nInputPacketDataType;//0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3    
    this.m_nMAType = nMAType;//0:단순, 1:지수, 2:가중, 3:기하, 4:조화, 5:삼각, 6:적합

    if (this.m_MASubGraphPropertyInfo === null)
        this.m_MASubGraphPropertyInfo = new CIndicatorSubGraphPropertyInfo();

    var strKeyOfClrLine = "MA" + nIndex;
    this.m_MASubGraphPropertyInfo.SetLineProperty(strKeyOfClrLine, clrLine, nThickness, nLineType);
    this.m_MASubGraphPropertyInfo.m_bShow = bShow;    
}

CMAPropertyInfo.prototype.GetPacketNameByInputPacketDataType = function (nInputPacketDataType) {

    var i, nLen = PRICE_TYPE_GROUPS.length;
    for (i = 0; i < nLen; i++) {
        var obj = PRICE_TYPE_GROUPS[i];
        if (obj.nValue === nInputPacketDataType)
            return obj.strValue;
    }
    return null;
}

CMAPropertyInfo.prototype.SetPropertyInfo = function (rSrcMAPropertyInfo, bSetup=false, strThemeName=null) {

    if (rSrcMAPropertyInfo === undefined)
        return false;

    this.m_nIndex = rSrcMAPropertyInfo.m_nIndex;

    if (bSetup === true) {

        this.m_bCalc = false;
        if (this.m_nMA !== rSrcMAPropertyInfo.m_nMA ||
            this.m_nInputPacketDataType !== rSrcMAPropertyInfo.m_nInputPacketDataType ||
            this.m_nMAType !== rSrcMAPropertyInfo.m_nMAType)
            this.m_bCalc = true;
    }
    else
        this.m_bCalc = true;

    this.m_nMA = rSrcMAPropertyInfo.m_nMA;
    this.m_nInputPacketDataType = rSrcMAPropertyInfo.m_nInputPacketDataType;//0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3
    this.m_nMAType = rSrcMAPropertyInfo.m_nMAType;//0:단순, 1:지수, 2:가중, 3:기하, 4:조화, 5:삼각, 6:적합

    this.m_MASubGraphPropertyInfo.SetPropertyInfo(rSrcMAPropertyInfo.m_MASubGraphPropertyInfo, bSetup, strThemeName);

    this.m_MASubGraphPropertyInfo.m_strSubGraphTitle = "" + this.m_nMA;

    return true;
}

CMAPropertyInfo.prototype.Copy = function ( rCopyMAProperty )
{
    if( rCopyMAProperty === undefined )
        rCopyMAProperty = new CMAPropertyInfo(0, 0, 3, 0, "rgb(0,0,0)", 1, 0, false);

    rCopyMAProperty.m_nIndex = this.m_nIndex;
    rCopyMAProperty.m_nMA = this.m_nMA;
    rCopyMAProperty.m_nInputPacketDataType = this.m_nInputPacketDataType ;//0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3
    rCopyMAProperty.m_nMAType = this.m_nMAType ;//0:단순, 1:지수, 2:가중, 3:기하, 4:조화, 5:삼각, 6:적합

    this.m_MASubGraphPropertyInfo.Copy(rCopyMAProperty.m_MASubGraphPropertyInfo);
    
    return rCopyMAProperty;
}

///////////////////////////////////////////////////////////////
//MA Indicator
function CMAIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_strGroup = "PRICE";

    this.m_nAddType = OVERLAY_TYPE;    
    this.m_strOverlayGraphName = "_PRICE_";

    this.m_MAGroupPropertyInfo = new CMAGroupPropertyInfo();
    this.m_MAGroupPropertyInfo.m_strName = "_MA_";
    this.m_MAGroupPropertyInfo.m_strTitle = "가격이평";
    this.m_MAGroupPropertyInfo.m_strGroup = "PRICE";

    this.m_MAGroupPropertyInfo.SetMAPropertyInfo(0, 7, 3, 0,    "rgb(255,0,0)", 1, 0, true);
    this.m_MAGroupPropertyInfo.SetMAPropertyInfo(1, 14, 3, 0, "rgb(0,0,0)", 1, 0, true);
    this.m_MAGroupPropertyInfo.SetMAPropertyInfo(2, 28, 3, 0, "rgb(0,0,255)", 1, 0, true);
    this.m_MAGroupPropertyInfo.SetMAPropertyInfo(3, 60, 3, 0, "rgb(51,153,102)", 1, 0, false);
    this.m_MAGroupPropertyInfo.SetMAPropertyInfo(4, 120, 3, 0, "rgb(255,0,255)", 1, 0, false);
    this.m_MAGroupPropertyInfo.SetMAPropertyInfo(5, 180, 3, 0, "rgb(204,153,0)", 1, 0, false);
    this.m_MAGroupPropertyInfo.SetMAPropertyInfo(6, 240, 3, 0, "rgb(150,150,150)", 1, 0, false);
    this.m_MAGroupPropertyInfo.SetMAPropertyInfo(7, 300, 3, 0, "rgb(153,204,255)", 1, 0, false);
    this.m_MAGroupPropertyInfo.SetMAPropertyInfo(8, 360, 3, 0, "rgb(153,255,51)", 1, 0, false);
    this.m_MAGroupPropertyInfo.SetMAPropertyInfo(9, 420, 3, 0, "rgb(255,204,255)", 1, 0, false);
    
    this.m_strGroup = "PRICE";
    this.m_strTitle = "가격이평 ";
    this.m_strTitleLangKey = "";

    this.m_rRQSet = rRQSet;

    this.m_nDigit = rRQSet.m_nPriceDigit;//가격이평이므로 해당종목 가격자리수와 맞춘다

    this.m_strMAPacketNameArray = [];
    //계산결과 담을 패킷생성
    var i, length = this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray.length;
    for (i = 0; i < length; i++) {

        //패킷추가
        this.m_strMAPacketNameArray[i] = this.m_strKey + "_MA" + i + "_";
        rRQSet.AddNumPacketInfo(this.m_strMAPacketNameArray[i], -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

        //서브그래프 추가
        var MASubGraph = new CIndicatorSubGraph(this);
        MASubGraph.m_rRQSet = rRQSet;
        MASubGraph.SetSubGraphName("" + i);
        MASubGraph.SetPacketData(this.m_strMAPacketNameArray[i]);
        MASubGraph.SetPropertyInfo(this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[i].m_MASubGraphPropertyInfo);
        this.m_SubGraphArray[i] = MASubGraph;
    }

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
}
CMAIndicator.prototype = new CIndicator();
CMAIndicator.prototype.constructor = CMAIndicator;

CMAIndicator.prototype.ChangeLang = function(){

    CIndicator.prototype.ChangeLang.call(this);

    if(this.m_strTitleLangKey.length > 0)
        this.m_strTitle = t(this.m_strTitleLangKey);

    this.m_MAGroupPropertyInfo.ChangeLang();

    var i, nLen = this.m_SubGraphArray.length;
    for( i = 0 ; i < nLen; i++ )
        this.m_SubGraphArray[i].ChangeLang();
}
//MAIndicator는 MAGroupPropertyInfo를 가지고 있으므로 그것을 리턴한다
CMAIndicator.prototype.GetPropertyInfo = function (strKey) {

    var i, j;

    if (strKey !== undefined && this.m_strKey !== strKey )
        return null;
    
    CGraph.prototype.GetPropertyInfo.call(this, strKey, this.m_MAGroupPropertyInfo);

    var length = this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray.length;
    var nSubGraphLength = this.m_SubGraphArray.length;
    for (i = 0; i < length && i < nSubGraphLength; i++) {

        var rMASubGraph = this.m_SubGraphArray[i];
        rMASubGraph.GetPropertyInfo(this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[i].m_MASubGraphPropertyInfo);
    }
    
    return this.m_MAGroupPropertyInfo;
}

CMAIndicator.prototype.SetPropertyInfo = function (strKey, rMAGroupPropertyInfo, bSetup=false, strThemeName=null) {

    var i, j;

    if (this.m_strKey !== strKey)
        return false;

    if (CGraph.prototype.SetPropertyInfo.call(this, strKey, rMAGroupPropertyInfo, bSetup) === false)
        return false;
    
    var rSubGraph;
    var NewMAProp, NewMASubGraph;
    var nMALen = this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray.length;
    var nMAPropLen = rMAGroupPropertyInfo.m_MAPropertyInfoArray.length;    
    var nDiffLen = nMAPropLen - nMALen;    
    var nMinLen = nMAPropLen > nMALen ? nMALen : nMAPropLen;    

    //this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray.length 와 this.m_SubGraphArray.length는 같아야 하므로 여기서는 같은 것으로 처리
    //만일 길이가 서로 달라진 상태이면 달라지게 된 원인을 찾아 해당 소스 수정할 것
    var bCalc = false;
    for (i = 0; i < nMinLen; i++) {
        this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[i].SetPropertyInfo(rMAGroupPropertyInfo.m_MAPropertyInfoArray[i], bSetup, strThemeName);
        if (this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[i].m_bCalc)
            bCalc = true;

        this.m_SubGraphArray[i].SetPropertyInfo(this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[i].m_MASubGraphPropertyInfo, bSetup, strThemeName);
    } 

    if (bSetup === true && bCalc === true) {
        this.Calc(bSetup);
        this.m_rBlock.ExtractYScaleMinMax(true);
    }

    return true;
}
CMAIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    var nLength = this.m_SubGraphArray.length;
    var strTitle, strLastestData, rLastestPacketItemData = null;
    var bFirstSubGraph = true;

    let rSubGraph;
    let i, rShowGraphArray = [];
    for(i = 0 ; i < nLength ; i++ )
    {
        rSubGraph = this.m_SubGraphArray[i];
        if(rSubGraph.m_bShow)
            rShowGraphArray[ rShowGraphArray.length ] = rSubGraph;
        else
            rSubGraph.HideTitle();
    }

    //Show상태 서브그래프가 없는 경우
    nLength = rShowGraphArray.length;
    if(nLength <= 0)
    {
        rSubGraph = this.m_SubGraphArray[0];
        if (bShowIndicatorName === true) {
            strTitle = this.m_strTitle;
            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
        else
            this.HideTitle();            
    }
    else
    {
        for( i = 0; i < nLength; i++ )
        {
            rSubGraph = rShowGraphArray[i];
            
            if (i === 0) 
            {
                if (bShowIndicatorName === true)
                    strTitle = this.m_strTitle + rSubGraph.m_strSubGraphTitle;
                else
                    strTitle = "";
            }
            else
            {
                if (bShowIndicatorName === true)
                    strTitle = rSubGraph.m_strSubGraphTitle;
                else
                    strTitle = "";
            }
            if (bShowIndicatorValue === true) {

                rLastestPacketItemData = rSubGraph.m_rPacketData.GetLastestPacketItemData();
                if (rLastestPacketItemData !== null) {

                    strLastestData = ConvertNumToDigitText(rLastestPacketItemData.m_Data, rLastestPacketItemData.m_rPacketData.m_nDec, 1, rLastestPacketItemData.m_rPacketData.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                    strTitle += "(" + strLastestData + ")";
                }
            }
            rSubGraph.SetTitle(strTitle);
            
            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
    }
}
CMAIndicator.prototype.Draw = function (DrawingInfo) {

    for (var i = 0; i < this.m_SubGraphArray.length; i++) {
        
        var rSubGraph = this.m_SubGraphArray[i];
        if (rSubGraph.m_bShow === false)
            continue;

        rSubGraph.Draw(DrawingInfo);        
    }
}
CMAIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rInputPacketData = null;
    var rMAPacketData = null;

    var n, nLength = this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray.length;
    for (n = 0; n < nLength; n++) {

        if (this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_MASubGraphPropertyInfo.m_bShow === false) {

            if (this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_bCalc)
                this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_bCalc = false;

            continue;
        }

        if (bSetup === true && this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_bCalc !== true)
            continue;
        this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_bCalc = false;

        var nMAType = this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_nMAType;
        var nMA = this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_nMA;
        var nMAIndex = nMA - 1;

        rInputPacketData = this.m_rRQSet.GetPacketData(this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].GetPacketNameByInputPacketDataType(this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_nInputPacketDataType));
        rMAPacketData = this.m_rRQSet.GetPacketData(this.m_strMAPacketNameArray[n]);

        rMAPacketData.InitDataArray();
        rMAPacketData.SetRQStartIndex(nMAIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)        

        var rSubGraph = this.m_SubGraphArray[n];        
        rSubGraph.m_strSubGraphTitle = "" + nMA;

        rSubGraph.m_SaveDataArray[0] = 0;
        rSubGraph.m_SaveDataArray[1] = null;
        var i, nDataLength = rInputPacketData.GetDataArraySize();

        if( nMAType === 0 )     // 단순
        {
            var Avg = 0;
            for (i = 0; i < nDataLength; i++) {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
                    continue;

                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem === undefined)
                    continue;
            
                rSubGraph.m_SaveDataArray[0] += rInputPacketData.m_DataArray[i].m_Data;
                rSubGraph.m_SaveDataArray[1] = rInputPacketData.m_DataArray[i].m_Data;//실시간 data 가 업데이트 되는 경우에 사용

                if (i < nMAIndex)
                {
                    RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                    continue;
                }

                if (nMAIndex < i)
                    rSubGraph.m_SaveDataArray[0] -= rInputPacketData.m_DataArray[i - nMAIndex - 1].m_Data;

                if( nMA === 0 )
                    Avg = 0;
                else
                    Avg = rSubGraph.m_SaveDataArray[0] / nMA;

                rMAPacketData.AddTail(i, Avg);

                RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
            }
        }
        else if( nMAType === 1 )     // 지수
        {
            var SmoothConst = 2 / ( nMA + 1);
            var MAValue = 0, Source = 0;
            for (i = 0; i < nDataLength; i++)
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
                    continue;

                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem === undefined)
                    continue;

                if( i === 0 )
                {
                    MAValue = rInputPacketData.m_DataArray[i].m_Data;
                    rSubGraph.m_SaveDataArray[0] = MAValue; //실시간 data 가 업데이트 되는 경우에 사용
                    rSubGraph.m_SaveDataArray[1] = MAValue;
                }
                else
                {
                    rSubGraph.m_SaveDataArray[0] = MAValue;     // 이전봉 지수 MA값 기억
                    Source = rInputPacketData.m_DataArray[i].m_Data;
                    MAValue = MAValue * ( 1 - SmoothConst ) + Source * SmoothConst;
                    rSubGraph.m_SaveDataArray[1] = MAValue;     // 현재 봉 지수 MA값 기억
                }

                if( nMAIndex <= i ) 
                {
                    rMAPacketData.AddTail(i, MAValue);
                    RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                }
                else
                {
                    RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                }
            }
        }
        else if( nMAType === 2 )     // 가중
        {
            var MAValue = 0, WeightedSum = 0, Sum = 0;
            var Source = 0, PreSource = 0;

            for (i = 0; i < nDataLength; i++)
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
                    continue;

                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem === undefined)
                    continue;

                if ( nMA > i )
                {
                    rSubGraph.m_SaveDataArray[0] = MAValue;         // 직전봉 가중 MA값 저장
                    rSubGraph.m_SaveDataArray[1] = Sum;             // 직전봉 sum값 저장

                    Source = rInputPacketData.m_DataArray[i].m_Data;
                    WeightedSum = WeightedSum + Source * ( i + 1 );
                    if( nMA === 0 )
                        MAValue = 0;
                    else
                        MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));
                    Sum = Sum + Source;

                    rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                    rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                }
                
                if( nMA <= i )
                {
                    rSubGraph.m_SaveDataArray[0] = MAValue;         // 직전봉 가중 MA값 저장
                    rSubGraph.m_SaveDataArray[1] = Sum;             // 직전봉 sum값 저장

                    Source = rInputPacketData.m_DataArray[i].m_Data;
                    PreSource = rInputPacketData.m_DataArray[i - nMA].m_Data;
                    WeightedSum = WeightedSum - Sum + Source * nMA;
                    if( nMA === 0 )
                        MAValue = 0;
                    else
                        MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));                    
                    Sum = Sum + Source - PreSource;

                    rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                    rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                }

                if( nMAIndex <= i ) 
                {
                    rMAPacketData.AddTail(i, MAValue);
                    RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                }
                else
                {
                    RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                }
            }
        }
    }

    return true;
}
CMAIndicator.prototype.RealCalc = function (bAddData) {

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rInputPacketData = null;
    var rMAPacketData = null;
    var Avg = 0;

    var i = 0, n, nLength = this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray.length, nSubGraphLength = this.m_SubGraphArray.length;
    for (n = 0; n < nLength && n < nSubGraphLength; n++) {

        if (this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_MASubGraphPropertyInfo.m_bShow === false)
            continue;

        var nMAType = this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_nMAType;
        var nMA = this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_nMA;
        var nMAIndex = nMA - 1;

        rInputPacketData = this.m_rRQSet.GetPacketData(this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].GetPacketNameByInputPacketDataType(this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_nInputPacketDataType));
        rMAPacketData = this.m_rRQSet.GetPacketData(this.m_strMAPacketNameArray[n]);
        rMAPacketData.SetRQStartIndex(nMAIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)

        var rSubGraph = this.m_SubGraphArray[n];

        if (bAddData) {//Add

            var nDataLength = rInputPacketData.GetDataArraySize();
            var nEndIndex = nDataLength - 1 - nMA;

            i = nDataLength - 1;
            if( nMAType === 0 )     // 단순
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] !== undefined) {

                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem !== undefined) {

                        rSubGraph.m_SaveDataArray[0] += rInputPacketData.m_DataArray[i].m_Data;
                        rSubGraph.m_SaveDataArray[1] = rInputPacketData.m_DataArray[i].m_Data;
                        if (nMAIndex <= i) {

                            if (nMAIndex < i)
                                rSubGraph.m_SaveDataArray[0] -= rInputPacketData.m_DataArray[i - nMAIndex - 1].m_Data;

                            if( nMA === 0 )
                                Avg = 0;
                            else
                                Avg = rSubGraph.m_SaveDataArray[0] / nMA;

                            rMAPacketData.AppendRealData(i, Avg);
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                    }
                }
            }
            else if( nMAType === 1 )     // 지수
            {
                var SmoothConst = 2 / ( nMA + 1);
                var MAValue = 0, Source = 0;

                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] !== undefined)
                {
                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem !== undefined)
                    {
                        if( i === 0 )
                        {
                            MAValue = rInputPacketData.m_DataArray[i].m_Data;
                            rSubGraph.m_SaveDataArray[0] = MAValue;
                            rSubGraph.m_SaveDataArray[1] = MAValue;
                        }
                        else
                        {
                            MAValue = rSubGraph.m_SaveDataArray[1];     // 이전봉 지수 MA값 얻어옴(갱신 값)
                            rSubGraph.m_SaveDataArray[0] = MAValue;     // 새로운 봉이 생성되었으므로 이전봉으로 등록

                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            MAValue = MAValue * ( 1 - SmoothConst ) + Source * SmoothConst;
                            rSubGraph.m_SaveDataArray[1] = MAValue;     // 현재 봉 지수 MA값 기억
                        }

                        if( nMAIndex <= i ) 
                        {
                            rMAPacketData.AddTail(i, MAValue);
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                    }
                }
            }
            else if( nMAType === 2 )     // 가중
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] !== undefined)
                {
                    var MAValue = 0, WeightedSum = 0, Sum = 0;
                    var Source = 0, PreSource = 0;

                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem !== undefined)
                    {
                        if ( 0 < i )
                        {
                            MAValue = rSubGraph.m_SaveDataArray[2];     // 직전봉 가중 MA값 얻어옴
                            Sum = rSubGraph.m_SaveDataArray[3];         // 직전봉 sum값 얻어옴

                            rSubGraph.m_SaveDataArray[0] = MAValue;     // 새로운 봉이 생성되었으므로 직전값으로 등록
                            rSubGraph.m_SaveDataArray[1] = Sum;         // 새로운 봉이 생성되었으므로 직전값으로 등록

                            WeightedSum = MAValue / 2 * ( nMA * ( nMA + 1));
                        }

                        if ( nMA > i )
                        {
                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            WeightedSum = WeightedSum + Source * ( i + 1 );
                            if( nMA === 0 )
                                MAValue = 0;
                            else
                                MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));
                            Sum = Sum + Source;

                            rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                            rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                        }

                        if( nMA <= i )
                        {
                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            PreSource = rInputPacketData.m_DataArray[i - nMA].m_Data;
                            WeightedSum = WeightedSum - Sum + Source * nMA;
                            if( nMA === 0 )
                                MAValue = 0;
                            else
                                MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));                    
                            Sum = Sum + Source - PreSource;

                            rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                            rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                        }

                        if( nMAIndex <= i ) 
                        {
                            rMAPacketData.AddTail(i, MAValue);
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                    }
                }
            }
        }
        else {//Update

            var nDataLength = rInputPacketData.GetDataArraySize();

            i = nDataLength - 1;
            if( nMAType === 0 )     // 단순
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] !== undefined) {

                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem !== undefined) {

                        rSubGraph.m_SaveDataArray[0] -= rSubGraph.m_SaveDataArray[1];

                        rSubGraph.m_SaveDataArray[0] += rInputPacketData.m_DataArray[i].m_Data;

                        if (nMAIndex <= i) {

                            if( nMA === 0 )
                                Avg = 0;
                            else
                                Avg = rSubGraph.m_SaveDataArray[0] / nMA;

                            rMAPacketData.UpdateData(i, Avg);

                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                        rSubGraph.m_SaveDataArray[1] = rInputPacketData.m_DataArray[i].m_Data;
                    }
                }
            }
            else if( nMAType === 1 )     // 지수
            {
                var SmoothConst = 2 / ( nMA + 1);
                var MAValue = 0, Source = 0;

                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] !== undefined)
                {
                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem !== undefined)
                    {
                        if( i === 0 )
                        {
                            MAValue = rInputPacketData.m_DataArray[i].m_Data;
                            rSubGraph.m_SaveDataArray[0] = MAValue;
                            rSubGraph.m_SaveDataArray[1] = MAValue;
                        }
                        else
                        {
                            MAValue = rSubGraph.m_SaveDataArray[0];     // 이전봉 지수 MA값 얻어옴
                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            MAValue = MAValue * ( 1 - SmoothConst ) + Source * SmoothConst;
                            rSubGraph.m_SaveDataArray[1] = MAValue;     // 현재봉 지수 MA값 기억
                        }

                        if( nMAIndex <= i ) 
                        {
                            rMAPacketData.UpdateData(i, MAValue);
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                    }
                }
            }
            else if( nMAType === 2 )     // 가중
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] !== undefined)
                {
                    var MAValue = 0, WeightedSum = 0, Sum = 0;
                    var Source = 0, PreSource = 0;

                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem !== undefined)
                    {
                        if ( 0 < i )
                        {
                            MAValue = rSubGraph.m_SaveDataArray[0];     // 직전봉 가중 MA값 얻어옴
                            Sum = rSubGraph.m_SaveDataArray[1];         // 직전봉 sum값 얻어옴
                            WeightedSum = MAValue / 2 * ( nMA * ( nMA + 1));
                        }

                        if ( nMA > i )
                        {
                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            WeightedSum = WeightedSum + Source * ( i + 1 );
                            if( nMA === 0 )
                                MAValue = 0;
                            else
                                MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));
                            Sum = Sum + Source;

                            rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                            rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                        }

                        if( nMA <= i )
                        {
                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            PreSource = rInputPacketData.m_DataArray[i - nMA].m_Data;
                            WeightedSum = WeightedSum - Sum + Source * nMA;
                            if( nMA === 0 )
                                MAValue = 0;
                            else
                                MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));                    
                            Sum = Sum + Source - PreSource;

                            rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                            rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                        }

                        if( nMAIndex <= i ) 
                        {
                            rMAPacketData.UpdateData(i, MAValue);
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                    }
                }
            }
        }
    }
    return REALCALC_SUCCESS;
}

//VMA
function CVMAIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_strGroup = "VOLUME";

    this.m_nAddType = OVERLAY_TYPE;
    this.m_strOverlayGraphName = "_VOLUME_";//거래량 그래프가 있는 블록을 찾아 해당 블록에 중첩시킨다(만일 거래량이 없으면 블록추가)

    this.m_VMAGroupPropertyInfo = new CMAGroupPropertyInfo();
    this.m_VMAGroupPropertyInfo.m_strName = "_VMA_";
    this.m_VMAGroupPropertyInfo.m_strTitle = "거래량이평";
    this.m_VMAGroupPropertyInfo.m_strGroup = "VOLUME";

    this.m_VMAGroupPropertyInfo.SetMAPropertyInfo(0, 7, 3, 0, "rgb(255,0,0)", 1, 0, true);
    this.m_VMAGroupPropertyInfo.SetMAPropertyInfo(1, 14, 3, 0, "rgb(0,0,0)", 1, 0, true);
    this.m_VMAGroupPropertyInfo.SetMAPropertyInfo(2, 28, 3, 0, "rgb(0,0,255)", 1, 0, false);
    this.m_VMAGroupPropertyInfo.SetMAPropertyInfo(3, 60, 3, 0, "rgb(51,153,102)", 1, 0, false);
    this.m_VMAGroupPropertyInfo.SetMAPropertyInfo(4, 120, 3, 0, "rgb(255,0,255)", 1, 0, false);
    this.m_VMAGroupPropertyInfo.SetMAPropertyInfo(5, 180, 3, 0, "rgb(204,153,0)", 1, 0, false);
    this.m_VMAGroupPropertyInfo.SetMAPropertyInfo(6, 240, 3, 0, "rgb(150,150,150)", 1, 0, false);
    this.m_VMAGroupPropertyInfo.SetMAPropertyInfo(7, 300, 3, 0, "rgb(153,204,255)", 1, 0, false);
    this.m_VMAGroupPropertyInfo.SetMAPropertyInfo(8, 360, 3, 0, "rgb(153,255,51)", 1, 0, false);
    this.m_VMAGroupPropertyInfo.SetMAPropertyInfo(9, 420, 3, 0, "rgb(255,204,255)", 1, 0, false);

    this.m_rRQSet = rRQSet;

    this.m_strTitle = "거래량이평 ";
    
    this.m_nDigit = rRQSet.m_nOrderUnitQty;

    this.m_strMAPacketNameArray = [];
    //계산결과 담을 패킷생성
    var i, length = this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray.length;
    for (i = 0; i < length; i++) {

        //패킷추가
        this.m_strMAPacketNameArray[i] = this.m_strKey + "_VMA" + i + "_";
        rRQSet.AddNumPacketInfo(this.m_strMAPacketNameArray[i], -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

        //서브그래프 추가
        var VMASubGraph = new CIndicatorSubGraph(this);
        VMASubGraph.m_rRQSet = rRQSet;
        VMASubGraph.SetSubGraphName("" + i);
        VMASubGraph.SetPacketData(this.m_strMAPacketNameArray[i]);
        VMASubGraph.SetPropertyInfo(this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[i].m_MASubGraphPropertyInfo);
        this.m_SubGraphArray[i] = VMASubGraph;
    }

    //계산에 사용되는 데이터 패킷 셋팅
    this.AddInputPacket(["_VOLUME_"]);

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
}
CVMAIndicator.prototype = new CIndicator();
CVMAIndicator.prototype.constructor = CVMAIndicator;

CVMAIndicator.prototype.GetExcelTitle = function(TitleArray){

    let i, rSubGraph, nSubGraphLen = this.m_SubGraphArray.length;
    for(i = 0 ; i < nSubGraphLen; i++ )
    {
        rSubGraph = this.m_SubGraphArray[i];
        if(rSubGraph.m_bShow)
            TitleArray[TitleArray.length] = this.m_strTitle + " " + rSubGraph.m_strSubGraphTitle;
    }
}
CVMAIndicator.prototype.GetPropertyInfo = function (strKey, rIndiPropertyInfo) {

    var i, j;

    if (strKey !== undefined && this.m_strKey !== strKey)
        return null;

    CGraph.prototype.GetPropertyInfo.call(this, strKey, this.m_VMAGroupPropertyInfo);
    
    var length = this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray.length;
    var nSubGraphLength = this.m_SubGraphArray.length;
    for (i = 0; i < length && i < nSubGraphLength; i++) {

        var rMASubGraph = this.m_SubGraphArray[i];
        rMASubGraph.GetPropertyInfo(this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[i].m_MASubGraphPropertyInfo);
    }

    return this.m_VMAGroupPropertyInfo;
}
CVMAIndicator.prototype.SetPropertyInfo = function (strKey, rVMAGroupPropertyInfo, bSetup=false, strThemeName=null) {

    var i, j;

    if (this.m_strKey !== strKey)
        return false;

    if (CGraph.prototype.SetPropertyInfo.call(this, strKey, rVMAGroupPropertyInfo, bSetup) === false)
        return false;

    var rSubGraph;
    var NewMAProp, NewMASubGraph;
    var nMALen = this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray.length;
    var nMAPropLen = rVMAGroupPropertyInfo.m_MAPropertyInfoArray.length;
    var nDiffLen = nMAPropLen - nMALen;
    var nMinLen = nMAPropLen > nMALen ? nMALen : nMAPropLen;

    //this.m_MAGroupPropertyInfo.m_MAPropertyInfoArray.length 와 this.m_SubGraphArray.length는 같아야 하므로 여기서는 같은 것으로 처리
    //만일 길이가 서로 달라진 상태이면 달라지게 된 원인을 찾아 해당 소스 수정할 것
    var bCalc = false;
    for (i = 0; i < nMinLen; i++) {
        this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[i].SetPropertyInfo(rVMAGroupPropertyInfo.m_MAPropertyInfoArray[i], bSetup, strThemeName);
        if (this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[i].m_bCalc)
            bCalc = true;

        this.m_SubGraphArray[i].SetPropertyInfo(this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[i].m_MASubGraphPropertyInfo, bSetup, strThemeName);
    } 

    if (bSetup === true && bCalc === true) {
        this.Calc(bSetup);
        this.m_rBlock.ExtractYScaleMinMax(true);
    }

    return true;
}
CVMAIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    var nLength = this.m_SubGraphArray.length;
    var strTitle, strLastestData, rLastestPacketItemData = null;
    var bFirstSubGraph = true;

    let rSubGraph;
    let i, rShowGraphArray = [];
    for(i = 0 ; i < nLength ; i++ )
    {
        rSubGraph = this.m_SubGraphArray[i];
        if(rSubGraph.m_bShow)
            rShowGraphArray[ rShowGraphArray.length ] = rSubGraph;
        else        
            rSubGraph.HideTitle();
    }

    //Show상태 서브그래프가 없는 경우
    nLength = rShowGraphArray.length;
    if(nLength <= 0)
    {
        rSubGraph = this.m_SubGraphArray[0];
        if (bShowIndicatorName === true) {
            strTitle = this.m_strTitle;
            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
        else
            this.HideTitle();            
    }
    else
    {
        for( i = 0; i < nLength; i++ )
        {
            rSubGraph = rShowGraphArray[i];
            
            if (i === 0) 
            {
                if (bShowIndicatorName === true)
                    strTitle = this.m_strTitle + rSubGraph.m_strSubGraphTitle;
                else
                    strTitle = "";
            }
            else
            {
                if (bShowIndicatorName === true)
                    strTitle = rSubGraph.m_strSubGraphTitle;
                else
                    strTitle = "";
            }
            if (bShowIndicatorValue === true) {

                rLastestPacketItemData = rSubGraph.m_rPacketData.GetLastestPacketItemData();
                if (rLastestPacketItemData !== null) {

                    strLastestData = ConvertNumToDigitText(rLastestPacketItemData.m_Data, rLastestPacketItemData.m_rPacketData.m_nDec, 1, rLastestPacketItemData.m_rPacketData.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                    strTitle += "(" + strLastestData + ")";
                }
            }
            rSubGraph.SetTitle(strTitle);
            
            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
    }
}
CVMAIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rMAPacketData = null;

    var rInputPacketData = this.m_InputPacketDataArray[0];

    var n, nLength = this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray.length;
    for (n = 0; n < nLength; n++) {

        if (this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_MASubGraphPropertyInfo.m_bShow == false) {

            if (this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_bCalc)
                this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_bCalc = false;

            continue;
        }

        if (bSetup === true && this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_bCalc !== true)
            continue;
        this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_bCalc = false;

        var nMAType = this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_nMAType;
        var nMA = this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_nMA;
        var nMAIndex = nMA - 1;

        rMAPacketData = this.m_rRQSet.GetPacketData(this.m_strMAPacketNameArray[n]);

        rMAPacketData.InitDataArray();
        rMAPacketData.SetRQStartIndex(nMAIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)        

        var rSubGraph = this.m_SubGraphArray[n];        
        rSubGraph.m_strSubGraphTitle = "" + nMA;

        rSubGraph.m_SaveDataArray[0] = 0;
        rSubGraph.m_SaveDataArray[1] = null;
        var i, nDataLength = rInputPacketData.GetDataArraySize();

        if( nMAType === 0 )     // 단순
        {
            var Avg = 0;
            for (i = 0; i < nDataLength; i++) {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
                    continue;

                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem == undefined)
                    continue;

                rSubGraph.m_SaveDataArray[0] += rInputPacketData.m_DataArray[i].m_Data;
                rSubGraph.m_SaveDataArray[1] = rInputPacketData.m_DataArray[i].m_Data;//실시간 data 가 업데이트 되는 경우에 사용
                if (i < nMAIndex) 
                {
                    RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                    continue;
                }

                if (nMAIndex < i)
                    rSubGraph.m_SaveDataArray[0] -= rInputPacketData.m_DataArray[i - nMAIndex - 1].m_Data;

                if( nMA === 0 )
                    Avg = 0;
                else
                    Avg = rSubGraph.m_SaveDataArray[0] / nMA;

                rMAPacketData.AddTail(i, Avg);
                RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
            }
        }
        else if( nMAType === 1 )     // 지수
        {
            var SmoothConst = 2 / ( nMA + 1);
            var MAValue = 0, Source = 0;
            for (i = 0; i < nDataLength; i++)
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
                    continue;

                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem == undefined)
                    continue;

                if( i == 0 )
                {
                    MAValue = rInputPacketData.m_DataArray[i].m_Data;
                    rSubGraph.m_SaveDataArray[0] = MAValue; //실시간 data 가 업데이트 되는 경우에 사용
                    rSubGraph.m_SaveDataArray[1] = MAValue;
                }
                else
                {
                    rSubGraph.m_SaveDataArray[0] = MAValue;     // 이전봉 지수 MA값 기억
                    Source = rInputPacketData.m_DataArray[i].m_Data;
                    MAValue = MAValue * ( 1 - SmoothConst ) + Source * SmoothConst;
                    rSubGraph.m_SaveDataArray[1] = MAValue;     // 현재 봉 지수 MA값 기억
                }

                if( nMAIndex <= i ) 
                {
                    rMAPacketData.AddTail(i, MAValue);
                    RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                }
                else
                {
                    RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                }
            }
        }
        else if( nMAType === 2 )     // 가중
        {
            var MAValue = 0, WeightedSum = 0, Sum = 0;
            var Source = 0, PreSource = 0;

            for (i = 0; i < nDataLength; i++)
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
                    continue;

                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem === undefined)
                    continue;
                
                if ( nMA > i )
                {
                    rSubGraph.m_SaveDataArray[0] = MAValue;         // 직전봉 가중 MA값 저장
                    rSubGraph.m_SaveDataArray[1] = Sum;             // 직전봉 sum값 저장

                    Source = rInputPacketData.m_DataArray[i].m_Data;
                    WeightedSum = WeightedSum + Source * ( i + 1 );
                    if( nMA === 0 )
                        MAValue = 0;
                    else
                       MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));
                    Sum = Sum + Source;
                    rSubGraph.m_SaveDataArray[i] = Sum;

                    rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                    rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                }
                
                if( nMA <= i )
                {
                    rSubGraph.m_SaveDataArray[0] = MAValue;         // 직전봉 가중 MA값 저장
                    rSubGraph.m_SaveDataArray[1] = Sum;             // 직전봉 sum값 저장

                    Source = rInputPacketData.m_DataArray[i].m_Data;
                    PreSource = rInputPacketData.m_DataArray[i - nMA].m_Data;
                    WeightedSum = WeightedSum - Sum + Source * nMA;
                    if( nMA === 0 )
                        MAValue = 0;
                    else
                        MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));                    
                    Sum = Sum + Source - PreSource;
                    
                    rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                    rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                }

                if( nMAIndex <= i ) 
                {
                    rMAPacketData.AddTail(i, MAValue);
                    RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                }
                else
                {
                    RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                }
            }
        }
    }
    return true;
}
CVMAIndicator.prototype.RealCalc = function (bAddData) {

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;


    var rInputPacketData = null;
    var rMAPacketData = null;
    var Avg = 0;

    var i = 0, n, nLength = this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray.length, nSubGraphLength = this.m_SubGraphArray.length;
    for (n = 0; n < nLength && n < nSubGraphLength; n++) {

        if (this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_MASubGraphPropertyInfo.m_bShow == false)
            continue;

        var nMAType = this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_nMAType;
        var nMA = this.m_VMAGroupPropertyInfo.m_MAPropertyInfoArray[n].m_nMA;
        var nMAIndex = nMA - 1;

        rInputPacketData = this.m_rRQSet.GetPacketDataByIndex(this.m_rRQSet.m_nVolumePacketIndex);

        rMAPacketData = this.m_rRQSet.GetPacketData(this.m_strMAPacketNameArray[n]);
        rMAPacketData.SetRQStartIndex(nMAIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)

        var rSubGraph = this.m_SubGraphArray[n];

        if (bAddData) {//Add

            var i, nDataLength = rInputPacketData.GetDataArraySize();

            var nEndIndex = nDataLength - 1 - nMA;

            i = nDataLength - 1;
            if( nMAType === 0 )     // 단순
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] != undefined) {

                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem != undefined) {

                        rSubGraph.m_SaveDataArray[0] += rInputPacketData.m_DataArray[i].m_Data;
                        rSubGraph.m_SaveDataArray[1] = rInputPacketData.m_DataArray[i].m_Data;
                        if (nMAIndex <= i) {

                            if (nMAIndex < i)
                                rSubGraph.m_SaveDataArray[0] -= rInputPacketData.m_DataArray[i - nMAIndex - 1].m_Data;

                            if( nMA === 0 )
                                Avg = 0;
                            else
                                Avg = rSubGraph.m_SaveDataArray[0] / nMA;

                            rMAPacketData.AppendRealData(i, Avg);

                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                    }
                }
            }
            else if( nMAType === 1 )     // 지수
            {
                var SmoothConst = 2 / ( nMA + 1);
                var MAValue = 0, Source = 0;

                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] !== undefined)
                {
                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem !== undefined)
                    {
                        if( i === 0 )
                        {
                            MAValue = rInputPacketData.m_DataArray[i].m_Data;
                            rSubGraph.m_SaveDataArray[0] = MAValue;
                            rSubGraph.m_SaveDataArray[1] = MAValue;
                        }
                        else
                        {
                            MAValue = rSubGraph.m_SaveDataArray[1];     // 이전봉 지수 MA값 얻어옴(갱신 값)
                            rSubGraph.m_SaveDataArray[0] = MAValue;     // 새로운 봉이 생성되었으므로 이전봉으로 등록

                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            MAValue = MAValue * ( 1 - SmoothConst ) + Source * SmoothConst;
                            rSubGraph.m_SaveDataArray[1] = MAValue;     // 현재 봉 지수 MA값 기억
                        }

                        if( nMAIndex <= i ) 
                        {
                            rMAPacketData.AddTail(i, MAValue);
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                    }
                }
            }
            else if( nMAType === 2 )     // 가중
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] !== undefined)
                {
                    var MAValue = 0, WeightedSum = 0, Sum = 0;
                    var Source = 0, PreSource = 0;

                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem !== undefined)
                    {
                        if ( 0 < i )
                        {
                            MAValue = rSubGraph.m_SaveDataArray[2];     // 직전봉 가중 MA값 얻어옴
                            Sum = rSubGraph.m_SaveDataArray[3];         // 직전봉 sum값 얻어옴

                            rSubGraph.m_SaveDataArray[0] = MAValue;     // 새로운 봉이 생성되었으므로 직전값으로 등록
                            rSubGraph.m_SaveDataArray[1] = Sum;         // 새로운 봉이 생성되었으므로 직전값으로 등록

                            WeightedSum = MAValue / 2 * ( nMA * ( nMA + 1));
                        }

                        if ( nMA > i )
                        {
                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            WeightedSum = WeightedSum + Source * ( i + 1 );
                            if( nMA === 0 )
                                MAValue = 0;
                            else
                                MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));
                            Sum = Sum + Source;

                            rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                            rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                        }

                        if( nMA <= i )
                        {
                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            PreSource = rInputPacketData.m_DataArray[i - nMA].m_Data;
                            WeightedSum = WeightedSum - Sum + Source * nMA;
                            if( nMA === 0 )
                                MAValue = 0;
                            else
                                MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));                    
                            Sum = Sum + Source - PreSource;

                            rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                            rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                        }

                        if( nMAIndex <= i ) 
                        {
                            rMAPacketData.AddTail(i, MAValue);
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                    }
                }
            }
        }
        else {//Update

            var i, nDataLength = rInputPacketData.GetDataArraySize();

            i = nDataLength - 1;
            if( nMAType === 0 )     // 단순
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] != undefined) {

                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem != undefined) {

                        rSubGraph.m_SaveDataArray[0] -= rSubGraph.m_SaveDataArray[1];

                        rSubGraph.m_SaveDataArray[0] += rInputPacketData.m_DataArray[i].m_Data;

                        if (nMAIndex <= i) {

                            if( nMA === 0 )
                                Avg = 0;
                            else
                                Avg = rSubGraph.m_SaveDataArray[0] / nMA;

                            rMAPacketData.UpdateData(i , Avg);

                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                        rSubGraph.m_SaveDataArray[1] = rInputPacketData.m_DataArray[i].m_Data;
                    }
                }
            }
            else if( nMAType === 1 )     // 지수
            {
                var SmoothConst = 2 / ( nMA + 1);
                var MAValue = 0, Source = 0;

                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] !== undefined)
                {
                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem !== undefined)
                    {
                        if( i === 0 )
                        {
                            MAValue = rInputPacketData.m_DataArray[i].m_Data;
                            rSubGraph.m_SaveDataArray[0] = MAValue;
                            rSubGraph.m_SaveDataArray[1] = MAValue;
                        }
                        else
                        {
                            MAValue = rSubGraph.m_SaveDataArray[0];     // 이전봉 지수 MA값 얻어옴
                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            MAValue = MAValue * ( 1 - SmoothConst ) + Source * SmoothConst;
                            rSubGraph.m_SaveDataArray[1] = MAValue;     // 현재봉 지수 MA값 기억
                        }

                        if( nMAIndex <= i ) 
                        {
                            rMAPacketData.UpdateData(i, MAValue);
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                    }
                }
            }
            else if( nMAType === 2 )     // 가중
            {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] !== undefined)
                {
                    var MAValue = 0, WeightedSum = 0, Sum = 0;
                    var Source = 0, PreSource = 0;

                    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                    if (RQPacketsItem !== undefined)
                    {
                        if ( 0 < i )
                        {
                            MAValue = rSubGraph.m_SaveDataArray[0];     // 직전봉 가중 MA값 얻어옴
                            Sum = rSubGraph.m_SaveDataArray[1];         // 직전봉 sum값 얻어옴
                            WeightedSum = MAValue / 2 * ( nMA * ( nMA + 1));
                        }

                        if ( nMA > i )
                        {
                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            WeightedSum = WeightedSum + Source * ( i + 1 );
                            if( nMA === 0 )
                                MAValue = 0;
                            else
                                MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));
                            Sum = Sum + Source;

                            rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                            rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                        }

                        if( nMA <= i )
                        {
                            Source = rInputPacketData.m_DataArray[i].m_Data;
                            PreSource = rInputPacketData.m_DataArray[i - nMA].m_Data;
                            WeightedSum = WeightedSum - Sum + Source * nMA;
                            if( nMA === 0 )
                                MAValue = 0;
                            else
                                MAValue = WeightedSum * 2 / ( nMA * ( nMA + 1));                    
                            Sum = Sum + Source - PreSource;

                            rSubGraph.m_SaveDataArray[2] = MAValue;         // 현재봉 가중 MA값 저장
                            rSubGraph.m_SaveDataArray[3] = Sum;             // 현재봉 sum값 저장
                        }

                        if( nMAIndex <= i ) 
                        {
                            rMAPacketData.UpdateData(i, MAValue);
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
                        }
                        else
                        {
                            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                        }
                    }
                }
            }
        }
    }
    return REALCALC_SUCCESS;
}

//MACD
function CMACDIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "MACD 지표";

    //계산결과 담을 패킷생성
    this.m_strMACDPacketName = this.m_strKey + "_MACD_";
    rRQSet.AddNumPacketInfo(this.m_strMACDPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strSignalPacketName = this.m_strKey + "_SIGNAL_";
    rRQSet.AddNumPacketInfo(this.m_strSignalPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var MACDSubGraph = new CIndicatorSubGraph(this);
    MACDSubGraph.m_rRQSet = rRQSet;
    MACDSubGraph.m_LineTypeInfo.m_clrLine = '#FF5626';
    MACDSubGraph.SetPacketData(this.m_strMACDPacketName);
    MACDSubGraph.SetSubGraphName("MACD");
    MACDSubGraph.m_strSubGraphTitle = "MACD";
    this.m_SubGraphArray.push(MACDSubGraph);

    var SignalSubGraph = new CIndicatorSubGraph(this);
    SignalSubGraph.m_rRQSet = rRQSet;
    SignalSubGraph.m_LineTypeInfo.m_clrLine = '#3EC3D1';
    SignalSubGraph.SetPacketData(this.m_strSignalPacketName);
    SignalSubGraph.SetSubGraphName("Signal");
    SignalSubGraph.m_strSubGraphTitle = "Signal";
    this.m_SubGraphArray.push(SignalSubGraph);
    
    //계산에 사용될 변수 기본설정
    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("ShortMAPeriod", NUMERIC_TYPE, 12); //Short(12)
    this.AddVariable("LongMAPeriod", NUMERIC_TYPE, 26);  //Long(26)
    this.AddVariable("SignalPeriod", NUMERIC_TYPE, 9);   //Signal Period(9)    
    this.AddVariable("DType", NUMERIC_TYPE, 3, "가격");          //데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)    

    //기준선
    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 0;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
    
    this.m_SaveLongDataArray = [];
    this.m_SaveShortDataArray = [];
    this.m_SaveSignalDataArray = [];
}
CMACDIndicator.prototype = new CIndicator();
CMACDIndicator.prototype.constructor = CMACDIndicator;
CMACDIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);
    
    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rMACDPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMACDPacketName);
    var rSignalPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSignalPacketName);    

    rMACDPacketData.InitDataArray();
    rSignalPacketData.InitDataArray();    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vShortPeriod = this.m_VariableArray[0].m_strData;
    var vLongPeriod = this.m_VariableArray[1].m_strData;
    var vSignalPeriod = this.m_VariableArray[2].m_strData;    
    var vDType = this.m_VariableArray[3].m_strData;
    /*var vMACDView = this.m_VariableArray[5].m_strData;
    var vSignalView = this.m_VariableArray[6].m_strData;
    var vBaseView = this.m_VariableArray[7].m_strData;*/
    ////////////////////////////////////////////////////////

    var MData = null;
    switch (vDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    this.m_SaveLongDataArray[1] = 0;
    this.m_SaveShortDataArray[1] = 0;
    this.m_SaveSignalDataArray[1] = 0;

    var deviationS = 2 / (vShortPeriod + 1);
    var deviationL = 2 / (vLongPeriod + 1);
    var deviation = 2 / (vSignalPeriod + 1);

    let ShortMA, LongMA, SignalMA, Source, PreSource, macd;
    var nDataLength = MData.length;
    for (var i = 0; i < nDataLength; i++) {

        var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }        

        if( i === 0 )
        {
            ShortMA = MData[i].m_Data;
            this.m_SaveShortDataArray[0] = ShortMA;
            this.m_SaveShortDataArray[1] = ShortMA;

            LongMA = MData[i].m_Data;
            this.m_SaveLongDataArray[0] = LongMA;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            SignalMA = macd;
            this.m_SaveSignalDataArray[0] = SignalMA;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }
        else
        {
            this.m_SaveShortDataArray[0] = ShortMA;
            Source = MData[i].m_Data;
            ShortMA = ShortMA * (1 - deviationS) + Source * deviationS;
            this.m_SaveShortDataArray[1] = ShortMA;

            this.m_SaveLongDataArray[0] = LongMA;
            LongMA = LongMA * (1 - deviationL) + Source * deviationL;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            this.m_SaveSignalDataArray[0] = SignalMA;
            SignalMA = SignalMA * (1 - deviation) + macd * deviation;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }
        
        if (rMACDPacketData.GetRQStartIndex() == null) {
            rMACDPacketData.SetRQStartIndex(i);
        }
        rMACDPacketData.AddTail(i, macd);
        RQPacketsItem.m_Packets[rMACDPacketData.m_nPacketIndex] = rMACDPacketData.GetData(rMACDPacketData.GetDataArraySize() - 1);

        if (rSignalPacketData.GetRQStartIndex() == null) {
            rSignalPacketData.SetRQStartIndex(i);
        }
        rSignalPacketData.AddTail(i, SignalMA);
        RQPacketsItem.m_Packets[rSignalPacketData.m_nPacketIndex] = rSignalPacketData.GetData(rSignalPacketData.GetDataArraySize() - 1);        
    }
    return true;
}
CMACDIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rMACDPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMACDPacketName);
    var rSignalPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSignalPacketName);    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vShortPeriod = this.m_VariableArray[0].m_strData;
    var vLongPeriod = this.m_VariableArray[1].m_strData;
    var vSignalPeriod = this.m_VariableArray[2].m_strData;    
    var vDType = this.m_VariableArray[3].m_strData;
    /*var vMACDView = this.m_VariableArray[5].m_strData;
    var vSignalView = this.m_VariableArray[6].m_strData;
    var vBaseView = this.m_VariableArray[7].m_strData;*/
    ////////////////////////////////////////////////////////

    var MData = null;
    switch (vDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    let deviationS = 2 / (vShortPeriod + 1);
    let deviationL = 2 / (vLongPeriod + 1);
    let deviation = 2 / (vSignalPeriod + 1);

    let i = MData.length - 1;
    let ShortMA, LongMA, SignalMA, Source, PreSource, macd;
    let tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }
    let RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }

    if(bAddData)//추가
    {
        if( i === 0)
        {
            ShortMA = MData[i].m_Data;
            this.m_SaveShortDataArray[0] = ShortMA;
            this.m_SaveShortDataArray[1] = ShortMA;

            LongMA = MData[i].m_Data;
            this.m_SaveLongDataArray[0] = LongMA;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            SignalMA = macd;
            this.m_SaveSignalDataArray[0] = SignalMA;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }
        else
        {
            ShortMA = this.m_SaveShortDataArray[1];
            this.m_SaveShortDataArray[0] = ShortMA;

            Source = MData[i].m_Data;
            ShortMA = ShortMA * (1 - deviationS) + Source * deviationS;
            this.m_SaveShortDataArray[1] = ShortMA;

            LongMA = this.m_SaveLongDataArray[1];
            this.m_SaveLongDataArray[0] = LongMA;

            LongMA = LongMA * (1 - deviationL) + Source * deviationL;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            SignalMA = this.m_SaveSignalDataArray[1];
            this.m_SaveSignalDataArray[0] = SignalMA;

            Source = macd;
            SignalMA = SignalMA * ( 1 - deviation) + Source * deviation;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }        
    }
    else//업데이트
    {
        if( i === 0)
        {
            ShortMA = MData[i].m_Data;
            this.m_SaveShortDataArray[0] = ShortMA;
            this.m_SaveShortDataArray[1] = ShortMA;

            LongMA = MData[i].m_Data;
            this.m_SaveLongDataArray[0] = LongMA;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            SignalMA = macd;
            this.m_SaveSignalDataArray[0] = SignalMA;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }
        else
        {
            ShortMA = this.m_SaveShortDataArray[0];
            Source = MData[i].m_Data;
            ShortMA = ShortMA * (1 - deviationS) + Source * deviationS;
            this.m_SaveShortDataArray[1] = ShortMA;

            LongMA = this.m_SaveLongDataArray[0];
            LongMA = LongMA * (1 - deviationL) + Source * deviationL;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            SignalMA = this.m_SaveSignalDataArray[0];
            Source = macd;
            SignalMA = SignalMA * ( 1 - deviation) + Source * deviation;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }
    }

    if (rMACDPacketData.GetRQStartIndex() === null) {
        rMACDPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rMACDPacketData.AppendRealData(i, macd);
    } else {
        rMACDPacketData.UpdateData(i, macd);
    }
    RQPacketsItem.m_Packets[rMACDPacketData.m_nPacketIndex] = rMACDPacketData.GetData(rMACDPacketData.GetDataArraySize() - 1);
    
    if (rSignalPacketData.GetRQStartIndex() === null) {
        rSignalPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rSignalPacketData.AppendRealData(i, SignalMA);
    } else {
        rSignalPacketData.UpdateData(i , SignalMA);
    }
    RQPacketsItem.m_Packets[rSignalPacketData.m_nPacketIndex] = rSignalPacketData.GetData(rSignalPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//MACD OSC
function CMACDOSIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;

    this.m_strTitle = "MACD Oscillator 지표";

    //계산결과 담을 패킷생성
    this.m_strMACSOSSignalPacketName = this.m_strKey + "_MACSOSSignal_";
    rRQSet.AddNumPacketInfo(this.m_strMACSOSSignalPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    var MACSOSSignalSubGraph = new CIndicatorSubGraph(this, INDICATOR_SUBGRAPH_BAR_TYPE);
    MACSOSSignalSubGraph.m_BarTypeInfo.m_nCompareType = 1;//0값 기준비교

    MACSOSSignalSubGraph.m_rRQSet = rRQSet;    
    MACSOSSignalSubGraph.SetPacketData(this.m_strMACSOSSignalPacketName);
    MACSOSSignalSubGraph.SetSubGraphName("Oscillator");
    MACSOSSignalSubGraph.m_strSubGraphTitle = "MACD Oscillator";

    var rPriceSubGraphPropertyInfo = rRQSet.m_CommonInfo["PriceSubGraphPropertyInfo"];
    if (rPriceSubGraphPropertyInfo !== undefined)
        MACSOSSignalSubGraph.SetPriceSubGraphPropertyInfo(rPriceSubGraphPropertyInfo);

    this.m_SubGraphArray.push(MACSOSSignalSubGraph);

    //계산에 사용될 변수 기본설정
    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("ShortMAPeriod", NUMERIC_TYPE, 12);
    this.AddVariable("LongMAPeriod", NUMERIC_TYPE, 26);
    this.AddVariable("SignalPeriod", NUMERIC_TYPE, 9);
    this.AddVariable("DType", NUMERIC_TYPE, 3, "가격");             //데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)
    //this.AddVariable("ViewOscillator", NUMERIC_TYPE, true); //Oscillator

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveShortDataArray = [];
    this.m_SaveLongDataArray = [];
    this.m_SaveSignalDataArray = [];
}
CMACDOSIndicator.prototype = new CIndicator();
CMACDOSIndicator.prototype.constructor = CMACDOSIndicator;
CMACDOSIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData == undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rOscillatorPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMACSOSSignalPacketName);
    rOscillatorPacketData.InitDataArray();

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vShortPeriod = this.m_VariableArray[0].m_strData;
    var vLongPeriod = this.m_VariableArray[1].m_strData;
    var vSignalPeriod = this.m_VariableArray[2].m_strData;
    var vDType = this.m_VariableArray[3].m_strData;
    //var vOscillatorView = this.m_VariableArray[4].m_strData;
    ////////////////////////////////////////////////////////

    var MData = null;
    switch (vDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    this.m_SaveLongDataArray[1] = 0;
    this.m_SaveShortDataArray[1] = 0;
    this.m_SaveSignalDataArray[1] = 0;

    var deviationS = 2 / (vShortPeriod + 1);
    var deviationL = 2 / (vLongPeriod + 1);
    var deviation = 2 / (vSignalPeriod + 1);

    let ShortMA, LongMA, SignalMA, Source, PreSource, macd, MacdOsc;
    var nDataLength = MData.length;
    for (var i = 0; i < nDataLength; i++) {

        var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined) {
            continue;
        }

        if( i === 0 )
        {
            ShortMA = MData[i].m_Data;
            this.m_SaveShortDataArray[0] = ShortMA;
            this.m_SaveShortDataArray[1] = ShortMA;

            LongMA = MData[i].m_Data;
            this.m_SaveLongDataArray[0] = LongMA;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            SignalMA = macd;
            this.m_SaveSignalDataArray[0] = SignalMA;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }
        else
        {
            this.m_SaveShortDataArray[0] = ShortMA;
            Source = MData[i].m_Data;
            ShortMA = ShortMA * (1 - deviationS) + Source * deviationS;
            this.m_SaveShortDataArray[1] = ShortMA;

            this.m_SaveLongDataArray[0] = LongMA;
            LongMA = LongMA * (1 - deviationL) + Source * deviationL;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            this.m_SaveSignalDataArray[0] = SignalMA;
            SignalMA = SignalMA * (1 - deviation) + macd * deviation;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }

        MacdOsc = macd - SignalMA;

        //if (vOscillatorView) {
            if (rOscillatorPacketData.GetRQStartIndex() == null) {
                rOscillatorPacketData.SetRQStartIndex(i);
            }
            rOscillatorPacketData.AddTail(i, MacdOsc);
            RQPacketsItem.m_Packets[rOscillatorPacketData.m_nPacketIndex] = rOscillatorPacketData.GetData(rOscillatorPacketData.GetDataArraySize() - 1);
        //}
    }
    return true;
}
CMACDOSIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData == undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rOscillatorPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMACSOSSignalPacketName);

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vShortPeriod = this.m_VariableArray[0].m_strData;
    var vLongPeriod = this.m_VariableArray[1].m_strData;
    var vSignalPeriod = this.m_VariableArray[2].m_strData;
    var vDType = this.m_VariableArray[3].m_strData;
    //var vOscillatorView = this.m_VariableArray[4].m_strData;
    ////////////////////////////////////////////////////////

    var MData = null;
    switch (vDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    if (this.m_SaveLongDataArray[1] == null ) {
        this.m_SaveLongDataArray[1] = 0;
    }
    if (this.m_SaveShortDataArray[1] == null ) {
        this.m_SaveShortDataArray[1] = 0;
    }
    if (this.m_SaveSignalDataArray[1] == null ) {
        this.m_SaveSignalDataArray[1] = 0;
    }

    var deviationS = 2 / (vShortPeriod + 1);
    var deviationL = 2 / (vLongPeriod + 1);
    var deviation = 2 / (vSignalPeriod + 1);

    var i = MData.length - 1;
    let ShortMA, LongMA, SignalMA, Source, PreSource, macd, MacdOsc;
    var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem == undefined) {
        return REALCALC_FAIL;
    }

    if (bAddData) {
        
        if( i === 0)
        {
            ShortMA = MData[i].m_Data;
            this.m_SaveShortDataArray[0] = ShortMA;
            this.m_SaveShortDataArray[1] = ShortMA;

            LongMA = MData[i].m_Data;
            this.m_SaveLongDataArray[0] = LongMA;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            SignalMA = macd;
            this.m_SaveSignalDataArray[0] = SignalMA;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }
        else
        {
            ShortMA = this.m_SaveShortDataArray[1];
            this.m_SaveShortDataArray[0] = ShortMA;

            Source = MData[i].m_Data;
            ShortMA = ShortMA * (1 - deviationS) + Source * deviationS;
            this.m_SaveShortDataArray[1] = ShortMA;

            LongMA = this.m_SaveLongDataArray[1];
            this.m_SaveLongDataArray[0] = LongMA;

            LongMA = LongMA * (1 - deviationL) + Source * deviationL;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            SignalMA = this.m_SaveSignalDataArray[1];
            this.m_SaveSignalDataArray[0] = SignalMA;

            Source = macd;
            SignalMA = SignalMA * ( 1 - deviation) + Source * deviation;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }
    }
    else
    {
        if( i === 0)
        {
            ShortMA = MData[i].m_Data;
            this.m_SaveShortDataArray[0] = ShortMA;
            this.m_SaveShortDataArray[1] = ShortMA;

            LongMA = MData[i].m_Data;
            this.m_SaveLongDataArray[0] = LongMA;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            SignalMA = macd;
            this.m_SaveSignalDataArray[0] = SignalMA;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }
        else
        {
            ShortMA = this.m_SaveShortDataArray[0];
            Source = MData[i].m_Data;
            ShortMA = ShortMA * (1 - deviationS) + Source * deviationS;
            this.m_SaveShortDataArray[1] = ShortMA;

            LongMA = this.m_SaveLongDataArray[0];
            LongMA = LongMA * (1 - deviationL) + Source * deviationL;
            this.m_SaveLongDataArray[1] = LongMA;

            macd = this.m_SaveShortDataArray[1] - this.m_SaveLongDataArray[1];

            SignalMA = this.m_SaveSignalDataArray[0];
            Source = macd;
            SignalMA = SignalMA * ( 1 - deviation) + Source * deviation;
            this.m_SaveSignalDataArray[1] = SignalMA;
        }
    }

    MacdOsc = macd - SignalMA;
    
    //if (vOscillatorView) {
        if (rOscillatorPacketData.GetRQStartIndex() == null) {
            rOscillatorPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {
            rOscillatorPacketData.AppendRealData( i, MacdOsc);
        } else {
            rOscillatorPacketData.UpdateData(i , MacdOsc);
        }
        RQPacketsItem.m_Packets[rOscillatorPacketData.m_nPacketIndex] = rOscillatorPacketData.GetData(rOscillatorPacketData.GetDataArraySize() - 1);
   //}
    return REALCALC_SUCCESS;
}

//ADX
function CADXIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "ADX 지표";

    //계산결과 담을 패킷생성
    this.m_strADXPacketName = this.m_strKey + "_ADX_";
    rRQSet.AddNumPacketInfo(this.m_strADXPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strPDIPacketName = this.m_strKey + "_PDI_";
    rRQSet.AddNumPacketInfo(this.m_strPDIPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strMDIPacketName = this.m_strKey + "_MDI_";
    rRQSet.AddNumPacketInfo(this.m_strMDIPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strADXBPacketName = this.m_strKey + "_ADXB_";
    rRQSet.AddNumPacketInfo(this.m_strADXBPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var ADXSubGraph = new CIndicatorSubGraph(this);
    ADXSubGraph.m_rRQSet = rRQSet;
    ADXSubGraph.m_LineTypeInfo.m_clrLine = '#FF5626';
    ADXSubGraph.SetPacketData(this.m_strADXPacketName);
    ADXSubGraph.SetSubGraphName("ADX");
    ADXSubGraph.m_strSubGraphTitle = "ADX";
    this.m_SubGraphArray.push(ADXSubGraph);

    var PDISubGraph = new CIndicatorSubGraph(this);
    PDISubGraph.m_rRQSet = rRQSet;
    PDISubGraph.m_LineTypeInfo.m_clrLine = '#3EC3D1';
    PDISubGraph.SetPacketData(this.m_strPDIPacketName);
    PDISubGraph.SetSubGraphName("PDI");
    PDISubGraph.m_strSubGraphTitle = "PDI";
    this.m_SubGraphArray.push(PDISubGraph);

    var MDISubGraph = new CIndicatorSubGraph(this);
    MDISubGraph.m_rRQSet = rRQSet;
    MDISubGraph.m_LineTypeInfo.m_clrLine = '#0001C8';
    MDISubGraph.SetPacketData(this.m_strMDIPacketName);
    MDISubGraph.SetSubGraphName("MDI");
    MDISubGraph.m_strSubGraphTitle = "MDI";
    this.m_SubGraphArray.push(MDISubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 14);     // ADX Period (14)

    //기준선
    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 20;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 80;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
    
    this.m_SavePDIDataArray = [];
    this.m_SaveMDIDataArray = [];
    this.m_SaveTMPDataArray = [];
    this.m_SaveADXDataArray = [];
}
CADXIndicator.prototype = new CIndicator();
CADXIndicator.prototype.constructor = CADXIndicator;
CADXIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];//고
    var rInputPacketLData = this.m_InputPacketDataArray[2];//저
    var rInputPacketPData = this.m_InputPacketDataArray[3];//종

    if (rInputPacketHData === undefined || rInputPacketLData === undefined || rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rADXPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADXPacketName);
    var rPDIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPDIPacketName);
    var rMDIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMDIPacketName);
    

    rADXPacketData.InitDataArray();
    rPDIPacketData.InitDataArray();
    rMDIPacketData.InitDataArray();

    var vADXPeriod = this.m_VariableArray[0].m_strData;
    
    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var pdi, mdi, tmp, adx;

    this.m_SavePDIDataArray[0] = 0;
    this.m_SaveMDIDataArray[0] = 0;
    this.m_SaveTMPDataArray[0] = 0;
    this.m_SaveADXDataArray[1] = 0;

    var nDataLength = MPData.length;
    for (var i = 0; i < nDataLength; i++) {
        var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }

        if (i < 1) {

            RQPacketsItem.m_Packets[rPDIPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rMDIPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        pdi = MHData[i].m_Data - MHData[i-1].m_Data;
        mdi = MLData[i-1].m_Data - MLData[i].m_Data;

        if (pdi <= 0 || pdi <= mdi) {
            pdi = 0;
        }

        if (mdi <= 0 || pdi >= mdi) {
            mdi = 0;
        }

        tmp = Math.max(Math.abs(MHData[i].m_Data - MLData[i].m_Data), Math.abs(MPData[i-1].m_Data - MHData[i].m_Data), Math.abs(MPData[i-1].m_Data - MLData[i].m_Data));

        if (i <= vADXPeriod) {
            this.m_SavePDIDataArray[1] = pdi;
            this.m_SavePDIDataArray[0] += this.m_SavePDIDataArray[1];
            this.m_SaveMDIDataArray[1] = mdi;
            this.m_SaveMDIDataArray[0] += this.m_SaveMDIDataArray[1];
            this.m_SaveTMPDataArray[1] = tmp;
            this.m_SaveTMPDataArray[0] += this.m_SaveTMPDataArray[1];
        }

        if (i < vADXPeriod) {

            RQPacketsItem.m_Packets[rPDIPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rMDIPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if (i === vADXPeriod) {
            if( vADXPeriod === 0 )
            {
                this.m_SavePDIDataArray[3] = 0;
                this.m_SaveMDIDataArray[3] = 0;
                this.m_SaveTMPDataArray[3] = 0;
            }
            else
            {
                this.m_SavePDIDataArray[3] = this.m_SavePDIDataArray[0] / vADXPeriod;
                this.m_SaveMDIDataArray[3] = this.m_SaveMDIDataArray[0] / vADXPeriod;
                this.m_SaveTMPDataArray[3] = this.m_SaveTMPDataArray[0] / vADXPeriod;
            }
        } else {
            if( vADXPeriod === 0 )
            {
                this.m_SavePDIDataArray[2] = this.m_SavePDIDataArray[3];
                this.m_SavePDIDataArray[3] = 0;

                this.m_SaveMDIDataArray[2] = this.m_SaveMDIDataArray[3];
                this.m_SaveMDIDataArray[3] = 0;

                this.m_SaveTMPDataArray[2] = this.m_SaveTMPDataArray[3];
                this.m_SaveTMPDataArray[3] = 0;
            }
            else
            {
                this.m_SavePDIDataArray[2] = this.m_SavePDIDataArray[3];
                this.m_SavePDIDataArray[3] = (this.m_SavePDIDataArray[2] * (vADXPeriod-1) + pdi) / vADXPeriod;

                this.m_SaveMDIDataArray[2] = this.m_SaveMDIDataArray[3];
                this.m_SaveMDIDataArray[3] = (this.m_SaveMDIDataArray[2] * (vADXPeriod-1) + mdi) / vADXPeriod;

                this.m_SaveTMPDataArray[2] = this.m_SaveTMPDataArray[3];
                this.m_SaveTMPDataArray[3] = (this.m_SaveTMPDataArray[2] * (vADXPeriod-1) + tmp) / vADXPeriod;
            }
        }

        if( this.m_SaveTMPDataArray[3] === 0 )
        {
            pdi = 0;
            mdi = 0;
        }
        else
        {
            pdi = this.m_SavePDIDataArray[3]/this.m_SaveTMPDataArray[3]*100;
            mdi = this.m_SaveMDIDataArray[3]/this.m_SaveTMPDataArray[3]*100;
        }

        
        if (rPDIPacketData.GetRQStartIndex() === null) {
            rPDIPacketData.SetRQStartIndex(i);
        }
        rPDIPacketData.AddTail(i, pdi);
        RQPacketsItem.m_Packets[rPDIPacketData.m_nPacketIndex] = rPDIPacketData.GetData(rPDIPacketData.GetDataArraySize() - 1);
        
        if (rMDIPacketData.GetRQStartIndex() == null) {
            rMDIPacketData.SetRQStartIndex(i);
        }
        rMDIPacketData.AddTail(i, mdi);
        RQPacketsItem.m_Packets[rMDIPacketData.m_nPacketIndex] = rMDIPacketData.GetData(rMDIPacketData.GetDataArraySize() - 1);

        if( (pdi + mdi) === 0 )
            adx = 0;
        else
            adx = Math.abs((pdi - mdi) / (pdi + mdi) * 100);

        if (i < vADXPeriod*3) {
            RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = undefined;
            continue;
        }
        if( vADXPeriod === 0 )
        {
            this.m_SaveADXDataArray[0] = this.m_SaveADXDataArray[1];
            this.m_SaveADXDataArray[1] = 0;
        }
        else
        {
            this.m_SaveADXDataArray[0] = this.m_SaveADXDataArray[1];
            this.m_SaveADXDataArray[1] = (this.m_SaveADXDataArray[0] * (vADXPeriod-1) + adx) / vADXPeriod;
        }
        
        if (rADXPacketData.GetRQStartIndex() === null) {
            rADXPacketData.SetRQStartIndex(i);
        }
        rADXPacketData.AddTail(i, this.m_SaveADXDataArray[1]);
        RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = rADXPacketData.GetData(rADXPacketData.GetDataArraySize() - 1);        
    }

    return true;
}
CADXIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketHData = this.m_InputPacketDataArray[1];//고
    var rInputPacketLData = this.m_InputPacketDataArray[2];//저
    var rInputPacketPData = this.m_InputPacketDataArray[3];//종

    if (rInputPacketHData === undefined || rInputPacketLData === undefined || rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rADXPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADXPacketName);
    var rPDIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPDIPacketName);
    var rMDIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMDIPacketName);

    var vADXPeriod = this.m_VariableArray[0].m_strData;

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var pdi, mdi, tmp, adx;

    if( this.m_SavePDIDataArray[0] === null ) {
        this.m_SavePDIDataArray[0] = 0;
    }
    if( this.m_SaveMDIDataArray[0] === null ) {
        this.m_SaveMDIDataArray[0] = 0;
    }
    if( this.m_SaveTMPDataArray[0] === null ) {
        this.m_SaveTMPDataArray[0] = 0;
    }
    if( this.m_SaveADXDataArray[1] === null ) {
        this.m_SaveADXDataArray[1] = 0;
    }

    var nDataLength = MPData.length;
    var i = nDataLength - 1;
    var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }
    
    if (i < 1) {
        RQPacketsItem.m_Packets[rPDIPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rMDIPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    pdi = MHData[i].m_Data - MHData[i-1].m_Data;
    mdi = MLData[i-1].m_Data - MLData[i].m_Data;

    if (pdi <= 0 || pdi <= mdi) {
        pdi = 0;
    }

    if (mdi <= 0 || pdi >= mdi) {
        mdi = 0;
    }

    tmp = Math.max(Math.abs(MHData[i].m_Data - MLData[i].m_Data), Math.abs(MPData[i-1].m_Data - MHData[i].m_Data), Math.abs(MPData[i-1].m_Data - MLData[i].m_Data));

    if (i <= vADXPeriod) {
        if (!bAddData) {
            this.m_SavePDIDataArray[0] -= this.m_SavePDIDataArray[1];
            this.m_SaveMDIDataArray[0] -= this.m_SaveMDIDataArray[1];
            this.m_SaveTMPDataArray[0] -= this.m_SaveTMPDataArray[1];
        }
        this.m_SavePDIDataArray[1] = pdi;
        this.m_SavePDIDataArray[0] += this.m_SavePDIDataArray[1];
        this.m_SaveMDIDataArray[1] = mdi;
        this.m_SaveMDIDataArray[0] += this.m_SaveMDIDataArray[1];
        this.m_SaveTMPDataArray[1] = tmp;
        this.m_SaveTMPDataArray[0] += this.m_SaveTMPDataArray[1];
    }

    if (i < vADXPeriod) {
        RQPacketsItem.m_Packets[rPDIPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rMDIPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (i === vADXPeriod) {

        if( vADXPeriod === 0 )
        {
            this.m_SavePDIDataArray[3] = 0;
            this.m_SaveMDIDataArray[3] = 0;
            this.m_SaveTMPDataArray[3] = 0;
        }
        else
        {
            this.m_SavePDIDataArray[3] = this.m_SavePDIDataArray[0] / vADXPeriod;
            this.m_SaveMDIDataArray[3] = this.m_SaveMDIDataArray[0] / vADXPeriod;
            this.m_SaveTMPDataArray[3] = this.m_SaveTMPDataArray[0] / vADXPeriod;    
        }
    } else {

        if (bAddData) {
            this.m_SavePDIDataArray[2] = this.m_SavePDIDataArray[3];
            this.m_SaveMDIDataArray[2] = this.m_SaveMDIDataArray[3];
            this.m_SaveTMPDataArray[2] = this.m_SaveTMPDataArray[3];
        }
        
        if( vADXPeriod === 0 )
        {
            this.m_SavePDIDataArray[3] = 0;
            this.m_SaveMDIDataArray[3] = 0;
            this.m_SaveTMPDataArray[3] = 0;
        }
        else
        {
            this.m_SavePDIDataArray[3] = (this.m_SavePDIDataArray[2] * (vADXPeriod-1) + pdi) / vADXPeriod;
            this.m_SaveMDIDataArray[3] = (this.m_SaveMDIDataArray[2] * (vADXPeriod-1) + mdi) / vADXPeriod;
            this.m_SaveTMPDataArray[3] = (this.m_SaveTMPDataArray[2] * (vADXPeriod-1) + tmp) / vADXPeriod;
        }
    }

    if( this.m_SaveTMPDataArray[3] === 0 )
    {
        pdi = 0;
        mdi = 0;
    }
    else
    {
        pdi = this.m_SavePDIDataArray[3]/this.m_SaveTMPDataArray[3]*100;
        mdi = this.m_SaveMDIDataArray[3]/this.m_SaveTMPDataArray[3]*100;
    }
    
    if (rPDIPacketData.GetRQStartIndex() === null) {
        rPDIPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rPDIPacketData.AppendRealData(i, pdi);            
    } else {
        rPDIPacketData.UpdateData(i, pdi);
    }
    RQPacketsItem.m_Packets[rPDIPacketData.m_nPacketIndex] = rPDIPacketData.GetData(rPDIPacketData.GetDataArraySize() - 1);    

    if (rMDIPacketData.GetRQStartIndex() === null) {
        rMDIPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rMDIPacketData.AppendRealData(i, mdi);            
    } else {
        rMDIPacketData.UpdateData(i, mdi);
    }
    RQPacketsItem.m_Packets[rMDIPacketData.m_nPacketIndex] = rMDIPacketData.GetData(rMDIPacketData.GetDataArraySize() - 1);

    if( (pdi + mdi) === 0 )
        adx = 0;
    else
        adx = Math.abs((pdi - mdi) / (pdi + mdi) * 100);

    if (i < vADXPeriod*3) {
        RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (bAddData) {
        this.m_SaveADXDataArray[0] = this.m_SaveADXDataArray[1];
    }
    
    if( vADXPeriod === 0 )
        this.m_SaveADXDataArray[1] = 0;
    else
        this.m_SaveADXDataArray[1] = (this.m_SaveADXDataArray[0] * (vADXPeriod-1) + adx) / vADXPeriod;

    if (rADXPacketData.GetRQStartIndex() === null) {
        rADXPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rADXPacketData.AppendRealData(i, this.m_SaveADXDataArray[1]);
    } else {
        rADXPacketData.UpdateData(i, this.m_SaveADXDataArray[1]);
    }
    RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = rADXPacketData.GetData(rADXPacketData.GetDataArraySize() - 1);    

    return REALCALC_SUCCESS;
}

//CCI
function CCCIIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "CCI 지표";

    //계산결과 담을 패킷생성
    this.m_strCCIPacketName = this.m_strKey + "_CCI_";
    rRQSet.AddNumPacketInfo(this.m_strCCIPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strCCISPacketName = this.m_strKey + "_CCIS_";
    rRQSet.AddNumPacketInfo(this.m_strCCISPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var CCISubGraph = new CIndicatorSubGraph(this);
    CCISubGraph.m_rRQSet = rRQSet;
    CCISubGraph.m_LineTypeInfo.m_clrLine = '#FF5626';
    CCISubGraph.SetPacketData(this.m_strCCIPacketName);
    CCISubGraph.SetSubGraphName("CCI");
    CCISubGraph.m_strSubGraphTitle = "CCI";
    this.m_SubGraphArray.push(CCISubGraph);

    var CCISSubGraph = new CIndicatorSubGraph(this);
    CCISSubGraph.m_rRQSet = rRQSet;
    CCISSubGraph.m_LineTypeInfo.m_clrLine = '#3EC3D1';
    CCISSubGraph.SetPacketData(this.m_strCCISPacketName);
    CCISSubGraph.SetSubGraphName("CCI_Signal");
    CCISSubGraph.m_strSubGraphTitle = "CCI Signal ";
    this.m_SubGraphArray.push(CCISSubGraph);
    
    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 14);        //CCI 기간(14)
    this.AddVariable("SignalPeriod", NUMERIC_TYPE, 9);   //CCI_Signal 기간(9)    
    this.AddVariable("DType", NUMERIC_TYPE, 5, "가격");          //데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)


    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 100;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = -100;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;


    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveDataArray = [];
    this.m_SaveMADataArray = [];
    this.m_SaveSDataArray = [];
}
CCCIIndicator.prototype = new CIndicator();
CCCIIndicator.prototype.constructor = CCCIIndicator;
//CCI 지표계산 함수(상속받은 클래스에 실제 계산함수 추가할 것!!!)
CCCIIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rCCIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strCCIPacketName);
    var rCCISPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strCCISPacketName);    

    rCCIPacketData.InitDataArray();
    rCCISPacketData.InitDataArray();    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vCCIPerdiod = this.m_VariableArray[0].m_strData;
    var vCCISPerdiod = this.m_VariableArray[1].m_strData;    
    var vCCIDType = this.m_VariableArray[2].m_strData;
    
    var MData = null;
    switch (vCCIDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    this.m_SaveMADataArray[0] = 0;        
    this.m_SaveSDataArray[1] = 0;

    var ma, m_ma, sum, cci;
    var deviation = 2 / (vCCISPerdiod + 1);

    var nDataLength = MData.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }
        
        this.m_SaveMADataArray[1] = MData[i].m_Data;
        this.m_SaveMADataArray[0] += this.m_SaveMADataArray[1];
        if (i >= vCCIPerdiod) {
            this.m_SaveMADataArray[0] -= MData[i-vCCIPerdiod].m_Data;
        }
        this.m_SaveDataArray[i%vCCIPerdiod] = this.m_SaveMADataArray[1];

        if (i < vCCIPerdiod - 1) {
            RQPacketsItem.m_Packets[rCCIPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rCCISPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        ma = this.m_SaveMADataArray[0] / vCCIPerdiod;
        sum = 0;
        for (var j = 0; j < vCCIPerdiod; j++) {
            sum += Math.abs(ma - this.m_SaveDataArray[j]);            
        }
        m_ma = sum / vCCIPerdiod;

        if (m_ma !== 0) {
            cci = (this.m_SaveMADataArray[1]-ma)/(m_ma*0.015);
        } else {
            cci = (this.m_SaveMADataArray[1]-ma)/0.015;
        }

        this.m_SaveSDataArray[0] = this.m_SaveSDataArray[1];
        this.m_SaveSDataArray[1] = this.m_SaveSDataArray[0] + deviation * (cci - this.m_SaveSDataArray[0]);

        if (rCCIPacketData.GetRQStartIndex() === null) {
            rCCIPacketData.SetRQStartIndex(i);
        }
        rCCIPacketData.AddTail(i, cci);
        RQPacketsItem.m_Packets[rCCIPacketData.m_nPacketIndex] = rCCIPacketData.GetData(rCCIPacketData.GetDataArraySize() - 1);
        
        if (i < vCCIPerdiod + vCCISPerdiod - 1) {            
            RQPacketsItem.m_Packets[rCCISPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if (rCCISPacketData.GetRQStartIndex() === null) {
            rCCISPacketData.SetRQStartIndex(i);
        }
        rCCISPacketData.AddTail(i, this.m_SaveSDataArray[1]);
        RQPacketsItem.m_Packets[rCCISPacketData.m_nPacketIndex] = rCCISPacketData.GetData(rCCISPacketData.GetDataArraySize() - 1);        
    }

    return true;
}
CCCIIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;
    var rCCIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strCCIPacketName);
    var rCCISPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strCCISPacketName);    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vCCIPerdiod = this.m_VariableArray[0].m_strData;
    var vCCISPerdiod = this.m_VariableArray[1].m_strData;    
    var vCCIDType = this.m_VariableArray[2].m_strData;
    
    var MData = null;
    switch (vCCIDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    if (this.m_SaveMADataArray[0] == null) {
        this.m_SaveMADataArray[0] = 0;        
    }
    if (this.m_SaveSDataArray[1] == null ) {
        this.m_SaveSDataArray[1] = 0;
    }

    var ma, m_ma, sum, cci;
    var deviation = 2 / (vCCISPerdiod + 1);

    var nDataLength = MData.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }

    if (bAddData) {
        this.m_SaveMADataArray[1] = MData[i].m_Data;
        this.m_SaveMADataArray[0] += this.m_SaveMADataArray[1];
        if (i >= vCCIPerdiod) {
            this.m_SaveMADataArray[0] -= MData[i-vCCIPerdiod].m_Data;
        }
    } else {
        this.m_SaveMADataArray[0] -= this.m_SaveMADataArray[1];
        this.m_SaveMADataArray[1] = MData[i].m_Data;
        this.m_SaveMADataArray[0] += this.m_SaveMADataArray[1];
    }
    
    this.m_SaveDataArray[i%vCCIPerdiod] = this.m_SaveMADataArray[1];

    if (i < vCCIPerdiod - 1) {
        RQPacketsItem.m_Packets[rCCIPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rCCISPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    ma = this.m_SaveMADataArray[0] / vCCIPerdiod;
    sum = 0;
    for (var j = 0; j < vCCIPerdiod; j++) {
        sum += Math.abs(ma - this.m_SaveDataArray[j]);            
    }
    m_ma = sum / vCCIPerdiod;

    if (m_ma !== 0) {
        cci = (this.m_SaveMADataArray[1]-ma)/(m_ma*0.015);
    } else {
        cci = (this.m_SaveMADataArray[1]-ma)/0.015;
    }

    if (bAddData) {
        this.m_SaveSDataArray[0] = this.m_SaveSDataArray[1];
    }
    this.m_SaveSDataArray[1] = this.m_SaveSDataArray[0] + deviation * (cci - this.m_SaveSDataArray[0]);

    if (rCCIPacketData.GetRQStartIndex() === null) {
        rCCIPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rCCIPacketData.AppendRealData(i, cci);
    } else {
        rCCIPacketData.UpdateData(i, cci);
    }
    RQPacketsItem.m_Packets[rCCIPacketData.m_nPacketIndex] = rCCIPacketData.GetData(rCCIPacketData.GetDataArraySize() - 1);
    
    if (i < vCCIPerdiod + vCCISPerdiod - 1) {        
        RQPacketsItem.m_Packets[rCCISPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    if (rCCISPacketData.GetRQStartIndex() == null) {
        rCCISPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rCCISPacketData.AppendRealData(i, this.m_SaveSDataArray[1]);
    } else {
        rCCISPacketData.UpdateData(i , this.m_SaveSDataArray[1]);
    }
    RQPacketsItem.m_Packets[rCCISPacketData.m_nPacketIndex] = rCCISPacketData.GetData(rCCISPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//Envelope
function CEnvelopeIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_strGroup = "PRICE";

    this.m_nAddType = OVERLAY_TYPE;
    this.m_strOverlayGraphName = "_PRICE_";

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "Envelope ";

    this.m_nDigit = rRQSet.m_nPriceDigit;

    //계산결과 담을 패킷생성
    this.m_strEnvHPacketName = this.m_strKey + "_EnvH_";
    rRQSet.AddNumPacketInfo(this.m_strEnvHPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strEnvCPacketName = this.m_strKey + "_EnvC_";
    rRQSet.AddNumPacketInfo(this.m_strEnvCPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strEnvLPacketName = this.m_strKey + "_EnvL_";
    rRQSet.AddNumPacketInfo(this.m_strEnvLPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var EnvHSubGraph = new CIndicatorSubGraph(this);
    EnvHSubGraph.m_rRQSet = rRQSet;
    EnvHSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    EnvHSubGraph.SetPacketData(this.m_strEnvHPacketName);
    EnvHSubGraph.SetSubGraphName("High");
    EnvHSubGraph.m_strSubGraphTitle = "상한선"; //E_High
    this.m_SubGraphArray.push(EnvHSubGraph);

    var EnvCSubGraph = new CIndicatorSubGraph(this);
    EnvCSubGraph.m_rRQSet = rRQSet;
    EnvCSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    EnvCSubGraph.SetPacketData(this.m_strEnvCPacketName);
    EnvCSubGraph.SetSubGraphName("Center");
    EnvCSubGraph.m_strSubGraphTitle = "중심선";
    this.m_SubGraphArray.push(EnvCSubGraph);

    var EnvLSubGraph = new CIndicatorSubGraph(this);
    EnvLSubGraph.m_rRQSet = rRQSet;
    EnvLSubGraph.m_LineTypeInfo.m_clrLine = '#306BF8';
    EnvLSubGraph.SetPacketData(this.m_strEnvLPacketName);
    EnvLSubGraph.SetSubGraphName("Low");
    EnvLSubGraph.m_strSubGraphTitle = "하한선";
    this.m_SubGraphArray.push(EnvLSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("MAPeriod", NUMERIC_TYPE, 20);    // 이평(20)
    this.AddVariable("UpLimitRate", NUMERIC_TYPE, 6);  // 상한율(6)
    this.AddVariable("DownLimitRate", NUMERIC_TYPE, 6);// 하한율(6)
    this.AddVariable("DType", NUMERIC_TYPE, 3, "가격");        // 데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)    

    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveDataArray = [];
}
CEnvelopeIndicator.prototype = new CIndicator();
CEnvelopeIndicator.prototype.constructor = CEnvelopeIndicator;
CEnvelopeIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var nLength = this.m_SubGraphArray.length;

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorParameter = this.m_rGlobalProperty.m_bShowIndicatorParameter;
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    let rSubGraph;
    let i, rShowGraphArray = [];
    let strTitle, strLastestData, rLastestPacketItemData = null;
    for(i = 0 ; i < nLength ; i++ )
    {
        rSubGraph = this.m_SubGraphArray[i];
        if(rSubGraph.m_bShow)
            rShowGraphArray[ rShowGraphArray.length ] = rSubGraph;
        else        
            rSubGraph.HideTitle();
    }
    
    nLength = rShowGraphArray.length;
    if(nLength <= 0)//Show상태 서브그래프가 없는 경우
    {
        rSubGraph = this.m_SubGraphArray[0];
        if (bShowIndicatorName === true) {
            strTitle = this.m_strTitle;
            if (bShowIndicatorParameter === true) {
                
                var nVLength = this.m_VariableArray.length;
                if (nVLength > 0) {
                    strTitle += "(";
                    for (var j = 0; j < nVLength; j++) {
                        var rVariable = this.m_VariableArray[j];
                        strTitle += rVariable.m_strData;
                        if (j < nVLength - 1)
                            strTitle += ",";
                    }
                    strTitle += ")";
                }
            }
            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
        else
            this.HideTitle();            
    }
    else
    {
        for( i = 0; i < nLength; i++ )
        {
            rSubGraph = rShowGraphArray[i];
            
            if (i === 0) 
            {
                if (bShowIndicatorName === true) {

                    strTitle = this.m_strTitle;
    
                    if (bShowIndicatorParameter === true) {
                        
                        var nVLength = this.m_VariableArray.length;
                        if (nVLength > 0) {
                            strTitle += "(";
                            for (var j = 0; j < nVLength; j++) {
                                var rVariable = this.m_VariableArray[j];
                                strTitle += rVariable.m_strData;
                                if (j < nVLength - 1)
                                    strTitle += ",";
                            }
                            strTitle += ")";
                        }
                    }
    
                    strTitle += " " + rSubGraph.m_strSubGraphTitle;
                }
                else
                    strTitle = "";
            }
            else
            {
                if (bShowIndicatorName === true)
                    strTitle = rSubGraph.m_strSubGraphTitle;
                else
                    strTitle = "";
            }
            if (bShowIndicatorValue === true) {

                rLastestPacketItemData = rSubGraph.m_rPacketData.GetLastestPacketItemData();
                if (rLastestPacketItemData !== null) {

                    if (rLastestPacketItemData.GetPacketType() === NUMERIC_TYPE) {
                        strLastestData = ConvertNumToDigitText(rLastestPacketItemData.m_Data, rLastestPacketItemData.m_rPacketData.m_nDec, 1, rLastestPacketItemData.m_rPacketData.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                        strTitle += "(" + strLastestData + ")";
                    }
                    else
                        strTitle += "(" + rLastestPacketItemData.m_Data + ")";
                }
            }
            rSubGraph.SetTitle(strTitle);
            
            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
    }   
}

CEnvelopeIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData == undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rEnvHPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strEnvHPacketName);
    var rEnvCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strEnvCPacketName);
    var rEnvLPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strEnvLPacketName);

    rEnvHPacketData.InitDataArray();
    rEnvLPacketData.InitDataArray();
    rEnvCPacketData.InitDataArray();

    var vEnvPeriod = this.m_VariableArray[0].m_strData;
    var vEnvHRate = this.m_VariableArray[1].m_strData;
    var vEnvLRate = this.m_VariableArray[2].m_strData;
    var vEnvDType = this.m_VariableArray[3].m_strData;
    /*
    var vEnvHView = this.m_VariableArray[4].m_strData;
    var vEnvCView = this.m_VariableArray[5].m_strData;
    var vEnvLView = this.m_VariableArray[6].m_strData;
    */

    vEnvHRate = 1 + vEnvHRate/100;
    vEnvLRate = 1 - vEnvLRate/100;

    var MData = null;
    switch (vEnvDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    this.m_SaveDataArray[0] = 0;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined)
            continue;

        this.m_SaveDataArray[1] = MData[i].m_Data;
        this.m_SaveDataArray[0] += this.m_SaveDataArray[1];
        if (i > vEnvPeriod - 1) {
            this.m_SaveDataArray[0] -= MData[i-vEnvPeriod].m_Data;
        }

        if (i < vEnvPeriod - 1) {
            RQPacketsItem.m_Packets[rEnvHPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rEnvCPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rEnvLPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        var env = 0;
        if( vEnvPeriod !== 0 )
            env = this.m_SaveDataArray[0]/vEnvPeriod;

        //if (vEnvHView) {
            if (rEnvHPacketData.GetRQStartIndex() == null) {
                rEnvHPacketData.SetRQStartIndex(i);
            }
            rEnvHPacketData.AddTail(i, env * vEnvHRate);
            RQPacketsItem.m_Packets[rEnvHPacketData.m_nPacketIndex] = rEnvHPacketData.GetData(rEnvHPacketData.GetDataArraySize() - 1);
        //}

        //if (vEnvCView) {
            if (rEnvCPacketData.GetRQStartIndex() == null) {
                rEnvCPacketData.SetRQStartIndex(i);
            }
            rEnvCPacketData.AddTail(i, env);
            RQPacketsItem.m_Packets[rEnvCPacketData.m_nPacketIndex] = rEnvCPacketData.GetData(rEnvCPacketData.GetDataArraySize() - 1);
        //}

        //if (vEnvLView) {
            if (rEnvLPacketData.GetRQStartIndex() == null) {
                rEnvLPacketData.SetRQStartIndex(i);
            }
            rEnvLPacketData.AddTail(i, env * vEnvLRate);
            RQPacketsItem.m_Packets[rEnvLPacketData.m_nPacketIndex] = rEnvLPacketData.GetData(rEnvLPacketData.GetDataArraySize() - 1);
        //}
    }
    return true;
}
CEnvelopeIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData == undefined)
        return REALCALC_FAIL;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rEnvHPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strEnvHPacketName);
    var rEnvCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strEnvCPacketName);
    var rEnvLPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strEnvLPacketName);

    var vEnvPeriod = this.m_VariableArray[0].m_strData;
    var vEnvHRate = this.m_VariableArray[1].m_strData;
    var vEnvLRate = this.m_VariableArray[2].m_strData;
    var vEnvDType = this.m_VariableArray[3].m_strData;
    /*
    var vEnvHView = this.m_VariableArray[4].m_strData;
    var vEnvCView = this.m_VariableArray[5].m_strData;
    var vEnvLView = this.m_VariableArray[6].m_strData;
    */

    vEnvHRate = 1 + vEnvHRate/100;
    vEnvLRate = 1 - vEnvLRate/100;

    var MData = null;
    switch (vEnvDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    var i = MData.length - 1;

    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
        return false;

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem == undefined)
        return REALCALC_FAIL;

    if (this.m_SaveDataArray[0] == null) {
        this.m_SaveDataArray[0] = 0;
    }

    if (bAddData) {
        this.m_SaveDataArray[1] = MData[i].m_Data;
        this.m_SaveDataArray[0] += this.m_SaveDataArray[1];
        if (i > vEnvPeriod - 1) {
            this.m_SaveDataArray[0] -= MData[i-vEnvPeriod].m_Data;
        }
    } else {
        this.m_SaveDataArray[0] -= this.m_SaveDataArray[1];
        this.m_SaveDataArray[1] = MData[i].m_Data;
        this.m_SaveDataArray[0] += this.m_SaveDataArray[1];
    }
    
    if (i < vEnvPeriod - 1) {
        RQPacketsItem.m_Packets[rEnvHPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rEnvCPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rEnvLPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    var env = 0;
    if( vEnvPeriod !== 0 )
        env = this.m_SaveDataArray[0]/vEnvPeriod;
        
    //if (vEnvHView) {
        if (rEnvHPacketData.GetRQStartIndex() == null) {
            rEnvHPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {
            rEnvHPacketData.AppendRealData(i, env * vEnvHRate);
        } else {
            rEnvHPacketData.UpdateData(i, env * vEnvHRate);
        }
        RQPacketsItem.m_Packets[rEnvHPacketData.m_nPacketIndex] = rEnvHPacketData.GetData(rEnvHPacketData.GetDataArraySize() - 1);
    //}

    //if (vEnvCView) {
        if (rEnvCPacketData.GetRQStartIndex() == null) {
            rEnvCPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {
            rEnvCPacketData.AppendRealData(i, env);
        } else {
            rEnvCPacketData.UpdateData(i, env);
        }
        RQPacketsItem.m_Packets[rEnvCPacketData.m_nPacketIndex] = rEnvCPacketData.GetData(rEnvCPacketData.GetDataArraySize() - 1);
    //}

    //if (vEnvLView) {
        if (rEnvLPacketData.GetRQStartIndex() == null) {
            rEnvLPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {
            rEnvLPacketData.AppendRealData(i, env * vEnvLRate);
        } else {
            rEnvLPacketData.UpdateData(i, env * vEnvLRate);
        }
        RQPacketsItem.m_Packets[rEnvLPacketData.m_nPacketIndex] = rEnvLPacketData.GetData(rEnvLPacketData.GetDataArraySize() - 1);
    //}
    return REALCALC_SUCCESS;
}

//BB
function CBBIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_strGroup = "PRICE";

    this.m_nAddType = OVERLAY_TYPE;
    this.m_strOverlayGraphName = "_PRICE_";

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "Bollinger Bands ";

    this.m_nDigit = rRQSet.m_nPriceDigit;

    //계산결과 담을 패킷생성
    this.m_strBBHPacketName = this.m_strKey + "_BBH_";
    rRQSet.AddNumPacketInfo(this.m_strBBHPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strBBCPacketName = this.m_strKey + "_BBC_";
    rRQSet.AddNumPacketInfo(this.m_strBBCPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strBBLPacketName = this.m_strKey + "_BBL_";
    rRQSet.AddNumPacketInfo(this.m_strBBLPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var BBHSubGraph = new CIndicatorSubGraph(this);
    BBHSubGraph.m_rRQSet = rRQSet;
    BBHSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    BBHSubGraph.SetPacketData(this.m_strBBHPacketName);
    BBHSubGraph.SetSubGraphName("UpperLine");
    BBHSubGraph.m_strSubGraphTitle = "상한선"; //E_High
    this.m_SubGraphArray.push(BBHSubGraph);

    var BBCSubGraph = new CIndicatorSubGraph(this);
    BBCSubGraph.m_rRQSet = rRQSet;
    BBCSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    BBCSubGraph.SetPacketData(this.m_strBBCPacketName);
    BBCSubGraph.SetSubGraphName("CenterLine");
    BBCSubGraph.m_strSubGraphTitle = "중심선";
    this.m_SubGraphArray.push(BBCSubGraph);

    var BBLSubGraph = new CIndicatorSubGraph(this);
    BBLSubGraph.m_rRQSet = rRQSet;
    BBLSubGraph.m_LineTypeInfo.m_clrLine = '#306BF8';
    BBLSubGraph.SetPacketData(this.m_strBBLPacketName);
    BBLSubGraph.SetSubGraphName("LowerLine");
    BBLSubGraph.m_strSubGraphTitle = "하한선";
    this.m_SubGraphArray.push(BBLSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("MAPeriod", NUMERIC_TYPE, 20);   // 이동평균(20)
    this.AddVariable("SDMNum", NUMERIC_TYPE, 2);     // 표준편준차 승수(2)
    /*
    this.AddVariable("ViewBBH", NUMERIC_TYPE, true); // 상한선
    this.AddVariable("ViewBBC", NUMERIC_TYPE, true); // 중심선
    this.AddVariable("ViewBBL", NUMERIC_TYPE, true); // 하한선
    */

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveDataArray = [];
}
CBBIndicator.prototype = new CIndicator();
CBBIndicator.prototype.constructor = CBBIndicator;
CBBIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {
    
    var nLength = this.m_SubGraphArray.length;

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorParameter = this.m_rGlobalProperty.m_bShowIndicatorParameter;
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    let rSubGraph;
    let i, rShowGraphArray = [];
    let strTitle, strLastestData, rLastestPacketItemData = null;
    for(i = 0 ; i < nLength ; i++ )
    {
        rSubGraph = this.m_SubGraphArray[i];
        if(rSubGraph.m_bShow)
            rShowGraphArray[ rShowGraphArray.length ] = rSubGraph;
        else        
            rSubGraph.HideTitle();
    }

    nLength = rShowGraphArray.length;
    if(nLength <= 0)//Show상태 서브그래프가 없는 경우
    {
        rSubGraph = this.m_SubGraphArray[0];
        if (bShowIndicatorName === true) {
            strTitle = this.m_strTitle;
            if (bShowIndicatorParameter === true) {
                        
                var nVLength = this.m_VariableArray.length;
                if (nVLength > 0) {
                    strTitle += "(";
                    for (var j = 0; j < nVLength; j++) {
                        var rVariable = this.m_VariableArray[j];
                        strTitle += rVariable.m_strData;
                        if (j < nVLength - 1)
                            strTitle += ",";
                    }
                    strTitle += ")";
                }
            }

            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
        else
            this.HideTitle();            
    }
    else
    {
        for( i = 0; i < nLength; i++ )
        {
            rSubGraph = rShowGraphArray[i];
            
            if (i === 0) 
            {
                if (bShowIndicatorName === true) {

                    strTitle = this.m_strTitle;
    
                    if (bShowIndicatorParameter === true) {
                        
                        var nVLength = this.m_VariableArray.length;
                        if (nVLength > 0) {
                            strTitle += "(";
                            for (var j = 0; j < nVLength; j++) {
                                var rVariable = this.m_VariableArray[j];
                                strTitle += rVariable.m_strData;
                                if (j < nVLength - 1)
                                    strTitle += ",";
                            }
                            strTitle += ")";
                        }
                    }
    
                    strTitle += " " + rSubGraph.m_strSubGraphTitle;
                }
                else
                    strTitle = "";
            }
            else
            {
                if (bShowIndicatorName === true)
                    strTitle = rSubGraph.m_strSubGraphTitle;
                else
                    strTitle = "";
            }

            if (bShowIndicatorValue === true) {
    
                rLastestPacketItemData = rSubGraph.m_rPacketData.GetLastestPacketItemData();
                if (rLastestPacketItemData !== null) {
                    if (rLastestPacketItemData.GetPacketType() === NUMERIC_TYPE) {
                        strLastestData = ConvertNumToDigitText(rLastestPacketItemData.m_Data, rLastestPacketItemData.m_rPacketData.m_nDec, 1, rLastestPacketItemData.m_rPacketData.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                        strTitle += "(" + strLastestData + ")";
                    }
                    else
                        strTitle += "(" + rLastestPacketItemData.m_Data + ")";
                }
            }
            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }        
    }    
}
CBBIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHLCData = this.m_InputPacketDataArray[5];
    if (rInputPacketHLCData == undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rBBHPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strBBHPacketName);
    var rBBCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strBBCPacketName);
    var rBBLPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strBBLPacketName);

    rBBCPacketData.InitDataArray();
    rBBHPacketData.InitDataArray();
    rBBLPacketData.InitDataArray();

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vBBPerdiod = this.m_VariableArray[0].m_strData;
    var vBBAPerdiod = this.m_VariableArray[1].m_strData;
    /*
    var vBBHView = this.m_VariableArray[2].m_strData;
    var vBBCView = this.m_VariableArray[3].m_strData;
    var vBBLView = this.m_VariableArray[4].m_strData;
    */
    ////////////////////////////////////////////////////////

    var MData = rInputPacketHLCData.m_DataArray;
    var bbh, bbc, bbl;
    var std;

    this.m_SaveDataArray[0] = 0;

    var nDataLength = rInputPacketHLCData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined) {
            continue;
        }

        /****BB 계산 Start *************************/
        this.m_SaveDataArray[1] = MData[i].m_Data;
        this.m_SaveDataArray[0] += this.m_SaveDataArray[1];
        if (i > vBBPerdiod - 1) {
            this.m_SaveDataArray[0] -= MData[i-vBBPerdiod].m_Data
        }
        bbc = this.m_SaveDataArray[0] / vBBPerdiod;
        
        if (i < vBBPerdiod - 1) {
            RQPacketsItem.m_Packets[rBBHPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rBBCPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rBBLPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        std = 0;
        for (var j = i; j > i - vBBPerdiod; j--) {
            std += Math.pow(bbc - MData[j].m_Data, 2);
        }
        
        if( vBBPerdiod === 0  )
            std = 0;
        else
            std = Math.sqrt(std/vBBPerdiod);

        bbh = bbc + vBBAPerdiod * std;
        bbl = bbc - vBBAPerdiod * std;

        //if (vBBHView) {
            if (rBBHPacketData.GetRQStartIndex() == null) {
                rBBHPacketData.SetRQStartIndex(i);
            }
            rBBHPacketData.AddTail(i, bbh);
            RQPacketsItem.m_Packets[rBBHPacketData.m_nPacketIndex] = rBBHPacketData.GetData(rBBHPacketData.GetDataArraySize() - 1);
        //}
        //if (vBBCView) {
            if (rBBCPacketData.GetRQStartIndex() == null) {
                rBBCPacketData.SetRQStartIndex(i);
            }
            rBBCPacketData.AddTail(i, bbc);
            RQPacketsItem.m_Packets[rBBCPacketData.m_nPacketIndex] = rBBCPacketData.GetData(rBBCPacketData.GetDataArraySize() - 1);
        //}
        //if (vBBLView) {
            if (rBBLPacketData.GetRQStartIndex() == null) {
                rBBLPacketData.SetRQStartIndex(i);
            }
            rBBLPacketData.AddTail(i, bbl);
            RQPacketsItem.m_Packets[rBBLPacketData.m_nPacketIndex] = rBBLPacketData.GetData(rBBLPacketData.GetDataArraySize() - 1);
        //}
    }
    return true;
}
CBBIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketHLCData = this.m_InputPacketDataArray[5];
    if (rInputPacketHLCData == undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rBBHPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strBBHPacketName);
    var rBBCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strBBCPacketName);
    var rBBLPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strBBLPacketName);

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vBBPerdiod = this.m_VariableArray[0].m_strData;
    var vBBAPerdiod = this.m_VariableArray[1].m_strData;
    /*
    var vBBHView = this.m_VariableArray[2].m_strData;
    var vBBCView = this.m_VariableArray[3].m_strData;
    var vBBLView = this.m_VariableArray[4].m_strData;
    */
    ////////////////////////////////////////////////////////

    var MData = rInputPacketHLCData.m_DataArray;
    var bbh, bbc, bbl;
    var std;

    var nDataLength = rInputPacketHLCData.m_DataArray.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem == undefined) {
        return REALCALC_FAIL;
    }

    /****BB 계산 Start *************************/
    if (this.m_SaveDataArray[0] == null) {
        this.m_SaveDataArray[0] = 0;
    }
    if (bAddData) {
        this.m_SaveDataArray[1] = MData[i].m_Data;
        this.m_SaveDataArray[0] += this.m_SaveDataArray[1];
        if (i > vBBPerdiod - 1) {
            this.m_SaveDataArray[0] -= MData[i-vBBPerdiod].m_Data
        }
    } else {
        this.m_SaveDataArray[0] -= this.m_SaveDataArray[1];
        this.m_SaveDataArray[1] = MData[i].m_Data;
        this.m_SaveDataArray[0] += this.m_SaveDataArray[1];
    }
    
    bbc = this.m_SaveDataArray[0] / vBBPerdiod;
    
    if (i < vBBPerdiod - 1) {
        RQPacketsItem.m_Packets[rBBHPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rBBCPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rBBLPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    std = 0;
    for (var j = i; j > i - vBBPerdiod; j--) {
        std += Math.pow(bbc - MData[j].m_Data, 2);
    }

    if( vBBPerdiod === 0  )
        std = 0;
    else
        std = Math.sqrt(std/vBBPerdiod);

    bbh = bbc + vBBAPerdiod * std;
    bbl = bbc - vBBAPerdiod * std;

    //if (vBBHView) {
        if (rBBHPacketData.GetRQStartIndex() == null) {
            rBBHPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {
            rBBHPacketData.AppendRealData(i, bbh);
        } else {
            rBBHPacketData.UpdateData(i, bbh);
        }
        RQPacketsItem.m_Packets[rBBHPacketData.m_nPacketIndex] = rBBHPacketData.GetData(rBBHPacketData.GetDataArraySize() - 1);
    //}
    //if (vBBCView) {
        if (rBBCPacketData.GetRQStartIndex() == null) {
            rBBCPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {
            rBBCPacketData.AppendRealData(i, bbc);
        } else {
            rBBCPacketData.UpdateData(i, bbc);
        }
        RQPacketsItem.m_Packets[rBBCPacketData.m_nPacketIndex] = rBBCPacketData.GetData(rBBCPacketData.GetDataArraySize() - 1);
    //}
    //if (vBBLView) {
        if (rBBLPacketData.GetRQStartIndex() == null) {
            rBBLPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {
            rBBLPacketData.AppendRealData(i, bbl);
        } else {
            rBBLPacketData.UpdateData(i, bbl);
        }
        RQPacketsItem.m_Packets[rBBLPacketData.m_nPacketIndex] = rBBLPacketData.GetData(rBBLPacketData.GetDataArraySize() - 1);
    //}

    return REALCALC_SUCCESS;
}

//Momentum
function CMOMIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "Momentum 지표";

    //계산결과 담을 패킷생성
    this.m_strMOMPacketName = this.m_strKey + "_MOM_";
    rRQSet.AddNumPacketInfo(this.m_strMOMPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strMOMSPacketName = this.m_strKey + "_MOMS_";
    rRQSet.AddNumPacketInfo(this.m_strMOMSPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var MOMSubGraph = new CIndicatorSubGraph(this);
    MOMSubGraph.m_rRQSet = rRQSet;
    MOMSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    MOMSubGraph.SetPacketData(this.m_strMOMPacketName);
    MOMSubGraph.SetSubGraphName("Momentum");
    MOMSubGraph.m_strSubGraphTitle = "Momentum"; //E_High
    this.m_SubGraphArray.push(MOMSubGraph);

    var MOMSSubGraph = new CIndicatorSubGraph(this);
    MOMSSubGraph.m_rRQSet = rRQSet;
    MOMSSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    MOMSSubGraph.SetPacketData(this.m_strMOMSPacketName);
    MOMSSubGraph.SetSubGraphName("Signal");
    MOMSSubGraph.m_strSubGraphTitle = "Signal";
    this.m_SubGraphArray.push(MOMSSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 14);      // 기간(14)
    this.AddVariable("SignalPeriod", NUMERIC_TYPE, 9); // Signal 기간(9)    
    this.AddVariable("DType", NUMERIC_TYPE, 3, "가격");        // 데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)    

    //기준선
    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 100;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveDataArray = [];
}
CMOMIndicator.prototype = new CIndicator();
CMOMIndicator.prototype.constructor = CMOMIndicator;
CMOMIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData === undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rMOMPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMOMPacketName);
    var rMOMSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMOMSPacketName);    

    rMOMPacketData.InitDataArray();
    rMOMSPacketData.InitDataArray();    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vMOMPerdiod = this.m_VariableArray[0].m_strData;
    var vMOMSPerdiod = this.m_VariableArray[1].m_strData;    
    var vMOMDType = this.m_VariableArray[2].m_strData;    
    ////////////////////////////////////////////////////////

    var MData = null;
    switch (vMOMDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }
    var deviation = 2/(vMOMSPerdiod+1);
    var MomData;

    this.m_SaveDataArray[1] = 0;

    var nDataLength = MData.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;

        //momentum 계산
        if (i < vMOMPerdiod) {

            RQPacketsItem.m_Packets[rMOMPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rMOMSPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        MomData = MData[i].m_Data - MData[i - vMOMPerdiod].m_Data;

        this.m_SaveDataArray[0] = this.m_SaveDataArray[1];
        this.m_SaveDataArray[1] = this.m_SaveDataArray[0] + deviation * (MomData - this.m_SaveDataArray[0]);

        if (rMOMPacketData.GetRQStartIndex() === null) {
            rMOMPacketData.SetRQStartIndex(i);
        }
        rMOMPacketData.AddTail(i, MomData);
        RQPacketsItem.m_Packets[rMOMPacketData.m_nPacketIndex] = rMOMPacketData.GetData(rMOMPacketData.GetDataArraySize() - 1);
        
        if (i < vMOMPerdiod + vMOMSPerdiod - 1) {
            RQPacketsItem.m_Packets[rMOMSPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        //momentum signal 계산
        if (rMOMSPacketData.GetRQStartIndex() === null) {
            rMOMSPacketData.SetRQStartIndex(i);
        }
        rMOMSPacketData.AddTail(i, this.m_SaveDataArray[1]);
        RQPacketsItem.m_Packets[rMOMSPacketData.m_nPacketIndex] = rMOMSPacketData.GetData(rMOMSPacketData.GetDataArraySize() - 1);        
    }

    return true;
}
CMOMIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rMOMPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMOMPacketName);
    var rMOMSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMOMSPacketName);    

    //필요한 변수들은 여기서 꺼내놓는다.
    var vMOMPerdiod = this.m_VariableArray[0].m_strData;
    var vMOMSPerdiod = this.m_VariableArray[1].m_strData;    
    var vMOMDType = this.m_VariableArray[2].m_strData;
    
    ////////////////////////////////////////////////////////

    var MData = null;
    switch (vMOMDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }
    var deviation = 2/(vMOMSPerdiod+1);
    var MomData;

    if (this.m_SaveDataArray[1] === null) {
        this.m_SaveDataArray[1] = 0;
    }

    var nDataLength = MData.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
        return false;

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined)
        return REALCALC_FAIL;

    //momentum 계산
    if (i < vMOMPerdiod) {
        RQPacketsItem.m_Packets[rMOMPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rMOMSPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    MomData = MData[i].m_Data - MData[i - vMOMPerdiod].m_Data;

    if (bAddData) {
        this.m_SaveDataArray[0] = this.m_SaveDataArray[1];
    }
    this.m_SaveDataArray[1] = this.m_SaveDataArray[0] + deviation * (MomData - this.m_SaveDataArray[0]);

    if (rMOMPacketData.GetRQStartIndex() === null) {
        rMOMPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rMOMPacketData.AppendRealData(i, MomData);
    } else {
        rMOMPacketData.UpdateData(i, MomData);
    }
    RQPacketsItem.m_Packets[rMOMPacketData.m_nPacketIndex] = rMOMPacketData.GetData(rMOMPacketData.GetDataArraySize() - 1);    

    if (i < vMOMPerdiod + vMOMSPerdiod - 1) {
        RQPacketsItem.m_Packets[rMOMSPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    //momentum signal 계산    
    if (rMOMSPacketData.GetRQStartIndex() === null) {
        rMOMSPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rMOMSPacketData.AppendRealData( i,this.m_SaveDataArray[1]);
    } else {
        rMOMSPacketData.UpdateData(i, this.m_SaveDataArray[1]);
    }
    RQPacketsItem.m_Packets[rMOMSPacketData.m_nPacketIndex] = rMOMSPacketData.GetData(rMOMSPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//RSI
function CRSIIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "RSI 지표";

    //계산결과 담을 패킷생성
    this.m_strRSIPacketName = this.m_strKey + "_RSI_";
    rRQSet.AddNumPacketInfo(this.m_strRSIPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strRSISPacketName = this.m_strKey + "_RSIS_";
    rRQSet.AddNumPacketInfo(this.m_strRSISPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);


    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var RSISubGraph = new CIndicatorSubGraph(this);
    RSISubGraph.m_rRQSet = rRQSet;
    RSISubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    RSISubGraph.SetPacketData(this.m_strRSIPacketName);
    RSISubGraph.SetSubGraphName("RSI");
    RSISubGraph.m_strSubGraphTitle = "RSI"; //E_High
    this.m_SubGraphArray.push(RSISubGraph);

    var RSISSubGraph = new CIndicatorSubGraph(this);
    RSISSubGraph.m_rRQSet = rRQSet;
    RSISSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    RSISSubGraph.SetPacketData(this.m_strRSISPacketName);
    RSISSubGraph.SetSubGraphName("Signal"); //E_Center
    RSISSubGraph.m_strSubGraphTitle = "Signal";
    this.m_SubGraphArray.push(RSISSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 14);      // 기간(14)
    this.AddVariable("SignalPeriod", NUMERIC_TYPE, 9); // Signal 기간(9)    
    this.AddVariable("DType", NUMERIC_TYPE, 3, "가격");        // 데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 30;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;
    BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 70;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveData = null;     //data
    this.m_SaveUpData = null;   //sum up_data
    this.m_SaveDownData = null; //sum down_data
    this.m_SaveRSISDataArray = []; //0: RSIS[i-1], 1: RSIS[i]
}
CRSIIndicator.prototype = new CIndicator();
CRSIIndicator.prototype.constructor = CRSIIndicator;
CRSIIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketPData = this.m_InputPacketDataArray[3];
    if (rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rRSIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strRSIPacketName);
    var rRSISPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strRSISPacketName);    

    rRSIPacketData.InitDataArray();
    rRSISPacketData.InitDataArray();    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vRSIPerdiod = this.m_VariableArray[0].m_strData;
    var vRSISPerdiod = this.m_VariableArray[1].m_strData;    
    var vRSIDType = this.m_VariableArray[2].m_strData;
    
    ////////////////////////////////////////////////////////
    
    var MData = null;
    switch (vRSIDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    var deviation = 2/(vRSISPerdiod+1);
    var data, rsi;

    this.m_SaveUpData = 0;
    this.m_SaveDownData = 0;
    this.m_SaveRSISDataArray[1] = 0;

    var nDataLength = MData.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;
        
        /****RSI 계산 Start *************************/
        if (i < 1) {
            RQPacketsItem.m_Packets[rRSIPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rRSISPacketData.m_nPacketIndex] = undefined;
            continue;
        }
        
        this.m_SaveData = MData[i].m_Data - MData[i-1].m_Data;
        if (this.m_SaveData > 0) {
            this.m_SaveUpData += this.m_SaveData;
        } else if (this.m_SaveData < 0) {
            this.m_SaveDownData -= this.m_SaveData;
        }
        
        if (i > vRSIPerdiod) {
            data = MData[i-vRSIPerdiod].m_Data - MData[i-vRSIPerdiod-1].m_Data;
            if (data > 0) {
                this.m_SaveUpData -= data;
            } else if (data < 0) {
                this.m_SaveDownData += data;
            }
        }

        if( this.m_SaveUpData + this.m_SaveDownData !== 0 && vRSIPerdiod !== 0 ) {
            rsi = (this.m_SaveUpData / vRSIPerdiod) * 100 / ((this.m_SaveUpData / vRSIPerdiod) + (this.m_SaveDownData / vRSIPerdiod));
        } else {
            rsi = 0;
        }

        this.m_SaveRSISDataArray[0] = this.m_SaveRSISDataArray[1];
        this.m_SaveRSISDataArray[1] = this.m_SaveRSISDataArray[0] + deviation * (rsi - this.m_SaveRSISDataArray[0]);

        if (i < vRSIPerdiod)
        {
            RQPacketsItem.m_Packets[rRSIPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rRSISPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if (rRSIPacketData.GetRQStartIndex() === null) {
            rRSIPacketData.SetRQStartIndex(i);
        }
        rRSIPacketData.AddTail(i, rsi);
        RQPacketsItem.m_Packets[rRSIPacketData.m_nPacketIndex] = rRSIPacketData.GetData(rRSIPacketData.GetDataArraySize() - 1);
        
        if (i < vRSIPerdiod + vRSISPerdiod - 1) {
            RQPacketsItem.m_Packets[rRSISPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if (rRSISPacketData.GetRQStartIndex() === null) {
            rRSISPacketData.SetRQStartIndex(i);
        }
        rRSISPacketData.AddTail(i, this.m_SaveRSISDataArray[1]);
        RQPacketsItem.m_Packets[rRSISPacketData.m_nPacketIndex] = rRSISPacketData.GetData(rRSISPacketData.GetDataArraySize() - 1);        
    }
    return true;
}
CRSIIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketPData = this.m_InputPacketDataArray[3];
    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rRSIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strRSIPacketName);
    var rRSISPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strRSISPacketName);    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vRSIPerdiod = this.m_VariableArray[0].m_strData;
    var vRSISPerdiod = this.m_VariableArray[1].m_strData;    
    var vRSIDType = this.m_VariableArray[2].m_strData;
    
    ////////////////////////////////////////////////////////
    
    var MData = null;
    switch (vRSIDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    var deviation = 2/(vRSISPerdiod+1);
    var data, rsi;

    if (this.m_SaveUpData === null) {
        this.m_SaveUpData = 0;
    }
    if (this.m_SaveDownData === null) {
        this.m_SaveDownData = 0;
    }
    if (this.m_SaveRSISDataArray[1] === null) {
        this.m_SaveRSISDataArray[1] = 0;
    }

    var nDataLength = MData.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }
        

    /****RSI 계산 Start *************************/
    if (i < 1) {
        RQPacketsItem.m_Packets[rRSIPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rRSISPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    
    if (bAddData) {//add
        this.m_SaveData = MData[i].m_Data - MData[i-1].m_Data;
        if (this.m_SaveData > 0) {
            this.m_SaveUpData += this.m_SaveData;
        } else if (this.m_SaveData < 0) {
            this.m_SaveDownData -= this.m_SaveData;
        }
        if (i > vRSIPerdiod) {
            data = MData[i-vRSIPerdiod].m_Data - MData[i-vRSIPerdiod-1].m_Data;
            if (data > 0) {
                this.m_SaveUpData -= data;
            } else if (data < 0) {
                this.m_SaveDownData += data;
            }
        }
    } else {//update
        if (this.m_SaveData > 0) {
            this.m_SaveUpData -= (this.m_SaveData);
        } else if (this.m_SaveData < 0) {
            this.m_SaveDownData += (this.m_SaveData);
        }

        this.m_SaveData = MData[i].m_Data - MData[i-1].m_Data;
        if (this.m_SaveData > 0) {
            this.m_SaveUpData += (this.m_SaveData);
        } else if (this.m_SaveData < 0) {
            this.m_SaveDownData -= (this.m_SaveData);
        }
    }

    if( this.m_SaveUpData + this.m_SaveDownData !== 0 && vRSIPerdiod !== 0 ) {
        rsi = (this.m_SaveUpData / vRSIPerdiod) * 100 / ((this.m_SaveUpData / vRSIPerdiod) + (this.m_SaveDownData / vRSIPerdiod));
    } else {
        rsi = 0;
    }

    if (bAddData) {
        this.m_SaveRSISDataArray[0] = this.m_SaveRSISDataArray[1];
    }
    this.m_SaveRSISDataArray[1] = this.m_SaveRSISDataArray[0] + deviation * (rsi - this.m_SaveRSISDataArray[0]);

    if (i < vRSIPerdiod) {
        RQPacketsItem.m_Packets[rRSIPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rRSISPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (rRSIPacketData.GetRQStartIndex() === null) {
        rRSIPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rRSIPacketData.AppendRealData( i,rsi);
    } else {
        rRSIPacketData.UpdateData(i, rsi);            
    }
    RQPacketsItem.m_Packets[rRSIPacketData.m_nPacketIndex] = rRSIPacketData.GetData(rRSIPacketData.GetDataArraySize() - 1);

    if (i < vRSIPerdiod + vRSISPerdiod - 1) {
        RQPacketsItem.m_Packets[rRSISPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (rRSISPacketData.GetRQStartIndex() === null) {
        rRSISPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rRSISPacketData.AppendRealData( i,this.m_SaveRSISDataArray[1]);
    } else {
        rRSISPacketData.UpdateData(i, this.m_SaveRSISDataArray[1]);
    }
    RQPacketsItem.m_Packets[rRSISPacketData.m_nPacketIndex] = rRSISPacketData.GetData(rRSISPacketData.GetDataArraySize() - 1);


    return REALCALC_SUCCESS;
}

//Stochastic Fast
function CStoFIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "Stochastics Fast 지표";

    //계산결과 담을 패킷생성
    this.m_strSTOFKPacketName = this.m_strKey + "_STOFK_";
    rRQSet.AddNumPacketInfo(this.m_strSTOFKPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strSTOFDPacketName = this.m_strKey + "_STOFD_";
    rRQSet.AddNumPacketInfo(this.m_strSTOFDPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    
    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var STOFKSubGraph = new CIndicatorSubGraph(this);
    STOFKSubGraph.m_rRQSet = rRQSet;
    STOFKSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    STOFKSubGraph.SetPacketData(this.m_strSTOFKPacketName);
    STOFKSubGraph.SetSubGraphName("Sto_FastK");
    STOFKSubGraph.m_strSubGraphTitle = "Sto Fast%K"; //E_High
    this.m_SubGraphArray.push(STOFKSubGraph);

    var STOFDSubGraph = new CIndicatorSubGraph(this);
    STOFDSubGraph.m_rRQSet = rRQSet;
    STOFDSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    STOFDSubGraph.SetPacketData(this.m_strSTOFDPacketName);
    STOFDSubGraph.SetSubGraphName("Sto_FastD");
    STOFDSubGraph.m_strSubGraphTitle = "Sto Fast%D";
    this.m_SubGraphArray.push(STOFDSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("FKPeriod", NUMERIC_TYPE, 5);    // Fast%K 기간(5)
    this.AddVariable("FDPeriod", NUMERIC_TYPE, 3);    // Fast%D 기간(3)
    
    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 20;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;
    BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 80;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveDataArray = [];
}
CStoFIndicator.prototype = new CIndicator();
CStoFIndicator.prototype.constructor = CStoFIndicator;
CStoFIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData == undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rSTOFKPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSTOFKPacketName);
    var rSTOFDPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSTOFDPacketName);    

    rSTOFKPacketData.InitDataArray();
    rSTOFDPacketData.InitDataArray();    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vSTOFKPeriod = this.m_VariableArray[0].m_strData;
    var vSTOFDPeriod = this.m_VariableArray[1].m_strData;    
    ////////////////////////////////////////////////////////

    var MLData = rInputPacketLData.m_DataArray;
    var MHData = rInputPacketHData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var minLow, maxHigh;
    var deviation = 2/(vSTOFDPeriod+1);
    var stofK;

    this.m_SaveDataArray[1] = 0;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }

        /****StockFast K 계산 Start *************************/
        if (i < 1) {
            RQPacketsItem.m_Packets[rSTOFKPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rSTOFDPacketData.m_nPacketIndex] = undefined;
            continue;
        }
        
        minLow = MLData[i].m_Data;
        maxHigh = MHData[i].m_Data;
        for (var j = i - 1; j > i - vSTOFKPeriod; j--) {
            if (j < 0) {
                break;
            }
            minLow = minLow>MLData[j].m_Data?MLData[j].m_Data:minLow;   
            maxHigh = maxHigh<MHData[j].m_Data?MHData[j].m_Data:maxHigh;
        }
        if (minLow === maxHigh) {
            stofK = 0;
        } else {
            stofK = (MPData[i].m_Data-minLow)*100/(maxHigh-minLow);
        }

        //STOF%D 계산
        this.m_SaveDataArray[0] = this.m_SaveDataArray[1];
        this.m_SaveDataArray[1] = this.m_SaveDataArray[0] + deviation * (stofK - this.m_SaveDataArray[0]);

        if (rSTOFKPacketData.GetRQStartIndex() == null) {
            rSTOFKPacketData.SetRQStartIndex(i);
        }
        rSTOFKPacketData.AddTail(i, stofK);
        RQPacketsItem.m_Packets[rSTOFKPacketData.m_nPacketIndex] = rSTOFKPacketData.GetData(rSTOFKPacketData.GetDataArraySize() - 1);        

        if (i < vSTOFKPeriod + vSTOFDPeriod - 2) {            
            RQPacketsItem.m_Packets[rSTOFDPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        /****StockFast D 계산 Start *************************/        
        if (rSTOFDPacketData.GetRQStartIndex() == null) {
            rSTOFDPacketData.SetRQStartIndex(i);
        }
        rSTOFDPacketData.AddTail(i, this.m_SaveDataArray[1]);
        RQPacketsItem.m_Packets[rSTOFDPacketData.m_nPacketIndex] = rSTOFDPacketData.GetData(rSTOFDPacketData.GetDataArraySize() - 1);        
    }

    return true;
}
CStoFIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rSTOFKPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSTOFKPacketName);
    var rSTOFDPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSTOFDPacketName);    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vSTOFKPeriod = this.m_VariableArray[0].m_strData;
    var vSTOFDPeriod = this.m_VariableArray[1].m_strData;    
    ////////////////////////////////////////////////////////

    var MLData = rInputPacketLData.m_DataArray;
    var MHData = rInputPacketHData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var minLow, maxHigh;
    var deviation = 2/(vSTOFDPeriod+1);
    var stofK;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem == undefined) {
        return REALCALC_FAIL;
    }

    /****StockFast K 계산 Start *************************/
    if (i < 1) {
        RQPacketsItem.m_Packets[rSTOFKPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rSTOFDPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    
    minLow = MLData[i].m_Data;
    maxHigh = MHData[i].m_Data;
    for (var j = i - 1; j > i - vSTOFKPeriod; j--) {
        if (j < 0) {
            break;
        }
        minLow = minLow>MLData[j].m_Data?MLData[j].m_Data:minLow;   
        maxHigh = maxHigh<MHData[j].m_Data?MHData[j].m_Data:maxHigh;
    }
    if (minLow === maxHigh) {
        stofK = 0;
    } else {
        stofK = (MPData[i].m_Data-minLow)*100/(maxHigh-minLow);
    }

    //STOF%D 계산
    if (this.m_SaveDataArray[1] === null) {
        this.m_SaveDataArray[1] = 0;
    }

    if (bAddData) {
        this.m_SaveDataArray[0] = this.m_SaveDataArray[1];
    }
    this.m_SaveDataArray[1] = this.m_SaveDataArray[0] + deviation * (stofK - this.m_SaveDataArray[0]);

    
    if (rSTOFKPacketData.GetRQStartIndex() === null) {
        rSTOFKPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rSTOFKPacketData.AppendRealData( i,stofK);
    } else {
        rSTOFKPacketData.UpdateData(i, stofK);
    }
    RQPacketsItem.m_Packets[rSTOFKPacketData.m_nPacketIndex] = rSTOFKPacketData.GetData(rSTOFKPacketData.GetDataArraySize() - 1);
    

    if (i < vSTOFKPeriod + vSTOFDPeriod - 2) {
        RQPacketsItem.m_Packets[rSTOFDPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    /****StockFast D 계산 Start *************************/    
    if (rSTOFDPacketData.GetRQStartIndex() === null) {
        rSTOFDPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rSTOFDPacketData.AppendRealData( i,this.m_SaveDataArray[1]);
    } else {
        rSTOFDPacketData.UpdateData(i, this.m_SaveDataArray[1]);
    }
    RQPacketsItem.m_Packets[rSTOFDPacketData.m_nPacketIndex] = rSTOFDPacketData.GetData(rSTOFDPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//Stochastic Slow
function CStoSIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "Stochastics Slow 지표";

    //계산결과 담을 패킷생성
    this.m_strSTOSKPacketName = this.m_strKey + "_STOSK_";
    rRQSet.AddNumPacketInfo(this.m_strSTOSKPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strSTOSDPacketName = this.m_strKey + "_STOSD_";
    rRQSet.AddNumPacketInfo(this.m_strSTOSDPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var STOSKSubGraph = new CIndicatorSubGraph(this);
    STOSKSubGraph.m_rRQSet = rRQSet;
    STOSKSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    STOSKSubGraph.SetPacketData(this.m_strSTOSKPacketName);
    STOSKSubGraph.SetSubGraphName("Sto_SlowK");
    STOSKSubGraph.m_strSubGraphTitle = "Sto Slow%K"; //E_High
    this.m_SubGraphArray.push(STOSKSubGraph);

    var STOSDSubGraph = new CIndicatorSubGraph(this);
    STOSDSubGraph.m_rRQSet = rRQSet;
    STOSDSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    STOSDSubGraph.SetPacketData(this.m_strSTOSDPacketName);
    STOSDSubGraph.SetSubGraphName("Sto_SlowD");
    STOSDSubGraph.m_strSubGraphTitle = "Sto Slow%D";
    this.m_SubGraphArray.push(STOSDSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("KPeriod", NUMERIC_TYPE, 5);    // Slow K period(5)
    this.AddVariable("SKPeriod", NUMERIC_TYPE, 3);    // Slow%K 기간(3)
    this.AddVariable("SDPeriod", NUMERIC_TYPE, 3);    // Slow%D 기간(3)


    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 20;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;
    BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 80;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveKDataArray = [];
    this.m_SaveDDataArray = [];
}
CStoSIndicator.prototype = new CIndicator();
CStoSIndicator.prototype.constructor = CStoSIndicator;
CStoSIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData === undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rSTOSKPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSTOSKPacketName);
    var rSTOSDPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSTOSDPacketName);    

    rSTOSKPacketData.InitDataArray();
    rSTOSDPacketData.InitDataArray();
    
    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vSTOSPeriod = this.m_VariableArray[0].m_strData;
    var vSTOSKPeriod = this.m_VariableArray[1].m_strData;
    var vSTOSDPeriod = this.m_VariableArray[2].m_strData;
    ////////////////////////////////////////////////////////

    var MLData = rInputPacketLData.m_DataArray;
    var MHData = rInputPacketHData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var minLow, maxHigh;
    var stos;

    var deviationK = 2/(vSTOSKPeriod+1);
    var deviationD = 2/(vSTOSDPeriod+1);

    this.m_SaveKDataArray[1] = 0;
    this.m_SaveDDataArray[1] = 0;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;
        
        
        /****StockSlow 계산 Start *************************/
        if (i < 1) {
            RQPacketsItem.m_Packets[rSTOSKPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rSTOSDPacketData.m_nPacketIndex] = undefined;
            continue;
        }
        
        minLow = MLData[i].m_Data;
        maxHigh = MHData[i].m_Data;
        for (var j = i - 1; j > i - vSTOSPeriod; j--) {
            if (j < 0) {
                break;
            }
            minLow = minLow>MLData[j].m_Data?MLData[j].m_Data:minLow;   
            maxHigh = maxHigh<MHData[j].m_Data?MHData[j].m_Data:maxHigh;
        }

        if (minLow === maxHigh) {
            stos = 0;
        } else {
            stos = (MPData[i].m_Data-minLow)*100/(maxHigh-minLow);
        }
        
        this.m_SaveKDataArray[0] = this.m_SaveKDataArray[1];
        this.m_SaveKDataArray[1] = this.m_SaveKDataArray[0] + deviationK * (stos - this.m_SaveKDataArray[0]);

        if (i < vSTOSPeriod + vSTOSKPeriod - 2) {
            RQPacketsItem.m_Packets[rSTOSKPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rSTOSDPacketData.m_nPacketIndex] = undefined;
            continue;
        }
        
        if (rSTOSKPacketData.GetRQStartIndex() == null) {
            rSTOSKPacketData.SetRQStartIndex(i);
        }
        rSTOSKPacketData.AddTail(i, this.m_SaveKDataArray[1]);
        RQPacketsItem.m_Packets[rSTOSKPacketData.m_nPacketIndex] = rSTOSKPacketData.GetData(rSTOSKPacketData.GetDataArraySize() - 1);
        

        this.m_SaveDDataArray[0] = this.m_SaveDDataArray[1];
        this.m_SaveDDataArray[1] = this.m_SaveDDataArray[0] + deviationD * (this.m_SaveKDataArray[1] - this.m_SaveDDataArray[0]);

        if (i < vSTOSPeriod + vSTOSKPeriod + vSTOSDPeriod - 3) {            
            RQPacketsItem.m_Packets[rSTOSDPacketData.m_nPacketIndex] = undefined;
            continue;
        }
        
        if (rSTOSDPacketData.GetRQStartIndex() == null) {
            rSTOSDPacketData.SetRQStartIndex(i);
        }
        rSTOSDPacketData.AddTail(i, this.m_SaveDDataArray[1]);
        RQPacketsItem.m_Packets[rSTOSDPacketData.m_nPacketIndex] = rSTOSDPacketData.GetData(rSTOSDPacketData.GetDataArraySize() - 1);
        
    }
    return true;
}
CStoSIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rSTOSKPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSTOSKPacketName);
    var rSTOSDPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSTOSDPacketName);
    
    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vSTOSPeriod = this.m_VariableArray[0].m_strData;
    var vSTOSKPeriod = this.m_VariableArray[1].m_strData;
    var vSTOSDPeriod = this.m_VariableArray[2].m_strData;    
    ////////////////////////////////////////////////////////

    var MLData = rInputPacketLData.m_DataArray;
    var MHData = rInputPacketHData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var minLow, maxHigh;
    var stos;

    var deviationK = 2/(vSTOSKPeriod+1);
    var deviationD = 2/(vSTOSDPeriod+1);

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
        return REALCALC_FAIL;

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined)
        return REALCALC_FAIL;

    /****StockSlow 계산 Start *************************/
    if (i < 1) {
        RQPacketsItem.m_Packets[rSTOSKPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rSTOSDPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    
    minLow = MLData[i].m_Data;
    maxHigh = MHData[i].m_Data;
    for (var j = i - 1; j > i - vSTOSPeriod; j--) {
        if (j < 0) {
            break;
        }
        minLow = minLow>MLData[j].m_Data?MLData[j].m_Data:minLow;   
        maxHigh = maxHigh<MHData[j].m_Data?MHData[j].m_Data:maxHigh;
    }
    if (minLow === maxHigh) {
        stos = 0;
    } else {
        stos = (MPData[i].m_Data-minLow)*100/(maxHigh-minLow);
    }
    if (this.m_SaveKDataArray[1] === null) {
        this.m_SaveKDataArray[1] = 0;
    }
    if (bAddData) {
        this.m_SaveKDataArray[0] = this.m_SaveKDataArray[1];
    }
    this.m_SaveKDataArray[1] = this.m_SaveKDataArray[0] + deviationK * (stos - this.m_SaveKDataArray[0]);

    if (i < vSTOSPeriod + vSTOSKPeriod - 2) {
        RQPacketsItem.m_Packets[rSTOSKPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rSTOSDPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    
    if (rSTOSKPacketData.GetRQStartIndex() === null) {
        rSTOSKPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rSTOSKPacketData.AppendRealData( i,this.m_SaveKDataArray[1]);
    } else {
        rSTOSKPacketData.UpdateData(i, this.m_SaveKDataArray[1]);
    }
    RQPacketsItem.m_Packets[rSTOSKPacketData.m_nPacketIndex] = rSTOSKPacketData.GetData(rSTOSKPacketData.GetDataArraySize() - 1);
    

    if (this.m_SaveDDataArray[1] === null) {        
        this.m_SaveDDataArray[1] = 0;
    }

    if (bAddData) {
        this.m_SaveDDataArray[0] = this.m_SaveDDataArray[1];
    }
    this.m_SaveDDataArray[1] = this.m_SaveDDataArray[0] + deviationD * (this.m_SaveKDataArray[1] - this.m_SaveDDataArray[0]);

    if (i < vSTOSPeriod + vSTOSKPeriod + vSTOSDPeriod - 3) {
        RQPacketsItem.m_Packets[rSTOSDPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    
    if (rSTOSDPacketData.GetRQStartIndex() == null) {
        rSTOSDPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rSTOSDPacketData.AppendRealData( i,this.m_SaveDDataArray[1]);
    } else {
        rSTOSDPacketData.UpdateData(i, this.m_SaveDDataArray[1]);
    }
    RQPacketsItem.m_Packets[rSTOSDPacketData.m_nPacketIndex] = rSTOSDPacketData.GetData(rSTOSDPacketData.GetDataArraySize() - 1);    

    return REALCALC_SUCCESS;
}

//Williams R
function CWillIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "William's R 지표";

    //계산결과 담을 패킷생성
    this.m_strWILLRPacketName = this.m_strKey + "_WILLR_";
    rRQSet.AddNumPacketInfo(this.m_strWILLRPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strWILLSPacketName = this.m_strKey + "_WILLD_";
    rRQSet.AddNumPacketInfo(this.m_strWILLSPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strWILLB1PacketName = this.m_strKey + "_WILLB1_";
    rRQSet.AddNumPacketInfo(this.m_strWILLB1PacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strWILLB2PacketName = this.m_strKey + "_WILLB2_";
    rRQSet.AddNumPacketInfo(this.m_strWILLB2PacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var WILLRSubGraph = new CIndicatorSubGraph(this);
    WILLRSubGraph.m_rRQSet = rRQSet;
    WILLRSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    WILLRSubGraph.SetPacketData(this.m_strWILLRPacketName);
    WILLRSubGraph.SetSubGraphName("Williams_R");
    WILLRSubGraph.m_strSubGraphTitle = "Williams R"; //E_High
    this.m_SubGraphArray.push(WILLRSubGraph);

    var WILLSSubGraph = new CIndicatorSubGraph(this);
    WILLSSubGraph.m_rRQSet = rRQSet;
    WILLSSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    WILLSSubGraph.SetPacketData(this.m_strWILLSPacketName);
    WILLSSubGraph.SetSubGraphName("R_Signal");
    WILLSSubGraph.m_strSubGraphTitle = "R Signal";
    this.m_SubGraphArray.push(WILLSSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("WRPeriod", NUMERIC_TYPE, 14);    // Williams R 기간(14)
    this.AddVariable("WSPeriod", NUMERIC_TYPE, 3);     // R Signal 기간(3)
    
    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = -20;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;
    BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = -80;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveDataArray = [];//0: R Signal[i-1], 1: R Signal[i]
}
CWillIndicator.prototype = new CIndicator();
CWillIndicator.prototype.constructor = CWillIndicator;
CWillIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rWILLRPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strWILLRPacketName);
    var rWILLSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strWILLSPacketName);    

    rWILLRPacketData.InitDataArray();
    rWILLSPacketData.InitDataArray();    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vWILLRPerdiod = this.m_VariableArray[0].m_strData;
    var vWILLSPerdiod = this.m_VariableArray[1].m_strData;    

    var MLData = rInputPacketLData.m_DataArray;
    var MHData = rInputPacketHData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var minLow, maxHigh;
    var will;
    var deviation = 2/(vWILLSPerdiod+1);

    this.m_SaveDataArray[1] = 0;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }
       
        /****Williams R 계산 Start *************************/
        if (i < vWILLRPerdiod - 1) {
            RQPacketsItem.m_Packets[rWILLRPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rWILLSPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        minLow = MLData[i].m_Data;
        maxHigh = MHData[i].m_Data;
        for (var j = i; j > i - vWILLRPerdiod; j--) {
            if (j < 0) {
                break;
            }
            minLow = minLow>MLData[j].m_Data?MLData[j].m_Data:minLow;   
            maxHigh = maxHigh<MHData[j].m_Data?MHData[j].m_Data:maxHigh;
        }
        if (minLow === maxHigh) {
            will = 0;
        } else {
            will = (MPData[i].m_Data-maxHigh)*100/(maxHigh-minLow);
        }

        this.m_SaveDataArray[0] = this.m_SaveDataArray[1];
        this.m_SaveDataArray[1] = this.m_SaveDataArray[0] + deviation * (will - this.m_SaveDataArray[0]);

        if (rWILLRPacketData.GetRQStartIndex() == null) {
            rWILLRPacketData.SetRQStartIndex(i);
        }
        rWILLRPacketData.AddTail(i, will);
        RQPacketsItem.m_Packets[rWILLRPacketData.m_nPacketIndex] = rWILLRPacketData.GetData(rWILLRPacketData.GetDataArraySize() - 1);
        
        if (i < vWILLRPerdiod + vWILLSPerdiod - 1) {            
            RQPacketsItem.m_Packets[rWILLSPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if (rWILLSPacketData.GetRQStartIndex() == null) {
            rWILLSPacketData.SetRQStartIndex(i);
        }
        rWILLSPacketData.AddTail(i, this.m_SaveDataArray[1]);
        RQPacketsItem.m_Packets[rWILLSPacketData.m_nPacketIndex] = rWILLSPacketData.GetData(rWILLSPacketData.GetDataArraySize() - 1);        
    }

    return true;
}
CWillIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rWILLRPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strWILLRPacketName);
    var rWILLSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strWILLSPacketName);    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vWILLRPerdiod = this.m_VariableArray[0].m_strData;
    var vWILLSPerdiod = this.m_VariableArray[1].m_strData;
    
    var MLData = rInputPacketLData.m_DataArray;
    var MHData = rInputPacketHData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var minLow, maxHigh;
    var will;
    var deviation = 2/(vWILLSPerdiod+1);

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }
    
    /****Williams R 계산 Start *************************/
    if (i < vWILLRPerdiod - 1) {
        RQPacketsItem.m_Packets[rWILLRPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rWILLSPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    minLow = MLData[i].m_Data;
    maxHigh = MHData[i].m_Data;
    for (var j = i; j > i - vWILLRPerdiod; j--) {
        if (j < 0) {
            break;
        }
        minLow = minLow>MLData[j].m_Data?MLData[j].m_Data:minLow;   
        maxHigh = maxHigh<MHData[j].m_Data?MHData[j].m_Data:maxHigh;
    }
    if (minLow === maxHigh) {
        will = 0;
    } else {
        will = (MPData[i].m_Data-maxHigh)*100/(maxHigh-minLow);
    }

    if (this.m_SaveDataArray[1] === null) {
        this.m_SaveDataArray[1] = 0;
    }
    if (bAddData) {
        this.m_SaveDataArray[0] = this.m_SaveDataArray[1];        
    }
    this.m_SaveDataArray[1] = this.m_SaveDataArray[0] + deviation * (will - this.m_SaveDataArray[0]);

    if (rWILLRPacketData.GetRQStartIndex() === null) {
        rWILLRPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rWILLRPacketData.AppendRealData( i,will);
    } else {
        rWILLRPacketData.UpdateData(i, will);
    }
    RQPacketsItem.m_Packets[rWILLRPacketData.m_nPacketIndex] = rWILLRPacketData.GetData(rWILLRPacketData.GetDataArraySize() - 1);
    
    if (i < vWILLRPerdiod + vWILLSPerdiod - 1) {
        RQPacketsItem.m_Packets[rWILLSPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (rWILLSPacketData.GetRQStartIndex() === null) {
        rWILLSPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rWILLSPacketData.AppendRealData( i,this.m_SaveDataArray[1]);
    } else {
        rWILLSPacketData.UpdateData(i, this.m_SaveDataArray[1]);
    }
    RQPacketsItem.m_Packets[rWILLSPacketData.m_nPacketIndex] = rWILLSPacketData.GetData(rWILLSPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//이격도
function CDisparityIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "이격도 ";

    this.m_strDisSPacketName = this.m_strKey + "_Short_";
    rRQSet.AddNumPacketInfo(this.m_strDisSPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strDisLPacketName = this.m_strKey + "_Long_";
    rRQSet.AddNumPacketInfo(this.m_strDisLPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);


    var DisShortSubGraph = new CIndicatorSubGraph(this);
    DisShortSubGraph.m_rRQSet = rRQSet;
    DisShortSubGraph.m_LineTypeInfo.m_clrLine = '#FF0000';
    DisShortSubGraph.SetPacketData(this.m_strDisSPacketName);
    DisShortSubGraph.SetSubGraphName("DisS");
    DisShortSubGraph.m_strSubGraphTitle = "DisS";
    this.m_SubGraphArray.push(DisShortSubGraph);

    var DisLongSubGraph = new CIndicatorSubGraph(this);
    DisLongSubGraph.m_rRQSet = rRQSet;
    DisLongSubGraph.m_LineTypeInfo.m_clrLine = '#0000FF';
    DisLongSubGraph.SetPacketData(this.m_strDisLPacketName);
    DisLongSubGraph.SetSubGraphName("DisL");
    DisLongSubGraph.m_strSubGraphTitle = "DisL";
    this.m_SubGraphArray.push(DisLongSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("ShortPeriod", NUMERIC_TYPE, 10); // Short Period(10)
    this.AddVariable("LongPeriod", NUMERIC_TYPE, 60);  // Long Period(60)    
    this.AddVariable("DType", NUMERIC_TYPE, 3, "가격");        // 데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)
    this.AddVariable("MAType", NUMERIC_TYPE, 0);       // MA 타입 : 0:단순, 1:지수, 2:가중, 3:기하, 4:조화, 5:삼각, 6:적합

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 90;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;
    BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 100;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveSDataArray = [];
    this.m_SaveLDataArray = [];
}
CDisparityIndicator.prototype = new CIndicator();
CDisparityIndicator.prototype.constructor = CDisparityIndicator;
CDisparityIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var nLength = this.m_SubGraphArray.length;

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorParameter = this.m_rGlobalProperty.m_bShowIndicatorParameter;
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    let rSubGraph;
    let i, rShowGraphArray = [];
    let strTitle, strLastestData, rLastestPacketItemData = null;
    for(i = 0 ; i < nLength ; i++ )
    {
        rSubGraph = this.m_SubGraphArray[i];
        if(rSubGraph.m_bShow)
            rShowGraphArray[ rShowGraphArray.length ] = rSubGraph;
        else        
            rSubGraph.HideTitle();
    }

    nLength = rShowGraphArray.length;
    if(nLength <= 0)//Show상태 서브그래프가 없는 경우
    {
        rSubGraph = this.m_SubGraphArray[0];
        if (bShowIndicatorName === true) {
            strTitle = this.m_strTitle;
            if (bShowIndicatorParameter === true) {
                        
                var nVLength = this.m_VariableArray.length;
                if (nVLength > 0) {
                    strTitle += "(";
                    for (var j = 0; j < nVLength; j++) {
                        var rVariable = this.m_VariableArray[j];
                        strTitle += rVariable.m_strData;
                        if (j < nVLength - 1)
                            strTitle += ",";
                    }
                    strTitle += ")";
                }
            }

            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
        else
            this.HideTitle();            
    }
    else
    {
        for( i = 0; i < nLength; i++ )
        {
            rSubGraph = rShowGraphArray[i];
            
            if (i === 0) 
            {
                if (bShowIndicatorName === true) {

                    strTitle = this.m_strTitle;
    
                    if (bShowIndicatorParameter === true) {
                        
                        var nVLength = this.m_VariableArray.length;
                        if (nVLength > 0) {
                            strTitle += "(";
                            for (var j = 0; j < nVLength; j++) {
                                var rVariable = this.m_VariableArray[j];
                                strTitle += rVariable.m_strData;
                                if (j < nVLength - 1)
                                    strTitle += ",";
                            }
                            strTitle += ")";
                        }
                    }
    
                    strTitle += " " + rSubGraph.m_strSubGraphTitle;
                }
                else
                    strTitle = "";
            }
            else
            {
                if (bShowIndicatorName === true)
                    strTitle = rSubGraph.m_strSubGraphTitle;
                else
                    strTitle = "";
            }

            if (bShowIndicatorValue === true) {
    
                rLastestPacketItemData = rSubGraph.m_rPacketData.GetLastestPacketItemData();
                if (rLastestPacketItemData !== null) {
                    if (rLastestPacketItemData.GetPacketType() === NUMERIC_TYPE) {
                        strLastestData = ConvertNumToDigitText(rLastestPacketItemData.m_Data, rLastestPacketItemData.m_rPacketData.m_nDec, 1, rLastestPacketItemData.m_rPacketData.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                        strTitle += "(" + strLastestData + ")";
                    }
                    else
                        strTitle += "(" + rLastestPacketItemData.m_Data + ")";
                }
            }
            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }        
    }
}
CDisparityIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rDisShortPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strDisSPacketName);
    var rDisLongPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strDisLPacketName);
        
    rDisShortPacketData.InitDataArray();
    rDisLongPacketData.InitDataArray();   

    var vDisSPeriod = this.m_VariableArray[0].m_strData;
    var vDisLPeriod = this.m_VariableArray[1].m_strData;    
    var vDisDType = this.m_VariableArray[2].m_strData;
    var vDisMAType = this.m_VariableArray[3].m_strData;
    
    var MData = null;
    switch (vDisDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    this.m_SaveSDataArray[0] = 0;
    this.m_SaveLDataArray[0] = 0;

    let i;
    let avg, dis;
    let nDataLength = MData.length;
    let vDisSPeriodIndex = vDisSPeriod - 1;
    let vDisLPeriodIndex = vDisLPeriod - 1;

    if(vDisMAType === 0)//단순
    {
        for ( i = 0; i < nDataLength; i++) {

            var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
            if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
                continue;
            }

            var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
            if (RQPacketsItem === undefined) {
                continue;
            }

            this.m_SaveSDataArray[1] = MData[i].m_Data;
            this.m_SaveSDataArray[0] += this.m_SaveSDataArray[1];
            if (i > vDisSPeriodIndex) {
                this.m_SaveSDataArray[0] -= MData[i-vDisSPeriod].m_Data;
            }

            this.m_SaveLDataArray[1] = MData[i].m_Data;
            this.m_SaveLDataArray[0] += this.m_SaveLDataArray[1];
            if (i > vDisLPeriodIndex) {
                this.m_SaveLDataArray[0] -= MData[i-vDisLPeriod].m_Data;
            }

            if (i < vDisSPeriodIndex) 
            {
                RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = undefined;                
            }
            else
            {
                avg = this.m_SaveSDataArray[0] / vDisSPeriod;
                if (avg !== 0 ) {
                    dis = this.m_SaveSDataArray[1] / avg * 100;
                } else {
                    dis = this.m_SaveSDataArray[1] * 100;
                }
                
                if (rDisShortPacketData.GetRQStartIndex() == null) {
                    rDisShortPacketData.SetRQStartIndex(i);
                }
                rDisShortPacketData.AddTail(i, dis);
                RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = rDisShortPacketData.GetData(rDisShortPacketData.GetDataArraySize() - 1);
            }
            
            
            if (i < vDisLPeriodIndex) 
            {
                RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = undefined;                
            }
            else
            {
                avg = this.m_SaveLDataArray[0] / vDisLPeriod;
                if (avg !== 0 ) {
                    dis = this.m_SaveLDataArray[1] / avg * 100;
                } else {
                    dis = this.m_SaveLDataArray[1] * 100;
                }

                if (rDisLongPacketData.GetRQStartIndex() === null) {
                    rDisLongPacketData.SetRQStartIndex(i);
                }
                rDisLongPacketData.AddTail(i, dis);
                RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = rDisLongPacketData.GetData(rDisLongPacketData.GetDataArraySize() - 1);
            }
        }
    }
    else if(vDisMAType === 1)//지수
    {
        let ShortSmoothConst = 2 / ( vDisSPeriod + 1);
        let LongSmoothConst = 2 / (vDisLPeriod + 1);
        let ShortMAValue = 0, LongMAValue = 0, Source = 0;

        for (i = 0; i < nDataLength; i++) {

            var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
            if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
                continue;
            }

            var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
            if (RQPacketsItem === undefined) {
                continue;
            }

            if( i === 0 )
            {
                ShortMAValue = MData[i].m_Data;
                this.m_SaveSDataArray[0] = ShortMAValue;//단기이평
                this.m_SaveSDataArray[1] = ShortMAValue;//단기이평

                LongMAValue = MData[i].m_Data;
                this.m_SaveLDataArray[0] = LongMAValue;//장기이평
                this.m_SaveLDataArray[1] = LongMAValue;//장기이평
            }
            else
            {
                //단기이평
                this.m_SaveSDataArray[0] = ShortMAValue;
                Source = MData[i].m_Data;
                ShortMAValue = ShortMAValue * (1 - ShortSmoothConst) + Source * ShortSmoothConst;
                this.m_SaveSDataArray[1] = ShortMAValue;
                
                //장기이평
                this.m_SaveLDataArray[0] = LongMAValue;
                Source = MData[i].m_Data;
                LongMAValue = LongMAValue * (1 - LongSmoothConst) + Source * LongSmoothConst;
                this.m_SaveLDataArray[1] = LongMAValue;
            }

            //단기이평
            if (i >= vDisSPeriodIndex) 
            {            
                if (ShortMAValue !== 0 ) {
                    dis = MData[i].m_Data / ShortMAValue * 100;
                } else {
                    dis = MData[i].m_Data * 100;
                }
                
                if (rDisShortPacketData.GetRQStartIndex() == null) {
                    rDisShortPacketData.SetRQStartIndex(i);
                }
                rDisShortPacketData.AddTail(i, dis);
                RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = rDisShortPacketData.GetData(rDisShortPacketData.GetDataArraySize() - 1);
            }
            else
            {
                RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = undefined;
            }
            
            //장기이평
            if (i >= vDisLPeriodIndex) 
            {                
                if (LongMAValue !== 0 ) {
                    dis = MData[i].m_Data / LongMAValue * 100;
                } else {
                    dis = MData[i].m_Data * 100;
                }

                if (rDisLongPacketData.GetRQStartIndex() === null) {
                    rDisLongPacketData.SetRQStartIndex(i);
                }
                rDisLongPacketData.AddTail(i, dis);
                RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = rDisLongPacketData.GetData(rDisLongPacketData.GetDataArraySize() - 1);
            }
            else
            {
                RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = undefined;
            }
        }
    }
    else if(vDisMAType === 2)//가중
    {
        let ShortSmoothConst = 2 / ( vDisSPeriod + 1);
        let LongSmoothConst = 2 / (vDisLPeriod + 1);
        let ShortMAValue = 0, LongMAValue = 0, Source = 0, PreSource = 0, ShortSum = 0, LongSum = 0;
        let ShortWeightedSum = 0, LongWeightedSum = 0;

        for (i = 0; i < nDataLength; i++) {

            var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
            if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
                continue;
            }

            var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
            if (RQPacketsItem === undefined) {
                continue;
            }

            ///////////////////////
            //단기이평
            ///////////////////////
            if( vDisSPeriod > i )
            {
                this.m_SaveSDataArray[0] = ShortMAValue;
                this.m_SaveSDataArray[1] = ShortSum;

                Source = MData[i].m_Data;
                ShortWeightedSum = ShortWeightedSum + Source * (i + 1);
                if(vDisSPeriod === 0)
                    ShortMAValue = 0;
                else
                    ShortMAValue = ShortWeightedSum * 2 / (vDisSPeriod * (vDisSPeriod + 1));

                ShortSum = ShortSum + Source;

                this.m_SaveSDataArray[2] = ShortMAValue;
                this.m_SaveSDataArray[3] = ShortSum;
            }
            else
            {
                this.m_SaveSDataArray[0] = ShortMAValue;
                this.m_SaveSDataArray[1] = ShortSum;
                
                Source = MData[i].m_Data;
                PreSource = MData[i - vDisSPeriod].m_Data;
                ShortWeightedSum = ShortWeightedSum - ShortSum + Source * vDisSPeriod;
                if(vDisSPeriod === 0)
                {
                    ShortMAValue = 0;
                }
                else
                {
                    ShortMAValue = ShortWeightedSum * 2 / (vDisSPeriod * (vDisSPeriod + 1));
                }
                ShortSum = ShortSum + Source - PreSource;
                
                this.m_SaveSDataArray[2] = ShortMAValue;
                this.m_SaveSDataArray[3] = ShortSum;
            }
            
            if (i >= vDisSPeriodIndex) 
            {            
                if (ShortMAValue !== 0 ) {
                    dis = MData[i].m_Data / ShortMAValue * 100;
                } else {
                    dis = MData[i].m_Data * 100;
                }
                
                if (rDisShortPacketData.GetRQStartIndex() == null) {
                    rDisShortPacketData.SetRQStartIndex(i);
                }
                rDisShortPacketData.AddTail(i, dis);
                RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = rDisShortPacketData.GetData(rDisShortPacketData.GetDataArraySize() - 1);
            }
            else
            {
                RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = undefined;
            }
            
            ///////////////////////
            //장기이평
            ///////////////////////
            if( vDisLPeriod > i )
            {
                this.m_SaveLDataArray[0] = LongMAValue;
                this.m_SaveLDataArray[1] = LongSum;

                Source = MData[i].m_Data;
                LongWeightedSum = LongWeightedSum + Source * (i + 1);
                if(vDisLPeriod === 0)
                    LongMAValue = 0;
                else
                    LongMAValue = LongWeightedSum * 2 / (vDisLPeriod * (vDisLPeriod + 1));

                LongSum = LongSum + Source;

                this.m_SaveLDataArray[2] = LongMAValue;
                this.m_SaveLDataArray[3] = LongSum;
            }
            else
            {
                this.m_SaveLDataArray[0] = LongMAValue;
                this.m_SaveLDataArray[1] = LongSum;
                
                Source = MData[i].m_Data;
                PreSource = MData[i - vDisLPeriod].m_Data;
                LongWeightedSum = LongWeightedSum - LongSum + Source * vDisLPeriod;
                if(vDisLPeriod === 0)
                {
                    LongMAValue = 0;
                }
                else
                {
                    LongMAValue = LongWeightedSum * 2 / (vDisLPeriod * (vDisLPeriod + 1));
                }
                LongSum = LongSum + Source - PreSource;
                
                this.m_SaveLDataArray[2] = LongMAValue;
                this.m_SaveLDataArray[3] = LongSum;
            }
            
            if (i >= vDisLPeriodIndex) 
            {                
                if (LongMAValue !== 0 ) {
                    dis = MData[i].m_Data / LongMAValue * 100;
                } else {
                    dis = MData[i].m_Data * 100;
                }

                if (rDisLongPacketData.GetRQStartIndex() === null) {
                    rDisLongPacketData.SetRQStartIndex(i);
                }
                rDisLongPacketData.AddTail(i, dis);
                RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = rDisLongPacketData.GetData(rDisLongPacketData.GetDataArraySize() - 1);
            }
            else
            {
                RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = undefined;
            }
        }
    }
    return true;
}
CDisparityIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rDisShortPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strDisSPacketName);
    var rDisLongPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strDisLPacketName);
    
    var vDisSPeriod = this.m_VariableArray[0].m_strData;
    var vDisLPeriod = this.m_VariableArray[1].m_strData;    
    var vDisDType = this.m_VariableArray[2].m_strData;
    var vDisMAType = this.m_VariableArray[3].m_strData;    

    var MData = null;
    switch (vDisDType) {
        case 0:
            MData = rInputPacketOData.m_DataArray;
            break;
        case 1:
            MData = rInputPacketHData.m_DataArray;
            break;
        case 2:
            MData = rInputPacketLData.m_DataArray;
            break;
        case 3:
            MData = rInputPacketPData.m_DataArray;
            break;
        case 4:
            MData = rInputPacketHLData.m_DataArray;
            break;
        case 5:
            MData = rInputPacketHLCData.m_DataArray;
            break;
    }

    if (this.m_SaveSDataArray[0] == null) {
        this.m_SaveSDataArray[0] = 0;
        this.m_SaveSDataArray[1] = 0;
    }
    if (this.m_SaveLDataArray[0] == null) {
        this.m_SaveLDataArray[0] = 0;
        this.m_SaveLDataArray[1] = 0;
    }

    var deviationS = 2 / (vDisSPeriod + 1);
    var deviationL = 2 / (vDisLPeriod + 1);
    var avg, dis;

    var nDataLength = MData.length;
    var i = nDataLength - 1;
    var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }

    let vDisSPeriodIndex = vDisSPeriod - 1;
    let vDisLPeriodIndex = vDisLPeriod - 1;

    if(vDisMAType === 0)//단순이평
    {
        if (bAddData) {
            
            this.m_SaveSDataArray[1] = MData[i].m_Data;
            this.m_SaveSDataArray[0] += this.m_SaveSDataArray[1];
            if (i > vDisSPeriod - 1) {
                this.m_SaveSDataArray[0] -= MData[i-vDisSPeriod].m_Data;
            }

            this.m_SaveLDataArray[1] = MData[i].m_Data;
            this.m_SaveLDataArray[0] += this.m_SaveLDataArray[1];
            if (i > vDisLPeriod - 1) {
                this.m_SaveLDataArray[0] -= MData[i-vDisLPeriod].m_Data;
            }    
        } else {
            this.m_SaveSDataArray[0] -= this.m_SaveSDataArray[1];
            this.m_SaveSDataArray[1] = MData[i].m_Data;
            this.m_SaveSDataArray[0] += this.m_SaveSDataArray[1];

            this.m_SaveLDataArray[0] -= this.m_SaveLDataArray[1];
            this.m_SaveLDataArray[1] = MData[i].m_Data;
            this.m_SaveLDataArray[0] += this.m_SaveLDataArray[1];
        }

        if (i >= vDisSPeriodIndex) {
            
            avg = this.m_SaveSDataArray[0] / vDisSPeriod;
            if (avg !== 0 ) {
                dis = this.m_SaveSDataArray[1] / avg * 100;
            } else {
                dis = this.m_SaveSDataArray[1] * 100;
            }
            
            if (rDisShortPacketData.GetRQStartIndex() == null) {
                rDisShortPacketData.SetRQStartIndex(i);
            }
            if (bAddData) {
                rDisShortPacketData.AppendRealData( i,dis);
            } else {
                rDisShortPacketData.UpdateData(i, dis);
            }
            RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = rDisShortPacketData.GetData(rDisShortPacketData.GetDataArraySize() - 1);            
        }
        else
        {
            RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = undefined;
        }


        if (i >= vDisLPeriodIndex) {
     
            avg = this.m_SaveLDataArray[0] / vDisLPeriod;
            if (avg !== 0 ) {
                dis = this.m_SaveLDataArray[1] / avg * 100;
            } else {
                dis = this.m_SaveLDataArray[1] * 100;
            }

            if (rDisLongPacketData.GetRQStartIndex() == null) {
                rDisLongPacketData.SetRQStartIndex(i);
            }
            if (bAddData) {
                rDisLongPacketData.AppendRealData( i,dis);
            } else {
                rDisLongPacketData.UpdateData(i, dis);
            }
            RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = rDisLongPacketData.GetData(rDisLongPacketData.GetDataArraySize() - 1);
        }
        else
        {
            RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = undefined;
        }
    }
    else if(vDisMAType === 1)//지수이평
    {
        var ShortSmoothConst = 2 / ( vDisSPeriod + 1);
        var LongSmoothConst = 2 / ( vDisLPeriod + 1);
        var ShortMAValue = 0, LongMAValue = 0, Source = 0;

        if (bAddData) {

            if(i === 0)
            {
                ShortMAValue = MData[i].m_Data;
                LongMAValue = ShortMAValue;
                this.m_SaveSDataArray[0] = ShortMAValue;
                this.m_SaveSDataArray[1] = ShortMAValue;

                this.m_SaveLDataArray[0] = LongMAValue;
                this.m_SaveLDataArray[1] = LongMAValue;
            }
            else
            {
                //단기이평
                ShortMAValue = this.m_SaveSDataArray[1];
                this.m_SaveSDataArray[0] = ShortMAValue;

                Source = MData[i].m_Data;
                ShortMAValue = ShortMAValue * ( 1 - ShortSmoothConst )  + Source * ShortSmoothConst;
                this.m_SaveSDataArray[1] = ShortMAValue;

                //장기이평
                LongMAValue = this.m_SaveLDataArray[1];
                this.m_SaveLDataArray[0] = LongMAValue;

                Source = MData[i].m_Data;
                LongMAValue = LongMAValue * ( 1 - LongSmoothConst )  + Source * LongSmoothConst;
                this.m_SaveLDataArray[1] = LongMAValue;
            }
        }
        else//업데이트
        {
            if(i === 0)
            {
                ShortMAValue = MData[i].m_Data;                
                this.m_SaveSDataArray[0] = ShortMAValue;
                this.m_SaveSDataArray[1] = ShortMAValue;

                LongMAValue = ShortMAValue;
                this.m_SaveLDataArray[0] = LongMAValue;
                this.m_SaveLDataArray[1] = LongMAValue;
            }
            else
            {
                //단기이평
                ShortMAValue = this.m_SaveSDataArray[0];
                Source = MData[i].m_Data;
                ShortMAValue = ShortMAValue * ( 1 - ShortSmoothConst )  + Source * ShortSmoothConst;
                this.m_SaveSDataArray[1] = ShortMAValue;

                //장기이평
                LongMAValue = this.m_SaveLDataArray[0];
                Source = MData[i].m_Data;
                LongMAValue = LongMAValue * ( 1 - LongSmoothConst )  + Source * LongSmoothConst;
                this.m_SaveLDataArray[1] = LongMAValue;
            }
        }
        
        //단기이평 데이터 셋팅
        if(vDisSPeriodIndex <= i)
        {
            if (ShortMAValue !== 0 ) {
                dis = MData[i].m_Data / ShortMAValue * 100;
            } else {
                dis = MData[i].m_Data * 100;
            }
            
            if (rDisShortPacketData.GetRQStartIndex() == null) {
                rDisShortPacketData.SetRQStartIndex(i);
            }
            if (bAddData) {
                rDisShortPacketData.AppendRealData( i,dis);
            } else {
                rDisShortPacketData.UpdateData(i, dis);
            }
            RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = rDisShortPacketData.GetData(rDisShortPacketData.GetDataArraySize() - 1);
        }
        else
        {
            RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = undefined;
        }

        //장기이평 데이터 셋팅
        if(vDisLPeriodIndex <= i)
        {
            if (LongMAValue !== 0 ) {
                dis = MData[i].m_Data / LongMAValue * 100;
            } else {
                dis = MData[i].m_Data * 100;
            }
            
            if (rDisLongPacketData.GetRQStartIndex() == null) {
                rDisLongPacketData.SetRQStartIndex(i);
            }
            if (bAddData) {
                rDisLongPacketData.AppendRealData( i,dis);
            } else {
                rDisLongPacketData.UpdateData(i, dis);
            }
            RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = rDisLongPacketData.GetData(rDisLongPacketData.GetDataArraySize() - 1);
        }
        else
        {
            RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = undefined;
        }
    }
    else if(vDisMAType === 2)//가중이평
    {
        let ShortMAValue = 0, LongMAValue = 0, ShortWeightedSum = 0, LongWeightedSum = 0, ShortSum = 0, LongSum = 0;
        let Source = 0, PreSource = 0;

        if(bAddData)
        {
            ///////////////////////////
            //단기이평
            ///////////////////////////
            if( 0 < i )
            {
                ShortMAValue = this.m_SaveSDataArray[2];
                ShortSum= this.m_SaveSDataArray[3];

                this.m_SaveSDataArray[0] = ShortMAValue;
                this.m_SaveSDataArray[1] = ShortSum;

                ShortWeightedSum = ShortMAValue / 2 * (vDisSPeriod * (vDisSPeriod + 1));
            }

            if(vDisSPeriod > i)
            {
                Source = MData[i].m_Data;
                ShortWeightedSum = ShortWeightedSum + Source * (i + 1);
                if(vDisSPeriod === 0)
                    ShortMAValue = 0;
                else
                    ShortMAValue = ShortWeightedSum * 2 / (vDisSPeriod * (vDisSPeriod + 1));
                
                ShortSum = ShortSum + Source;
                this.m_SaveSDataArray[2] = ShortMAValue;
                this.m_SaveSDataArray[3] = ShortSum;                
            }
            else
            {
                Source = MData[i].m_Data;
                PreSource = MData[i - vDisSPeriod].m_Data;
                ShortWeightedSum = ShortWeightedSum - ShortSum + Source * vDisSPeriod;
                if(vDisSPeriod === 0)
                    ShortMAValue = 0;
                else
                    ShortMAValue = ShortWeightedSum * 2 / ( vDisSPeriod * (vDisSPeriod + 1));

                ShortSum = ShortSum + Source - PreSource;

                this.m_SaveSDataArray[2] = ShortMAValue;
                this.m_SaveSDataArray[3] = ShortSum;
            }

            ///////////////////////////
            //장기이평
            ///////////////////////////
            if( 0 < i )
            {
                LongMAValue = this.m_SaveLDataArray[2];
                LongSum= this.m_SaveLDataArray[3];

                this.m_SaveLDataArray[0] = LongMAValue;
                this.m_SaveLDataArray[1] = LongSum;

                LongWeightedSum = LongMAValue / 2 * (vDisLPeriod * (vDisLPeriod + 1));
            }

            if(vDisLPeriod > i)
            {
                Source = MData[i].m_Data;
                LongWeightedSum = LongWeightedSum + Source * (i + 1);
                if(vDisLPeriod === 0)
                    LongMAValue = 0;
                else
                    LongMAValue = LongWeightedSum * 2 / (vDisLPeriod * (vDisLPeriod + 1));
                
                LongSum = LongSum + Source;
                this.m_SaveLDataArray[2] = LongMAValue;
                this.m_SaveLDataArray[3] = LongSum;                
            }
            else
            {
                Source = MData[i].m_Data;
                PreSource = MData[i - vDisLPeriod].m_Data;
                LongWeightedSum = LongWeightedSum - LongSum + Source * vDisLPeriod;
                if(vDisLPeriod === 0)
                    LongMAValue = 0;
                else
                    LongMAValue = LongWeightedSum * 2 / ( vDisLPeriod * (vDisLPeriod + 1));

                LongSum = LongSum + Source - PreSource;

                this.m_SaveLDataArray[2] = LongMAValue;
                this.m_SaveLDataArray[3] = LongSum;
            }
        }
        else//업데이트
        {
            ///////////////////////////
            //단기이평
            ///////////////////////////
            if( 0 < i )
            {
                ShortMAValue = this.m_SaveSDataArray[0];
                ShortSum = this.m_SaveSDataArray[1];
                ShortWeightedSum = ShortMAValue / 2 * (vDisSPeriod * (vDisSPeriod + 1));
            }

            if(vDisSPeriod > i)
            {
                Source = MData[i].m_Data;
                ShortWeightedSum = ShortWeightedSum + Source * (i + 1);
                if(vDisSPeriod === 0)
                    ShortMAValue = 0;
                else
                    ShortMAValue = ShortWeightedSum * 2 / ( vDisSPeriod * (vDisSPeriod + 1));
                
                ShortSum = ShortSum + Source;

                this.m_SaveSDataArray[2] = ShortMAValue;
                this.m_SaveSDataArray[3] = ShortSum;
            }
            else
            {
                Source = MData[i].m_Data;
                PreSource = MData[i - vDisSPeriod].m_Data;
                ShortWeightedSum = ShortWeightedSum - ShortSum + Source * vDisSPeriod;
                if(vDisSPeriod === 0)
                    ShortMAValue = 0;
                else
                    ShortMAValue = ShortWeightedSum * 2 / (vDisSPeriod * (vDisSPeriod + 1));
                
                ShortSum = ShortSum + Source - PreSource;

                this.m_SaveSDataArray[2] = ShortMAValue;
                this.m_SaveSDataArray[3] = ShortSum;
            }

            ///////////////////////////
            //장기이평
            ///////////////////////////
            if( 0 < i )
            {
                LongMAValue = this.m_SaveLDataArray[0];
                LongSum = this.m_SaveLDataArray[1];
                LongWeightedSum = LongMAValue / 2 * (vDisLPeriod * (vDisLPeriod + 1));
            }

            if(vDisLPeriod > i)
            {
                Source = MData[i].m_Data;
                LongWeightedSum = LongWeightedSum + Source * (i + 1);
                if(vDisLPeriod === 0)
                    LongMAValue = 0;
                else
                    LongMAValue = LongWeightedSum * 2 / ( vDisLPeriod * (vDisLPeriod + 1));
                
                LongSum = LongSum + Source;

                this.m_SaveLDataArray[2] = LongMAValue;
                this.m_SaveLDataArray[3] = LongSum;
            }
            else
            {
                Source = MData[i].m_Data;
                PreSource = MData[i - vDisLPeriod].m_Data;
                LongWeightedSum = LongWeightedSum - LongSum + Source * vDisLPeriod;
                if(vDisLPeriod === 0)
                    LongMAValue = 0;
                else
                    LongMAValue = LongWeightedSum * 2 / (vDisLPeriod * (vDisLPeriod + 1));
                
                LongSum = LongSum + Source - PreSource;

                this.m_SaveLDataArray[2] = LongMAValue;
                this.m_SaveLDataArray[3] = LongSum;
            }
        }

        //단기이평 데이터 셋팅
        if(vDisSPeriodIndex <= i)
        {
            if (ShortMAValue !== 0 ) {
                dis = MData[i].m_Data / ShortMAValue * 100;
            } else {
                dis = MData[i].m_Data * 100;
            }
            
            if (rDisShortPacketData.GetRQStartIndex() == null) {
                rDisShortPacketData.SetRQStartIndex(i);
            }
            if (bAddData) {
                rDisShortPacketData.AppendRealData( i,dis);
            } else {
                rDisShortPacketData.UpdateData(i, dis);
            }
            RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = rDisShortPacketData.GetData(rDisShortPacketData.GetDataArraySize() - 1);
        }
        else
        {
            RQPacketsItem.m_Packets[rDisShortPacketData.m_nPacketIndex] = undefined;
        }

        //장기이평 데이터 셋팅
        if(vDisLPeriodIndex <= i)
        {
            if (LongMAValue !== 0 ) {
                dis = MData[i].m_Data / LongMAValue * 100;
            } else {
                dis = MData[i].m_Data * 100;
            }
            
            if (rDisLongPacketData.GetRQStartIndex() == null) {
                rDisLongPacketData.SetRQStartIndex(i);
            }
            if (bAddData) {
                rDisLongPacketData.AppendRealData( i,dis);
            } else {
                rDisLongPacketData.UpdateData(i, dis);
            }
            RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = rDisLongPacketData.GetData(rDisLongPacketData.GetDataArraySize() - 1);
        }
        else
        {
            RQPacketsItem.m_Packets[rDisLongPacketData.m_nPacketIndex] = undefined;
        }
    }
    return REALCALC_SUCCESS;
}

//OBV
function COBVIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "OBV 지표";

    //계산결과 담을 패킷생성
    this.m_strOBVPacketName = this.m_strKey + "_OBV_";
    rRQSet.AddNumPacketInfo(this.m_strOBVPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strOBVSPacketName = this.m_strKey + "_OBVS_";
    rRQSet.AddNumPacketInfo(this.m_strOBVSPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var OBVSubGraph = new CIndicatorSubGraph(this);
    OBVSubGraph.m_rRQSet = rRQSet;
    OBVSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    OBVSubGraph.SetPacketData(this.m_strOBVPacketName);
    OBVSubGraph.SetSubGraphName("OBV");
    OBVSubGraph.m_strSubGraphTitle = "OBV";
    this.m_SubGraphArray.push(OBVSubGraph);

    var OBVSSubGraph = new CIndicatorSubGraph(this);
    OBVSSubGraph.m_rRQSet = rRQSet;
    OBVSSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    OBVSSubGraph.SetPacketData(this.m_strOBVSPacketName);
    OBVSSubGraph.SetSubGraphName("Signal");
    OBVSSubGraph.m_strSubGraphTitle = "Signal";
    this.m_SubGraphArray.push(OBVSSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);
    this.AddVariable("SignalPeriod", NUMERIC_TYPE, 9);    // Signal 기간(9)

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 0;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveOBVDataArray = [];  //0: OBV[i-1], 1: OBV[i]
    this.m_SaveOBVSDataArray = []; //0: OBVS[i-1], 1: OBVS[i]

}
COBVIndicator.prototype = new CIndicator();
COBVIndicator.prototype.constructor = COBVIndicator;
COBVIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketVCData = this.m_InputPacketDataArray[6];

    if (rInputPacketPData === undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rOBVPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strOBVPacketName);
    var rOBVSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strOBVSPacketName);    

    rOBVPacketData.InitDataArray();
    rOBVSPacketData.InitDataArray();    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vOBVSPerdiod = this.m_VariableArray[0].m_strData;
    ////////////////////////////////////////////////////////

    var MPData = rInputPacketPData.m_DataArray;
    var MVData = rInputPacketVCData.m_DataArray;
    var deviation = 2/(vOBVSPerdiod+1);

    this.m_SaveOBVDataArray[1] = 0;
    this.m_SaveOBVSDataArray[1] = 0;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;

        if (i < 1) {
            RQPacketsItem.m_Packets[rOBVPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rOBVSPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        //OBV 계산
        this.m_SaveOBVDataArray[0] = this.m_SaveOBVDataArray[1];
        if (MPData[i].m_Data == MPData[i-1].m_Data) {
            this.m_SaveOBVDataArray[1] = this.m_SaveOBVDataArray[0];
        } else if (MPData[i].m_Data > MPData[i-1].m_Data) {
            this.m_SaveOBVDataArray[1] = this.m_SaveOBVDataArray[0] + MVData[i].m_Data;
        } else {
            this.m_SaveOBVDataArray[1] = this.m_SaveOBVDataArray[0] - MVData[i].m_Data;
        }

        //OBV Signal 계산
        this.m_SaveOBVSDataArray[0] = this.m_SaveOBVSDataArray[1];
        this.m_SaveOBVSDataArray[1] = this.m_SaveOBVSDataArray[0] + deviation * (this.m_SaveOBVDataArray[1] - this.m_SaveOBVSDataArray[0]);

        if (rOBVPacketData.GetRQStartIndex() == null)
            rOBVPacketData.SetRQStartIndex(i);
        rOBVPacketData.AddTail(i, this.m_SaveOBVDataArray[1]);
        RQPacketsItem.m_Packets[rOBVPacketData.m_nPacketIndex] = rOBVPacketData.GetData(rOBVPacketData.GetDataArraySize() - 1);

        if (rOBVSPacketData.GetRQStartIndex() === null)
                rOBVSPacketData.SetRQStartIndex(i);
        rOBVSPacketData.AddTail(i, this.m_SaveOBVSDataArray[1]);
        RQPacketsItem.m_Packets[rOBVSPacketData.m_nPacketIndex] = rOBVSPacketData.GetData(rOBVSPacketData.GetDataArraySize() - 1);        
    }

    return true;
}
COBVIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketVCData = this.m_InputPacketDataArray[6];

    if (rInputPacketPData === undefined)
        return REALCALC_FAIL;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rOBVPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strOBVPacketName);
    var rOBVSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strOBVSPacketName);    

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vOBVSPerdiod = this.m_VariableArray[0].m_strData;
    ////////////////////////////////////////////////////////

    var MPData = rInputPacketPData.m_DataArray;
    var MVData = rInputPacketVCData.m_DataArray;
    var deviation = 2/(vOBVSPerdiod+1);

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }

    if (i < 1) {
        RQPacketsItem.m_Packets[rOBVPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rOBVSPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    //OBV 계산
    if (this.m_SaveOBVDataArray[1] == null) {
        this.m_SaveOBVDataArray[1] = 0;
    }

    if (bAddData) {
        this.m_SaveOBVDataArray[0] = this.m_SaveOBVDataArray[1];
    }

    if (MPData[i].m_Data == MPData[i-1].m_Data) {
        this.m_SaveOBVDataArray[1] = this.m_SaveOBVDataArray[0];
    } else if (MPData[i].m_Data > MPData[i-1].m_Data) {
        this.m_SaveOBVDataArray[1] = this.m_SaveOBVDataArray[0] + MVData[i].m_Data;
    } else {
        this.m_SaveOBVDataArray[1] = this.m_SaveOBVDataArray[0] - MVData[i].m_Data;
    }

    //OBV Signal 계산
    if (this.m_SaveOBVSDataArray[1] == null) {
        this.m_SaveOBVSDataArray[1] = 0;
    }

    if (bAddData) {
        this.m_SaveOBVSDataArray[0] = this.m_SaveOBVSDataArray[1];
    }
    
    this.m_SaveOBVSDataArray[1] = this.m_SaveOBVSDataArray[0] + deviation * (this.m_SaveOBVDataArray[1] - this.m_SaveOBVSDataArray[0]);

    if (rOBVPacketData.GetRQStartIndex() == null) {
        rOBVPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rOBVPacketData.AppendRealData( i,this.m_SaveOBVDataArray[1]);
    } else {
        rOBVPacketData.UpdateData(i, this.m_SaveOBVDataArray[1]);
    }
    RQPacketsItem.m_Packets[rOBVPacketData.m_nPacketIndex] = rOBVPacketData.GetData(rOBVPacketData.GetDataArraySize() - 1);
    

    if (rOBVSPacketData.GetRQStartIndex() == null) {
        rOBVSPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rOBVSPacketData.AppendRealData( i,this.m_SaveOBVSDataArray[1]);
    } else {
        rOBVSPacketData.UpdateData(i, this.m_SaveOBVSDataArray[1]);
    }
    RQPacketsItem.m_Packets[rOBVSPacketData.m_nPacketIndex] = rOBVSPacketData.GetData(rOBVSPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//Pivot
function CPIVOTIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_strGroup = "PRICE";

    this.m_nAddType = OVERLAY_TYPE;
    this.m_strOverlayGraphName = "_PRICE_";

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "PIVOT 지표";

    this.m_nDigit = rRQSet.m_nPriceDigit;

    //계산결과 담을 패킷생성
    this.m_strPIVOTR3PacketName = this.m_strKey + "_PIVOTR3_";
    rRQSet.AddNumPacketInfo(this.m_strPIVOTR3PacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strPIVOTR2PacketName = this.m_strKey + "_PIVOTR2_";
    rRQSet.AddNumPacketInfo(this.m_strPIVOTR2PacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strPIVOTR1PacketName = this.m_strKey + "_PIVOTR1_";
    rRQSet.AddNumPacketInfo(this.m_strPIVOTR1PacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strPIVOTPacketName = this.m_strKey + "PIVOT_";
    rRQSet.AddNumPacketInfo(this.m_strPIVOTPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strPIVOTS1PacketName = this.m_strKey + "_PIVOTS1_";
    rRQSet.AddNumPacketInfo(this.m_strPIVOTS1PacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strPIVOTS2PacketName = this.m_strKey + "_PIVOTS2_";
    rRQSet.AddNumPacketInfo(this.m_strPIVOTS2PacketName, -1, INDICATOR_PACKET_USE_TYPE, 10,null, this.m_nDigit);

    this.m_strPIVOTS3PacketName = this.m_strKey + "_PIVOTS3_";
    rRQSet.AddNumPacketInfo(this.m_strPIVOTS3PacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var PIVOTR3SubGraph = new CIndicatorSubGraph(this);
    PIVOTR3SubGraph.m_rRQSet = rRQSet;
    PIVOTR3SubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    PIVOTR3SubGraph.SetPacketData(this.m_strPIVOTR3PacketName);
    PIVOTR3SubGraph.SetSubGraphName("R3");
    PIVOTR3SubGraph.m_strSubGraphTitle = "R3"; //E_High
    PIVOTR3SubGraph.m_bShow = false;
    this.m_SubGraphArray.push(PIVOTR3SubGraph);

    var PIVOTR2SubGraph = new CIndicatorSubGraph(this);
    PIVOTR2SubGraph.m_rRQSet = rRQSet;
    PIVOTR2SubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    PIVOTR2SubGraph.SetPacketData(this.m_strPIVOTR2PacketName);
    PIVOTR2SubGraph.SetSubGraphName("R2");
    PIVOTR2SubGraph.m_strSubGraphTitle = "R2"; //E_High
    this.m_SubGraphArray.push(PIVOTR2SubGraph);

    var PIVOTR1SubGraph = new CIndicatorSubGraph(this);
    PIVOTR1SubGraph.m_rRQSet = rRQSet;
    PIVOTR1SubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    PIVOTR1SubGraph.SetPacketData(this.m_strPIVOTR1PacketName);
    PIVOTR1SubGraph.SetSubGraphName("R1");
    PIVOTR1SubGraph.m_strSubGraphTitle = "R1"; //E_High
    this.m_SubGraphArray.push(PIVOTR1SubGraph);

    var PIVOTSubGraph = new CIndicatorSubGraph(this);
    PIVOTSubGraph.m_rRQSet = rRQSet;
    PIVOTSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    PIVOTSubGraph.SetPacketData(this.m_strPIVOTPacketName);
    PIVOTSubGraph.SetSubGraphName("PIVOT");
    PIVOTSubGraph.m_strSubGraphTitle = "PIVOT"; //E_High
    this.m_SubGraphArray.push(PIVOTSubGraph);

    var PIVOTS1SubGraph = new CIndicatorSubGraph(this);
    PIVOTS1SubGraph.m_rRQSet = rRQSet;
    PIVOTS1SubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    PIVOTS1SubGraph.SetPacketData(this.m_strPIVOTS1PacketName);
    PIVOTS1SubGraph.SetSubGraphName("S1");
    PIVOTS1SubGraph.m_strSubGraphTitle = "S1"; //E_High
    this.m_SubGraphArray.push(PIVOTS1SubGraph);

    var PIVOTS2SubGraph = new CIndicatorSubGraph(this);
    PIVOTS2SubGraph.m_rRQSet = rRQSet;
    PIVOTS2SubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    PIVOTS2SubGraph.SetPacketData(this.m_strPIVOTS2PacketName);
    PIVOTS2SubGraph.SetSubGraphName("S2");
    PIVOTS2SubGraph.m_strSubGraphTitle = "S2"; //E_High
    this.m_SubGraphArray.push(PIVOTS2SubGraph);

    var PIVOTS3SubGraph = new CIndicatorSubGraph(this);
    PIVOTS3SubGraph.m_rRQSet = rRQSet;
    PIVOTS3SubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    PIVOTS3SubGraph.SetPacketData(this.m_strPIVOTS3PacketName);
    PIVOTS3SubGraph.SetSubGraphName("S3");
    PIVOTS3SubGraph.m_strSubGraphTitle = "S3"; //E_High
    PIVOTS3SubGraph.m_bShow = false;
    this.m_SubGraphArray.push(PIVOTS3SubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    /*
    this.AddVariable("ViewPIVOT", NUMERIC_TYPE, true);    // PIVOT
    this.AddVariable("ViewPIVOTR1", NUMERIC_TYPE, true);  // PIVOTS1
    this.AddVariable("ViewPIVOTS1", NUMERIC_TYPE, true);  // PIVOTR1
    this.AddVariable("ViewPIVOTR2", NUMERIC_TYPE, true);  // PIVOTS2
    this.AddVariable("ViewPIVOTS2", NUMERIC_TYPE, true);  // PIVOTR2
    this.AddVariable("ViewPIVOTR3", NUMERIC_TYPE, false); // PIVOTS3
    this.AddVariable("ViewPIVOTS3", NUMERIC_TYPE, false); // PIVOTR3
    */

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
}
CPIVOTIndicator.prototype = new CIndicator();
CPIVOTIndicator.prototype.constructor = CPIVOTIndicator;
CPIVOTIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorParameter = this.m_rGlobalProperty.m_bShowIndicatorParameter;
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    var nLength = this.m_SubGraphArray.length;
    let rSubGraph;
    let i, rShowGraphArray = [];
    let strTitle, strLastestData, rLastestPacketItemData = null;
    for(i = 0 ; i < nLength ; i++ )
    {
        rSubGraph = this.m_SubGraphArray[i];
        if(rSubGraph.m_bShow)
            rShowGraphArray[ rShowGraphArray.length ] = rSubGraph;
        else        
            rSubGraph.HideTitle();
    }

    nLength = rShowGraphArray.length;
    if(nLength <= 0)//Show상태 서브그래프가 없는 경우
    {
        rSubGraph = this.m_SubGraphArray[0];
        if (bShowIndicatorName === true) {
            strTitle = this.m_strTitle;
            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
        else
            this.HideTitle();            
    }
    else
    {
        for( i = 0; i < nLength; i++ )
        {
            rSubGraph = rShowGraphArray[i];
            
            if (bShowIndicatorName === true)
                strTitle = rSubGraph.m_strSubGraphTitle;                
            else
                strTitle = "";
            
            if (bShowIndicatorValue === true) {
    
                rLastestPacketItemData = rSubGraph.m_rPacketData.GetLastestPacketItemData();
                if (rLastestPacketItemData !== null) {
                    if (rLastestPacketItemData.GetPacketType() === NUMERIC_TYPE) {
                        strLastestData = ConvertNumToDigitText(rLastestPacketItemData.m_Data, rLastestPacketItemData.m_rPacketData.m_nDec, 1, rLastestPacketItemData.m_rPacketData.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                        strTitle += "(" + strLastestData + ")";
                    }
                    else
                        strTitle += "(" + rLastestPacketItemData.m_Data + ")";
                }
            }
            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }        
    }
}
CPIVOTIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketHLCData == undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rPIVOTPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTPacketName);
    var rPIVOTR1PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTR1PacketName);
    var rPIVOTS1PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTS1PacketName);
    var rPIVOTR2PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTR2PacketName);
    var rPIVOTS2PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTS2PacketName);
    var rPIVOTR3PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTR3PacketName);
    var rPIVOTS3PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTS3PacketName);

    rPIVOTPacketData.InitDataArray();
    rPIVOTR1PacketData.InitDataArray();
    rPIVOTS1PacketData.InitDataArray();
    rPIVOTR2PacketData.InitDataArray();
    rPIVOTS2PacketData.InitDataArray();
    rPIVOTR3PacketData.InitDataArray();
    rPIVOTS3PacketData.InitDataArray();

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    /*
    var vPIVOTView = this.m_VariableArray[0].m_strData;
    var vPIVOTR1View = this.m_VariableArray[1].m_strData;
    var vPIVOTS1View = this.m_VariableArray[2].m_strData;
    var vPIVOTR2View = this.m_VariableArray[3].m_strData;
    var vPIVOTS2View = this.m_VariableArray[4].m_strData;
    var vPIVOTR3View = this.m_VariableArray[5].m_strData;
    var vPIVOTS3View = this.m_VariableArray[6].m_strData;
    */
    ////////////////////////////////////////////////////////

    var nDataLength = rInputPacketHLCData.m_DataArray.length;
    var low, high;
    var pivot, pivotR1, pivotR2, pivotR3, pivotS1, pivotS2, pivotS3;

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MHLCData = rInputPacketHLCData.m_DataArray;

    for (var i = 0; i < nDataLength; i++) {
        var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined)
            continue;

        if (i < 1)
        {
            RQPacketsItem.m_Packets[rPIVOTPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rPIVOTR1PacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rPIVOTS1PacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rPIVOTR2PacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rPIVOTS2PacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rPIVOTR3PacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rPIVOTS3PacketData.m_nPacketIndex] = undefined;
            continue;
        }
        /****PIVOT 계산 Start *************************/
        pivot = MHLCData[i-1].m_Data;
        low = MLData[i-1].m_Data;
        high = MHData[i-1].m_Data;
        
        pivotR3 = high + 2 * (pivot - low);
        pivotR2 = pivot + high - low;
        pivotR1 = 2 * pivot - low;
        pivotS1 = 2 * pivot - high;
        pivotS2 = pivot - high + low;
        pivotS3 = low - 2 * (high - pivot);

        //if (vPIVOTView) {
            if (rPIVOTPacketData.GetRQStartIndex() == null) {
                rPIVOTPacketData.SetRQStartIndex(i);
            }
            rPIVOTPacketData.AddTail(i, pivot);
            RQPacketsItem.m_Packets[rPIVOTPacketData.m_nPacketIndex] = rPIVOTPacketData.GetData(rPIVOTPacketData.GetDataArraySize() - 1);
        //}

        //if (vPIVOTR1View) {
            if (rPIVOTR1PacketData.GetRQStartIndex() == null) {
                rPIVOTR1PacketData.SetRQStartIndex(i);
            }
            rPIVOTR1PacketData.AddTail(i, pivotR1);
            RQPacketsItem.m_Packets[rPIVOTR1PacketData.m_nPacketIndex] = rPIVOTR1PacketData.GetData(rPIVOTR1PacketData.GetDataArraySize() - 1);
        //}

        //if (vPIVOTS1View) {
            if (rPIVOTS1PacketData.GetRQStartIndex() == null) {
                rPIVOTS1PacketData.SetRQStartIndex(i);
            }
            rPIVOTS1PacketData.AddTail(i, pivotS1);
            RQPacketsItem.m_Packets[rPIVOTS1PacketData.m_nPacketIndex] = rPIVOTS1PacketData.GetData(rPIVOTS1PacketData.GetDataArraySize() - 1);
        //}

        //if (vPIVOTR2View) {
            if (rPIVOTR2PacketData.GetRQStartIndex() == null) {
                rPIVOTR2PacketData.SetRQStartIndex(i);
            }
            rPIVOTR2PacketData.AddTail(i, pivotR2);
            RQPacketsItem.m_Packets[rPIVOTR2PacketData.m_nPacketIndex] = rPIVOTR2PacketData.GetData(rPIVOTR2PacketData.GetDataArraySize() - 1);
        //}

        //if (vPIVOTS2View) {
            if (rPIVOTS2PacketData.GetRQStartIndex() == null) {
                rPIVOTS2PacketData.SetRQStartIndex(i);
            }
            rPIVOTS2PacketData.AddTail(i, pivotS2);
            RQPacketsItem.m_Packets[rPIVOTS2PacketData.m_nPacketIndex] = rPIVOTS2PacketData.GetData(rPIVOTS2PacketData.GetDataArraySize() - 1);
        //}

        //if (vPIVOTR3View) {
            if (rPIVOTR3PacketData.GetRQStartIndex() == null) {
                rPIVOTR3PacketData.SetRQStartIndex(i);
            }
            rPIVOTR3PacketData.AddTail(i, pivotR3);
            RQPacketsItem.m_Packets[rPIVOTR3PacketData.m_nPacketIndex] = rPIVOTR3PacketData.GetData(rPIVOTR3PacketData.GetDataArraySize() - 1);
        //}

        //if (vPIVOTS3View) {
            if (rPIVOTS3PacketData.GetRQStartIndex() == null) {
                rPIVOTS3PacketData.SetRQStartIndex(i);
            }
            rPIVOTS3PacketData.AddTail(i, pivotS3);
            RQPacketsItem.m_Packets[rPIVOTS3PacketData.m_nPacketIndex] = rPIVOTS3PacketData.GetData(rPIVOTS3PacketData.GetDataArraySize() - 1);
        //}
    }

    return true;
}
CPIVOTIndicator.prototype.RealCalc = function (bAddData) {
    //pivot은 전봉 데이터를 계산하여 현재지표로 보여주기 때문에 update는 없음
    if( bAddData == false )
        return REALCALC_FAIL;

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketHLCData == undefined)
        return REALCALC_FAIL;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rPIVOTPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTPacketName);
    var rPIVOTR1PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTR1PacketName);
    var rPIVOTS1PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTS1PacketName);
    var rPIVOTR2PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTR2PacketName);
    var rPIVOTS2PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTS2PacketName);
    var rPIVOTR3PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTR3PacketName);
    var rPIVOTS3PacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPIVOTS3PacketName);

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    /*
    var vPIVOTView = this.m_VariableArray[0].m_strData;
    var vPIVOTR1View = this.m_VariableArray[1].m_strData;
    var vPIVOTS1View = this.m_VariableArray[2].m_strData;
    var vPIVOTR2View = this.m_VariableArray[3].m_strData;
    var vPIVOTS2View = this.m_VariableArray[4].m_strData;
    var vPIVOTR3View = this.m_VariableArray[5].m_strData;
    var vPIVOTS3View = this.m_VariableArray[6].m_strData;
    */
    ////////////////////////////////////////////////////////

    var low, high;
    var pivot, pivotR1, pivotR2, pivotR3, pivotS1, pivotS2, pivotS3;

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MHLCData = rInputPacketHLCData.m_DataArray;

    var nDataLength = rInputPacketHLCData.m_DataArray.length;
    var i = nDataLength - 1;
    var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
        return REALCALC_FAIL;

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem == undefined)
        return REALCALC_FAIL;

    if (i < 1)
    {
        RQPacketsItem.m_Packets[rPIVOTPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rPIVOTR1PacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rPIVOTS1PacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rPIVOTR2PacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rPIVOTS2PacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rPIVOTR3PacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rPIVOTS3PacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    
    /****PIVOT 계산 Start *************************/
    pivot = MHLCData[i-1].m_Data;
    low = MLData[i-1].m_Data;
    high = MHData[i-1].m_Data;
    
    pivotR3 = high + 2 * (pivot - low);
    pivotR2 = pivot + high - low;
    pivotR1 = 2 * pivot - low;
    pivotS1 = 2 * pivot - high;
    pivotS2 = pivot - high + low;
    pivotS3 = low - 2 * (high - pivot);

    //if (vPIVOTView) {
        if (rPIVOTPacketData.GetRQStartIndex() == null) {
            rPIVOTPacketData.SetRQStartIndex(i);
        }
        rPIVOTPacketData.AppendRealData( i,pivot);
        RQPacketsItem.m_Packets[rPIVOTPacketData.m_nPacketIndex] = rPIVOTPacketData.GetData(rPIVOTPacketData.GetDataArraySize() - 1);
    //}

    //if (vPIVOTR1View) {
        if (rPIVOTR1PacketData.GetRQStartIndex() == null) {
            rPIVOTR1PacketData.SetRQStartIndex(i);
        }
        rPIVOTR1PacketData.AppendRealData( i,pivotR1);
        RQPacketsItem.m_Packets[rPIVOTR1PacketData.m_nPacketIndex] = rPIVOTR1PacketData.GetData(rPIVOTR1PacketData.GetDataArraySize() - 1);
    //}

    //if (vPIVOTS1View) {
        if (rPIVOTS1PacketData.GetRQStartIndex() == null) {
            rPIVOTS1PacketData.SetRQStartIndex(i);
        }
        rPIVOTS1PacketData.AppendRealData( i,pivotS1);
        RQPacketsItem.m_Packets[rPIVOTS1PacketData.m_nPacketIndex] = rPIVOTS1PacketData.GetData(rPIVOTS1PacketData.GetDataArraySize() - 1);
    //}

    //if (vPIVOTR2View) {
        if (rPIVOTR2PacketData.GetRQStartIndex() == null) {
            rPIVOTR2PacketData.SetRQStartIndex(i);
        }
        rPIVOTR2PacketData.AppendRealData( i,pivotR2);
        RQPacketsItem.m_Packets[rPIVOTR2PacketData.m_nPacketIndex] = rPIVOTR2PacketData.GetData(rPIVOTR2PacketData.GetDataArraySize() - 1);
    //}

    //if (vPIVOTS2View) {
        if (rPIVOTS2PacketData.GetRQStartIndex() == null) {
            rPIVOTS2PacketData.SetRQStartIndex(i);
        }
        rPIVOTS2PacketData.AppendRealData( i,pivotS2);
        RQPacketsItem.m_Packets[rPIVOTS2PacketData.m_nPacketIndex] = rPIVOTS2PacketData.GetData(rPIVOTS2PacketData.GetDataArraySize() - 1);
    //}

    //if (vPIVOTR3View) {
        if (rPIVOTR3PacketData.GetRQStartIndex() == null) {
            rPIVOTR3PacketData.SetRQStartIndex(i);
        }
        rPIVOTR3PacketData.AppendRealData( i,pivotR3);
        RQPacketsItem.m_Packets[rPIVOTR3PacketData.m_nPacketIndex] = rPIVOTR3PacketData.GetData(rPIVOTR3PacketData.GetDataArraySize() - 1);
    //}

    //if (vPIVOTS3View) {
        if (rPIVOTS3PacketData.GetRQStartIndex() == null) {
            rPIVOTS3PacketData.SetRQStartIndex(i);
        }
        rPIVOTS3PacketData.AppendRealData( i,pivotS3);
        RQPacketsItem.m_Packets[rPIVOTS3PacketData.m_nPacketIndex] = rPIVOTS3PacketData.GetData(rPIVOTS3PacketData.GetDataArraySize() - 1);
    //}

    return REALCALC_SUCCESS;
}

//ROC
function CROCIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "ROC 지표";

    //계산결과 담을 패킷생성
    this.m_strROCPacketName = this.m_strKey + "_ROC_";
    rRQSet.AddNumPacketInfo(this.m_strROCPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var ROCSubGraph = new CIndicatorSubGraph(this);
    ROCSubGraph.m_rRQSet = rRQSet;
    ROCSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    ROCSubGraph.SetPacketData(this.m_strROCPacketName);
    ROCSubGraph.SetSubGraphName("ROC");
    ROCSubGraph.m_strSubGraphTitle = "ROC";
    this.m_SubGraphArray.push(ROCSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 10);      // 기간(10)

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 100;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
}
CROCIndicator.prototype = new CIndicator();
CROCIndicator.prototype.constructor = CROCIndicator;
CROCIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketPData = this.m_InputPacketDataArray[3];
    if (rInputPacketPData === undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rROCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strROCPacketName);

    rROCPacketData.InitDataArray();

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vROCPerdiod = this.m_VariableArray[0].m_strData;
    
    ////////////////////////////////////////////////////////
    var MData = rInputPacketPData.m_DataArray;
    var roc;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;

        if (i < vROCPerdiod) {
            RQPacketsItem.m_Packets[rROCPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        //ROC 계산
        if( MData[i-vROCPerdiod].m_Data === 0 )
            roc = 0;
        else
            roc = MData[i].m_Data / MData[i-vROCPerdiod].m_Data * 100;
        
        if (rROCPacketData.GetRQStartIndex() === null) {
            rROCPacketData.SetRQStartIndex(i);
        }
        rROCPacketData.AddTail(i, roc);
        RQPacketsItem.m_Packets[rROCPacketData.m_nPacketIndex] = rROCPacketData.GetData(rROCPacketData.GetDataArraySize() - 1);        
    }

    return true;
}
CROCIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketPData = this.m_InputPacketDataArray[3];
    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rROCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strROCPacketName);
    
    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vROCPerdiod = this.m_VariableArray[0].m_strData;
    
    ////////////////////////////////////////////////////////
    var MData = rInputPacketPData.m_DataArray;
    var roc;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }

    if (i < vROCPerdiod) {
        RQPacketsItem.m_Packets[rROCPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    //ROC 계산
    if( MData[i-vROCPerdiod].m_Data === 0 )
        roc = 0;
    else
        roc = MData[i].m_Data / MData[i-vROCPerdiod].m_Data * 100;
    
    if (rROCPacketData.GetRQStartIndex() === null) {
        rROCPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rROCPacketData.AppendRealData( i,roc);
    } else {
        rROCPacketData.UpdateData(i, roc);
    }
    RQPacketsItem.m_Packets[rROCPacketData.m_nPacketIndex] = rROCPacketData.GetData(rROCPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//심리도
function CPSYCOIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "심리도 지표";

    //계산결과 담을 패킷생성
    this.m_strPSYCOPacketName = this.m_strKey + "_PSYCO_";
    rRQSet.AddNumPacketInfo(this.m_strPSYCOPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    
    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var PSYCOSubGraph = new CIndicatorSubGraph(this);
    PSYCOSubGraph.m_rRQSet = rRQSet;
    PSYCOSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    PSYCOSubGraph.SetPacketData(this.m_strPSYCOPacketName);
    PSYCOSubGraph.SetSubGraphName("PSYCO");
    PSYCOSubGraph.m_strSubGraphTitle = "심리도"; //E_High
    this.m_SubGraphArray.push(PSYCOSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 10);          // 기간(10)

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 25;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;
    BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 75;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
    this.m_SaveDataArray = [];
}
CPSYCOIndicator.prototype = new CIndicator();
CPSYCOIndicator.prototype.constructor = CPSYCOIndicator;
CPSYCOIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketPData = this.m_InputPacketDataArray[3];
    if (rInputPacketPData === undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rPSYCOPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPSYCOPacketName);
    
    rPSYCOPacketData.InitDataArray();
    
    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vPSYCOPeriod = this.m_VariableArray[0].m_strData;
    ////////////////////////////////////////////////////////
    
    var psyco;

    /****PSYCO 계산 Start *************************/
    var MData = rInputPacketPData.m_DataArray;

    //realcalc 계산속도 향상
    this.m_SaveDataArray[0] = 0;
    this.m_SaveDataArray[1] = 0;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;

        if (i < 1) {
            RQPacketsItem.m_Packets[rPSYCOPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if (MData[i].m_Data > MData[i-1].m_Data) {
            this.m_SaveDataArray[0]++;
            this.m_SaveDataArray[1] = 1;
        } else {
            this.m_SaveDataArray[1] = 0;
        }
        if (i > vPSYCOPeriod) {
            if (MData[i - vPSYCOPeriod].m_Data > MData[i - vPSYCOPeriod - 1].m_Data) {
                this.m_SaveDataArray[0]--;
            }
        }

        if( i < vPSYCOPeriod ) {
            RQPacketsItem.m_Packets[rPSYCOPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if( vPSYCOPeriod === 0 )
            psyco = 0;
        else
            psyco = this.m_SaveDataArray[0] / vPSYCOPeriod * 100;
        
        if (rPSYCOPacketData.GetRQStartIndex() == null) {
            rPSYCOPacketData.SetRQStartIndex(i);
        }
        rPSYCOPacketData.AddTail(i, psyco);
        RQPacketsItem.m_Packets[rPSYCOPacketData.m_nPacketIndex] = rPSYCOPacketData.GetData(rPSYCOPacketData.GetDataArraySize() - 1);        
    }

    return true;
}
CPSYCOIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketPData = this.m_InputPacketDataArray[3];
    if (rInputPacketPData === undefined)
        return REALCALC_FAIL;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rPSYCOPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPSYCOPacketName);
    
    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vPSYCOPeriod = this.m_VariableArray[0].m_strData;    
    ////////////////////////////////////////////////////////
    
    var psyco;

    /****PSYCO 계산 Start *************************/
    var MData = rInputPacketPData.m_DataArray;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var i = nDataLength - 1;
    var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
        return REALCALC_FAIL;

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined)
        return REALCALC_FAIL;

    if (i < 1) {
        RQPacketsItem.m_Packets[rPSYCOPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (bAddData) {
        if (MData[i].m_Data > MData[i-1].m_Data) {
            this.m_SaveDataArray[0]++;
            this.m_SaveDataArray[1] = 1;
        } else {
            this.m_SaveDataArray[1] = 0;
        }
        if (i > vPSYCOPeriod) {
            if (MData[i - vPSYCOPeriod].m_Data > MData[i - vPSYCOPeriod - 1].m_Data) {
                this.m_SaveDataArray[0]--;
            }
        }
    } else {
        this.m_SaveDataArray[0] -= this.m_SaveDataArray[1];
        if (MData[i].m_Data > MData[i-1].m_Data) {
            this.m_SaveDataArray[0]++;
            this.m_SaveDataArray[1] = 1;
        } else {
            this.m_SaveDataArray[1] = 0;
        }
    }

    if( i < vPSYCOPeriod ) {
        RQPacketsItem.m_Packets[rPSYCOPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if( vPSYCOPeriod === 0 )
        psyco = 0;
    else
        psyco = this.m_SaveDataArray[0] / vPSYCOPeriod * 100;

    if (rPSYCOPacketData.GetRQStartIndex() == null) {
        rPSYCOPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rPSYCOPacketData.AppendRealData( i,psyco);
    } else {
        rPSYCOPacketData.UpdateData(i, psyco);
    }
    RQPacketsItem.m_Packets[rPSYCOPacketData.m_nPacketIndex] = rPSYCOPacketData.GetData(rPSYCOPacketData.GetDataArraySize() - 1);

    return REALCALC_SUCCESS;
}

//AB Ratio
function CABRatioIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "AB Ratio 지표";

    //계산결과 담을 패킷생성
    this.m_strARPacketName = this.m_strKey + "_AR_";
    rRQSet.AddNumPacketInfo(this.m_strARPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strBRPacketName = this.m_strKey + "_BR_";
    rRQSet.AddNumPacketInfo(this.m_strBRPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var ARSubGraph = new CIndicatorSubGraph(this);
    ARSubGraph.m_rRQSet = rRQSet;
    ARSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    ARSubGraph.SetPacketData(this.m_strARPacketName);
    ARSubGraph.SetSubGraphName("AR");
    ARSubGraph.m_strSubGraphTitle = "AR"; //E_High
    this.m_SubGraphArray.push(ARSubGraph);

    var BRSubGraph = new CIndicatorSubGraph(this);
    BRSubGraph.m_rRQSet = rRQSet;
    BRSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    BRSubGraph.SetPacketData(this.m_strBRPacketName);
    BRSubGraph.SetSubGraphName("BR");
    BRSubGraph.m_strSubGraphTitle = "BR";
    this.m_SubGraphArray.push(BRSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("ARPeriod", NUMERIC_TYPE, 26);  // AR 기간
    this.AddVariable("BRPeriod", NUMERIC_TYPE, 26);  // BR 기간
    
    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 100;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveHODataArray = [];
    this.m_SaveOLDataArray = [];
    this.m_SaveHCDataArray = [];
    this.m_SaveCLDataArray = [];
}
CABRatioIndicator.prototype = new CIndicator();
CABRatioIndicator.prototype.constructor = CABRatioIndicator;
CABRatioIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rARPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strARPacketName);
    var rBRPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strBRPacketName);    

    rARPacketData.InitDataArray();
    rBRPacketData.InitDataArray();    

    var vARPeriod = this.m_VariableArray[0].m_strData;
    var vBRPeriod = this.m_VariableArray[1].m_strData;

    var MOData = rInputPacketOData.m_DataArray;
    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var ar, br;

    this.m_SaveHODataArray[0] = 0;
    this.m_SaveOLDataArray[0] = 0;
    this.m_SaveHCDataArray[0] = 0;
    this.m_SaveCLDataArray[0] = 0;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;
        
        this.m_SaveHODataArray[1] = MHData[i].m_Data - MOData[i].m_Data;
        this.m_SaveHODataArray[0] += this.m_SaveHODataArray[1];
        this.m_SaveOLDataArray[1] = MOData[i].m_Data - MLData[i].m_Data;
        this.m_SaveOLDataArray[0] += this.m_SaveOLDataArray[1];
        if (i > vARPeriod - 1) {
            this.m_SaveHODataArray[0] -= (MHData[i-vARPeriod].m_Data - MOData[i-vARPeriod].m_Data);
            this.m_SaveOLDataArray[0] -= (MOData[i-vARPeriod].m_Data - MLData[i-vARPeriod].m_Data);
        }
    
        if (i >= vARPeriod - 1 && i >= vBRPeriod) {
            if (this.m_SaveOLDataArray[0] !== 0) {
                ar = this.m_SaveHODataArray[0]*100/this.m_SaveOLDataArray[0];
            } else {
                ar = 100;
            }
    
            if (rARPacketData.GetRQStartIndex() === null) {
                rARPacketData.SetRQStartIndex(i);
            }
            rARPacketData.AddTail(i, ar);
            RQPacketsItem.m_Packets[rARPacketData.m_nPacketIndex] = rARPacketData.GetData(rARPacketData.GetDataArraySize() - 1);
        }
        else
        {
            RQPacketsItem.m_Packets[rARPacketData.m_nPacketIndex] = undefined;
        }
        if( i < 1 ) {
            RQPacketsItem.m_Packets[rBRPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        this.m_SaveHCDataArray[1] = MHData[i].m_Data - MPData[i-1].m_Data;
        this.m_SaveHCDataArray[0] += this.m_SaveHCDataArray[1];
        this.m_SaveCLDataArray[1] = MPData[i-1].m_Data - MLData[i].m_Data;
        this.m_SaveCLDataArray[0] += this.m_SaveCLDataArray[1];
        if (i > vBRPeriod) {
            this.m_SaveHCDataArray[0] -= (MHData[i-vBRPeriod].m_Data - MPData[i-vBRPeriod-1].m_Data);
            this.m_SaveCLDataArray[0] -= (MPData[i-vBRPeriod-1].m_Data - MLData[i-vBRPeriod].m_Data);
        }

        if (i >= vARPeriod - 1 && i >= vBRPeriod) {
            if (this.m_SaveCLDataArray[0] !== 0) {
                br = this.m_SaveHCDataArray[0]*100/this.m_SaveCLDataArray[0];
            } else {
                br = 100;
            }
    
            if (rBRPacketData.GetRQStartIndex() === null) {
                rBRPacketData.SetRQStartIndex(i);
            }
            rBRPacketData.AddTail(i, br);
            RQPacketsItem.m_Packets[rBRPacketData.m_nPacketIndex] = rBRPacketData.GetData(rBRPacketData.GetDataArraySize() - 1);
        } 
        else
        {
            RQPacketsItem.m_Packets[rBRPacketData.m_nPacketIndex] = undefined;  
        }       
    }

    return true;
}
CABRatioIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rARPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strARPacketName);
    var rBRPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strBRPacketName);    

    var vARPeriod = this.m_VariableArray[0].m_strData;
    var vBRPeriod = this.m_VariableArray[1].m_strData;    

    var MOData = rInputPacketOData.m_DataArray;
    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var ar, br;

    if( this.m_SaveHODataArray[0] === null ) {
        this.m_SaveHODataArray[0] = 0;
    }
    if( this.m_SaveOLDataArray[0] === null ) {
        this.m_SaveOLDataArray[0] = 0;
    }
    if( this.m_SaveHCDataArray[0] === null ) {
        this.m_SaveHCDataArray[0] = 0;
    }
    if( this.m_SaveCLDataArray[0] === null ) {
        this.m_SaveCLDataArray[0] = 0;
    }

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var i = nDataLength - 1;

    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
        return REALCALC_FAIL;

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined)
        return REALCALC_FAIL;

    if (bAddData) {//add
        //AR        
        this.m_SaveHODataArray[1] = MHData[i].m_Data - MOData[i].m_Data;
        this.m_SaveHODataArray[0] += this.m_SaveHODataArray[1];
        this.m_SaveOLDataArray[1] = MOData[i].m_Data - MLData[i].m_Data;
        this.m_SaveOLDataArray[0] += this.m_SaveOLDataArray[1];
        if (i > vARPeriod - 1) {
            this.m_SaveHODataArray[0] -= (MHData[i-vARPeriod].m_Data - MOData[i-vARPeriod].m_Data);
            this.m_SaveOLDataArray[0] -= (MOData[i-vARPeriod].m_Data - MLData[i-vARPeriod].m_Data);
        }
    
        if (i >= vARPeriod - 1 && i >= vBRPeriod) {
            if (this.m_SaveOLDataArray[0] !== 0) {
                ar = this.m_SaveHODataArray[0]*100/this.m_SaveOLDataArray[0];
            } else {
                ar = 100;
            }
    
            if (rARPacketData.GetRQStartIndex() === null) {
                rARPacketData.SetRQStartIndex(i);
            }
            rARPacketData.AppendRealData( i,ar);
            RQPacketsItem.m_Packets[rARPacketData.m_nPacketIndex] = rARPacketData.GetData(rARPacketData.GetDataArraySize() - 1);
        }
        else
        {
            RQPacketsItem.m_Packets[rARPacketData.m_nPacketIndex] = undefined;
        }

        //BR
        
        if( i < 1 ) {
            RQPacketsItem.m_Packets[rBRPacketData.m_nPacketIndex] = undefined;
            return REALCALC_FAIL;
        }
    
        this.m_SaveHCDataArray[1] = MHData[i].m_Data - MPData[i-1].m_Data;
        this.m_SaveHCDataArray[0] += this.m_SaveHCDataArray[1];
        this.m_SaveCLDataArray[1] = MPData[i-1].m_Data - MLData[i].m_Data;
        this.m_SaveCLDataArray[0] += this.m_SaveCLDataArray[1];
        if (i > vBRPeriod) {
            this.m_SaveHCDataArray[0] -= (MHData[i-vBRPeriod].m_Data - MPData[i-vBRPeriod-1].m_Data);
            this.m_SaveCLDataArray[0] -= (MPData[i-vBRPeriod-1].m_Data - MLData[i-vBRPeriod].m_Data);
        }
    
        if (i >= vARPeriod - 1 && i >= vBRPeriod) {
            if (this.m_SaveCLDataArray[0] !== 0) {
                br = this.m_SaveHCDataArray[0]*100/this.m_SaveCLDataArray[0];
            } else {
                br = 100;
            }
    
            if (rBRPacketData.GetRQStartIndex() === null) {
                rBRPacketData.SetRQStartIndex(i);
            }
            rBRPacketData.AppendRealData( i,br);
            RQPacketsItem.m_Packets[rBRPacketData.m_nPacketIndex] = rBRPacketData.GetData(rBRPacketData.GetDataArraySize() - 1);
        }
        else
        {
            RQPacketsItem.m_Packets[rBRPacketData.m_nPacketIndex] = undefined;
        }
    } else {//update

        //AR        
        this.m_SaveHODataArray[0] -= this.m_SaveHODataArray[1];
        this.m_SaveHODataArray[1] = MHData[i].m_Data - MOData[i].m_Data;
        this.m_SaveHODataArray[0] += this.m_SaveHODataArray[1];

        this.m_SaveOLDataArray[0] -= this.m_SaveOLDataArray[1];
        this.m_SaveOLDataArray[1] = MOData[i].m_Data - MLData[i].m_Data;
        this.m_SaveOLDataArray[0] += this.m_SaveOLDataArray[1];
    
        if (i >= vARPeriod - 1 && i >= vBRPeriod) {
            if (this.m_SaveOLDataArray[0] != 0) {
                ar = this.m_SaveHODataArray[0]*100/this.m_SaveOLDataArray[0];
            } else {
                ar = 100;
            }
    
            if (rARPacketData.GetRQStartIndex() === null) {
                rARPacketData.SetRQStartIndex(i);
            }
            rARPacketData.UpdateData(i, ar);
            RQPacketsItem.m_Packets[rARPacketData.m_nPacketIndex] = rARPacketData.GetData(rARPacketData.GetDataArraySize() - 1);
        }
        else
        {
            RQPacketsItem.m_Packets[rARPacketData.m_nPacketIndex] = undefined;
        }
        //}
    
        //BR        
        if( i < 1 ) {
            RQPacketsItem.m_Packets[rBRPacketData.m_nPacketIndex] = undefined;
            return REALCALC_FAIL;
        }
    
        this.m_SaveHCDataArray[0] -= this.m_SaveHCDataArray[1];
        this.m_SaveHCDataArray[1] = MHData[i].m_Data - MPData[i-1].m_Data;
        this.m_SaveHCDataArray[0] += this.m_SaveHCDataArray[1];

        this.m_SaveCLDataArray[0] -= this.m_SaveCLDataArray[1];
        this.m_SaveCLDataArray[1] = MPData[i-1].m_Data - MLData[i].m_Data;
        this.m_SaveCLDataArray[0] += this.m_SaveCLDataArray[1];
    
        if (i >= vARPeriod - 1 && i >= vBRPeriod) {
            if (this.m_SaveCLDataArray[0] !== 0) {
                br = this.m_SaveHCDataArray[0]*100/this.m_SaveCLDataArray[0];
            } else {
                br = 100;
            }
    
            if (rBRPacketData.GetRQStartIndex() === null) {
                rBRPacketData.SetRQStartIndex(i);
            }
            rBRPacketData.UpdateData(i, br);
            RQPacketsItem.m_Packets[rBRPacketData.m_nPacketIndex] = rBRPacketData.GetData(rBRPacketData.GetDataArraySize() - 1);
        }
        else
        {
            RQPacketsItem.m_Packets[rBRPacketData.m_nPacketIndex] = undefined;
        }
    }

    return REALCALC_SUCCESS;
}

//AD Line
function CADLineIndicator(rRQSet, strIndicatorName) {

    CIndicator.call(this, rRQSet, strIndicatorName);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "AD Line 지표";

    //계산결과 담을 패킷생성
    this.m_strADPacketName = this.m_strKey + "_AD_";
    rRQSet.AddNumPacketInfo(this.m_strADPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strADSPacketName = this.m_strKey + "_ADS_";
    rRQSet.AddNumPacketInfo(this.m_strADSPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var ADSubGraph = new CIndicatorSubGraph(this);
    ADSubGraph.m_rRQSet = rRQSet;
    ADSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    ADSubGraph.SetPacketData(this.m_strADPacketName);
    ADSubGraph.SetSubGraphName("ADLine");
    ADSubGraph.m_strSubGraphTitle = "AD Line"; //E_High
    this.m_SubGraphArray.push(ADSubGraph);

    var ADSSubGraph = new CIndicatorSubGraph(this);
    ADSSubGraph.m_rRQSet = rRQSet;
    ADSSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    ADSSubGraph.SetPacketData(this.m_strADSPacketName);
    ADSSubGraph.SetSubGraphName("Signal");
    ADSSubGraph.m_strSubGraphTitle = "Signal";
    this.m_SubGraphArray.push(ADSSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);
    this.AddVariable("ADSPeriod", NUMERIC_TYPE, 10); // Signal 기간
    /*
    this.AddVariable("ViewAD", NUMERIC_TYPE, true);  // AD Line View
    this.AddVariable("ViewADS", NUMERIC_TYPE, true); // Signal View
    */

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveADDataArray = [];
    this.m_SaveADSDataArray = [];
}
CADLineIndicator.prototype = new CIndicator();
CADLineIndicator.prototype.constructor = CADLineIndicator;
CADLineIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketVData = this.m_InputPacketDataArray[6];

    if (rInputPacketPData == undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rADPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADPacketName);
    var rADSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADSPacketName);

    rADPacketData.InitDataArray();
    rADSPacketData.InitDataArray();

    var vADSPeriod = this.m_VariableArray[0].m_strData;
    /*
    var vADView = this.m_VariableArray[1].m_strData;
    var vADSView = this.m_VariableArray[2].m_strData;
    */

    var MOData = rInputPacketOData.m_DataArray;
    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;
    var MVData = rInputPacketVData.m_DataArray;

    var deviation = 2/(vADSPeriod+1);

    this.m_SaveADDataArray[0] = 0;
    this.m_SaveADSDataArray[1] = 0;
    
    var nDataLength = MPData.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined) {
            continue;
        }

        if (i < 1) {
            this.m_SaveADDataArray[1] = 0;
            this.m_SaveADSDataArray[1] = 0;
            RQPacketsItem.m_Packets[rADPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rADSPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if ((MHData[i].m_Data - MLData[i].m_Data) !== 0) {
            this.m_SaveADDataArray[1] = (MPData[i].m_Data - MOData[i].m_Data) / (MHData[i].m_Data - MLData[i].m_Data) * MVData[i].m_Data;
        } else {
            this.m_SaveADDataArray[1] = 0;
        }

        this.m_SaveADDataArray[0] += this.m_SaveADDataArray[1];

        this.m_SaveADSDataArray[0] = this.m_SaveADSDataArray[1];
        this.m_SaveADSDataArray[1] = this.m_SaveADSDataArray[0] + deviation * (this.m_SaveADDataArray[0] - this.m_SaveADSDataArray[0]);

        //if (vADView) {
            if (rADPacketData.GetRQStartIndex() == null) {
                rADPacketData.SetRQStartIndex(i);
            }
            rADPacketData.AddTail(i, this.m_SaveADDataArray[0]);
            RQPacketsItem.m_Packets[rADPacketData.m_nPacketIndex] = rADPacketData.GetData(rADPacketData.GetDataArraySize() - 1);
        //}

        //if (vADSView) {
            if (rADSPacketData.GetRQStartIndex() == null) {
                rADSPacketData.SetRQStartIndex(i);
            }
            rADSPacketData.AddTail(i, this.m_SaveADSDataArray[1]);
            RQPacketsItem.m_Packets[rADSPacketData.m_nPacketIndex] = rADSPacketData.GetData(rADSPacketData.GetDataArraySize() - 1);
        //}
    }

    return true;
}
CADLineIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketVData = this.m_InputPacketDataArray[6];

    if (rInputPacketPData == undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rADPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADPacketName);
    var rADSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADSPacketName);

    var vADSPeriod = this.m_VariableArray[0].m_strData;
    /*
    var vADView = this.m_VariableArray[1].m_strData;
    var vADSView = this.m_VariableArray[2].m_strData;
    */

    var MOData = rInputPacketOData.m_DataArray;
    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;
    var MVData = rInputPacketVData.m_DataArray;

    var deviation = 2/(vADSPeriod+1);

    if (this.m_SaveADDataArray[0] == null) {
        this.m_SaveADDataArray[0] = 0;
    }
    if (this.m_SaveADSDataArray[1] == null) {
        this.m_SaveADSDataArray[1] = 0;
    }
    
    var nDataLength = MPData.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem == undefined) {
        return REALCALC_FAIL;
    }

    if (i < 1) {
        this.m_SaveADDataArray[1] = 0;
        this.m_SaveADSDataArray[1] = 0;
        RQPacketsItem.m_Packets[rADPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rADSPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (bAddData) {
        this.m_SaveADSDataArray[0] = this.m_SaveADSDataArray[1];
    } else {
        this.m_SaveADDataArray[0] -= this.m_SaveADDataArray[1];
    }

    if ((MHData[i].m_Data - MLData[i].m_Data) != 0) {
        this.m_SaveADDataArray[1] = (MPData[i].m_Data - MOData[i].m_Data) / (MHData[i].m_Data - MLData[i].m_Data) * MVData[i].m_Data;
    } else {
        this.m_SaveADDataArray[1] = 0;
    }
    this.m_SaveADDataArray[0] += this.m_SaveADDataArray[1];

    this.m_SaveADSDataArray[1] = this.m_SaveADSDataArray[0] + deviation * (this.m_SaveADDataArray[0] - this.m_SaveADSDataArray[0]);

    if (bAddData) {
        //if (vADView) {
            if (rADPacketData.GetRQStartIndex() == null) {
                rADPacketData.SetRQStartIndex(i);
            }
            rADPacketData.AppendRealData( i,this.m_SaveADDataArray[0]);
            RQPacketsItem.m_Packets[rADPacketData.m_nPacketIndex] = rADPacketData.GetData(rADPacketData.GetDataArraySize() - 1);
        //}
    
        //if (vADSView) {
            if (rADSPacketData.GetRQStartIndex() == null) {
                rADSPacketData.SetRQStartIndex(i);
            }
            rADSPacketData.AppendRealData( i,this.m_SaveADSDataArray[1]);
            RQPacketsItem.m_Packets[rADSPacketData.m_nPacketIndex] = rADSPacketData.GetData(rADSPacketData.GetDataArraySize() - 1);
        //}
    } else {
        //if (vADView) {
            if (rADPacketData.GetRQStartIndex() == null) {
                rADPacketData.SetRQStartIndex(i);
            }
            rADPacketData.UpdateData(i, this.m_SaveADDataArray[0]);
            RQPacketsItem.m_Packets[rADPacketData.m_nPacketIndex] = rADPacketData.GetData(rADPacketData.GetDataArraySize() - 1);
        //}
    
        //if (vADSView) {
            if (rADSPacketData.GetRQStartIndex() == null) {
                rADSPacketData.SetRQStartIndex(i);
            }
            rADSPacketData.UpdateData(i, this.m_SaveADSDataArray[1]);
            RQPacketsItem.m_Packets[rADSPacketData.m_nPacketIndex] = rADSPacketData.GetData(rADSPacketData.GetDataArraySize() - 1);
        //}
    }
    return REALCALC_SUCCESS;
}

//ATR
function CATRIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "ATR 지표";

    //계산결과 담을 패킷생성
    this.m_strATRPacketName = this.m_strKey + "_ATR_";
    rRQSet.AddNumPacketInfo(this.m_strATRPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var ATRSubGraph = new CIndicatorSubGraph(this);
    ATRSubGraph.m_rRQSet = rRQSet;
    ATRSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    ATRSubGraph.SetPacketData(this.m_strATRPacketName);
    ATRSubGraph.SetSubGraphName("ATR");
    ATRSubGraph.m_strSubGraphTitle = "ATR"; //E_High
    this.m_SubGraphArray.push(ATRSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);
    this.AddVariable("ATRPeriod", NUMERIC_TYPE, 14); // ATR 기간(14)
    //this.AddVariable("ViewATR", NUMERIC_TYPE, true); // ATR View

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveDataArray = [];
}
CATRIndicator.prototype = new CIndicator();
CATRIndicator.prototype.constructor = CATRIndicator;
CATRIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData == undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rATRPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strATRPacketName);

    rATRPacketData.InitDataArray();

    var vATRPeriod = this.m_VariableArray[0].m_strData;
    //var vATRView = this.m_VariableArray[1].m_strData;

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var val1, val2, val3;

    this.m_SaveDataArray[1] = 0;

    var nDataLength = MPData.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined) {
            continue;
        }

        if (i < 1) {
            RQPacketsItem.m_Packets[rATRPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        this.m_SaveDataArray[0] = this.m_SaveDataArray[1];
        val1 = MHData[i].m_Data - MLData[i].m_Data;
        val2 = Math.abs(MPData[i-1].m_Data - MHData[i].m_Data);
        val3 = Math.abs(MPData[i-1].m_Data - MLData[i].m_Data);
        this.m_SaveDataArray[1] += Math.max(val1, val2, val3);
        if (i > vATRPeriod) {
            val1 = MHData[i-vATRPeriod].m_Data - MLData[i-vATRPeriod].m_Data;
            val2 = Math.abs(MPData[i-vATRPeriod-1].m_Data - MHData[i-vATRPeriod].m_Data);
            val3 = Math.abs(MPData[i-vATRPeriod-1].m_Data - MLData[i-vATRPeriod].m_Data);
            this.m_SaveDataArray[1] -= Math.max(val1, val2, val3);
        }

        if (i < vATRPeriod - 1) {
            RQPacketsItem.m_Packets[rATRPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        //if (vATRView) {
            if (rATRPacketData.GetRQStartIndex() == null) {
                rATRPacketData.SetRQStartIndex(i);
            }
            if( vATRPeriod === 0 )
                rATRPacketData.AddTail(i, 0);
            else
                rATRPacketData.AddTail(i, this.m_SaveDataArray[1]/vATRPeriod);
            RQPacketsItem.m_Packets[rATRPacketData.m_nPacketIndex] = rATRPacketData.GetData(rATRPacketData.GetDataArraySize() - 1);
        //}
    }

    return true;
}
CATRIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData == undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rATRPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strATRPacketName);

    var vATRPeriod = this.m_VariableArray[0].m_strData;
    //var vATRView = this.m_VariableArray[1].m_strData;

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var val1, val2, val3;

    if (this.m_SaveDataArray[1] == null) {
        this.m_SaveDataArray[1] = 0;
    }

    var nDataLength = MPData.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem == undefined) {
        return REALCALC_FAIL;
    }

    if (i < 1) {
        RQPacketsItem.m_Packets[rATRPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (bAddData) {//add
        this.m_SaveDataArray[0] = this.m_SaveDataArray[1];
    } else {//update
        this.m_SaveDataArray[1] = this.m_SaveDataArray[0];
    }

    val1 = MHData[i].m_Data - MLData[i].m_Data;
    val2 = Math.abs(MPData[i-1].m_Data - MHData[i].m_Data);
    val3 = Math.abs(MPData[i-1].m_Data - MLData[i].m_Data);
    this.m_SaveDataArray[1] += Math.max(val1, val2, val3);
    if (i > vATRPeriod) {
        val1 = MHData[i-vATRPeriod].m_Data - MLData[i-vATRPeriod].m_Data;
        val2 = Math.abs(MPData[i-vATRPeriod-1].m_Data - MHData[i-vATRPeriod].m_Data);
        val3 = Math.abs(MPData[i-vATRPeriod-1].m_Data - MLData[i-vATRPeriod].m_Data);
        this.m_SaveDataArray[1] -= Math.max(val1, val2, val3);
    }

    if (i < vATRPeriod - 1) {
        RQPacketsItem.m_Packets[rATRPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    //if (vATRView) {
        if (rATRPacketData.GetRQStartIndex() == null) {
            rATRPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {//add
            if( vATRPeriod === 0 )
                rATRPacketData.AppendRealData( i, 0 );
            else
                rATRPacketData.AppendRealData( i,this.m_SaveDataArray[1]/vATRPeriod);
        } else {//update
            if( vATRPeriod === 0 )
                rATRPacketData.UpdateData( i, 0 );
            else
                rATRPacketData.UpdateData(i, this.m_SaveDataArray[1]/vATRPeriod);
        }
        RQPacketsItem.m_Packets[rATRPacketData.m_nPacketIndex] = rATRPacketData.GetData(rATRPacketData.GetDataArraySize() - 1);
    //}
    return REALCALC_SUCCESS;
}

//Chaikins OSC
function CCOIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "Chaikins OSC 지표";

    //계산결과 담을 패킷생성
    this.m_strCOPacketName = this.m_strKey + "_CO_";
    rRQSet.AddNumPacketInfo(this.m_strCOPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var COSubGraph = new CIndicatorSubGraph(this);
    COSubGraph.m_rRQSet = rRQSet;
    COSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    COSubGraph.SetPacketData(this.m_strCOPacketName);
    COSubGraph.SetSubGraphName("CO");
    COSubGraph.m_strSubGraphTitle = "CO"; //E_High
    this.m_SubGraphArray.push(COSubGraph);    

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);
    this.AddVariable("COSPeriod", NUMERIC_TYPE, 3);  // Short 기간
    this.AddVariable("COLPeriod", NUMERIC_TYPE, 10); // Long 기간

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 0;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveDataArray = [];
    this.m_SaveSDataArray = [];
    this.m_SaveLDataArray = [];
}
CCOIndicator.prototype = new CIndicator();
CCOIndicator.prototype.constructor = CCOIndicator;
CCOIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketVData = this.m_InputPacketDataArray[6];

    if (rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rCOPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strCOPacketName);
    
    rCOPacketData.InitDataArray();    

    var vCOSeriod = this.m_VariableArray[0].m_strData;
    var vCOLeriod = this.m_VariableArray[1].m_strData;        

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;
    var MVData = rInputPacketVData.m_DataArray;

    var deviationS = 2/(vCOSeriod+1);
    var deviationL = 2/(vCOLeriod+1);

    var h, l, c, v;
    
    var nDataLength = MPData.length;
    for (var i = 0; i < nDataLength; i++) {

        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }
        
        h = MHData[i].m_Data;
        l = MLData[i].m_Data;
        c = MPData[i].m_Data;
        v = MVData[i].m_Data;

        if (i === 0) {
            if (h - l === 0) {
                this.m_SaveDataArray[1] = (c * 2 - l - h) * v;
            } else {
                this.m_SaveDataArray[1] = (c * 2 - l - h) * v / (h - l);
            }
            this.m_SaveSDataArray[1] = this.m_SaveDataArray[1];
            this.m_SaveLDataArray[1] = this.m_SaveDataArray[1];
            RQPacketsItem.m_Packets[rCOPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        this.m_SaveDataArray[0] = this.m_SaveDataArray[1];
        if (h - l === 0) {
            this.m_SaveDataArray[1] = this.m_SaveDataArray[0];
        } else {
            this.m_SaveDataArray[1] = this.m_SaveDataArray[0] + (c * 2 - l - h) * v / (h - l);
        }

        this.m_SaveSDataArray[0] = this.m_SaveSDataArray[1];
        this.m_SaveSDataArray[1] = this.m_SaveSDataArray[0] + deviationS * (this.m_SaveDataArray[1] - this.m_SaveSDataArray[0]);

        this.m_SaveLDataArray[0] = this.m_SaveLDataArray[1];
        this.m_SaveLDataArray[1] = this.m_SaveLDataArray[0] + deviationL * (this.m_SaveDataArray[1] - this.m_SaveLDataArray[0]);

        if (rCOPacketData.GetRQStartIndex() === null) {
            rCOPacketData.SetRQStartIndex(i);
        }
        rCOPacketData.AddTail(i, this.m_SaveSDataArray[1] - this.m_SaveLDataArray[1]);
        RQPacketsItem.m_Packets[rCOPacketData.m_nPacketIndex] = rCOPacketData.GetData(rCOPacketData.GetDataArraySize() - 1);
    }

    return true;
}
CCOIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketVData = this.m_InputPacketDataArray[6];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rCOPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strCOPacketName);    

    var vCOSeriod = this.m_VariableArray[0].m_strData;
    var vCOLeriod = this.m_VariableArray[1].m_strData;    

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;
    var MVData = rInputPacketVData.m_DataArray;

    var deviationS = 2/(vCOSeriod+1);
    var deviationL = 2/(vCOLeriod+1);

    var h, l, c, v;
    
    var nDataLength = MPData.length;
    var i = nDataLength - 1;

    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }

    h = MHData[i].m_Data;
    l = MLData[i].m_Data;
    c = MPData[i].m_Data;
    v = MVData[i].m_Data;

    if (i === 0) {
        if (h - l === 0) {
            this.m_SaveDataArray[1] = (c*2-l-h)*v;
        } else {
            this.m_SaveDataArray[1] = (c*2-l-h)*v/(h-l);
        }
        this.m_SaveSDataArray[1] = this.m_SaveDataArray[1];
        this.m_SaveLDataArray[1] = this.m_SaveDataArray[1];
        RQPacketsItem.m_Packets[rCOPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (bAddData) {
        this.m_SaveDataArray[0] = this.m_SaveDataArray[1];
        this.m_SaveSDataArray[0] = this.m_SaveSDataArray[1];
        this.m_SaveLDataArray[0] = this.m_SaveLDataArray[1];
    }
        
    if (h - l === 0) {
        this.m_SaveDataArray[1] = this.m_SaveDataArray[0];
    } else {
        this.m_SaveDataArray[1] = this.m_SaveDataArray[0] + (c*2-l-h)*v/(h-l);
    }
    this.m_SaveSDataArray[1] = this.m_SaveSDataArray[0] + deviationS * (this.m_SaveDataArray[1] - this.m_SaveSDataArray[0]);
    this.m_SaveLDataArray[1] = this.m_SaveLDataArray[0] + deviationL * (this.m_SaveDataArray[1] - this.m_SaveLDataArray[0]);

    if (rCOPacketData.GetRQStartIndex() == null) {
        rCOPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rCOPacketData.AppendRealData( i,this.m_SaveSDataArray[1] - this.m_SaveLDataArray[1]);
    } else {
        rCOPacketData.UpdateData(i, this.m_SaveSDataArray[1] - this.m_SaveLDataArray[1]);
    }
    RQPacketsItem.m_Packets[rCOPacketData.m_nPacketIndex] = rCOPacketData.GetData(rCOPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//Chaikins Volatility
function CCVIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "Chaikins Volatility 지표";

    //계산결과 담을 패킷생성
    this.m_strCVPacketName = this.m_strKey + "_CV_";
    rRQSet.AddNumPacketInfo(this.m_strCVPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    
    this.m_strCVSPacketName = this.m_strKey + "_CVS_";
    rRQSet.AddNumPacketInfo(this.m_strCVSPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    
    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var CVSubGraph = new CIndicatorSubGraph(this);
    CVSubGraph.m_rRQSet = rRQSet;
    CVSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    CVSubGraph.SetPacketData(this.m_strCVPacketName);
    CVSubGraph.SetSubGraphName("CV");
    CVSubGraph.m_strSubGraphTitle = "CV"; //E_High
    this.m_SubGraphArray.push(CVSubGraph);

    var CVSSubGraph = new CIndicatorSubGraph(this);
    CVSSubGraph.m_rRQSet = rRQSet;
    CVSSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    CVSSubGraph.SetPacketData(this.m_strCVSPacketName);
    CVSSubGraph.SetSubGraphName("Signal");
    CVSSubGraph.m_strSubGraphTitle = "Signal";
    this.m_SubGraphArray.push(CVSSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);
    this.AddVariable("CVPeriod", NUMERIC_TYPE, 10);    // CV 기간(10)
    this.AddVariable("CVSPeriod", NUMERIC_TYPE, 9);    // Signal 기간(9)    

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 100;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveDataArray = [];
    this.m_SaveCVDataArray = [];
    this.m_SaveCVSDataArray = [];
}
CCVIndicator.prototype = new CIndicator();
CCVIndicator.prototype.constructor = CCVIndicator;
CCVIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];

    if (rInputPacketHData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rCVPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strCVPacketName);
    var rCVSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strCVSPacketName);    

    rCVPacketData.InitDataArray();
    rCVSPacketData.InitDataArray();    

    var vCVPeriod = this.m_VariableArray[0].m_strData;
    var vCVSPeriod = this.m_VariableArray[1].m_strData;
    
    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;

    var deviationCV = 2/(vCVPeriod+1);
    var deviationCVS = 2/(vCVSPeriod+1);
    var maxperiod = Math.max(vCVPeriod, vCVSPeriod);

    var hl, cv1, cv;

    this.m_SaveCVSDataArray[1] = 0;

    var nDataLength = rInputPacketHData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;

        hl = MHData[i].m_Data - MLData[i].m_Data;
        if (i === 0) {
            this.m_SaveCVDataArray[i] = hl;
        }

        if (i < 1) {
            RQPacketsItem.m_Packets[rCVPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rCVSPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        var curIndex = i % vCVPeriod;
        var prevIndex = curIndex-1<0?vCVPeriod-1:curIndex-1;

        cv1 = this.m_SaveCVDataArray[prevIndex] + deviationCV * (hl - this.m_SaveCVDataArray[prevIndex]);

        if (i < maxperiod) {
            this.m_SaveDataArray[0] = this.m_SaveCVDataArray[curIndex];//update할때 사용
            this.m_SaveCVDataArray[curIndex] = cv1;

            RQPacketsItem.m_Packets[rCVPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rCVSPacketData.m_nPacketIndex] = undefined;

            continue;
        }

        cv = this.m_SaveCVDataArray[curIndex]!== 0 ? (cv1 - this.m_SaveCVDataArray[curIndex]) / this.m_SaveCVDataArray[curIndex] * 100:0;
        this.m_SaveDataArray[0] = this.m_SaveCVDataArray[curIndex];//update할때 사용
        this.m_SaveCVDataArray[curIndex] = cv1;
        
        this.m_SaveCVSDataArray[0] = this.m_SaveCVSDataArray[1];
        this.m_SaveCVSDataArray[1] = this.m_SaveCVSDataArray[0] + deviationCVS * (cv - this.m_SaveCVSDataArray[0]);

        if (rCVPacketData.GetRQStartIndex() == null) {
            rCVPacketData.SetRQStartIndex(i);
        }
        rCVPacketData.AddTail(i, cv);
        RQPacketsItem.m_Packets[rCVPacketData.m_nPacketIndex] = rCVPacketData.GetData(rCVPacketData.GetDataArraySize() - 1);

        if (rCVSPacketData.GetRQStartIndex() == null) {
            rCVSPacketData.SetRQStartIndex(i);
        }
        rCVSPacketData.AddTail(i, this.m_SaveCVSDataArray[1]);
        RQPacketsItem.m_Packets[rCVSPacketData.m_nPacketIndex] = rCVSPacketData.GetData(rCVSPacketData.GetDataArraySize() - 1);        
    }
    return true;
}
CCVIndicator.prototype.RealCalc = function (bAddData) {
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];

    if (rInputPacketHData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rCVPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strCVPacketName);
    var rCVSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strCVSPacketName);
    
    var vCVPeriod = this.m_VariableArray[0].m_strData;
    var vCVSPeriod = this.m_VariableArray[1].m_strData;
    
    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;

    var deviationCV = 2/(vCVPeriod+1);
    var deviationCVS = 2/(vCVSPeriod+1);
    var maxperiod = Math.max(vCVPeriod, vCVSPeriod);

    var hl, cv1, cv;

    if (this.m_SaveCVSDataArray[1] === null) {
        this.m_SaveCVSDataArray[1] = 0;
    }

    var nDataLength = rInputPacketHData.m_DataArray.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }

    hl = MHData[i].m_Data - MLData[i].m_Data;
    if (i === 0) {
        this.m_SaveCVDataArray[i] = hl;
    }

    if (i < 1) {
        RQPacketsItem.m_Packets[rCVPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rCVSPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    var curIndex = i % vCVPeriod;
    var prevIndex = curIndex-1<0?vCVPeriod-1:curIndex-1;

    if (bAddData) {

        cv1 = this.m_SaveCVDataArray[prevIndex] + deviationCV * (hl - this.m_SaveCVDataArray[prevIndex]);

        if (i < maxperiod) {
            this.m_SaveDataArray[0] = this.m_SaveCVDataArray[curIndex];//update할때 사용
            this.m_SaveCVDataArray[curIndex] = cv1;

            RQPacketsItem.m_Packets[rCVPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rCVSPacketData.m_nPacketIndex] = undefined;
            return REALCALC_FAIL;
        }

        cv = this.m_SaveCVDataArray[curIndex]!==0?(cv1 - this.m_SaveCVDataArray[curIndex]) / this.m_SaveCVDataArray[curIndex] * 100:0;
        this.m_SaveDataArray[0] = this.m_SaveCVDataArray[curIndex];//update할때 사용
        this.m_SaveCVDataArray[curIndex] = cv1;

        this.m_SaveCVSDataArray[0] = this.m_SaveCVSDataArray[1];
        this.m_SaveCVSDataArray[1] = this.m_SaveCVSDataArray[0] + deviationCVS * (cv - this.m_SaveCVSDataArray[0]);

    } else {

        this.m_SaveCVDataArray[curIndex] = this.m_SaveDataArray[0];
        cv1 = this.m_SaveCVDataArray[prevIndex] + deviationCV * (hl - this.m_SaveCVDataArray[prevIndex]);

        if (i < maxperiod) {
            this.m_SaveCVDataArray[curIndex] = cv1;

            RQPacketsItem.m_Packets[rCVPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rCVSPacketData.m_nPacketIndex] = undefined;

            return REALCALC_FAIL;
        }

        cv = this.m_SaveCVDataArray[curIndex]!==0?(cv1 - this.m_SaveCVDataArray[curIndex]) / this.m_SaveCVDataArray[curIndex] * 100:0;
        this.m_SaveCVDataArray[curIndex] = cv1;
        
        this.m_SaveCVSDataArray[1] = this.m_SaveCVSDataArray[0] + deviationCVS * (cv - this.m_SaveCVSDataArray[0]);
    }

    if (rCVPacketData.GetRQStartIndex() === null) {
        rCVPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rCVPacketData.AppendRealData( i,cv);
    } else {
        rCVPacketData.UpdateData(i, cv);
    }
    RQPacketsItem.m_Packets[rCVPacketData.m_nPacketIndex] = rCVPacketData.GetData(rCVPacketData.GetDataArraySize() - 1);
    
    if (rCVSPacketData.GetRQStartIndex() === null) {
        rCVSPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rCVSPacketData.AppendRealData( i,this.m_SaveCVSDataArray[1]);
    } else {
        rCVSPacketData.UpdateData(i, this.m_SaveCVSDataArray[1]);
    }
    RQPacketsItem.m_Packets[rCVSPacketData.m_nPacketIndex] = rCVSPacketData.GetData(rCVSPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//DMI
function CDMIIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "DMI 지표";

    //계산결과 담을 패킷생성
    this.m_strUpDIacketName = this.m_strKey + "_UPDI_";
    rRQSet.AddNumPacketInfo(this.m_strUpDIacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    
    this.m_strDownDIPacketName = this.m_strKey + "_DOWNDI_";
    rRQSet.AddNumPacketInfo(this.m_strDownDIPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var UpDISubGraph = new CIndicatorSubGraph(this);
    UpDISubGraph.m_rRQSet = rRQSet;
    UpDISubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    UpDISubGraph.SetPacketData(this.m_strUpDIacketName);
    UpDISubGraph.SetSubGraphName("UpDI");
    UpDISubGraph.m_strSubGraphTitle = "UpDI"; //E_High
    this.m_SubGraphArray.push(UpDISubGraph);

    var DownDISubGraph = new CIndicatorSubGraph(this);
    DownDISubGraph.m_rRQSet = rRQSet;
    DownDISubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    DownDISubGraph.SetPacketData(this.m_strDownDIPacketName);
    DownDISubGraph.SetSubGraphName("DownDI");
    DownDISubGraph.m_strSubGraphTitle = "DownDI";
    this.m_SubGraphArray.push(DownDISubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);
    this.AddVariable("DMIPeriod", NUMERIC_TYPE, 14);   // DMI 기간

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 10;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;
    BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 30;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveUpDIDataArray = [];
    this.m_SaveDownDIDataArray = [];
    this.m_SaveTRDataArray = [];
}
CDMIIndicator.prototype = new CIndicator();
CDMIIndicator.prototype.constructor = CDMIIndicator;

CDMIIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rUpDIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strUpDIacketName);
    var rDownDIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strDownDIPacketName);
    
    rUpDIPacketData.InitDataArray();
    rDownDIPacketData.InitDataArray();
    
    var vDMIPeriod = this.m_VariableArray[0].m_strData;    

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var h, h1, l, l1, c1;
    var UpDI, DownDI, tr;

    this.m_SaveUpDIDataArray[0] = 0;
    this.m_SaveDownDIDataArray[0] = 0;
    this.m_SaveTRDataArray[0] = 0;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;
       
        if (i < 1) {
            RQPacketsItem.m_Packets[rUpDIPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rDownDIPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        h = MHData[i].m_Data;
        h1 = MHData[i-1].m_Data;
        l = MLData[i].m_Data;
        l1 = MLData[i-1].m_Data;
        c1 = MPData[i-1].m_Data;
        if ((h - h1) > 0 && ((h - h1) > (l1 - l))) {
            UpDI = h - h1;
        } else {
            UpDI = 0;
        }
        if ((l - l1) < 0 && ((h - h1) < (l1 - l))) {
            DownDI = l1 - l;
        } else {
            DownDI = 0;
        }

        tr = Math.max(Math.abs(h-l), Math.abs(c1-h), Math.abs(c1-l));

        if (i <= vDMIPeriod) {
            this.m_SaveUpDIDataArray[0] += UpDI;
            this.m_SaveDownDIDataArray[0] += DownDI;
            this.m_SaveTRDataArray[0] += tr;
        }

        if (i === vDMIPeriod)
        {
            if( vDMIPeriod === 0 )
            {
                this.m_SaveUpDIDataArray[1] = 0;
                this.m_SaveDownDIDataArray[1] = 0;
                this.m_SaveTRDataArray[1] = 0;
            }
            else            
            {
                this.m_SaveUpDIDataArray[1] = this.m_SaveUpDIDataArray[0] / vDMIPeriod;
                this.m_SaveDownDIDataArray[1] = this.m_SaveDownDIDataArray[0] / vDMIPeriod;
                this.m_SaveTRDataArray[1] = this.m_SaveTRDataArray[0] / vDMIPeriod;
            }
        }
        else if (i > vDMIPeriod)
        {
            if( vDMIPeriod === 0 )
            {
                this.m_SaveUpDIDataArray[0] = this.m_SaveUpDIDataArray[1];
                this.m_SaveUpDIDataArray[1] = 0; 

                this.m_SaveDownDIDataArray[0] = this.m_SaveDownDIDataArray[1];
                this.m_SaveDownDIDataArray[1] = 0;

                this.m_SaveTRDataArray[0] = this.m_SaveTRDataArray[1];
                this.m_SaveTRDataArray[1] = 0;
            }
            else
            {
                this.m_SaveUpDIDataArray[0] = this.m_SaveUpDIDataArray[1];
                this.m_SaveUpDIDataArray[1] = (this.m_SaveUpDIDataArray[0] * (vDMIPeriod-1) + UpDI) / vDMIPeriod; 

                this.m_SaveDownDIDataArray[0] = this.m_SaveDownDIDataArray[1];
                this.m_SaveDownDIDataArray[1] = (this.m_SaveDownDIDataArray[0] * (vDMIPeriod-1) + DownDI) / vDMIPeriod;

                this.m_SaveTRDataArray[0] = this.m_SaveTRDataArray[1];
                this.m_SaveTRDataArray[1] = (this.m_SaveTRDataArray[0] * (vDMIPeriod-1) + tr) / vDMIPeriod;
            }
        }

        if (i < vDMIPeriod) {
            RQPacketsItem.m_Packets[rUpDIPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rDownDIPacketData.m_nPacketIndex] = undefined;
            continue;
        }        
        if (rUpDIPacketData.GetRQStartIndex() === null) {
            rUpDIPacketData.SetRQStartIndex(i);
        }

        if (rDownDIPacketData.GetRQStartIndex() === null) {
            rDownDIPacketData.SetRQStartIndex(i);
        }

        if( this.m_SaveTRDataArray[1] === 0 ) {
            
            rUpDIPacketData.AddTail(i, 0);
            rDownDIPacketData.AddTail(i, 0);
        }
        else {
            rUpDIPacketData.AddTail(i, this.m_SaveUpDIDataArray[1] / this.m_SaveTRDataArray[1] * 100);
            rDownDIPacketData.AddTail(i, this.m_SaveDownDIDataArray[1] / this.m_SaveTRDataArray[1] * 100);
        }

        RQPacketsItem.m_Packets[rUpDIPacketData.m_nPacketIndex] = rUpDIPacketData.GetData(rUpDIPacketData.GetDataArraySize() - 1);
        RQPacketsItem.m_Packets[rDownDIPacketData.m_nPacketIndex] = rDownDIPacketData.GetData(rDownDIPacketData.GetDataArraySize() - 1);
    }

    return true;
}
CDMIIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rUpDIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strUpDIacketName);
    var rDownDIPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strDownDIPacketName);
    
    var vDMIPeriod = this.m_VariableArray[0].m_strData;
    
    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MPData = rInputPacketPData.m_DataArray;

    var h, h1, l, l1, c1;
    var UpDI, DownDI, tr;

    if (this.m_SaveUpDIDataArray[0] === null) {
        this.m_SaveUpDIDataArray[0] = 0;
    }
    if (this.m_SaveDownDIDataArray[0] === null) {
        this.m_SaveDownDIDataArray[0] = 0;
    }
    if (this.m_SaveTRDataArray[0] === null) {
        this.m_SaveTRDataArray[0] = 0;
    }

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined) {
        return REALCALC_FAIL;
    }

    if (i < 1) {
        RQPacketsItem.m_Packets[rUpDIPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rDownDIPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    h = MHData[i].m_Data;
    h1 = MHData[i-1].m_Data;
    l = MLData[i].m_Data;
    l1 = MLData[i-1].m_Data;
    c1 = MPData[i-1].m_Data;
    if ((h - h1) > 0 && ((h - h1) > (l1 - l))) {
        UpDI = h - h1;
    } else {
        UpDI = 0;
    }
    if ((l - l1) < 0 && ((h - h1) < (l1 - l))) {
        DownDI = l1 - l;
    } else {
        DownDI = 0;
    }

    tr = Math.max(Math.abs(h-l), Math.abs(c1-h), Math.abs(c1-l));

    if (i <= vDMIPeriod) {
        this.m_SaveUpDIDataArray[0] += UpDI;
        this.m_SaveDownDIDataArray[0] += DownDI;
        this.m_SaveTRDataArray[0] += tr;
    }

    if (i === vDMIPeriod)
    {
        if( vDMIPeriod === 0 )
        {
            this.m_SaveUpDIDataArray[1] = 0;
            this.m_SaveDownDIDataArray[1] = 0;
            this.m_SaveTRDataArray[1] = 0;
        }
        else            
        {
            this.m_SaveUpDIDataArray[1] = this.m_SaveUpDIDataArray[0] / vDMIPeriod;
            this.m_SaveDownDIDataArray[1] = this.m_SaveDownDIDataArray[0] / vDMIPeriod;
            this.m_SaveTRDataArray[1] = this.m_SaveTRDataArray[0] / vDMIPeriod;
        }
    }
    else if (i > vDMIPeriod) 
    {
        if (bAddData) {//add
            this.m_SaveUpDIDataArray[0] = this.m_SaveUpDIDataArray[1];
            this.m_SaveDownDIDataArray[0] = this.m_SaveDownDIDataArray[1];
            this.m_SaveTRDataArray[0] = this.m_SaveTRDataArray[1];
        }
        
        if( vDMIPeriod === 0 )
        {
            this.m_SaveUpDIDataArray[1] = 0; 
            this.m_SaveDownDIDataArray[1] = 0;
            this.m_SaveTRDataArray[1] = 0;
        }
        else
        {
            this.m_SaveUpDIDataArray[1] = (this.m_SaveUpDIDataArray[0] * (vDMIPeriod-1) + UpDI) / vDMIPeriod; 
            this.m_SaveDownDIDataArray[1] = (this.m_SaveDownDIDataArray[0] * (vDMIPeriod-1) + DownDI) / vDMIPeriod;
            this.m_SaveTRDataArray[1] = (this.m_SaveTRDataArray[0] * (vDMIPeriod-1) + tr) / vDMIPeriod;
        }
    }

    if (i < vDMIPeriod) {
        RQPacketsItem.m_Packets[rUpDIPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rDownDIPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    
    if (rUpDIPacketData.GetRQStartIndex() === null) {
        rUpDIPacketData.SetRQStartIndex(i);
    }

    if (rDownDIPacketData.GetRQStartIndex() === null) {
        rDownDIPacketData.SetRQStartIndex(i);
    }

    if (bAddData) //add
    {
        if( this.m_SaveTRDataArray[1] === 0 ) {
            
            rUpDIPacketData.AppendRealData(i, 0);
            rDownDIPacketData.AppendRealData(i, 0);
        }
        else {
            rUpDIPacketData.AppendRealData( i,this.m_SaveUpDIDataArray[1] / this.m_SaveTRDataArray[1] * 100);
            rDownDIPacketData.AppendRealData( i,this.m_SaveDownDIDataArray[1] / this.m_SaveTRDataArray[1] * 100);
        }
    }
    else //update
    {
        if( this.m_SaveTRDataArray[1] === 0 ) {
            
            rUpDIPacketData.UpdateData(i, 0);
            rDownDIPacketData.UpdateData(i, 0);
        }
        else {
            rUpDIPacketData.UpdateData(i , this.m_SaveUpDIDataArray[1] / this.m_SaveTRDataArray[1] * 100);
            rDownDIPacketData.UpdateData(i , this.m_SaveDownDIDataArray[1] / this.m_SaveTRDataArray[1] * 100);
        }
    }
    
    RQPacketsItem.m_Packets[rUpDIPacketData.m_nPacketIndex] = rUpDIPacketData.GetData(rUpDIPacketData.GetDataArraySize() - 1);
    RQPacketsItem.m_Packets[rDownDIPacketData.m_nPacketIndex] = rDownDIPacketData.GetData(rDownDIPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//EOM
function CEOMIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "EOM 지표";

    //계산결과 담을 패킷생성
    this.m_strEOMPacketName = this.m_strKey + "_EOM_";
    rRQSet.AddNumPacketInfo(this.m_strEOMPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    
    this.m_strEOMSPacketName = this.m_strKey + "_EOMS_";
    rRQSet.AddNumPacketInfo(this.m_strEOMSPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strEOMBPacketName = this.m_strKey + "_EOMB_";
    rRQSet.AddNumPacketInfo(this.m_strEOMBPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var EOMSubGraph = new CIndicatorSubGraph(this);
    EOMSubGraph.m_rRQSet = rRQSet;
    EOMSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    EOMSubGraph.SetPacketData(this.m_strEOMPacketName);
    EOMSubGraph.SetSubGraphName("EOM");
    EOMSubGraph.m_strSubGraphTitle = "EOM"; //E_High
    this.m_SubGraphArray.push(EOMSubGraph);

    var EOMSSubGraph = new CIndicatorSubGraph(this);
    EOMSSubGraph.m_rRQSet = rRQSet;
    EOMSSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    EOMSSubGraph.SetPacketData(this.m_strEOMSPacketName);
    EOMSSubGraph.SetSubGraphName("Signal");
    EOMSSubGraph.m_strSubGraphTitle = "Signal";
    this.m_SubGraphArray.push(EOMSSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);
    this.AddVariable("EOMPeriod", NUMERIC_TYPE, 14);  // EOM 기간
    this.AddVariable("EOMSPeriod", NUMERIC_TYPE, 3);  // Signal 기간

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 0;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveEOMDataArray = [];
    this.m_SaveEOMSDataArray = [];
}

CEOMIndicator.prototype = new CIndicator();
CEOMIndicator.prototype.constructor = CEOMIndicator;
CEOMIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketVData = this.m_InputPacketDataArray[6];

    if (rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rEOMPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strEOMPacketName);
    var rEOMSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strEOMSPacketName);
    
    rEOMPacketData.InitDataArray();
    rEOMSPacketData.InitDataArray();
    
    var vEOMPeriod = this.m_VariableArray[0].m_strData;
    var vEOMSPeriod = this.m_VariableArray[1].m_strData;
    
    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MVData = rInputPacketVData.m_DataArray;

    var h, h1, l, l1, v, hl;
    var eom;

    var deviationEOM = 2/(vEOMPeriod+1);
    var deviationEOMS = 2/(vEOMSPeriod+1);

    this.m_SaveEOMSDataArray[1] = 0;

    var nDataLength = rInputPacketHData.m_DataArray.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;

        if (i < 1) {
            RQPacketsItem.m_Packets[rEOMPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rEOMSPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        h = MHData[i].m_Data;
        l = MLData[i].m_Data;
        v = MVData[i].m_Data;
        h1 = MHData[i-1].m_Data;
        l1 = MLData[i-1].m_Data;
        
        hl = h===l?1:h-l;
        if (v === 0) {
            v = 1;
        }
        
        if( hl === 0 )
            eom = 0;
        else
            eom = ((h+l)/2-(h1+l1)/2)/((v/10000)/hl);

        if (i === 1) {
            this.m_SaveEOMDataArray[1] = eom;
        } else {
            this.m_SaveEOMDataArray[0] = this.m_SaveEOMDataArray[1];
            this.m_SaveEOMDataArray[1] = this.m_SaveEOMDataArray[0] + deviationEOM * (eom - this.m_SaveEOMDataArray[0]);
        }

        this.m_SaveEOMSDataArray[0] = this.m_SaveEOMSDataArray[1];
        this.m_SaveEOMSDataArray[1] = this.m_SaveEOMSDataArray[0] + deviationEOMS * (this.m_SaveEOMDataArray[1] - this.m_SaveEOMSDataArray[0]);

        if (rEOMPacketData.GetRQStartIndex() === null) {
            rEOMPacketData.SetRQStartIndex(i);
        }
        rEOMPacketData.AddTail(i, this.m_SaveEOMDataArray[1]);
        RQPacketsItem.m_Packets[rEOMPacketData.m_nPacketIndex] = rEOMPacketData.GetData(rEOMPacketData.GetDataArraySize() - 1);

        if (i < vEOMPeriod + vEOMSPeriod - 1) {
            RQPacketsItem.m_Packets[rEOMSPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if (rEOMSPacketData.GetRQStartIndex() === null) {
            rEOMSPacketData.SetRQStartIndex(i);
        }
        rEOMSPacketData.AddTail(i, this.m_SaveEOMSDataArray[1]);
        RQPacketsItem.m_Packets[rEOMSPacketData.m_nPacketIndex] = rEOMSPacketData.GetData(rEOMSPacketData.GetDataArraySize() - 1);        
    }

    return true;
}
CEOMIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketVData = this.m_InputPacketDataArray[6];

    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rEOMPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strEOMPacketName);
    var rEOMSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strEOMSPacketName);
    
    var vEOMPeriod = this.m_VariableArray[0].m_strData;
    var vEOMSPeriod = this.m_VariableArray[1].m_strData;
    
    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;
    var MVData = rInputPacketVData.m_DataArray;

    var h, h1, l, l1, v, hl;
    var eom;

    var deviationEOM = 2/(vEOMPeriod+1);
    var deviationEOMS = 2/(vEOMSPeriod+1);

    if (this.m_SaveEOMSDataArray[1] === null) {
        this.m_SaveEOMSDataArray[1] = 0;
    }

    var nDataLength = rInputPacketHData.m_DataArray.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
        return REALCALC_FAIL;

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined)
        return REALCALC_FAIL;

    if (i < 1) {
        RQPacketsItem.m_Packets[rEOMPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rEOMSPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    h = MHData[i].m_Data;
    l = MLData[i].m_Data;
    v = MVData[i].m_Data;
    h1 = MHData[i-1].m_Data;
    l1 = MLData[i-1].m_Data;
    
    hl = h===l?1:h-l;
    if (v === 0) {
        v = 1;
    }
    
    if( hl === 0 )
        eom = 0;
    else
        eom = ((h+l)/2-(h1+l1)/2)/((v/10000)/hl);

    if (i === 1) {
        this.m_SaveEOMDataArray[1] = eom;
    } else {
        if (bAddData) {
            this.m_SaveEOMDataArray[0] = this.m_SaveEOMDataArray[1];
        }
        this.m_SaveEOMDataArray[1] = this.m_SaveEOMDataArray[0] + deviationEOM * (eom - this.m_SaveEOMDataArray[0]);
    }
    
    if (bAddData) {
        this.m_SaveEOMSDataArray[0] = this.m_SaveEOMSDataArray[1];
    }
    this.m_SaveEOMSDataArray[1] = this.m_SaveEOMSDataArray[0] + deviationEOMS * (this.m_SaveEOMDataArray[1] - this.m_SaveEOMSDataArray[0]);

    if (rEOMPacketData.GetRQStartIndex() === null) {
        rEOMPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rEOMPacketData.AppendRealData( i,this.m_SaveEOMDataArray[1]);
    } else {
        rEOMPacketData.UpdateData(i , this.m_SaveEOMDataArray[1]);
    }
    RQPacketsItem.m_Packets[rEOMPacketData.m_nPacketIndex] = rEOMPacketData.GetData(rEOMPacketData.GetDataArraySize() - 1);

    if (i < vEOMPeriod + vEOMSPeriod - 1) {
        RQPacketsItem.m_Packets[rEOMSPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    
    if (rEOMSPacketData.GetRQStartIndex() === null) {
        rEOMSPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rEOMSPacketData.AppendRealData( i,this.m_SaveEOMSDataArray[1]);
    } else {
        rEOMSPacketData.UpdateData(i , this.m_SaveEOMSDataArray[1]);
    }
    RQPacketsItem.m_Packets[rEOMSPacketData.m_nPacketIndex] = rEOMSPacketData.GetData(rEOMSPacketData.GetDataArraySize() - 1);

    return REALCALC_SUCCESS;
}

//LRL
function CLRLIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "LRL 지표";

    //계산결과 담을 패킷생성
    this.m_strLRLPacketName = this.m_strKey + "_LRL_";
    rRQSet.AddNumPacketInfo(this.m_strLRLPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);    
    
    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var LRLSubGraph = new CIndicatorSubGraph(this);
    LRLSubGraph.m_rRQSet = rRQSet;
    LRLSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    LRLSubGraph.SetPacketData(this.m_strLRLPacketName);
    LRLSubGraph.SetSubGraphName("LRL");
    LRLSubGraph.m_strSubGraphTitle = "LRL"; //E_High
    this.m_SubGraphArray.push(LRLSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);
    this.AddVariable("LRLPeriod", NUMERIC_TYPE, 14);   // LRL 기간

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 20;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;
    BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 80;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveA3DataArray = [];
    this.m_SaveA4DataArray = [];
    this.m_SaveA7DataArray = [];
    this.m_SaveA8DataArray = [];
}
CLRLIndicator.prototype = new CIndicator();
CLRLIndicator.prototype.constructor = CLRLIndicator;
CLRLIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketPData = this.m_InputPacketDataArray[3];
    
    if (rInputPacketPData === undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rLRLPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strLRLPacketName);
    
    rLRLPacketData.InitDataArray();
    
    var vLRLPeriod = this.m_VariableArray[0].m_strData;
    
    var MData = rInputPacketPData.m_DataArray;

    var a1, a2, a3, a4, a5, a6, a7, a8, lrl;
    
    this.m_SaveA3DataArray[0] = 0;
    this.m_SaveA4DataArray[0] = 0;
    this.m_SaveA7DataArray[0] = 0;
    this.m_SaveA8DataArray[0] = 0;

    var nDataLength = MData.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined)
            continue;

        a1 = i;
        a2 = a1 * a1;
        //a3
        this.m_SaveA3DataArray[1] = a1;
        this.m_SaveA3DataArray[0] += this.m_SaveA3DataArray[1];
        if (i > vLRLPeriod - 1) {
            this.m_SaveA3DataArray[0] -= i - vLRLPeriod;
        }

        if( vLRLPeriod === 0 )
            a3 = 0;
        else
            a3 = this.m_SaveA3DataArray[0] / vLRLPeriod;

        //a4
        this.m_SaveA4DataArray[1] = a2;
        this.m_SaveA4DataArray[0] += this.m_SaveA4DataArray[1];
        if (i > vLRLPeriod - 1) {
            this.m_SaveA4DataArray[0] -= (i - vLRLPeriod) * (i - vLRLPeriod);
        }
        
        if( vLRLPeriod === 0 )
            a4 = 0;
        else
            a4 = this.m_SaveA4DataArray[0] / vLRLPeriod

        a5 = a3 * a3;
        a6 = MData[i].m_Data * i;
        //a7
        this.m_SaveA7DataArray[1] = a6;
        this.m_SaveA7DataArray[0] += this.m_SaveA7DataArray[1];
        if (i > vLRLPeriod - 1) {
            this.m_SaveA7DataArray[0] -= MData[i - vLRLPeriod].m_Data * (i - vLRLPeriod);
        }

        if( vLRLPeriod === 0 )
            a7 = 0;
        else
            a7 = this.m_SaveA7DataArray[0] / vLRLPeriod

        //a8
        this.m_SaveA8DataArray[1] = MData[i].m_Data;
        this.m_SaveA8DataArray[0] += this.m_SaveA8DataArray[1];
        if (i > vLRLPeriod - 1) {
            this.m_SaveA8DataArray[0] -= MData[i - vLRLPeriod].m_Data;
        }

        if( vLRLPeriod === 0 )
            a8 = 0;
        else
            a8 = this.m_SaveA8DataArray[0] / vLRLPeriod;
        
        var denominator = (a4-a5)*(a1-a3)+a8;
        if( denominator === 0 )
            lrl = 0;
        else
            lrl = (a7-a3*a8)/denominator;

        if (i < vLRLPeriod - 1) {
            RQPacketsItem.m_Packets[rLRLPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        //LRL        
        if (rLRLPacketData.GetRQStartIndex() === null) {
            rLRLPacketData.SetRQStartIndex(i);
        }
        rLRLPacketData.AddTail(i, lrl);
        RQPacketsItem.m_Packets[rLRLPacketData.m_nPacketIndex] = rLRLPacketData.GetData(rLRLPacketData.GetDataArraySize() - 1);
        
    }

    return true;
}
CLRLIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketPData = this.m_InputPacketDataArray[3];
    
    if (rInputPacketPData === undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rLRLPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strLRLPacketName);
    
    var vLRLPeriod = this.m_VariableArray[0].m_strData;
    
    var MData = rInputPacketPData.m_DataArray;

    var a1, a2, a3, a4, a5, a6, a7, a8, lrl;
    
    if (this.m_SaveA3DataArray[0] === null) {
        this.m_SaveA3DataArray[0] = 0;
    }
    if (this.m_SaveA4DataArray[0] === null) {
        this.m_SaveA4DataArray[0] = 0;
    }
    if (this.m_SaveA7DataArray[0] === null) {
        this.m_SaveA7DataArray[0] = 0;
    }
    if (this.m_SaveA8DataArray[0] === null) {
        this.m_SaveA8DataArray[0] = 0;
    }

    var nDataLength = MData.length;
    var i = nDataLength - 1;

    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] === undefined)
        return REALCALC_FAIL;

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem === undefined)
        return REALCALC_FAIL;

    if (bAddData) {

        a1 = i;
        a2 = a1 * a1;
        //a3
        this.m_SaveA3DataArray[1] = a1;
        this.m_SaveA3DataArray[0] += this.m_SaveA3DataArray[1];
        if (i > vLRLPeriod - 1) {
            this.m_SaveA3DataArray[0] -= i - vLRLPeriod;
        }
        
        if( vLRLPeriod === 0 )
            a3 = 0;
        else
            a3 = this.m_SaveA3DataArray[0] / vLRLPeriod;

        //a4
        this.m_SaveA4DataArray[1] = a2;
        this.m_SaveA4DataArray[0] += this.m_SaveA4DataArray[1];
        if (i > vLRLPeriod - 1) {
            this.m_SaveA4DataArray[0] -= (i - vLRLPeriod) * (i - vLRLPeriod);
        }

        if( vLRLPeriod === 0 )
            a4 = 0;
        else
            a4 = this.m_SaveA4DataArray[0] / vLRLPeriod;

        a5 = a3 * a3;
        a6 = MData[i].m_Data * i;
        //a7
        this.m_SaveA7DataArray[1] = a6;
        this.m_SaveA7DataArray[0] += this.m_SaveA7DataArray[1];
        if (i > vLRLPeriod - 1) {
            this.m_SaveA7DataArray[0] -= MData[i - vLRLPeriod].m_Data * (i - vLRLPeriod);
        }

        if( vLRLPeriod === 0 )
            a7 = 0;
        else
            a7 = this.m_SaveA7DataArray[0] / vLRLPeriod;

        //a8
        this.m_SaveA8DataArray[1] = MData[i].m_Data;
        this.m_SaveA8DataArray[0] += this.m_SaveA8DataArray[1];
        if (i > vLRLPeriod - 1) {
            this.m_SaveA8DataArray[0] -= MData[i - vLRLPeriod].m_Data;
        }

        if( vLRLPeriod === 0 )
            a8 = 0;
        else
            a8 = this.m_SaveA8DataArray[0] / vLRLPeriod;

    } else {
        a1 = i;
        a2 = a1 * a1;
        //a3
        this.m_SaveA3DataArray[0] -= this.m_SaveA3DataArray[1];
        this.m_SaveA3DataArray[1] = a1;
        this.m_SaveA3DataArray[0] += this.m_SaveA3DataArray[1];

        if( vLRLPeriod === 0 )
            a3 = 0;
        else
            a3 = this.m_SaveA3DataArray[0] / vLRLPeriod;

        //a4
        this.m_SaveA4DataArray[0] -= this.m_SaveA4DataArray[1];
        this.m_SaveA4DataArray[1] = a2;
        this.m_SaveA4DataArray[0] += this.m_SaveA4DataArray[1];

        if( vLRLPeriod === 0 )
            a4 = 0;
        else
            a4 = this.m_SaveA4DataArray[0] / vLRLPeriod;

        a5 = a3 * a3;
        a6 = MData[i].m_Data * i;
        //a7
        this.m_SaveA7DataArray[0] -= this.m_SaveA7DataArray[1];
        this.m_SaveA7DataArray[1] = a6;
        this.m_SaveA7DataArray[0] += this.m_SaveA7DataArray[1];

        if( vLRLPeriod === 0 )
            a7 = 0;
        else
            a7 = this.m_SaveA7DataArray[0] / vLRLPeriod;

        //a8
        this.m_SaveA8DataArray[0] -= this.m_SaveA8DataArray[1];
        this.m_SaveA8DataArray[1] = MData[i].m_Data;
        this.m_SaveA8DataArray[0] += this.m_SaveA8DataArray[1];

        if( vLRLPeriod === 0 )
            a8 = 0;
        else
            a8 = this.m_SaveA8DataArray[0] / vLRLPeriod;
    }

    var denominator = (a4-a5)*(a1-a3)+a8;
    if( denominator === 0 )
        lrl = 0;
    else
        lrl = (a7-a3*a8)/denominator;

    if (i < vLRLPeriod - 1) {
        RQPacketsItem.m_Packets[rLRLPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    //LRL    
    if (rLRLPacketData.GetRQStartIndex() === null) {
        rLRLPacketData.SetRQStartIndex(i);
    }
    if (bAddData) {
        rLRLPacketData.AppendRealData( i,lrl);
    } else {
        rLRLPacketData.UpdateData(i , lrl);
    }
    RQPacketsItem.m_Packets[rLRLPacketData.m_nPacketIndex] = rLRLPacketData.GetData(rLRLPacketData.GetDataArraySize() - 1);
    
    return REALCALC_SUCCESS;
}

//RCI
function CRCIIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    var MA_bShow_LS = [true, true, true, true], MA_Num_LS = [9, 13, 18, 26], MA_Rgb_LS = ["rgb(255,000,000)","rgb(000,000,000)","rgb(000,000,255)","rgb(51,153,102)"];

    var i, length = MA_bShow_LS.length;
    this.m_MAPropertyInfoArray = [];
    for (i = 0; i < length; i++) {
        this.m_MAPropertyInfoArray[i] = new CMAPropertyInfo(i, MA_Num_LS[i], 3, 0, MA_Rgb_LS[i], 1, 0, MA_bShow_LS[i]);
    }

    this.m_strTitle = "RCI ";
    this.m_rRQSet = rRQSet;
    this.m_strMAPacketNameArray = [];
    //계산결과 담을 패킷생성
    length = this.m_MAPropertyInfoArray.length;
    for (i = 0; i < length; i++) {
        //패킷추가
        this.m_strMAPacketNameArray[i] = this.m_strKey + "_RCI" + i + "_";
        rRQSet.AddNumPacketInfo(this.m_strMAPacketNameArray[i], -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

        //서브그래프 추가
        var MASubGraph = new CIndicatorSubGraph(this);
        MASubGraph.m_rRQSet = rRQSet;
        MASubGraph.SetSubGraphName("" + i);
        MASubGraph.SetPacketData(this.m_strMAPacketNameArray[i]);
        MASubGraph.SetPropertyInfo(this.m_MAPropertyInfoArray[i].m_MASubGraphPropertyInfo);
        this.m_SubGraphArray[i] = MASubGraph;
    }

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);

    var BaseLine = new CBaseLine(this.m_rChart);
    BaseLine.m_dBaseValue = 20;
    this.m_BaseLineArray[this.m_BaseLineArray.length] = BaseLine;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
}

CRCIIndicator.prototype = new CIndicator();
CRCIIndicator.prototype.constructor = CRCIIndicator;
CRCIIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorParameter = this.m_rGlobalProperty.m_bShowIndicatorParameter;
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    var nLength = this.m_SubGraphArray.length;
    let rSubGraph;
    let i, rShowGraphArray = [];
    let strTitle, strLastestData, rLastestPacketItemData = null;
    for(i = 0 ; i < nLength ; i++ )
    {
        rSubGraph = this.m_SubGraphArray[i];
        if(rSubGraph.m_bShow)
            rShowGraphArray[ rShowGraphArray.length ] = rSubGraph;
        else        
            rSubGraph.HideTitle();
    }

    nLength = rShowGraphArray.length;
    if(nLength <= 0)//Show상태 서브그래프가 없는 경우
    {
        rSubGraph = this.m_SubGraphArray[0];
        if (bShowIndicatorName === true) {
            strTitle = this.m_strTitle;
            if (bShowIndicatorParameter === true) {
                        
                var nVLength = this.m_VariableArray.length;
                if (nVLength > 0) {
                    strTitle += "(";
                    for (var j = 0; j < nVLength; j++) {
                        var rVariable = this.m_VariableArray[j];
                        strTitle += rVariable.m_strData;
                        if (j < nVLength - 1)
                            strTitle += ",";
                    }
                    strTitle += ")";
                }
            }

            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
        else
            this.HideTitle();            
    }
    else
    {
        for( i = 0; i < nLength; i++ )
        {
            rSubGraph = rShowGraphArray[i];
            
            if (i === 0) 
            {
                if (bShowIndicatorName === true) {

                    strTitle = this.m_strTitle;
    
                    if (bShowIndicatorParameter === true) {
                        
                        var nVLength = this.m_VariableArray.length;
                        if (nVLength > 0) {
                            strTitle += "(";
                            for (var j = 0; j < nVLength; j++) {
                                var rVariable = this.m_VariableArray[j];
                                strTitle += rVariable.m_strData;
                                if (j < nVLength - 1)
                                    strTitle += ",";
                            }
                            strTitle += ")";
                        }
                    }
    
                    strTitle += " " + rSubGraph.m_strSubGraphTitle;
                }
                else
                    strTitle = "";
            }
            else
            {
                if (bShowIndicatorName === true)
                    strTitle = rSubGraph.m_strSubGraphTitle;
                else
                    strTitle = "";
            }

            if (bShowIndicatorValue === true) {
    
                rLastestPacketItemData = rSubGraph.m_rPacketData.GetLastestPacketItemData();
                if (rLastestPacketItemData !== null) {
                    if (rLastestPacketItemData.GetPacketType() === NUMERIC_TYPE) {
                        strLastestData = ConvertNumToDigitText(rLastestPacketItemData.m_Data, rLastestPacketItemData.m_rPacketData.m_nDec, 1, rLastestPacketItemData.m_rPacketData.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);
                        strTitle += "(" + strLastestData + ")";
                    }
                    else
                        strTitle += "(" + rLastestPacketItemData.m_Data + ")";
                }
            }
            rSubGraph.SetTitle(strTitle);

            var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
            if (rTitleDiv)
                TitleDivArray[TitleDivArray.length] = rTitleDiv;
        }
    }
}
CRCIIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;
    
    var rInputPacketData = null;
    var rMAPacketData = null;
    var rci = 0;

    var chkBase = -1;

    var n, nLength = this.m_MAPropertyInfoArray.length;
    for (n = 0; n < nLength; n++) {

        if (chkBase === 0) {
            chkBase = 1;
        }

        if (this.m_MAPropertyInfoArray[n].m_MASubGraphPropertyInfo.m_bShow === false)
            continue;

        var nMA = this.m_MAPropertyInfoArray[n].m_nMA;
        rInputPacketData = this.m_rRQSet.GetPacketData(this.m_MAPropertyInfoArray[n].GetPacketNameByInputPacketDataType(this.m_MAPropertyInfoArray[n].m_nInputPacketDataType));
        rMAPacketData = this.m_rRQSet.GetPacketData(this.m_strMAPacketNameArray[n]);
        rMAPacketData.InitDataArray();

        var rSubGraph = this.m_SubGraphArray[n];        
        rSubGraph.m_strSubGraphTitle = "" + nMA;
        var nDataLength = rInputPacketData.GetDataArraySize();
        for (var i = 0; i < nDataLength; i++) {
            var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
            if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
                continue;
            }

            var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
            if (RQPacketsItem === undefined) {
                continue;
            }

            if (i < nMA - 1) {
                RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                continue;
            }

            var data = [];
            for (var j = 0; j < nMA; j++) {
                data[j] = {
                    index: j,
                    value: rInputPacketData.m_DataArray[i+j-nMA+1].m_Data
                };
            }
            data.sort(function(a, b) {
                if (a.value > b.value) {
                    return 1;
                } else if (a.value < b.value) {
                    return -1;
                } else {
                    return 0;
                }
            });
            var d = 0;
            for (var j = 0; j < nMA; j++) {
                d += Math.pow(j - data[j].index, 2);
            }
            rci = (1 - (6 * d / (nMA * (nMA * nMA - 1)))) * 100;

            if (rMAPacketData.GetRQStartIndex() === null) {
                rMAPacketData.SetRQStartIndex(i);
            }
            rMAPacketData.AddTail(i, rci);
            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
        }
    }

    return true;
}
CRCIIndicator.prototype.RealCalc = function (bAddData) {

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;
    
    var rInputPacketData = null;
    var rMAPacketData = null;
    var rci = 0;

    var chkBase = -1;

    var n, nLength = this.m_MAPropertyInfoArray.length;
    for (n = 0; n < nLength; n++) {

        if (chkBase === 0) {
            chkBase = 1;
        }

        if (this.m_MAPropertyInfoArray[n].m_MASubGraphPropertyInfo.m_bShow === false)
            continue;

        var nMA = this.m_MAPropertyInfoArray[n].m_nMA;
        rInputPacketData = this.m_rRQSet.GetPacketData(this.m_MAPropertyInfoArray[n].GetPacketNameByInputPacketDataType(this.m_MAPropertyInfoArray[n].m_nInputPacketDataType));
        rMAPacketData = this.m_rRQSet.GetPacketData(this.m_strMAPacketNameArray[n]);

        var rSubGraph = this.m_SubGraphArray[n];        
        rSubGraph.m_strSubGraphTitle = "" + nMA;
        var nDataLength = rInputPacketData.GetDataArraySize();
        var i = nDataLength - 1;
        var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }

        if (i < nMA - 1) {
            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        var data = [];
        for (var j = 0; j < nMA; j++) {
            data[j] = {
                index: j,
                value: rInputPacketData.m_DataArray[i+j-nMA+1].m_Data
            };
        }
        data.sort(function(a, b) {
            if (a.value > b.value) {
                return 1;
            } else if (a.value < b.value) {
                return -1;
            } else {
                return 0;
            }
        });
        var d = 0;
        for (var j = 0; j < nMA; j++) {
            d += Math.pow(j - data[j].index, 2);
        }
        rci = (1 - (6 * d / (nMA * (nMA * nMA -1)))) * 100;

        if (rMAPacketData.GetRQStartIndex() === null) {
            rMAPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {
            rMAPacketData.AppendRealData( i,rci);
        } else {
            rMAPacketData.UpdateData(i , rci);
        }
        RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
    }

    return REALCALC_SUCCESS;
}

//Volume Oscillator
function COSCVIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "Volume Oscillator 지표";

    //계산결과 담을 패킷생성
    this.m_strOSCVPacketName = this.m_strKey + "_OSCV_";
    rRQSet.AddNumPacketInfo(this.m_strOSCVPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var OSCVSubGraph = new CIndicatorSubGraph(this);
    OSCVSubGraph.m_rRQSet = rRQSet;
    OSCVSubGraph.m_LineTypeInfo.m_clrLine = '#FF0000';
    OSCVSubGraph.SetPacketData(this.m_strOSCVPacketName);
    OSCVSubGraph.SetSubGraphName("OSCV");
    OSCVSubGraph.m_strSubGraphTitle = "OSCV";
    this.m_SubGraphArray.push(OSCVSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);
    this.AddVariable("OSCVPeriod1", NUMERIC_TYPE, 20); // OSCV 기간1
    this.AddVariable("OSCVPeriod2", NUMERIC_TYPE, 9);  // OSCV 기간2
    //this.AddVariable("ViewOSCV", NUMERIC_TYPE, true);  // OSCV View

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveLDataArray = [];
    this.m_SaveSDataArray = [];
}
COSCVIndicator.prototype = new CIndicator();
COSCVIndicator.prototype.constructor = COSCVIndicator;
COSCVIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketVData = this.m_InputPacketDataArray[6];
    if (rInputPacketVData == undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rOSCVPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strOSCVPacketName);
    rOSCVPacketData.InitDataArray();

    var vOSCVPeriod1 = this.m_VariableArray[0].m_strData;
    var vOSCVPeriod2 = this.m_VariableArray[1].m_strData;
    //var vOSCVView = this.m_VariableArray[2].m_strData;

    var MData = rInputPacketVData.m_DataArray;

    var oscv;
    var deviationS = 2 / (vOSCVPeriod1 + 1);
    var deviationL = 2 / (vOSCVPeriod2 + 1);
    var maxPeriod = Math.max(vOSCVPeriod1, vOSCVPeriod2);

    this.m_SaveSDataArray[1] = 0;
    this.m_SaveLDataArray[1] = 0;

    var nDataLength = MData.length;
    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined)
            continue;

        if (i < 1) {
            RQPacketsItem.m_Packets[rOSCVPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        this.m_SaveSDataArray[0] = this.m_SaveSDataArray[1];
        this.m_SaveSDataArray[1] = this.m_SaveSDataArray[0] + deviationS * (MData[i].m_Data - this.m_SaveSDataArray[0]);

        this.m_SaveLDataArray[0] = this.m_SaveLDataArray[1];
        this.m_SaveLDataArray[1] = this.m_SaveLDataArray[0] + deviationL * (MData[i].m_Data - this.m_SaveLDataArray[0]);

        if (i < maxPeriod) {
            RQPacketsItem.m_Packets[rOSCVPacketData.m_nPacketIndex] = undefined;
            continue;
        }
        
        if (this.m_SaveSDataArray[1] !== 0) {
            oscv = (this.m_SaveSDataArray[1]-this.m_SaveLDataArray[1])/this.m_SaveSDataArray[1]*100;
        } else {
            oscv = 0;
        }

        //OSCV
        //if (vOSCVView) {
            if (rOSCVPacketData.GetRQStartIndex() == null) {
                rOSCVPacketData.SetRQStartIndex(i);
            }
            rOSCVPacketData.AddTail(i, oscv);
            RQPacketsItem.m_Packets[rOSCVPacketData.m_nPacketIndex] = rOSCVPacketData.GetData(rOSCVPacketData.GetDataArraySize() - 1);
        //}
    }

    return true;
}
COSCVIndicator.prototype.RealCalc = function (bAddData) {
    var rInputPacketVData = this.m_InputPacketDataArray[6];
    if (rInputPacketVData == undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rOSCVPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strOSCVPacketName);

    var vOSCVPeriod1 = this.m_VariableArray[0].m_strData;
    var vOSCVPeriod2 = this.m_VariableArray[1].m_strData;
    //var vOSCVView = this.m_VariableArray[2].m_strData;

    var MData = rInputPacketVData.m_DataArray;

    var oscv;
    var deviationS = 2 / (vOSCVPeriod1 + 1);
    var deviationL = 2 / (vOSCVPeriod2 + 1);
    var maxPeriod = Math.max(vOSCVPeriod1, vOSCVPeriod2);

    if (this.m_SaveSDataArray[1] == null) {
        this.m_SaveSDataArray[1] = MData[i-1].m_Data;
    }
    if (this.m_SaveLDataArray[1] == null) {
        this.m_SaveLDataArray[1] = MData[i-1].m_Data;
    }

    var nDataLength = MData.length;
    var i = nDataLength - 1;
    var rDateTimeData = rDateTimePacketData.m_DataArray[i];
    var tDateTime = rDateTimeData.GetDateTimeT();

    if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem == undefined) {
        return REALCALC_FAIL;
    }

    if (i < 1) {
        RQPacketsItem.m_Packets[rOSCVPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    
    if (bAddData) {
        this.m_SaveSDataArray[0] = this.m_SaveSDataArray[1];
        this.m_SaveLDataArray[0] = this.m_SaveLDataArray[1];
    }
    
    this.m_SaveSDataArray[1] = this.m_SaveSDataArray[0] + deviationS * (MData[i].m_Data - this.m_SaveSDataArray[0]);
    this.m_SaveLDataArray[1] = this.m_SaveLDataArray[0] + deviationL * (MData[i].m_Data - this.m_SaveLDataArray[0]);

    if (i < maxPeriod) {
        RQPacketsItem.m_Packets[rOSCVPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }
    
    if (this.m_SaveSDataArray[1] !== 0) {
        oscv = (this.m_SaveSDataArray[1]-this.m_SaveLDataArray[1])/this.m_SaveSDataArray[1]*100;
    } else {
        oscv = 0;
    }
    
    //OSCV
    //if (vOSCVView) {
        if (rOSCVPacketData.GetRQStartIndex() == null) {
            rOSCVPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {
            rOSCVPacketData.AppendRealData( i,oscv);
        } else {
            rOSCVPacketData.UpdateData(i , oscv);
        }
        RQPacketsItem.m_Packets[rOSCVPacketData.m_nPacketIndex] = rOSCVPacketData.GetData(rOSCVPacketData.GetDataArraySize() - 1);
    //}
    return REALCALC_SUCCESS;
}

//MAC
function CMACIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_strGroup = "PRICE";

    this.m_nAddType = OVERLAY_TYPE;
    this.m_strOverlayGraphName = "_PRICE_";

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "MAC 지표";

    this.m_nDigit = rRQSet.m_nPriceDigit;

    //계산결과 담을 패킷생성
    this.m_strMACHPacketName = this.m_strKey + "_HIGH_";
    rRQSet.AddNumPacketInfo(this.m_strMACHPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_strMACLPacketName = this.m_strKey + "_LOW_";
    rRQSet.AddNumPacketInfo(this.m_strMACLPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    
    var MACHSubGraph = new CIndicatorSubGraph(this);
    MACHSubGraph.m_rRQSet = rRQSet;
    MACHSubGraph.m_LineTypeInfo.m_clrLine = '#FF5626';
    MACHSubGraph.SetPacketData(this.m_strMACHPacketName);
    MACHSubGraph.SetSubGraphName("HighMA");
    MACHSubGraph.m_strSubGraphTitle = "HighMA";
    this.m_SubGraphArray.push(MACHSubGraph);

    var MACLSubGraph = new CIndicatorSubGraph(this);
    MACLSubGraph.m_rRQSet = rRQSet;
    MACLSubGraph.m_LineTypeInfo.m_clrLine = '#3EC3D1';
    MACLSubGraph.SetPacketData(this.m_strMACLPacketName);
    MACLSubGraph.SetSubGraphName("LowMA");
    MACLSubGraph.m_strSubGraphTitle = "LowMA";
    this.m_SubGraphArray.push(MACLSubGraph);

    //계산에 사용될 변수 기본설정
    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("MACPeriod", NUMERIC_TYPE, 5);  //Period(5)
    /*
    this.AddVariable("ViewMACH", NUMERIC_TYPE, true); //MAC high
    this.AddVariable("ViewMACL", NUMERIC_TYPE, true); //MAC low
    */
    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_SaveHDataArray = [];
    this.m_SaveLDataArray = [];
}
CMACIndicator.prototype = new CIndicator();
CMACIndicator.prototype.constructor = CMACIndicator;

CMACIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];

    if (rInputPacketHData == undefined || rInputPacketLData == undefined) {
        return false;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rMACHPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMACHPacketName);
    var rMACLPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMACLPacketName);

    rMACHPacketData.InitDataArray();
    rMACLPacketData.InitDataArray();

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vMACPeriod = this.m_VariableArray[0].m_strData;
    /*
    var vMACHView = this.m_VariableArray[1].m_strData;
    var vMACLView = this.m_VariableArray[2].m_strData;
    */

    this.m_SaveHDataArray[0] = 0;
    this.m_SaveLDataArray[0] = 0;

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;

    var nDataLength = MHData.length;
    for (var i = 0; i < nDataLength; i++) {
        var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }

        this.m_SaveHDataArray[1] = MHData[i].m_Data;
        this.m_SaveHDataArray[0] += this.m_SaveHDataArray[1];

        this.m_SaveLDataArray[1] = MLData[i].m_Data;
        this.m_SaveLDataArray[0] += this.m_SaveLDataArray[1];
        if (i > vMACPeriod - 1) {
            this.m_SaveHDataArray[0] -= MHData[i-vMACPeriod].m_Data;
            this.m_SaveLDataArray[0] -= MLData[i-vMACPeriod].m_Data;
        }
        
        if (i < vMACPeriod) {
            RQPacketsItem.m_Packets[rMACHPacketData.m_nPacketIndex] = undefined;
            RQPacketsItem.m_Packets[rMACLPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if (rMACHPacketData.GetRQStartIndex() === null) {
            rMACHPacketData.SetRQStartIndex(i);
        }

        if (rMACLPacketData.GetRQStartIndex() === null) {
            rMACLPacketData.SetRQStartIndex(i);
        }

        if( vMACPeriod === 0 )
        {
            rMACHPacketData.AddTail(i, 0);
            rMACLPacketData.AddTail(i, 0);
        }
        else
        {
            rMACHPacketData.AddTail(i, this.m_SaveHDataArray[0]/vMACPeriod);
            rMACLPacketData.AddTail(i, this.m_SaveLDataArray[0]/vMACPeriod);
        }

        RQPacketsItem.m_Packets[rMACHPacketData.m_nPacketIndex] = rMACHPacketData.GetData(rMACHPacketData.GetDataArraySize() - 1);
        RQPacketsItem.m_Packets[rMACLPacketData.m_nPacketIndex] = rMACLPacketData.GetData(rMACLPacketData.GetDataArraySize() - 1);
    }

    return true;
}
CMACIndicator.prototype.RealCalc = function (bAddData) {
    
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];

    if (rInputPacketHData == undefined || rInputPacketLData == undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rMACHPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMACHPacketName);
    var rMACLPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMACLPacketName);

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vMACPeriod = this.m_VariableArray[0].m_strData;
    /*
    var vMACHView = this.m_VariableArray[1].m_strData;
    var vMACLView = this.m_VariableArray[2].m_strData;
    */

    if (this.m_SaveHDataArray[0] == null) {
        this.m_SaveHDataArray[0] = 0;
    }
    if (this.m_SaveLDataArray[0] == null) {
        this.m_SaveLDataArray[0] = 0;
    }

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;

    var nDataLength = MHData.length;
    var i = nDataLength - 1;
    var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem == undefined) {
        return REALCALC_FAIL;
    }

    if (bAddData) {
        this.m_SaveHDataArray[1] = MHData[i].m_Data;
        this.m_SaveHDataArray[0] += this.m_SaveHDataArray[1];

        this.m_SaveLDataArray[1] = MLData[i].m_Data;
        this.m_SaveLDataArray[0] += this.m_SaveLDataArray[1];
        if (i > vMACPeriod - 1) {
            this.m_SaveHDataArray[0] -= MHData[i-vMACPeriod].m_Data;
            this.m_SaveLDataArray[0] -= MLData[i-vMACPeriod].m_Data;
        }
    } else {
        this.m_SaveHDataArray[0] -= this.m_SaveHDataArray[1];
        this.m_SaveHDataArray[1] = MHData[i].m_Data;
        this.m_SaveHDataArray[0] += this.m_SaveHDataArray[1];

        this.m_SaveLDataArray[0] -= this.m_SaveLDataArray[1];
        this.m_SaveLDataArray[1] = MLData[i].m_Data;
        this.m_SaveLDataArray[0] += this.m_SaveLDataArray[1];
    }

    if (i < vMACPeriod) {
        RQPacketsItem.m_Packets[rMACHPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rMACLPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (rMACHPacketData.GetRQStartIndex() === null) {
        rMACHPacketData.SetRQStartIndex(i);
    }
    if (rMACLPacketData.GetRQStartIndex() === null) {
        rMACLPacketData.SetRQStartIndex(i);
    }

    if (bAddData)
    {
        if( vMACPeriod === 0 )
        {
            rMACHPacketData.AppendRealData( i, 0 );
            rMACLPacketData.AppendRealData( i, 0 );
        }
        else
        {
            rMACHPacketData.AppendRealData( i,this.m_SaveHDataArray[0]/vMACPeriod);
            rMACLPacketData.AppendRealData( i,this.m_SaveLDataArray[0]/vMACPeriod);
        }
    } 
    else
    {
        if( vMACPeriod === 0 )
        {
            rMACHPacketData.UpdateData(i , 0 );
            rMACLPacketData.UpdateData(i , 0 );
        }
        else
        {
            rMACHPacketData.UpdateData(i , this.m_SaveHDataArray[0]/vMACPeriod);
            rMACLPacketData.UpdateData(i , this.m_SaveLDataArray[0]/vMACPeriod);
        }
    }

    RQPacketsItem.m_Packets[rMACHPacketData.m_nPacketIndex] = rMACHPacketData.GetData(rMACHPacketData.GetDataArraySize() - 1);
    RQPacketsItem.m_Packets[rMACLPacketData.m_nPacketIndex] = rMACLPacketData.GetData(rMACLPacketData.GetDataArraySize() - 1);

    return REALCALC_SUCCESS;
}

//그물차트
function CRainbowIndicator(rRQSet, strIndicatorName, strKey) {

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_strGroup = "PRICE";

    this.m_nAddType = OVERLAY_TYPE;
    this.m_strOverlayGraphName = "_PRICE_";

    this.m_nMaxCount = 20;

    var period = 5;
    var gap = 1;
    var count = 15;
    
    this.m_MAPropertyInfoArray = [];
    for (var i = 0; i < this.m_nMaxCount; i++) {        
        this.m_MAPropertyInfoArray[i] = new CMAPropertyInfo(i, period + (i*gap), 3, 0, "rgb(255,000,000)", 1, 0, i < count ? true : false);
    }

    this.m_strTitle = "그물차트";
    this.m_nDigit = rRQSet.m_nPriceDigit;
    this.m_strMAPacketNameArray = [];
    //계산결과 담을 패킷생성
    var length = this.m_MAPropertyInfoArray.length;
    for (var i = 0; i < length; i++) {
        //패킷추가
        this.m_strMAPacketNameArray[i] = this.m_strKey + "_RAINBOW" + i + "_";
        rRQSet.AddNumPacketInfo(this.m_strMAPacketNameArray[i], -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

        //서브그래프 추가
        var MASubGraph = new CIndicatorSubGraph(this);
        MASubGraph.m_rRQSet = rRQSet;
        MASubGraph.SetSubGraphName("" + i);
        MASubGraph.SetPacketData(this.m_strMAPacketNameArray[i]);
        MASubGraph.SetPropertyInfo(this.m_MAPropertyInfoArray[i].m_MASubGraphPropertyInfo);
        this.m_SubGraphArray[i] = MASubGraph;

        //this.AddVariable("ViewRAINBOW" + i, NUMERIC_TYPE, true); // 상한선
    }

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.AddVariable("RAINBOWPeriod", NUMERIC_TYPE, period); // 이동평균 기간
    this.AddVariable("RAINBOWGap", NUMERIC_TYPE, gap); // 간격
    this.AddVariable("RAINBOWCount", NUMERIC_TYPE, count); // 개수
}
CRainbowIndicator.prototype = new CIndicator();
CRainbowIndicator.prototype.constructor = CRainbowIndicator;

CRainbowIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorParameter = this.m_rGlobalProperty.m_bShowIndicatorParameter;    

    //지표명 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    //그물차트는 subgraph가 많은 관계로 지표값 보기는 지원하지 않습니다.
    if (bShowIndicatorName === false) {
        this.HideTitle();
        return;
    }

    var nLength = this.m_SubGraphArray.length;
    
    if(nLength > 0){

        var rSubGraph = this.m_SubGraphArray[0];
        
        var strTitle = this.m_strTitle;

        if (bShowIndicatorParameter === true) {

            var nVLength = this.m_VariableArray.length;
            if (nVLength > 0) {
                strTitle += "(";
                for (var j = 0; j < nVLength; j++) {

                    var rVariable = this.m_VariableArray[j];
                    strTitle += rVariable.m_strData;
                    if (j < nVLength - 1)
                        strTitle += ",";
                }
                strTitle += ")";
            }
        }
        
        rSubGraph.SetTitle(strTitle);

        var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
        if (rTitleDiv)
            TitleDivArray[TitleDivArray.length] = rTitleDiv;    
    }
}

CRainbowIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    let strRQ = this.m_rRQSet.GetRQ();
    let rXScaleMng = this.GetXScaleMng();
    let rDateTimePacketData = this.m_rXAxisPacket;

    let rInputPacketData = null;
    let rMAPacketData = null;

    let nMA = null;
    let vRainbowPeriod = Number(this.m_VariableArray[0].m_strData);
    let vRainbowGap = Number(this.m_VariableArray[1].m_strData);
    let vRainbowCount = Number(this.m_VariableArray[2].m_strData);
    if(vRainbowCount > this.m_nMaxCount)
    {
        this.m_VariableArray[2].m_strData = "" + this.m_nMaxCount;
        vRainbowCount = this.m_nMaxCount;
    }

    var nLength = this.m_MAPropertyInfoArray.length;
    for (var n = 0; n < nLength; n++) {

        this.m_MAPropertyInfoArray[n].m_nMA = vRainbowPeriod + (n * vRainbowGap);

        if(n < vRainbowCount )
            this.m_MAPropertyInfoArray[n].m_MASubGraphPropertyInfo.m_bShow = true;
        else
            this.m_MAPropertyInfoArray[n].m_MASubGraphPropertyInfo.m_bShow = false;

        rMAPacketData = this.m_rRQSet.GetPacketData(this.m_strMAPacketNameArray[n]);
        rMAPacketData.InitDataArray();
        rInputPacketData = this.m_rRQSet.GetPacketData(this.m_MAPropertyInfoArray[n].GetPacketNameByInputPacketDataType(this.m_MAPropertyInfoArray[n].m_nInputPacketDataType));
        var nDataLength = rInputPacketData.GetDataArraySize();

        if (this.m_MAPropertyInfoArray[n].m_MASubGraphPropertyInfo.m_bShow === false)
        {
            for (var i = 0; i < nDataLength; i++) {
                var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
                if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
                    continue;
                }    
                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem == undefined) {
                    continue;
                }    
                RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;                
            }
            continue;
        }

        nMA = this.m_MAPropertyInfoArray[n].m_nMA;
        var rSubGraph = this.m_SubGraphArray[n];        
        rSubGraph.m_strSubGraphTitle = "" + nMA;
        rSubGraph.m_SaveDataArray[0] = 0;

        for (var i = 0; i < nDataLength; i++) {
            var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
            if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
                continue;
            }

            var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
            if (RQPacketsItem == undefined) {
                continue;
            }

            //MA 계산
            rSubGraph.m_SaveDataArray[1] = rInputPacketData.m_DataArray[i].m_Data;//실시간 data 가 업데이트 되는 경우에 사용
            rSubGraph.m_SaveDataArray[0] += rSubGraph.m_SaveDataArray[1];
            if (i > nMA - 1) {
                rSubGraph.m_SaveDataArray[0] -= rInputPacketData.m_DataArray[i - nMA].m_Data;
            }
            
            //start index 조절
            if (i < nMA) {
                RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
                continue;
            }

            if (rMAPacketData.GetRQStartIndex() === null) {
                rMAPacketData.SetRQStartIndex(i);
            }

            if( nMA === 0 )
                rMAPacketData.AddTail(i, 0 );
            else
                rMAPacketData.AddTail(i, rSubGraph.m_SaveDataArray[0] / nMA);
            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
        }
    }

    return true;
}
CRainbowIndicator.prototype.RealCalc = function (bAddData) {
    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rInputPacketData = null;
    var rMAPacketData = null;

    var nLength = this.m_MAPropertyInfoArray.length;
    for (var n = 0; n < nLength; n++) {

        if (this.m_MAPropertyInfoArray[n].m_MASubGraphPropertyInfo.m_bShow == false)
            continue;

        var nMA = this.m_MAPropertyInfoArray[n].m_nMA;

        rInputPacketData = this.m_rRQSet.GetPacketData(this.m_MAPropertyInfoArray[n].GetPacketNameByInputPacketDataType(this.m_MAPropertyInfoArray[n].m_nInputPacketDataType));
        rMAPacketData = this.m_rRQSet.GetPacketData(this.m_strMAPacketNameArray[n]);

        var rSubGraph = this.m_SubGraphArray[n];
        if( rSubGraph.m_SaveDataArray[0] === null ) {
            rSubGraph.m_SaveDataArray[0] = 0;
        }

        var nDataLength = rInputPacketData.GetDataArraySize();
        var i = nDataLength - 1;

        var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] === undefined) {
            continue;
        }

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem === undefined) {
            continue;
        }

        //MA 계산
        if (bAddData) {
            rSubGraph.m_SaveDataArray[1] = rInputPacketData.m_DataArray[i].m_Data;
            rSubGraph.m_SaveDataArray[0] += rSubGraph.m_SaveDataArray[1];
            if (i > nMA - 1) {
                rSubGraph.m_SaveDataArray[0] -= rInputPacketData.m_DataArray[i - nMA].m_Data;
            }
        } else {
            rSubGraph.m_SaveDataArray[0] -= rSubGraph.m_SaveDataArray[1];
            rSubGraph.m_SaveDataArray[1] = rInputPacketData.m_DataArray[i].m_Data;
            rSubGraph.m_SaveDataArray[0] += rSubGraph.m_SaveDataArray[1];
        }
        
        //start index 조절
        if (i < nMA) {
            RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = undefined;
            continue;
        }

        if (rMAPacketData.GetRQStartIndex() === null) {
            rMAPacketData.SetRQStartIndex(i);
        }
        if (bAddData) {
            if( nMA === 0 )
                rMAPacketData.AppendRealData( i, 0 );
            else
                rMAPacketData.AppendRealData( i,rSubGraph.m_SaveDataArray[0] / nMA);
        } else {
            if( nMA === 0 )
                rMAPacketData.UpdateData( i, 0 );
            else
                rMAPacketData.UpdateData(i , rSubGraph.m_SaveDataArray[0] / nMA);
        }
        RQPacketsItem.m_Packets[rMAPacketData.m_nPacketIndex] = rMAPacketData.GetData(rMAPacketData.GetDataArraySize() - 1);
    }
    return REALCALC_SUCCESS;
}
/////////////////////////////
//CThreeLineIndicator(삼선전환도)
function CThreeLineIndicator(rRQSet, strIndicatorName, strKey){

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rChart.SetChartType("ThreeLine", true);

    this.m_bSpecialIndicator = true;

    this.m_strGroup = "PRICE";

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "ThreeLine";
    this.m_strTitleLangKey = "defaultindicator.threeline";

    this.m_nDigit = rRQSet.m_nPriceDigit;

    this.m_DataListArray = [];

    //계산결과 담을 패킷생성
    //1.시계열패킷추가
    let strXPacketName = "THREELINE_DATETIME";
    if(rRQSet.m_RQInfo.m_nCycle === 5 || rRQSet.m_RQInfo.m_nCycle === 6)
        rRQSet.AddDateTimePacketInfo( strXPacketName, "YYYYMMDDHHMMSS", 14, INDICATOR_PACKET_USE_TYPE);//INPUT_PACKET_USE_TYPE);        
    else
        rRQSet.AddDateTimePacketInfo( strXPacketName, "YYYYMMDD", 8, INDICATOR_PACKET_USE_TYPE);//INPUT_PACKET_USE_TYPE);

    //2. 계산결과 담을 패킷생성
    var strPacketNameArray = ["_ThreeLine_OPEN_", "_ThreeLine_CLOSE_"];
    this.m_strThreeLineOpenPacketName = this.m_strKey + "_ThreeLine_OPEN_";
    let rOpenPacket = rRQSet.AddNumPacketInfo(this.m_strThreeLineOpenPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    this.m_strThreeLineClosePacketName = this.m_strKey + "_ThreeLine_CLOSE_";
    let rClosePacket = rRQSet.AddNumPacketInfo(this.m_strThreeLineClosePacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);

    this.m_rOutputPacketArray = [];
    this.m_rOutputPacketArray.push( rOpenPacket );
    this.m_rOutputPacketArray.push( rClosePacket );

    let ThreeLineSubGraph = new CThreeLineSubGraph(this);
    ThreeLineSubGraph.m_rRQSet = rRQSet;
    ThreeLineSubGraph.SetPacketData(this.m_rOutputPacketArray);
    ThreeLineSubGraph.SetSubGraphName("ThreeLine");
    ThreeLineSubGraph.m_strSubGraphTitle = "";
    ThreeLineSubGraph.m_strSubGraphTitleLangKey = "defaultindicator.threeline";
    ThreeLineSubGraph.m_nOpenPacketIndex = rOpenPacket.m_nPacketIndex;
    ThreeLineSubGraph.m_nClosePacketIndex = rClosePacket.m_nPacketIndex;
    this.m_SubGraphArray[this.m_SubGraphArray.length] = ThreeLineSubGraph;

    this.AddInputPacket(["_OPEN_", "_CLOSE_"]);
    this.AddVariable("BoxSize", NUMERIC_TYPE, 3);  //박스크기

    this.m_rXAxisPacket = rRQSet.GetPacketData(strXPacketName);
    this.m_rInputXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    //실시간계산을 위해 저장변수
    this.m_OpenPrice = null;
    this.m_ClosePrice = null;
    this.m_strPrvDateTime = null;

    //실시간계산을 위해 저장변수 초기화
    this.InitRealVariable();

}
CThreeLineIndicator.prototype = new CIndicator();
CThreeLineIndicator.prototype.constructor = CThreeLineIndicator;

CThreeLineIndicator.prototype.GetExcelData = function(nIndex, ColDataArray){

    this.m_SubGraphArray[0].GetExcelData(nIndex, ColDataArray);
}

CThreeLineIndicator.prototype.GetExcelTitle = function(TitleArray){    
    
    let i, rSubGraph = this.m_SubGraphArray[0];
    let nTitleArrayLen = rSubGraph.m_strSubGraphTitleArray.length;
    for( i = 0 ; i < nTitleArrayLen ; i++ )//거래량은 제외
    {
        TitleArray[TitleArray.length] = rSubGraph.m_strSubGraphTitleArray[i];    
    }
}

CThreeLineIndicator.prototype.InitRealVariable = function(){

    this.m_rPricePacket = null;
    this.m_rThreeLineOpenPacketData = null;
    this.m_ThreeLineClosePacketData = null;
    this.m_OpenPrice = null;    
    this.m_ClosePrice = null;
    this.m_nIndex = null;
}

//특수지표에만 실제함수 추가
CThreeLineIndicator.prototype.GetInputXScalePacketNameArray = function(rXScalePacketNameArray){
    if(this.m_rInputXAxisPacket){
        let i, strPacketName, nLen = rXScalePacketNameArray.length;
        for( i = 0 ; i < nLen ; i++ )
        {
            if(this.m_rInputXAxisPacket.m_strPacketName === rXScalePacketNameArray[i])
                return;
        }
        rXScalePacketNameArray[nLen] = this.m_rInputXAxisPacket.m_strPacketName;
    }
    return;
}

CThreeLineIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    //CIndicator.prototype.Calc.call(this, bSetup);
    if(!bAppend){
        this.InitRealVariable();
    }

    var rInputPacketCData = this.m_InputPacketDataArray[1];
    if (rInputPacketCData === undefined)
        return false;
    
    this.m_rPricePacket = rInputPacketCData;

    if(bAppend){//추가부르기인 경우 XScaleMng 전체를 초기화하지 않는다
        var rXScaleMng = this.GetXScaleMng();
        rXScaleMng.m_XScaleItemArray.length = 0;
    }
    else{
        this.m_rChart.RegXScaleMngByPacketData(this.m_rXAxisPacket);
    }

    return this.TotalCalc(bSetup);
}

CThreeLineIndicator.prototype.TotalCalc = function (bSetup=false, bRealCalc=false)
{
    let rOrgDateTimePacket = this.m_rInputXAxisPacket;
    if( rOrgDateTimePacket === null)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    let nIndex = 0;
    let RQPacketsItem = null;
    let nCycle = this.m_rRQSet.m_RQInfo.m_nCycle;
    let nInterval = this.m_rRQSet.m_RQInfo.m_nInterval;

    var rXScaleMng = this.GetXScaleMng();
    if(bRealCalc === true){
        rXScaleMng.m_XScaleItemArray.length = 0;
    }
    var nDataCnt = rOrgDateTimePacket.GetDataArraySize();

    var rDateTimePacketData = this.m_rXAxisPacket;

    var rThreeLineOPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strThreeLineOpenPacketName);
    var rThreeLineCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strThreeLineClosePacketName);

    rDateTimePacketData.InitDataArray();

    rThreeLineOPacketData.InitDataArray();
    rThreeLineOPacketData.AppendPacketStartIndexObj(0);
    rThreeLineOPacketData.CalcMinMaxItemCnt(nDataCnt, false);
    rThreeLineOPacketData.SetDataFormat(10, null, this.m_rRQSet.m_nPriceDigit);

    rThreeLineCPacketData.InitDataArray();
    rThreeLineCPacketData.AppendPacketStartIndexObj(0);
    rThreeLineCPacketData.CalcMinMaxItemCnt(nDataCnt, false);
    rThreeLineCPacketData.SetDataFormat(10, null, this.m_rRQSet.m_nPriceDigit);

    var vBoxSize = this.m_VariableArray[0].m_strData; //칸전환

    var rPricePacket = null, rPricePacketArray = null;
    rPricePacket = this.m_rPricePacket;
    rPricePacketArray = rPricePacket.m_DataArray;

    //실시간계산을 위해 저장    
    this.m_rThreeLineOPacketData = rThreeLineOPacketData;
    this.m_rThreeLineCPacketData = rThreeLineCPacketData;

    rThreeLineOPacketData.SetRQStartIndex(0);
    rThreeLineCPacketData.SetRQStartIndex(0);

    var nDataLength = rPricePacketArray.length;
    if( nDataLength <= 0 )
        return false;

    if(vBoxSize <= 0)
        return false;

    var i = 0, j=0, k=0, ClosePrice = 0;
    var strDateTime, strDateTimeType;
    strDateTime = rOrgDateTimePacket.m_DataArray[0].m_strDateTime;
    strDateTimeType = rOrgDateTimePacket.m_DataArray[0].m_strDateTimeType;    

    this.m_DataListArray.length = 0;
    for(i=0; i < vBoxSize + 1; i++)
    {
        this.m_DataListArray[i] = rPricePacketArray[0].m_Data;
    }

    for(i = 0; i < nDataLength; i++)
    {
        ClosePrice = rPricePacketArray[i].m_Data;
        strDateTime = rOrgDateTimePacket.m_DataArray[i].GetDateTimeString();

        if(this.m_DataListArray[0] === ClosePrice) 
            continue;

        if(((ClosePrice - this.m_DataListArray[0]) * (this.m_DataListArray[0] - this.m_DataListArray[1])) >= 0){
            RQPacketsItem = new CRQPacketsItem(strRQ, nCycle, nInterval);
        }        
        else if( 0 < ((this.m_DataListArray[vBoxSize] - ClosePrice) * (this.m_DataListArray[0] - this.m_DataListArray[vBoxSize])))
        {
            for(j = vBoxSize;  j >= 2; j--)
            {
                this.m_DataListArray[j] = this.m_DataListArray[0];
            }
            this.m_DataListArray[0] = this.m_DataListArray[1];
            this.m_DataListArray[1] = this.m_DataListArray[2];

            RQPacketsItem = new CRQPacketsItem(strRQ, nCycle, nInterval);
        }
        else
            continue;

        rDateTimePacketData.AddTail( nIndex, strDateTime, strDateTimeType, false, nCycle );
        RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex] = rDateTimePacketData.GetData(rDateTimePacketData.GetDataArraySize() - 1);

        rThreeLineOPacketData.AddTail( nIndex, this.m_DataListArray[0] );
        RQPacketsItem.m_Packets[rThreeLineOPacketData.m_nPacketIndex] = rThreeLineOPacketData.GetData(rThreeLineOPacketData.GetDataArraySize() - 1);

        rThreeLineCPacketData.AddTail( nIndex, ClosePrice );
        RQPacketsItem.m_Packets[rThreeLineCPacketData.m_nPacketIndex] = rThreeLineCPacketData.GetData(rThreeLineCPacketData.GetDataArraySize() - 1);

        RQPacketsItem.m_rXScalePacketData = RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex];
        rXScaleMng.SetRQPacketsItem(strRQ, RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex], RQPacketsItem);
        
        nIndex++;

        for(k = vBoxSize; k>=1; k--)
        {
            this.m_DataListArray[k] = this.m_DataListArray[k-1];
        }
        this.m_DataListArray[0] = ClosePrice;
    }

    return true;    
}

CThreeLineIndicator.prototype.RealCalc = function (bAddData) {

    ////////////////////////////////////////////////////////////////
    //실시간 처리시 봉삭제 기능 추가 전까지 재계산으로 임시처리
    this.TotalCalc(false, true);
    return RECALC_SPECIALCHART;
    ////////////////////////////////////////////////////////////////    
    
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];

    if (rInputPacketHData == undefined || rInputPacketLData == undefined) {
        return REALCALC_FAIL;
    }

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rMACHPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMACHPacketName);
    var rMACLPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strMACLPacketName);

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vMACPeriod = this.m_VariableArray[0].m_strData;
    /*
    var vMACHView = this.m_VariableArray[1].m_strData;
    var vMACLView = this.m_VariableArray[2].m_strData;
    */

    if (this.m_SaveHDataArray[0] == null) {
        this.m_SaveHDataArray[0] = 0;
    }
    if (this.m_SaveLDataArray[0] == null) {
        this.m_SaveLDataArray[0] = 0;
    }

    var MHData = rInputPacketHData.m_DataArray;
    var MLData = rInputPacketLData.m_DataArray;

    var nDataLength = MHData.length;
    var i = nDataLength - 1;
    var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
    if (rXScaleMng.m_tTimeArray[tDateTime] == undefined) {
        return REALCALC_FAIL;
    }

    var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
    if (RQPacketsItem == undefined) {
        return REALCALC_FAIL;
    }

    if (bAddData) {
        this.m_SaveHDataArray[1] = MHData[i].m_Data;
        this.m_SaveHDataArray[0] += this.m_SaveHDataArray[1];

        this.m_SaveLDataArray[1] = MLData[i].m_Data;
        this.m_SaveLDataArray[0] += this.m_SaveLDataArray[1];
        if (i > vMACPeriod - 1) {
            this.m_SaveHDataArray[0] -= MHData[i-vMACPeriod].m_Data;
            this.m_SaveLDataArray[0] -= MLData[i-vMACPeriod].m_Data;
        }
    } else {
        this.m_SaveHDataArray[0] -= this.m_SaveHDataArray[1];
        this.m_SaveHDataArray[1] = MHData[i].m_Data;
        this.m_SaveHDataArray[0] += this.m_SaveHDataArray[1];

        this.m_SaveLDataArray[0] -= this.m_SaveLDataArray[1];
        this.m_SaveLDataArray[1] = MLData[i].m_Data;
        this.m_SaveLDataArray[0] += this.m_SaveLDataArray[1];
    }

    if (i < vMACPeriod) {
        RQPacketsItem.m_Packets[rMACHPacketData.m_nPacketIndex] = undefined;
        RQPacketsItem.m_Packets[rMACLPacketData.m_nPacketIndex] = undefined;
        return REALCALC_FAIL;
    }

    if (rMACHPacketData.GetRQStartIndex() === null) {
        rMACHPacketData.SetRQStartIndex(i);
    }
    if (rMACLPacketData.GetRQStartIndex() === null) {
        rMACLPacketData.SetRQStartIndex(i);
    }

    if (bAddData)
    {
        if( vMACPeriod === 0 )
        {
            rMACHPacketData.AppendRealData( i, 0 );
            rMACLPacketData.AppendRealData( i, 0 );
        }
        else
        {
            rMACHPacketData.AppendRealData( i,this.m_SaveHDataArray[0]/vMACPeriod);
            rMACLPacketData.AppendRealData( i,this.m_SaveLDataArray[0]/vMACPeriod);
        }
    } 
    else
    {
        if( vMACPeriod === 0 )
        {
            rMACHPacketData.UpdateData(i , 0 );
            rMACLPacketData.UpdateData(i , 0 );
        }
        else
        {
            rMACHPacketData.UpdateData(i , this.m_SaveHDataArray[0]/vMACPeriod);
            rMACLPacketData.UpdateData(i , this.m_SaveLDataArray[0]/vMACPeriod);
        }
    }

    RQPacketsItem.m_Packets[rMACHPacketData.m_nPacketIndex] = rMACHPacketData.GetData(rMACHPacketData.GetDataArraySize() - 1);
    RQPacketsItem.m_Packets[rMACLPacketData.m_nPacketIndex] = rMACLPacketData.GetData(rMACLPacketData.GetDataArraySize() - 1);

    return REALCALC_SUCCESS;
}
/////////////////////////////
//CPAndFIndicator(P&F)->미래에셋버전
function CPAndFIndicator(rRQSet, strIndicatorName, strKey){

    console.log("CPAndFIndi");

    CIndicator.call(this, rRQSet, strIndicatorName, strKey);

    this.m_rChart.SetChartType("PAndFChart", true);

    this.m_bSpecialIndicator = true;

    this.m_strGroup = "PRICE";

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "PAndF";
    this.m_strTitleLangKey = "defaultindicator.pandf";

    this.m_nDigit = rRQSet.m_nPriceDigit;

    this.m_UnitSize = 1;

    //설정으로 UnitSize 값 변경시 종목코드 저장
    //(목적:종목코드 변경 조회시 UnitSize값을 자동계산하기 위함)
    this.m_strItemCodeOnUserInput = null;

    //계산결과 담을 패킷생성    
    //1.시계열패킷추가
    let strXPacketName = "PANDF_DATETIME";
    if(rRQSet.m_RQInfo.m_nCycle === 5 || rRQSet.m_RQInfo.m_nCycle === 6)
        rRQSet.AddDateTimePacketInfo( strXPacketName, "YYYYMMDDHHMMSS", 14, INDICATOR_PACKET_USE_TYPE);//INPUT_PACKET_USE_TYPE);        
    else
        rRQSet.AddDateTimePacketInfo( strXPacketName, "YYYYMMDD", 8, INDICATOR_PACKET_USE_TYPE);//INPUT_PACKET_USE_TYPE);

    //2. 계산결과 담을 패킷생성
    //var strPacketNameArray = [ "_PAndF_OPEN_", "_PAndF_HIGH_", "_PAndF_LOW_", "_PAndF_CLOSE_"];
    var strPacketNameArray = [ "_PAndF_OPEN_", "_PAndF_CLOSE_"];
    this.m_strPAndFOpenPacketName = this.m_strKey + "_PAndF_OPEN_";
    let rOpenPacket = rRQSet.AddNumPacketInfo(this.m_strPAndFOpenPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    // this.m_strPAndFHighPacketName = this.m_strKey + "_PAndF_HIGH_";
    // let rHighPacket = rRQSet.AddNumPacketInfo(this.m_strPAndFHighPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    // this.m_strPAndFLowPacketName = this.m_strKey + "_PAndF_LOW_";
    //let rLowPacket = rRQSet.AddNumPacketInfo(this.m_strPAndFLowPacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    this.m_strPAndFClosePacketName = this.m_strKey + "_PAndF_CLOSE_";
    let rClosePacket = rRQSet.AddNumPacketInfo(this.m_strPAndFClosePacketName, -1, INDICATOR_PACKET_USE_TYPE, 10, null, this.m_nDigit);
    
    this.m_rOutputPacketArray = [];
    this.m_rOutputPacketArray.push( rOpenPacket );
    //this.m_rOutputPacketArray.push( rHighPacket );
    //this.m_rOutputPacketArray.push( rLowPacket );
    this.m_rOutputPacketArray.push( rClosePacket );    

    let PAndFSubGraph = new CPAndFSubGraph(this);
    PAndFSubGraph.m_rRQSet = rRQSet;
    
    //일반적으로 _close_ 패킷을 SubGraph의 대표패킷으로 등록하지만 PAndF는 Close패킷이 없으므로 High 패킷등록시킴
    PAndFSubGraph.SetPacketData(this.m_rOutputPacketArray);
    PAndFSubGraph.SetSubGraphName("PAndF");
    PAndFSubGraph.m_strSubGraphTitle = "PAndF";    
    PAndFSubGraph.m_nOpenPacketIndex = rOpenPacket.m_nPacketIndex;
    // PAndFSubGraph.m_nHighPacketIndex = rHighPacket.m_nPacketIndex;
    // PAndFSubGraph.m_nLowPacketIndex = rLowPacket.m_nPacketIndex;
    PAndFSubGraph.m_nClosePacketIndex = rClosePacket.m_nPacketIndex;
    this.m_SubGraphArray[this.m_SubGraphArray.length] = PAndFSubGraph;

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);

    //계산에 사용될 변수 기본설정
    this.AddVariable("BoxSize", NUMERIC_TYPE, 3);//칸전환
    this.AddVariable("UnitSize",NUMERIC_TYPE, 0);//칸크기
    this.AddVariable("bUserInput",NUMERIC_TYPE, 0);//사용자입력여부
    this.AddVariable("DType", NUMERIC_TYPE, 3);    // 데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)   

    this.m_rXAxisPacket = rRQSet.GetPacketData(strXPacketName);
    this.m_rInputXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    //실시간계산을 위해 저장변수 초기화
    this.InitRealVariable();
}
CPAndFIndicator.prototype = new CIndicator();
CPAndFIndicator.prototype.constructor = CPAndFIndicator;

CPAndFIndicator.prototype.GetExcelData = function(nIndex, ColDataArray){

    this.m_SubGraphArray[0].GetExcelData(nIndex, ColDataArray);
}

CPAndFIndicator.prototype.GetExcelTitle = function(TitleArray){    
    
    let i, rSubGraph = this.m_SubGraphArray[0];
    let nTitleArrayLen = rSubGraph.m_strSubGraphTitleArray.length;
    for( i = 0 ; i < nTitleArrayLen ; i++ )//거래량은 제외
    {
        TitleArray[TitleArray.length] = rSubGraph.m_strSubGraphTitleArray[i];    
    }
}

CPAndFIndicator.prototype.InitRealVariable = function(){

    this.m_rPricePacket = null;
    this.m_rPAndFOpenPacketData = null;
    this.m_rPAndFHighPacketData = null;
    this.m_rPAndFLowPacketData = null;
    this.m_rPAndFClosePacketData = null;
    this.m_MinData = null;
    this.m_MaxData = null;
    this.m_BasePrice = null;
    this.m_OpenPrice = null;    
    this.m_ClosePrice = null;
    this.m_nIndex = null;    
    this.m_bUpCheck = null;
    this.m_FirstData = null;
    this.m_SecondData = null;
    this.m_bFixSecondData = false;
    this.m_strPrvDateTime = null;

    this.m_PrevBasePrice = null;
    this.m_PrevOpenPrice = null;    
    this.m_PrevClosePrice = null;
    this.m_nPrevIndex = null;
    this.m_bPrevUpCheck = null;    
    this.m_bPrevFixSecondData = false;

    this.m_FirstData = null;
    this.m_SecondData = null;
}
//특수지표에만 실제함수 추가
CPAndFIndicator.prototype.GetInputXScalePacketNameArray = function(rXScalePacketNameArray){
    if(this.m_rInputXAxisPacket){
        let i, strPacketName, nLen = rXScalePacketNameArray.length;
        for( i = 0 ; i < nLen ; i++ )
        {
            if(this.m_rInputXAxisPacket.m_strPacketName === rXScalePacketNameArray[i])
                return;
        }
        rXScalePacketNameArray[nLen] = this.m_rInputXAxisPacket.m_strPacketName;
    }
    return;
}

CPAndFIndicator.prototype.Calc = function (bSetup=false, bAppend = false)
{
    //CIndicator.prototype.Calc.call(this);//특수차트는 기본Calc 동작이 다르므로 베이스클래스 Calc 호출하지 않는다

    //실시간계산을 위해 저장변수 초기화
    if(!bAppend){
        this.InitRealVariable();
    }

    let rInputPacketOData = this.m_InputPacketDataArray[0];
    let rInputPacketHData = this.m_InputPacketDataArray[1];
    let rInputPacketLData = this.m_InputPacketDataArray[2];
    let rInputPacketCData = this.m_InputPacketDataArray[3];
    let rInputPacketHLData = this.m_InputPacketDataArray[4];
    let rInputPacketHLCData = this.m_InputPacketDataArray[5];
    if (rInputPacketCData == undefined)
        return false;

    let rPricePacket = null;
    let vDType = this.m_VariableArray[3].m_strData;    
    switch (vDType) 
    {
    case 0:
        rPricePacket = rInputPacketOData;   break;
    case 1:
        rPricePacket = rInputPacketHData;   break;
    case 2:
        rPricePacket = rInputPacketLData;   break;
    case 3:
        rPricePacket = rInputPacketCData;   break;
    case 4:
        rPricePacket = rInputPacketHLData;  break;
    case 5:
        rPricePacket = rInputPacketHLCData; break;
    default:
        rPricePacket = rInputPacketCData;   break;
    }
    this.m_rPricePacket = rPricePacket;

    if(bAppend){//추가부르기인 경우 XScaleMng 전체를 초기화하지 않는다
        let rXScaleMng = this.GetXScaleMng();    
        rXScaleMng.m_XScaleItemArray.length = 0;        
    }
    else{
        this.m_rChart.RegXScaleMngByPacketData(this.m_rXAxisPacket);    
    }

    return this.TotalCalc(bSetup);
}

//테스트화면의 데이터가 미래에셋과 일치하여 검증을 위해 hts 미래에셋버전으로 변경
CPAndFIndicator.prototype.TotalCalc = function (bSetup=false, bRealCalc=false)
{
    let rOrgDateTimePacket = this.m_rInputXAxisPacket;
    if( rOrgDateTimePacket === null ) 
        return false;

    let strRQ = this.m_rRQSet.GetRQ();    
    let nIndex = 0;
    let RQPacketsItem = null;
    let nCycle = this.m_rRQSet.m_RQInfo.m_nCycle;
    let nInterval = this.m_rRQSet.m_RQInfo.m_nInterval;

    let rXScaleMng = this.GetXScaleMng();
    if(bRealCalc === true){
        rXScaleMng.m_XScaleItemArray.length = 0;
    }

    let nDataCnt = rOrgDateTimePacket.GetDataArraySize();
    
    let rDateTimePacketData = this.m_rXAxisPacket;
    let rPAndFOpenPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPAndFOpenPacketName);
    // let rPAndFHighPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPAndFHighPacketName);
    // let rPAndFLowPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPAndFLowPacketName);
    let rPAndFClosePacketData = this.m_rRQSet.GetPacketDataByName(this.m_strPAndFClosePacketName);

    rDateTimePacketData.InitDataArray();
    
    rPAndFOpenPacketData.InitDataArray();
    rPAndFOpenPacketData.AppendPacketStartIndexObj(0);
    rPAndFOpenPacketData.CalcMinMaxItemCnt(nDataCnt, false);
    rPAndFOpenPacketData.SetDataFormat(10, null, this.m_rRQSet.m_nPriceDigit);

    // rPAndFHighPacketData.InitDataArray();
    // rPAndFHighPacketData.AppendPacketStartIndexObj(0);
    // rPAndFHighPacketData.CalcMinMaxItemCnt(nDataCnt, false);
    // rPAndFHighPacketData.SetDataFormat(10, null, this.m_rRQSet.m_nPriceDigit);

    // rPAndFLowPacketData.InitDataArray();
    // rPAndFLowPacketData.AppendPacketStartIndexObj(0);
    // rPAndFLowPacketData.CalcMinMaxItemCnt(nDataCnt, false);
    // rPAndFLowPacketData.SetDataFormat(10, null, this.m_rRQSet.m_nPriceDigit);

    rPAndFClosePacketData.InitDataArray();
    rPAndFClosePacketData.AppendPacketStartIndexObj(0);
    rPAndFClosePacketData.CalcMinMaxItemCnt(nDataCnt, false);    
    rPAndFClosePacketData.SetDataFormat(10, null, this.m_rRQSet.m_nPriceDigit);

    let vBoxSize = this.m_VariableArray[0].m_strData;//칸전환
    let UnitSize = this.m_VariableArray[1].m_strData;//칸크기
    let nUserInput=this.m_VariableArray[2].m_strData;//칸크기 사용자 입력여부(1:입력, 그외:자동계산)    
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //설정창에서 값을 수정한 경우만 입력값을 유지시켜주기 위한 처리(설정창에서 값을 변경하고 실시간처리시에도 그 값은 계속 유지가 되어야 한다)
    //유지되지 않는 경우는 종목변경이나 주기변경시 가격대가 달라 UnitSize값을 달리해야 하므로 자동계산토록 한다
    if(nUserInput === 1 && bSetup === true)
    {
        this.m_strItemCodeOnUserInput = this.m_rRQSet.m_RQInfo.m_strItemCode;
    }
    else if(nUserInput === 1 && (bSetup !== true && bRealCalc !== true)){

        if(this.m_strItemCodeOnUserInput != this.m_rRQSet.m_RQInfo.m_strItemCode)
        {
            nUserInput = 0;
            this.m_VariableArray[2].m_strData = nUserInput;
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let MinValue = 0, MaxValue = 0, TickValue = 0, nDigit = 0;
    let rPricePacket = this.m_rPricePacket;
    let rPricePacketArray = rPricePacket.m_DataArray;

    TickValue = rPricePacket.m_Unit;
    nDigit = rPricePacket.m_nDigit;
    MaxValue = rPricePacket.m_MinMaxMng.m_MaxValueOfFullRange;
    MinValue = rPricePacket.m_MinMaxMng.m_MinValueOfFullRange;

    //실시간계산을 위해 저장
    this.m_MinData = MinValue;
    this.m_MaxData = MaxValue;
    
    this.m_rPAndFOpenPacketData = rPAndFOpenPacketData;
    //this.m_rPAndFHighPacketData = rPAndFHighPacketData;
    //this.m_rPAndFLowPacketData = rPAndFLowPacketData;
    this.m_rPAndFClosePacketData = rPAndFClosePacketData;

    let nDataLength = rPricePacketArray.length;
    if( nDataLength <= 0 )
        return false;

    if(nUserInput !== 1)//칸크기 자동계산인 경우(보통 종목변경시나 저장불러오기시 자동계산됨, 주기변경시는 사용자 입력한 값 유지)
    {
        UnitSize = (MaxValue - MinValue) / 50;
        if( UnitSize < TickValue )
            UnitSize = TickValue;
        
        this.m_VariableArray[1].m_strData = UnitSize;//자동계산이므로 계산된 값을 넣어준다
    }

    if( UnitSize <= 0 || vBoxSize <= 0)
    {
        return false;
    }
    
    let startPoint = 1, firstData = 0, SecondData = 0, Price = 0, i = 0;
    firstData = rPricePacketArray[0].m_Data;
    for( i = 1 ; i < nDataLength; i++ )
    {        
        Price = rPricePacketArray[i].m_Data;
        if(firstData === Price || !((Price >= firstData + UnitSize) || (Price <= firstData - UnitSize)))
        {
            startPoint++;
        }
        else
        {
            SecondData = Price;
            break;
        }
    }

    this.m_bUpCheck = true;
    let TopData, BottomData, nUnitSize, data, conversionValue;
    let OpenPrice, ClosePrice, BasePrice, strDateTime, strDateTimeType, strPrvDateTime;
    TopData = BasePrice = Price = rPricePacketArray[0].m_Data;
    strDateTime = rOrgDateTimePacket.m_DataArray[0].m_strDateTime;
    strDateTimeType = rOrgDateTimePacket.m_DataArray[0].m_strDateTimeType;

    if(SecondData >= BasePrice + UnitSize){
        this.m_bUpCheck = true;
    }
    else if(SecondData <= BasePrice - UnitSize){
        this.m_bUpCheck = false;
    }

    rPAndFOpenPacketData.SetRQStartIndex(0);
    rPAndFClosePacketData.SetRQStartIndex(0);
    //rPAndFLowPacketData.SetRQStartIndex(0);
    //rPAndFHighPacketData.SetRQStartIndex(0);

    for( i = 1 ; i < nDataLength; i++)
	{
		Price = rPricePacketArray[i].m_Data;
        strDateTime = rOrgDateTimePacket.m_DataArray[i].GetDateTimeString();           

        if( Price >= BasePrice + UnitSize  && this.m_bUpCheck === true) //상승 중 상승
		{
            nUnitSize = Math.floor( UnitSize * 10000 );
            if(nUnitSize > 0)
            {
                data = Math.abs( Math.round( (Price - TopData) * 10000) % nUnitSize) * 0.0001;
                if(data === 0.0){
                    BottomData = Price;
                }
                else{
                    if(data < (nUnitSize / 2 * 0.0001)){
                        BottomData = Price - data;
                    }
                    else{
                        BottomData = Price + (UnitSize - data);
                    }
                }

                if(rPAndFClosePacketData.GetDataArraySize() > 0){

                    rDateTimePacketData.UpdateDataOnLast(strDateTime, strDateTimeType, false, nCycle);
                    rPAndFClosePacketData.UpdateDataOnLast(BottomData);      
                    
                    if(RQPacketsItem !== null){
                        RQPacketsItem.m_rXScalePacketData = RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex];
                        rXScaleMng.SetRQPacketsItem(strRQ, RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex], RQPacketsItem);
                    }
                }
                else
                {
                    RQPacketsItem = new CRQPacketsItem(strRQ, nCycle, nInterval);

                    rDateTimePacketData.AddTail( nIndex, strDateTime, strDateTimeType, false, nCycle );
                    RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex] = rDateTimePacketData.GetData(rDateTimePacketData.GetDataArraySize() - 1);

                    rPAndFOpenPacketData.AddTail( nIndex, TopData );
                    RQPacketsItem.m_Packets[rPAndFOpenPacketData.m_nPacketIndex] = rPAndFOpenPacketData.GetData(rPAndFOpenPacketData.GetDataArraySize() - 1);

                    rPAndFClosePacketData.AddTail( nIndex, BottomData );
                    RQPacketsItem.m_Packets[rPAndFClosePacketData.m_nPacketIndex] = rPAndFClosePacketData.GetData(rPAndFClosePacketData.GetDataArraySize() - 1);
                    
                    RQPacketsItem.m_rXScalePacketData = RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex];
                    rXScaleMng.SetRQPacketsItem(strRQ, RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex], RQPacketsItem);

                    nIndex++;
                }
            }
			BasePrice = Price;
            
            ///////////////////////////////////////
            //실시간계산을 위해 저장        
            this.m_BasePrice = BasePrice;
            ///////////////////////////////////////
        }
        else if( Price <= BasePrice - UnitSize && this.m_bUpCheck === true)
        {
            nUnitSize = Math.floor( UnitSize * 10000 );
            conversionValue = (BasePrice - Price) / UnitSize;
            if(conversionValue >= vBoxSize)
            {
                TopData = BottomData - UnitSize;
                data = Math.abs( Math.round( (Price - TopData) * 10000) % nUnitSize) * 0.0001;
                if(data === 0.0){
                    BottomData = Price;
                }
                else{
                    if(data < (nUnitSize / 2 * 0.0001)){
                        BottomData = Price + data;
                    }
                    else{
                        BottomData = Price - (UnitSize - data);
                    }
                }

                RQPacketsItem = new CRQPacketsItem(strRQ, nCycle, nInterval);

                rDateTimePacketData.AddTail( nIndex, strDateTime, strDateTimeType, false, nCycle );
                RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex] = rDateTimePacketData.GetData(rDateTimePacketData.GetDataArraySize() - 1);

                rPAndFOpenPacketData.AddTail( nIndex, TopData );
                RQPacketsItem.m_Packets[rPAndFOpenPacketData.m_nPacketIndex] = rPAndFOpenPacketData.GetData(rPAndFOpenPacketData.GetDataArraySize() - 1);

                rPAndFClosePacketData.AddTail( nIndex, BottomData );
                RQPacketsItem.m_Packets[rPAndFClosePacketData.m_nPacketIndex] = rPAndFClosePacketData.GetData(rPAndFClosePacketData.GetDataArraySize() - 1);

                RQPacketsItem.m_rXScalePacketData = RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex];
                rXScaleMng.SetRQPacketsItem(strRQ, RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex], RQPacketsItem);

                nIndex++;

                this.m_bUpCheck = false;
                BasePrice = Price;

                ///////////////////////////////////////
                //실시간계산을 위해 저장        
                this.m_BasePrice = BasePrice;
                ///////////////////////////////////////
            }
            else
            {
                conversionValue = 0;
            }
        }
        else if( Price <= BasePrice - UnitSize  && this.m_bUpCheck === false)  //하락중 상승
        {
            nUnitSize = Math.floor( UnitSize * 10000 );

            if(nUnitSize > 0)
            {
                data = Math.abs( Math.round( (Price - TopData) * 10000) % nUnitSize) * 0.0001;
                if(data === 0.0){
                    BottomData = Price;
                }
                else{
                    if(data < (nUnitSize / 2 * 0.0001)){
                        BottomData = Price + data;
                    }
                    else{
                        BottomData = Price - (UnitSize - data);
                    }
                }

                if(rPAndFClosePacketData.GetDataArraySize() > 0){

                    rDateTimePacketData.UpdateDataOnLast(strDateTime, strDateTimeType, false, nCycle);
                    rPAndFClosePacketData.UpdateDataOnLast(BottomData);    
                    
                    if(RQPacketsItem !== null){
                        RQPacketsItem.m_rXScalePacketData = RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex];
                        rXScaleMng.SetRQPacketsItem(strRQ, RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex], RQPacketsItem);
                    }
                }
                else
                {
                    RQPacketsItem = new CRQPacketsItem(strRQ, nCycle, nInterval);

                    rDateTimePacketData.AddTail( nIndex, strDateTime, strDateTimeType, false, nCycle );
                    RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex] = rDateTimePacketData.GetData(rDateTimePacketData.GetDataArraySize() - 1);

                    rPAndFOpenPacketData.AddTail( nIndex, TopData );
                    RQPacketsItem.m_Packets[rPAndFOpenPacketData.m_nPacketIndex] = rPAndFOpenPacketData.GetData(rPAndFOpenPacketData.GetDataArraySize() - 1);

                    rPAndFClosePacketData.AddTail( nIndex, BottomData );
                    RQPacketsItem.m_Packets[rPAndFClosePacketData.m_nPacketIndex] = rPAndFClosePacketData.GetData(rPAndFClosePacketData.GetDataArraySize() - 1);
                    
                    RQPacketsItem.m_rXScalePacketData = RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex];
                    rXScaleMng.SetRQPacketsItem(strRQ, RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex], RQPacketsItem);

                    nIndex++;
                }
            }
			BasePrice = Price;
            
            ///////////////////////////////////////
            //실시간계산을 위해 저장        
            this.m_BasePrice = BasePrice;
            ///////////////////////////////////////
        }
		else if( Price >= BasePrice + UnitSize && this.m_bUpCheck == false)  //하락중 하락
		{
			nUnitSize = Math.floor( UnitSize * 10000 );
            conversionValue = (Price - BasePrice) / UnitSize;
            if(conversionValue >= vBoxSize)
            {
                TopData = BottomData + UnitSize;
                data = Math.abs( Math.round( (Price - TopData) * 10000) % nUnitSize) * 0.0001;
                if(data === 0.0){
                    BottomData = Price;
                }
                else{
                    if(data < (nUnitSize / 2 * 0.0001)){
                        BottomData = Price - data;
                    }
                    else{
                        BottomData = Price + (UnitSize - data);
                    }
                }

                RQPacketsItem = new CRQPacketsItem(strRQ, nCycle, nInterval);

                rDateTimePacketData.AddTail( nIndex, strDateTime, strDateTimeType, false, nCycle );
                RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex] = rDateTimePacketData.GetData(rDateTimePacketData.GetDataArraySize() - 1);

                rPAndFClosePacketData.AddTail( nIndex, BottomData );
                RQPacketsItem.m_Packets[rPAndFClosePacketData.m_nPacketIndex] = rPAndFClosePacketData.GetData(rPAndFClosePacketData.GetDataArraySize() - 1);

                rPAndFOpenPacketData.AddTail( nIndex, TopData );
                RQPacketsItem.m_Packets[rPAndFOpenPacketData.m_nPacketIndex] = rPAndFOpenPacketData.GetData(rPAndFOpenPacketData.GetDataArraySize() - 1);
                
                RQPacketsItem.m_rXScalePacketData = RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex];
                rXScaleMng.SetRQPacketsItem(strRQ, RQPacketsItem.m_Packets[rDateTimePacketData.m_nPacketIndex], RQPacketsItem);

                nIndex++;

                this.m_bUpCheck = true;
                BasePrice = Price;

                ///////////////////////////////////////
                //실시간계산을 위해 저장        
                this.m_BasePrice = BasePrice;
                ///////////////////////////////////////
            }
            else
            {
                conversionValue = 0;
            }
        }
    }
    
    return true;
}

CPAndFIndicator.prototype.RealCalc = function (bAddData)
{
    let rPricePacket = this.m_rPricePacket;
    if(rPricePacket === null || rPricePacket === undefined)
        return REALCALC_FAIL;

    var rOrgDateTimePacket = this.m_rInputXAxisPacket;
    if( rOrgDateTimePacket === null || rOrgDateTimePacket === undefined) 
        return REALCALC_FAIL;

    var vBoxSize = this.m_VariableArray[0].m_strData;//칸전환    
    var nUserInput=this.m_VariableArray[2].m_strData;//칸크기 사용자 입력여부(1:입력, 그외:자동계산)
    var vDType = this.m_VariableArray[3].m_strData;

    var UnitSize = this.m_UnitSize;//칸크기
    
    var MinValue = 0, MaxValue = 0, TickValue = 0, nDigit = 0;
    var rPricePacketArray = rPricePacket.m_DataArray;
    
    TickValue = rPricePacket.m_Unit;
    nDigit = rPricePacket.m_nDigit;
    MaxValue = rPricePacket.m_MinMaxMng.m_MaxValueOfFullRange;
    MinValue = rPricePacket.m_MinMaxMng.m_MinValueOfFullRange;
    
    ////////////////////////////////////////////////////////////////
    //실시간 처리시 봉삭제 기능 추가 전까지 재계산으로 임시처리
    this.TotalCalc(false, true);
    return RECALC_SPECIALCHART;    
}

//////////////////////////
//CHogaDepthIndicator
function CHogaDepthIndicator(rRQSet, strIndicatorName, strKey) {

    CGraph.call(this, rRQSet, strIndicatorName, strKey);
    
    this.m_rRQSet = rRQSet;    

    this.m_rChart.SetChartType("DepthChart");

    this.SetTitle(this.m_rRQSet.m_RQInfo.m_strItemName);

    //서브그래프 추가 및 서브그래프 패킷데이터 추가    
    var DepthSubGraph = new CHogaDepthSubGraph(this);
    DepthSubGraph.m_rRQSet = rRQSet;    
    DepthSubGraph.SetSubGraphName("HogaDepth");
    DepthSubGraph.m_strSubGraphTitleLangKey = "chart.qty";
    DepthSubGraph.m_strSubGraphTitle = t(DepthSubGraph.m_strSubGraphTitleLangKey);
    DepthSubGraph.SetPacketData("_HOGAREST_");
    DepthSubGraph.m_rSellFlagPacketData = rRQSet.GetPacketData("_SELLFLAG_");
    DepthSubGraph.m_rHogaAmountPacketData = rRQSet.GetPacketData("_HOGAAMOUNT_");
    DepthSubGraph.m_strSubGraphSubTitleLangKey = "chart.amount";
    DepthSubGraph.m_strSubGraphSubTitle = t(DepthSubGraph.m_strSubGraphSubTitleLangKey);
    DepthSubGraph.m_strPriceTitleLangKey = "chart.price";
    DepthSubGraph.m_strPriceTitle = t(DepthSubGraph.m_strPriceTitleLangKey);
    
    this.m_SubGraphArray[this.m_SubGraphArray.length] = DepthSubGraph;

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_HOGA_");
}
CHogaDepthIndicator.prototype = new CGraph();
CHogaDepthIndicator.prototype.constructor = CHogaDepthIndicator;

CHogaDepthIndicator.prototype.ChangeLang = function(){

    CGraph.prototype.ChangeLang.call(this);
}

CHogaDepthIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CGraph.prototype.Calc.call(this, bSetup);

    this.SetTitle(this.m_rRQSet.m_RQInfo.m_strItemName);
}
CHogaDepthIndicator.prototype.ShowTitle = function (StartPt, LayoutInfo, TitleDivArray) {

    var bShowIndicatorName = this.m_rGlobalProperty.m_bShowIndicatorName;
    var bShowIndicatorValue = this.m_rGlobalProperty.m_bShowIndicatorValue;

    //지표명과 지표값 보지 않는 설정은 타이틀 자체를 생성하지 않는다
    if (bShowIndicatorName === false && bShowIndicatorValue === false) {
        this.HideTitle();
        return;
    }

    var nLength = this.m_SubGraphArray.length;
    var strTitle = null;
    for (var i = 0; i < nLength; i++) {

        var rSubGraph = this.m_SubGraphArray[i];

        if (bShowIndicatorName === true)
            strTitle = this.m_strTitle;
        else
            strTitle = "";
        
        rSubGraph.SetTitle(strTitle);
        var rTitleDiv = rSubGraph.ShowTitle(StartPt, LayoutInfo);
        if (rTitleDiv)
            TitleDivArray[TitleDivArray.length] = rTitleDiv;
    }
}
CHogaDepthIndicator.prototype.GetBuyLineColor = function(){

    if(this.m_SubGraphArray.length <= 0) return null;
    var rSubGraph = this.m_SubGraphArray[0];
    return rSubGraph.m_HogaDepthTypeInfo.m_clrBuyLine;
}
CHogaDepthIndicator.prototype.GetSellLineColor = function(){

    if(this.m_SubGraphArray.length <= 0) return null;
    var rSubGraph = this.m_SubGraphArray[0];
    return rSubGraph.m_HogaDepthTypeInfo.m_clrSellLine;
}
CHogaDepthIndicator.prototype.GetBuyRangeColor = function(){

    if(this.m_SubGraphArray.length <= 0) return null;
    var rSubGraph = this.m_SubGraphArray[0];
    return rSubGraph.m_HogaDepthTypeInfo.m_clrBuyRange;
}
CHogaDepthIndicator.prototype.GetSellRangeColor = function(){

    if(this.m_SubGraphArray.length <= 0) return null;
    var rSubGraph = this.m_SubGraphArray[0];
    return rSubGraph.m_HogaDepthTypeInfo.m_clrSellRange;
}

CHogaDepthIndicator.prototype.FindRQGraphDataPerXScaleMng = function (X, Y, nFindXIndex, rXScaleMng, rFindInfo) {

    var rGraphXScaleMng = this.GetXScaleMng();
    if (rGraphXScaleMng !== undefined && rXScaleMng === rGraphXScaleMng) {

        if (rXScaleMng.GetXScalePacketName() === "_HOGA_")
        {
            var strRQ = this.m_rRQSet.GetRQ();
            
            var rXScaleItem = rXScaleMng.m_XScaleItemArray[nFindXIndex];
            if (rXScaleItem !== undefined)
            {
                var rRQPackets = rXScaleItem.m_mapRQPacketsItem[strRQ];
                if (rRQPackets !== undefined) {

                    var dHoga = rRQPackets.m_rXScalePacketData.m_Data;
                    if(dHoga <= 0.0)
                        return null;

                    if (!rFindInfo) {

                        rFindInfo = new CFindInfo();
                        rFindInfo.m_strRQ = strRQ;
                        rFindInfo.m_XDataInfo = rRQPackets;
                        rFindInfo.m_strXTitle = rXScaleMng.GetTitle();

                        var rHogaPacketItemData = rRQPackets.m_rXScalePacketData;
                        rFindInfo.m_strXData = ConvertNumToDigitText(rHogaPacketItemData.m_Data, rHogaPacketItemData.m_rPacketData.m_nDec, 1, rHogaPacketItemData.m_rPacketData.m_nDigit, -1, this.m_rGlobalProperty.m_bShowThousandComma);                        
                    }

                    var GraphFindData = null;
                    var i, length = this.m_SubGraphArray.length;
                    for (i = length - 1; i >= 0; i--) {

                        var rSubGraph = this.m_SubGraphArray[i];
                        if (rSubGraph.m_bShow === false)
                            continue;

                        if (rSubGraph.FindRQGraphDataPerXScaleMng(X, Y, rRQPackets, rXScaleMng, this.m_rBlock.m_rectGraphRegion)) {
                           
                            rFindInfo.m_rFindSubGraph = rSubGraph;//마우스 위치에 서브그래프가 존재하는 경우 찾은 서브그래프를 변수에 저장한다

                            break;
                        }
                    }

                    return rFindInfo;
                }
            }
        }
    }
    return null;
}

CHogaDepthIndicator.prototype.GetRQGraphFindDataPerXScaleMng = function (rFindInfo, rXScaleMng) {

    var GraphFindData = null;
    var rGraphXScaleMng = this.GetXScaleMng();
    if (rGraphXScaleMng !== undefined && rXScaleMng === rGraphXScaleMng) {

        if (rXScaleMng.GetXScalePacketName() === "_HOGA_")
        {
            var rRQPackets = rFindInfo;
            if (rRQPackets !== undefined) {

                var i, length = this.m_SubGraphArray.length;
                for (i = 0; i < length; i++) {

                    var rSubGraph = this.m_SubGraphArray[i];
                    var SubGraphFindData = rSubGraph.GetRQGraphFindDataPerXScaleMng(rRQPackets);
                    if (SubGraphFindData !== null) {

                        if (GraphFindData === null) {
                            GraphFindData = this.m_GraphFindData;
                            GraphFindData.m_strGraphName = this.m_strTitle;
                        }

                        var rSubGraphFindData = GraphFindData.GetSubGraphFindData(SubGraphFindData.m_strSubGraphName);
                        if(rSubGraphFindData === null)
                            GraphFindData.m_arrSubGraphFindData[GraphFindData.m_arrSubGraphFindData.length] = SubGraphFindData;
                    }
                }
            }
        }        
    }
    return GraphFindData;
}
////////////////////////////지표 끝////////////////////////////

/*
//ADXR
function CADXRIndicator(rRQSet, strIndicatorName) {
    CIndicator.call(this, rRQSet, strIndicatorName);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "ADXR 지표";

    //계산결과 담을 패킷생성
    this.m_strADXPacketName = this.m_strKey + "_ADX_";
    rRQSet.AddNumPacketInfo(this.m_strADXPacketName, -1, false, 10, null, this.m_nDigit);

    this.m_strADXRPacketName = this.m_strKey + "_ADXR_";
    rRQSet.AddNumPacketInfo(this.m_strADXRPacketName, -1, false, 10, null, this.m_nDigit);

    this.m_strADXRCPacketName = this.m_strKey + "_ADXRC_";
    rRQSet.AddNumPacketInfo(this.m_strADXRCPacketName, -1, false, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var ADXSubGraph = new CIndicatorSubGraph(this);
    ADXSubGraph.m_rRQSet = rRQSet;
    ADXSubGraph.m_LineTypeInfo.m_clrLine = '#FF5626';
    ADXSubGraph.SetPacketData(this.m_strADXPacketName);
    ADXSubGraph.SetSubGraphName("ADX");
    ADXSubGraph.m_strSubGraphTitle = "ADX";
    this.m_SubGraphArray.push(ADXSubGraph);

    var ADXRSubGraph = new CIndicatorSubGraph(this);
    ADXRSubGraph.m_rRQSet = rRQSet;
    ADXRSubGraph.m_LineTypeInfo.m_clrLine = '#0001C8';
    ADXRSubGraph.SetPacketData(this.m_strADXRPacketName);
    ADXRSubGraph.SetSubGraphName("ADXR");
    ADXRSubGraph.m_strSubGraphTitle = "ADXR";
    this.m_SubGraphArray.push(ADXRSubGraph);


    var ADXRCSubGraph = new CIndicatorSubGraph(this);
    ADXRCSubGraph.m_rRQSet = rRQSet;
    ADXRCSubGraph.m_LineTypeInfo.m_clrLine = '#000000';
    ADXRCSubGraph.SetPacketData(this.m_strADXRCPacketName);
    ADXRCSubGraph.SetSubGraphName("BaseLine");
    ADXRCSubGraph.m_strSubGraphTitle = "기준선";
    this.m_SubGraphArray.push(ADXRCSubGraph);


    this.AddInputPacket(["_HIGH_", "_LOW_", "_CLOSE_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 14);
    this.AddVariable("BaseNum", NUMERIC_TYPE, 20);
    this.AddVariable("MAType", NUMERIC_TYPE, 0);     //  0:단순, 1:지수, 2:가중, 3:기하, 4:조화, 5:삼각, 6:적합


    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    //실시간 계산속도개선을 위해 사용되는 임시배열
    this.m_nResultPIDData = [];
    this.m_nResultMDIData = [];
    this.m_nResultADXData = [];
    this.m_nResultADXRData = [];
    this.m_pdiData = [];
    this.m_mdiData = [],
        this.m_trMAX = [],
        this.m_DX = [];

    this.m_vPDIStartIndex = null;
    this.m_vMDIStartIndex = null;
    this.m_vADXStartIndex = null;
    this.m_vADXRStartIndex = null;
    this.m_vADXRbStartIndex = null;

}
CADXRIndicator.prototype = new CIndicator();
CADXRIndicator.prototype.constructor = CADXRIndicator;
CADXRIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketHData = this.m_InputPacketDataArray[0];//고
    var rInputPacketLData = this.m_InputPacketDataArray[1];//저
    var rInputPacketPData = this.m_InputPacketDataArray[2];//종

    if (rInputPacketHData == undefined || rInputPacketLData == undefined || rInputPacketPData == undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;
    var rADXPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADXPacketName);
    var rADXRPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADXRPacketName);
    var rADXRCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADXRCPacketName);

    rADXRPacketData.InitDataArray();
    rADXPacketData.InitDataArray();
    rADXRCPacketData.InitDataArray();

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vADXPerdiod = this.m_VariableArray[0].m_strData;
    var vADXRbase = this.m_VariableArray[1].m_strData;
    var vADXMAType = this.m_VariableArray[2].m_strData;
    ////////////////////////////////////////////////////////

    var vADXStartIndex = null;
    var vADXRStartIndex = null;
    var vADXRbStartIndex = null;


    var nDataLength = rInputPacketPData.m_DataArray.length;
    var rNumPacketItemPData = [], rNumPacketItemHData = [], rNumPacketItemLData = [];
    var nResultADXData = [], nResultPDIData = [], nResultMDIData = [], nResultADXRData = [];
    var pdiData = [], mdiData = [], AdXData = [], trData = [], tr = [], trMAX = [], DX = [], PDMnData = [], MDMnData = [], TRnData = [];
    var pdisum = 0, mdisum = 0, adxsum = 0, trsum = 0, tmp1 = 0, tmp2 = 0, tmp3 = 0, DXsum = 0;
    var PDMn = 0, MDMn = 0;

    this.m_nResultPIDData.length = 0;
    this.m_nResultMDIData.length = 0;
    this.m_nResultADXData.length = 0;
    this.m_nResultADXRData.length = 0;

    this.m_SaveData[0] = 0;//pdisum
    this.m_SaveData[1] = 0;//mdisum
    this.m_SaveData[2] = 0;//trsum
    this.m_SaveData[3] = 0;//DXsum
    this.m_SaveData[4] = null;
    this.m_SaveData[5] = null; //LDiff
    this.m_SaveData[6] = null; //Hi
    this.m_SaveData[7] = null; //Lo
    this.m_SaveData[8] = null; //Pr

    for (var i = 0; i < nDataLength; i++) {

        var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined)
            continue;

        if (i == 0) continue;

        if (this.m_vADXRbStartIndex == null)
            this.m_vADXRbStartIndex = i;

        rADXRCPacketData.AddTail(i, vADXRbase);
        RQPacketsItem.m_Packets[rADXRCPacketData.m_nPacketIndex] = rADXRCPacketData.GetData(rADXRCPacketData.GetDataArraySize() - 1);


        if (vADXMAType == 0) {
            //rNumPacketItemPData[i].m_Data;//input data
            //  PDI 계산 Start
            //(당일고가-전일고가>0 이고 (당일고가-전일고가>전일저가-당일저가)이면, PDM=(당일고가-전일고가), 그외는 0

            var HDiff = rInputPacketHData.m_DataArray[i].m_Data - rInputPacketHData.m_DataArray[i - 1].m_Data;
            var LDiff = rInputPacketLData.m_DataArray[i - 1].m_Data - rInputPacketLData.m_DataArray[i].m_Data;

            if ((rInputPacketHData.m_DataArray[i].m_Data > rInputPacketHData.m_DataArray[i - 1].m_Data) && (HDiff > LDiff))
                this.m_pdiData[i] = HDiff;
            else
                this.m_pdiData[i] = 0;

            this.m_SaveData[0] += this.m_pdiData[i];

            if (i > vADXPerdiod) {
                //				    this.m_SaveData[0] = this.m_SaveData[0] - pdiData[i - vADXPerdiod];

                if (vADXPerdiod < i)
                    this.m_SaveData[0] -= this.m_pdiData[i - vADXPerdiod];
            }


            //MDI 계산 Start
            //if(rNumPacketItemLData[i] < rNumPacketItemLData[i-1]  && ( HDiff < LDiff))
            if (rInputPacketLData.m_DataArray[i].m_Data < rInputPacketLData.m_DataArray[i - 1].m_Data && (HDiff < LDiff))

                this.m_mdiData[i] = LDiff;
            else
                this.m_mdiData[i] = 0;


            this.m_SaveData[1] += this.m_mdiData[i];
            if (i > vADXPerdiod) {
                //mdisum = mdisum - this.m_mdiData[i - vADXPerdiod];
                if (vADXPerdiod < i)
                    this.m_SaveData[1] -= this.m_mdiData[i - vADXPerdiod];
            }

            var temp1 = Math.abs(rInputPacketHData.m_DataArray[i].m_Data - rInputPacketLData.m_DataArray[i].m_Data);
            var temp2 = Math.abs(rInputPacketPData.m_DataArray[i - 1].m_Data - rInputPacketHData.m_DataArray[i].m_Data);
            var temp3 = Math.abs(rInputPacketPData.m_DataArray[i - 1].m_Data - rInputPacketLData.m_DataArray[i].m_Data);

            if (temp1 > temp2) {
                if (temp1 > temp3) this.m_trMAX[i] = temp1;
                else this.m_trMAX[i] = temp3;
            } else {
                if (temp2 > temp3) this.m_trMAX[i] = temp2;
                else this.m_trMAX[i] = temp3;
            }

            if (!this.m_trMAX[i]) this.m_trMAX[i] = temp1;

            this.m_SaveData[2] += this.m_trMAX[i];

            if (i > vADXPerdiod) {
                // this.m_SaveData[2] = this.m_SaveData[2] - trMAX[i - vADXPerdiod];
                if (vADXPerdiod < i)
                    this.m_SaveData[2] -= this.m_trMAX[i - vADXPerdiod];
            }


            if (i <= vADXPerdiod - 1)
                continue;

            trData[i] = (this.m_SaveData[2] / vADXPerdiod);


            //ADX 계산 Start

            //PDI
            var PIDDataIndex = this.m_nResultPIDData.length;

            this.m_nResultPIDData[PIDDataIndex] = (this.m_SaveData[0] / vADXPerdiod) / trData[i] * 100;

            //MDI
            var MDIDataIndex = this.m_nResultMDIData.length;
            this.m_nResultMDIData[MDIDataIndex] = (this.m_SaveData[1] / vADXPerdiod) / trData[i] * 100;

            if (this.m_nResultPIDData[PIDDataIndex] + this.m_nResultMDIData[MDIDataIndex] != 0)
                this.m_DX[i] = (Math.abs(this.m_nResultPIDData[PIDDataIndex] - this.m_nResultMDIData[MDIDataIndex]) / (this.m_nResultPIDData[PIDDataIndex] + this.m_nResultMDIData[MDIDataIndex])) * 100;
            else
                this.m_DX[i] = 0;

            this.m_SaveData[3] += this.m_DX[i];

            if (!this.m_DX[i - vADXPerdiod]) {
                this.m_SaveData[3] = this.m_SaveData[3];
            } else {
                if (i > vADXPerdiod) {
                    //this.m_SaveData[3]= this.m_SaveData[3]-DX[i-vADXPerdiod];
                    if (vADXPerdiod < i)
                        this.m_SaveData[3] -= this.m_DX[i - vADXPerdiod];
                }
            }


            var ADXDataIndex = this.m_nResultADXData.length;

            this.m_nResultADXData[ADXDataIndex] = (this.m_SaveData[3] / vADXPerdiod);

            if (this.m_vADXStartIndex == null) this.m_vADXStartIndex = i;

            rADXPacketData.AddTail(i, this.m_nResultADXData[ADXDataIndex]);
            RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = rADXPacketData.GetData(rADXPacketData.GetDataArraySize() - 1);


            var ADXRDataIndex = this.m_nResultADXRData.length;

            this.m_nResultADXRData[ADXRDataIndex] = (this.m_nResultADXData[ADXDataIndex] + this.m_nResultADXData[ADXDataIndex - vADXPerdiod]) / 2;

            if (this.m_vADXRStartIndex == null) this.m_vADXRStartIndex = i;

            rADXRPacketData.AddTail(i, this.m_nResultADXRData[ADXRDataIndex]);
            RQPacketsItem.m_Packets[rADXRPacketData.m_nPacketIndex] = rADXRPacketData.GetData(rADXRPacketData.GetDataArraySize() - 1);

        } else if (vADXMAType == 1) {

        }

    }

    rADXRPacketData.SetRQStartIndex(this.m_vADXRStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    rADXPacketData.SetRQStartIndex(this.m_vADXStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    rADXRCPacketData.SetRQStartIndex(this.m_vADXRbStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    return true;

}
CADXRIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketHData = this.m_InputPacketDataArray[0];//고
    var rInputPacketLData = this.m_InputPacketDataArray[1];//저
    var rInputPacketPData = this.m_InputPacketDataArray[2];//종
    
    if (rInputPacketHData != undefined || rInputPacketLData != undefined || rInputPacketPData != undefined) {


        var strRQ = this.m_rRQSet.GetRQ();
        var rXScaleMng = this.GetXScaleMng();
        var rDateTimePacketData = this.m_rXAxisPacket;
        var rADXPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADXPacketName);
        var rADXRPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADXRPacketName);
        var rADXRCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strADXRCPacketName);

        ////////////////////////////////////////////////////////
        //필요한 변수들은 여기서 꺼내놓는다.
        var vADXPerdiod = this.m_VariableArray[0].m_strData;
        var vADXRbase = this.m_VariableArray[1].m_strData;
        var vADXMAType = this.m_VariableArray[2].m_strData;
        ////////////////////////////////////////////////////////

        var vADXStartIndex = null;
        var vADXRStartIndex = null;
        var vADXRbStartIndex = null;


        var nDataLength = rInputPacketPData.m_DataArray.length;
        var rNumPacketItemPData = [], rNumPacketItemHData = [], rNumPacketItemLData = [];
        var nResultADXData = [], nResultPDIData = [], nResultMDIData = [], nResultADXRData = [];
        var pdiData = [], mdiData = [], AdXData = [], trData = [], tr = [], trMAX = [], DX = [], PDMnData = [], MDMnData = [], TRnData = [];
        var pdisum = 0, mdisum = 0, adxsum = 0, trsum = 0, tmp1 = 0, tmp2 = 0, tmp3 = 0, DXsum = 0;
        var PDMn = 0, MDMn = 0;

        if (bAddData) {//add
            
            var i = nDataLength - 1;

            var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
            if (rXScaleMng.m_tTimeArray[tDateTime] != undefined) {
                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem != undefined) {

                    
                    if (this.m_vADXRbStartIndex == null)
                        this.m_vADXRbStartIndex = i;

                    rADXRCPacketData.AddTail(i, vADXRbase);
                    RQPacketsItem.m_Packets[rADXRCPacketData.m_nPacketIndex] = rADXRCPacketData.GetData(rADXRCPacketData.GetDataArraySize() - 1);

                    if (vADXMAType == 0) {
                        
                        var HDiff = rInputPacketHData.m_DataArray[i].m_Data - rInputPacketHData.m_DataArray[i - 1].m_Data;
                        var LDiff = rInputPacketLData.m_DataArray[i - 1].m_Data - rInputPacketLData.m_DataArray[i].m_Data;

                        if ((rInputPacketHData.m_DataArray[i].m_Data > rInputPacketHData.m_DataArray[i - 1].m_Data) && (HDiff > LDiff))
                            this.m_pdiData[i] = HDiff;
                        else
                            this.m_pdiData[i] = 0;

                        this.m_SaveData[0] += this.m_pdiData[i];

                        if (i >= vADXPerdiod) {
                            this.m_SaveData[0] -= this.m_pdiData[i - vADXPerdiod];
                        }

                        // MDI 계산 Start

                        if (rInputPacketLData.m_DataArray[i].m_Data < rInputPacketLData.m_DataArray[i - 1].m_Data && (HDiff < LDiff))

                            this.m_mdiData[i] = LDiff;
                        else
                            this.m_mdiData[i] = 0;


                        this.m_SaveData[1] += this.m_mdiData[i];
                        if (i >= vADXPerdiod) {
                            //this.m_SaveData[1] = this.m_SaveData[1] - mdiData[i - vADXPerdiod];
                            this.m_SaveData[1] -= this.m_mdiData[i - vADXPerdiod];
                        }

                        var temp1 = Math.abs(rInputPacketHData.m_DataArray[i].m_Data - rInputPacketLData.m_DataArray[i].m_Data);
                        var temp2 = Math.abs(rInputPacketPData.m_DataArray[i - 1].m_Data - rInputPacketHData.m_DataArray[i].m_Data);
                        var temp3 = Math.abs(rInputPacketPData.m_DataArray[i - 1].m_Data - rInputPacketLData.m_DataArray[i].m_Data);

                        if (temp1 > temp2) {
                            if (temp1 > temp3) this.m_trMAX[i] = temp1;
                            else this.m_trMAX[i] = temp3;
                        } else {
                            if (temp2 > temp3) this.m_trMAX[i] = temp2;
                            else this.m_trMAX[i] = temp3;
                        }

                        if (!this.m_trMAX[i]) this.m_trMAX[i] = temp1;

                        this.m_SaveData[2] += this.m_trMAX[i];

                        if (i >= vADXPerdiod) {
                            // this.m_SaveData[2] = this.m_SaveData[2] - trMAX[i - vADXPerdiod];
                            this.m_SaveData[2] -= this.m_trMAX[i - vADXPerdiod];
                        }

                        if (i > vADXPerdiod - 1) {
                            
                            trData[i] = (this.m_SaveData[2] / vADXPerdiod);
                            //PDI
                            var PIDDataIndex = this.m_nResultPIDData.length;

                            this.m_nResultPIDData[PIDDataIndex] = (this.m_SaveData[0] / vADXPerdiod) / trData[i] * 100;

                            //MDI
                            var MDIDataIndex = this.m_nResultMDIData.length;
                            this.m_nResultMDIData[MDIDataIndex] = (this.m_SaveData[1] / vADXPerdiod) / trData[i] * 100;

                            this.m_DX[i] = (Math.abs(this.m_nResultPIDData[PIDDataIndex] - this.m_nResultMDIData[MDIDataIndex]) / (this.m_nResultPIDData[PIDDataIndex] + this.m_nResultMDIData[MDIDataIndex])) * 100;

                            this.m_SaveData[3] += this.m_DX[i];


                            if (!this.m_DX[i - vADXPerdiod]) {
                                this.m_SaveData[3] = this.m_SaveData[3];
                            } else {
                                if (i >= vADXPerdiod) {
                                    this.m_SaveData[3] -= this.m_DX[i - vADXPerdiod];
                                }
                            }

                            var ADXDataIndex = this.m_nResultADXData.length;

                            this.m_nResultADXData[ADXDataIndex] = (this.m_SaveData[3] / vADXPerdiod);

                            if (this.m_vADXStartIndex == null) this.m_vADXStartIndex = i;

                            rADXPacketData.AddTail(i, this.m_nResultADXData[ADXDataIndex]);
                            RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = rADXPacketData.GetData(rADXPacketData.GetDataArraySize() - 1);


                            var ADXRDataIndex = this.m_nResultADXRData.length;

                            this.m_nResultADXRData[ADXRDataIndex] = (this.m_nResultADXData[ADXDataIndex] + this.m_nResultADXData[ADXDataIndex - vADXPerdiod]) / 2;

                            if (this.m_vADXRStartIndex == null) this.m_vADXRStartIndex = i;

                            rADXRPacketData.AddTail(i, this.m_nResultADXRData[ADXRDataIndex]);
                            RQPacketsItem.m_Packets[rADXRPacketData.m_nPacketIndex] = rADXRPacketData.GetData(rADXRPacketData.GetDataArraySize() - 1);

                        }
                    }
                }
            } else if (vADXMAType == 1) {

            }
        } else {
            var i = nDataLength - 1;

            var tDateTime = rDateTimePacketData.m_DataArray[i].GetDateTimeT();
            if (rXScaleMng.m_tTimeArray[tDateTime] != undefined) {
                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem != undefined || i > 0) {
                    if (this.m_vADXRbStartIndex == null)
                        this.m_vADXRbStartIndex = i;

                    rADXRCPacketData.UpdateData(i , vADXRbase);
                    RQPacketsItem.m_Packets[rADXRCPacketData.m_nPacketIndex] = rADXRCPacketData.GetData(rADXRCPacketData.GetDataArraySize() - 1);

                    if (vADXMAType == 0) {

                        this.m_SaveData[0] -= this.m_pdiData[i];
                        this.m_SaveData[1] -= this.m_mdiData[i];
                        this.m_SaveData[2] -= this.m_trMAX[i];
                        if (this.m_DX[i])
                            this.m_SaveData[3] -= this.m_DX[i];

                        var HDiff = rInputPacketHData.m_DataArray[i].m_Data - rInputPacketHData.m_DataArray[i - 1].m_Data;
                        var LDiff = rInputPacketLData.m_DataArray[i - 1].m_Data - rInputPacketLData.m_DataArray[i].m_Data;

                        if ((rInputPacketHData.m_DataArray[i].m_Data > rInputPacketHData.m_DataArray[i - 1].m_Data) && (HDiff > LDiff))
                            this.m_pdiData[i] = HDiff;
                        else
                            this.m_pdiData[i] = 0;

                        this.m_SaveData[0] += this.m_pdiData[i];

                        //MDI 계산 Start

                        if (rInputPacketLData.m_DataArray[i].m_Data < rInputPacketLData.m_DataArray[i - 1].m_Data && (HDiff < LDiff))

                            this.m_mdiData[i] = LDiff;
                        else
                            this.m_mdiData[i] = 0;


                        this.m_SaveData[1] += this.m_mdiData[i];

                        var temp1 = Math.abs(rInputPacketHData.m_DataArray[i].m_Data - rInputPacketLData.m_DataArray[i].m_Data);
                        var temp2 = Math.abs(rInputPacketPData.m_DataArray[i - 1].m_Data - rInputPacketHData.m_DataArray[i].m_Data);
                        var temp3 = Math.abs(rInputPacketPData.m_DataArray[i - 1].m_Data - rInputPacketLData.m_DataArray[i].m_Data);

                        if (temp1 > temp2) {
                            if (temp1 > temp3) this.m_trMAX[i] = temp1;
                            else this.m_trMAX[i] = temp3;
                        } else {
                            if (temp2 > temp3) this.m_trMAX[i] = temp2;
                            else this.m_trMAX[i] = temp3;
                        }

                        if (!this.m_trMAX[i]) this.m_trMAX[i] = temp1;

                        this.m_SaveData[2] += this.m_trMAX[i];

                        if (i > vADXPerdiod - 1) {

                            trData[i] = (this.m_SaveData[2] / vADXPerdiod);
                            //PDI
                            var PIDDataIndex = this.m_nResultPIDData.length - 1;

                            this.m_nResultPIDData[PIDDataIndex] = (this.m_SaveData[0] / vADXPerdiod) / trData[i] * 100;

                            //MDI
                            var MDIDataIndex = this.m_nResultMDIData.length - 1;
                            this.m_nResultMDIData[MDIDataIndex] = (this.m_SaveData[1] / vADXPerdiod) / trData[i] * 100;

                            this.m_DX[i] = (Math.abs(this.m_nResultPIDData[PIDDataIndex] - this.m_nResultMDIData[MDIDataIndex]) / (this.m_nResultPIDData[PIDDataIndex] + this.m_nResultMDIData[MDIDataIndex])) * 100;

                            this.m_SaveData[3] += this.m_DX[i];

                            var ADXDataIndex = this.m_nResultADXData.length - 1;

                            this.m_nResultADXData[ADXDataIndex] = (this.m_SaveData[3] / vADXPerdiod);

                            if (this.m_vADXStartIndex == null) this.m_vADXStartIndex = i;

                            rADXPacketData.UpdateData(i , this.m_nResultADXData[ADXDataIndex]);
                            RQPacketsItem.m_Packets[rADXPacketData.m_nPacketIndex] = rADXPacketData.GetData(rADXPacketData.GetDataArraySize() - 1);


                            var ADXRDataIndex = this.m_nResultADXRData.length - 1;

                            this.m_nResultADXRData[ADXRDataIndex] = (this.m_nResultADXData[ADXDataIndex] + this.m_nResultADXData[ADXDataIndex - vADXPerdiod]) / 2;

                            if (this.m_vADXRStartIndex == null) this.m_vADXRStartIndex = i;

                            rADXRPacketData.UpdateData(i , this.m_nResultADXRData[ADXRDataIndex]);
                            RQPacketsItem.m_Packets[rADXRPacketData.m_nPacketIndex] = rADXRPacketData.GetData(rADXRPacketData.GetDataArraySize() - 1);

                        }
                    }
                }
            } else if (vADXMAType == 1) {

            }

        }
    }

}

//Sonar
function CSONARIndicator(rRQSet, strIndicatorName) {
    CIndicator.call(this, rRQSet, strIndicatorName);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "SONAR 지표";

    //계산결과 담을 패킷생성
    this.m_strSONARPacketName = this.m_strKey + "_SONAR_";
    rRQSet.AddNumPacketInfo(this.m_strSONARPacketName, -1, false, 10, null, this.m_nDigit);

    this.m_strSONARSPacketName = this.m_strKey + "_SONARS_";
    rRQSet.AddNumPacketInfo(this.m_strSONARSPacketName, -1, false, 10,null, this.m_nDigit);

    this.m_strSONARCPacketName = this.m_strKey + "_SONARC_";
    rRQSet.AddNumPacketInfo(this.m_strSONARCPacketName, -1, false, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var SONARSubGraph = new CIndicatorSubGraph(this);
    SONARSubGraph.m_rRQSet = rRQSet;
    SONARSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    SONARSubGraph.SetPacketData(this.m_strSONARPacketName);
    SONARSubGraph.SetSubGraphName("Sonar");  //E_High
    SONARSubGraph.m_strSubGraphTitle = "Sonar"; //E_High
    this.m_SubGraphArray.push(SONARSubGraph);

    var SONARSSubGraph = new CIndicatorSubGraph(this);
    SONARSSubGraph.m_rRQSet = rRQSet;
    SONARSSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    SONARSSubGraph.SetPacketData(this.m_strSONARSPacketName);
    SONARSSubGraph.SetSubGraphName("Signal");
    SONARSSubGraph.m_strSubGraphTitle = "Signal";
    this.m_SubGraphArray.push(SONARSSubGraph);

    var SONARCSubGraph = new CIndicatorSubGraph(this);
    SONARCSubGraph.m_rRQSet = rRQSet;
    SONARCSubGraph.m_LineTypeInfo.m_clrLine = '#000000';
    SONARCSubGraph.SetPacketData(this.m_strSONARCPacketName);
    SONARCSubGraph.SetSubGraphName("BaseLine");
    SONARCSubGraph.m_strSubGraphTitle = "기준선";
    this.m_SubGraphArray.push(SONARCSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 5);       // 기간
    this.AddVariable("SignalPeriod", NUMERIC_TYPE, 3); // Signal 기간
    this.AddVariable("BaseNum", NUMERIC_TYPE, 0);      // 기준선
    this.AddVariable("DType", NUMERIC_TYPE, 3);        // 데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)
    this.AddVariable("MAType", NUMERIC_TYPE, 0);       // MA 타입 : 0:단순, 1:지수, 2:가중, 3:기하, 4:조화, 5:삼각, 6:적합
    this.AddVariable("ViewSONAR", NUMERIC_TYPE, true); // Momentum
    this.AddVariable("ViewSONARS", NUMERIC_TYPE, true);// Signal

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
}
CSONARIndicator.prototype = new CIndicator();
CSONARIndicator.prototype.constructor = CSONARIndicator;
CSONARIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData == undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rSONARPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSONARPacketName);
    var rSONARSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSONARSPacketName);
    var rSONARCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strSONARCPacketName);

    rSONARPacketData.InitDataArray();
    rSONARSPacketData.InitDataArray();
    rSONARCPacketData.InitDataArray();

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vSONARPerdiod = this.m_VariableArray[0].m_strData;
    var vSONARSPerdiod = this.m_VariableArray[1].m_strData;
    var vSONARCPerdiod = this.m_VariableArray[2].m_strData;
    var vSONARDType = this.m_VariableArray[3].m_strData;
    var vSONARMAType = this.m_VariableArray[4].m_strData;
    var vSONARView = this.m_VariableArray[5].m_strData;
    var vSONARSView = this.m_VariableArray[6].m_strData;
    ////////////////////////////////////////////////////////
    var vSONARStartIndex = null;
    var vSONARCStartIndex = null;
    var vSignalStartIndex = null;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var rNumPacketItemPData = [], rNumPacketItemHData = [], rNumPacketItemLData = [];
    var nResultSONARData = [], nResultSONARSData = [], nResultSONARCData = [], nResultSONARCHData = [], nResultSONARCLData = [];
    var MData = [], SONARData = [], dEma = [], average = [];
    var dMDatasum = 0, dEmasum = 0, SONARSsnum = 0;

    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined)
            continue;

        if (vSONARCStartIndex == null) vSONARCStartIndex = i;

        nResultSONARCData[i] = vSONARCPerdiod;
        rSONARCPacketData.AddTail(i, nResultSONARCData[i]);
        RQPacketsItem.m_Packets[rSONARCPacketData.m_nPacketIndex] = rSONARCPacketData.GetData(rSONARCPacketData.GetDataArraySize() - 1);

        // SONAR 계산 Start

        switch (vSONARDType) {
            case 0:
                MData[i] = rInputPacketOData.m_DataArray[i].m_Data;
                break;
            case 1:
                MData[i] = rInputPacketHData.m_DataArray[i].m_Data;
                break;
            case 2:
                MData[i] = rInputPacketLData.m_DataArray[i].m_Data;
                break;
            case 3:
                MData[i] = rInputPacketPData.m_DataArray[i].m_Data;
                break;
            case 4:
                MData[i] = rInputPacketHLData.m_DataArray[i].m_Data;
                break;
            case 5:
                MData[i] = rInputPacketHLCData.m_DataArray[i].m_Data;
                break;
        }

        if (vSONARMAType == 0) {
            if (i <= vSONARPerdiod - 2) continue;
            dMDatasum = 0;
            for (var j = i; j > i - vSONARPerdiod; j--) {
                dMDatasum += MData[j];
            }

            average[i] = dMDatasum / vSONARPerdiod;

            if (!average[i - 1]) continue;

            else dEma[i] = (average[i] - average[i - 1]) / average[i - 1] * 100;

            SONARData[i] = dEma[i];

        } else if (vSONARMAType == 1) {

        }

        if (vSONARView) {
            if (vSONARStartIndex == null) vSONARStartIndex = i;

            nResultSONARData[i] = SONARData[i];
            rSONARPacketData.AddTail(i, nResultSONARData[i]);
            RQPacketsItem.m_Packets[rSONARPacketData.m_nPacketIndex] = rSONARPacketData.GetData(rSONARPacketData.GetDataArraySize() - 1);
        }

        if (vSONARSView) {
            SONARSsnum = 0;

            for (var h = i; h > i - vSONARSPerdiod; h--) {
                SONARSsnum += SONARData[h];
            }

            if (!SONARSsnum) SONARSsnum = SONARData[i];
            if (vSignalStartIndex == null) vSignalStartIndex = i;

            nResultSONARSData[i] = SONARSsnum / vSONARSPerdiod;

            rSONARSPacketData.AddTail(i, nResultSONARSData[i]);
            RQPacketsItem.m_Packets[rSONARSPacketData.m_nPacketIndex] = rSONARSPacketData.GetData(rSONARSPacketData.GetDataArraySize() - 1);
        }
        
    }

    rSONARPacketData.SetRQStartIndex(vSONARStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    rSONARSPacketData.SetRQStartIndex(vSignalStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    rSONARCPacketData.SetRQStartIndex(vSONARCStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!

    return true;

}

//TRIX
function CTRIXIndicator(rRQSet, strIndicatorName) {
    CIndicator.call(this, rRQSet, strIndicatorName);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "TRIX 지표";

    //계산결과 담을 패킷생성
    this.m_strTRIXPacketName = this.m_strKey + "_TRIX_";
    rRQSet.AddNumPacketInfo(this.m_strTRIXPacketName, -1, false, 10, null, this.m_nDigit);

    this.m_strTRIXSPacketName = this.m_strKey + "_TRIXS_";
    rRQSet.AddNumPacketInfo(this.m_strTRIXSPacketName, -1, false, 10, null, this.m_nDigit);

    this.m_strTRIXCPacketName = this.m_strKey + "_TRIXC_";
    rRQSet.AddNumPacketInfo(this.m_strTRIXCPacketName, -1, false, 10, null, this.m_nDigit);


    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var TRIXSubGraph = new CIndicatorSubGraph(this);
    TRIXSubGraph.m_rRQSet = rRQSet;
    TRIXSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    TRIXSubGraph.SetPacketData(this.m_strTRIXPacketName);
    TRIXSubGraph.SetSubGraphName("TRIX");
    TRIXSubGraph.m_strSubGraphTitle = "TRIX"; //E_High
    this.m_SubGraphArray.push(TRIXSubGraph);


    var TRIXSSubGraph = new CIndicatorSubGraph(this);
    TRIXSSubGraph.m_rRQSet = rRQSet;
    TRIXSSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    TRIXSSubGraph.SetPacketData(this.m_strTRIXSPacketName);
    TRIXSSubGraph.SetSubGraphName("TRIX_Signal");
    TRIXSSubGraph.m_strSubGraphTitle = "TRIX Signal";
    this.m_SubGraphArray.push(TRIXSSubGraph);

    var TRIXCSubGraph = new CIndicatorSubGraph(this);
    TRIXCSubGraph.m_rRQSet = rRQSet;
    TRIXCSubGraph.m_LineTypeInfo.m_clrLine = '#000000';
    TRIXCSubGraph.SetPacketData(this.m_strTRIXCPacketName);
    TRIXCSubGraph.SetSubGraphName("BaseLine");
    TRIXCSubGraph.m_strSubGraphTitle = "기준선";
    this.m_SubGraphArray.push(TRIXCSubGraph);


    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 12);    // 기간
    this.AddVariable("SignalPeriod", NUMERIC_TYPE, 9);    // Singnal 기간
    this.AddVariable("BaseNum", NUMERIC_TYPE, 0);    // 기준선
    this.AddVariable("DType", NUMERIC_TYPE, 3);    // 데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)
    this.AddVariable("MAType", NUMERIC_TYPE, 1);    // MA 타입 : 0:단순, 1:지수, 2:가중, 3:기하, 4:조화, 5:삼각, 6:적합
    this.AddVariable("ViewTRIX", NUMERIC_TYPE, true);  // TRIX
    this.AddVariable("ViewTRIXS", NUMERIC_TYPE, true);  // TRIX Singnal

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");

    this.m_nResultTRIXData = [];
    this.m_nResultTRIXSData = [];

    this.m_MData = [];
    this.m_M1Data = [];
    this.m_M2Data = [];
    this.m_M3Data = [];
    this.m_MTData = [];

    this.m_vTRIXCStartIndex = null;
    this.m_vTRIXStartIndex = null;
    this.m_vTRIXSStartIndex = null;



}
CTRIXIndicator.prototype = new CIndicator();
CTRIXIndicator.prototype.constructor = CTRIXIndicator;
CTRIXIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData == undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rTRIXPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strTRIXPacketName);
    var rTRIXSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strTRIXSPacketName);
    var rTRIXCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strTRIXCPacketName);

    rTRIXCPacketData.InitDataArray();
    rTRIXPacketData.InitDataArray();
    rTRIXSPacketData.InitDataArray();

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vTRIXPerdiod = this.m_VariableArray[0].m_strData;
    var vTRIXSerdiod = this.m_VariableArray[1].m_strData;
    var vTRIXCerdiod = this.m_VariableArray[2].m_strData;
    var vTRIXDType = this.m_VariableArray[3].m_strData;
    var vTRIXMAType = this.m_VariableArray[4].m_strData;
    var vTRIXView = this.m_VariableArray[5].m_strData;
    var vTRIXSView = this.m_VariableArray[6].m_strData;

    ////////////////////////////////////////////////////////

    var vTRIXPerdiodIndex = vTRIXPerdiod - 1;
    var vTRIXSPerdiodIndex = vTRIXSerdiod - 1;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var rNumPacketItemPData = [], rNumPacketItemHData = [], rNumPacketItemLData = [];
    var nResultTRIXData = [], nResultTRIXCData = [], nResultTRIXSData = [];
    var MData = [], M1Data = [], M2Data = [], M3Data = [], MTData = [], MSData = [];
    var M1sum = 0, M2sum = 0, M3sum = 0, MSsum = 0, MSnum = 0;
    var nM3DataCount = 0;

    this.m_nResultTRIXData.length = 0;
    this.m_nResultTRIXSData.length = 0;

    this.m_SaveData[0] = 0; //M1sum
    this.m_SaveData[1] = 0; //M2sum
    this.m_SaveData[2] = 0; //M3sum
    this.m_SaveData[3] = 0; //MSsum
    this.m_SaveData[4] = null; //Pr
    this.m_MSnum = 0;

    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined)
            continue;

        //nResultTRIXCData[i] = vTRIXCerdiod;

        if (this.m_vTRIXCStartIndex == null) this.m_vTRIXCStartIndex = i;

        rTRIXCPacketData.AddTail(i, vTRIXCerdiod);
        RQPacketsItem.m_Packets[rTRIXCPacketData.m_nPacketIndex] = rTRIXCPacketData.GetData(rTRIXCPacketData.GetDataArraySize() - 1);

        // Env 계산 Start

        switch (vTRIXDType) {
            case 0:
                this.m_MData[i] = rInputPacketOData.m_DataArray[i].m_Data;
                break;
            case 1:
                this.m_MData[i] = rInputPacketHData.m_DataArray[i].m_Data;
                break;
            case 2:
                this.m_MData[i] = rInputPacketLData.m_DataArray[i].m_Data;
                break;
            case 3:
                this.m_MData[i] = rInputPacketPData.m_DataArray[i].m_Data;
                break;
            case 4:
                this.m_MData[i] = rInputPacketHLData.m_DataArray[i].m_Data;
                break;
            case 5:
                this.m_MData[i] = rInputPacketHLCData.m_DataArray[i].m_Data;
                break;
        }

        this.m_SaveData[0] += this.m_MData[i];

        if (i > vTRIXPerdiod - 1) this.m_SaveData[0] = this.m_SaveData[0] - this.m_MData[i - vTRIXPerdiod];

        if (i <= vTRIXPerdiod - 2) continue;

        this.m_M1Data[i] = this.m_SaveData[0] / vTRIXPerdiod;

        this.m_SaveData[1] += this.m_M1Data[i];
        if (i > vTRIXPerdiod * 2 - 2) this.m_SaveData[1] = this.m_SaveData[1] - this.m_M1Data[i - vTRIXPerdiod];
        if (i <= vTRIXPerdiod * 2 - 3) continue;

        this.m_M2Data[i] = this.m_SaveData[1] / vTRIXPerdiod;

        this.m_SaveData[2] += this.m_M2Data[i];
        if (i > vTRIXPerdiod * 3 - 3) this.m_SaveData[2] = this.m_SaveData[2] - this.m_M2Data[i - vTRIXPerdiod];
        if (i <= vTRIXPerdiod * 3 - 4) continue;

        this.m_M3Data[i] = this.m_SaveData[2] / vTRIXPerdiod;

        nM3DataCount++;
        if (nM3DataCount <= 1)
            continue;

        this.m_MTData[i] = (this.m_M3Data[i] - this.m_M3Data[i - 1]) / this.m_M3Data[i - 1] * 100;

        var TRIXDataIndex = this.m_nResultTRIXData.length;
        this.m_nResultTRIXData[TRIXDataIndex] = this.m_MTData[i];

        if (this.m_vTRIXStartIndex == null)
            this.m_vTRIXStartIndex = i;

        rTRIXPacketData.AddTail(i, this.m_nResultTRIXData[TRIXDataIndex]);
        RQPacketsItem.m_Packets[rTRIXPacketData.m_nPacketIndex] = rTRIXPacketData.GetData(rTRIXPacketData.GetDataArraySize() - 1);

        if (!this.m_MTData[i]) continue;

        this.m_MSnum++;

        this.m_SaveData[3] += this.m_MTData[i];

        if (this.m_MSnum > vTRIXSerdiod) this.m_SaveData[3] = this.m_SaveData[3] - this.m_MTData[i - vTRIXSerdiod];

        if (this.m_MSnum <= vTRIXSerdiod - 1) continue;

        MSData[i] = this.m_SaveData[3] / vTRIXSerdiod;

        var TRIXSDataIndex = this.m_nResultTRIXSData.length;
        this.m_nResultTRIXSData[TRIXSDataIndex] = MSData[i];

        if (this.m_vTRIXSStartIndex == null)
            this.m_vTRIXSStartIndex = i;

        rTRIXSPacketData.AddTail(i, this.m_nResultTRIXSData[TRIXSDataIndex]);
        RQPacketsItem.m_Packets[rTRIXSPacketData.m_nPacketIndex] = rTRIXSPacketData.GetData(rTRIXSPacketData.GetDataArraySize() - 1);

        
    }
    rTRIXCPacketData.SetRQStartIndex(this.m_vTRIXCStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    rTRIXPacketData.SetRQStartIndex(this.m_vTRIXStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    rTRIXSPacketData.SetRQStartIndex(this.m_vTRIXSStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!

    return true;
}
CTRIXIndicator.prototype.RealCalc = function (bAddData) {

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData != undefined) {

        var strRQ = this.m_rRQSet.GetRQ();
        var rXScaleMng = this.GetXScaleMng();
        var rDateTimePacketData = this.m_rXAxisPacket;

        var rTRIXPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strTRIXPacketName);
        var rTRIXSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strTRIXSPacketName);
        var rTRIXCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strTRIXCPacketName);

        ////////////////////////////////////////////////////////
        //필요한 변수들은 여기서 꺼내놓는다.
        var vTRIXPerdiod = this.m_VariableArray[0].m_strData;
        var vTRIXSerdiod = this.m_VariableArray[1].m_strData;
        var vTRIXCerdiod = this.m_VariableArray[2].m_strData;
        var vTRIXDType = this.m_VariableArray[3].m_strData;
        var vTRIXMAType = this.m_VariableArray[4].m_strData;
        var vTRIXView = this.m_VariableArray[5].m_strData;
        var vTRIXSView = this.m_VariableArray[6].m_strData;

        ////////////////////////////////////////////////////////

        var vTRIXPerdiodIndex = vTRIXPerdiod - 1;
        var vTRIXSPerdiodIndex = vTRIXSerdiod - 1;

        var nDataLength = rInputPacketPData.m_DataArray.length;
        var rNumPacketItemPData = [], rNumPacketItemHData = [], rNumPacketItemLData = [];
        var nResultTRIXData = [], nResultTRIXCData = [], nResultTRIXSData = [];
        var MData = [], M1Data = [], M2Data = [], M3Data = [], MTData = [], MSData = [];
        var M1sum = 0, M2sum = 0, M3sum = 0, MSsum = 0, MSnum = 0;
        var nM3DataCount = 1;

        if (bAddData) {//add

            var i = nDataLength - 1;
            var rDateTimeData = rDateTimePacketData.m_DataArray[i];
            var tDateTime = rDateTimeData.GetDateTimeT();

            if (rXScaleMng.m_tTimeArray[tDateTime] != undefined) {

                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem != undefined) {

                    if (this.m_vTRIXCStartIndex == null) this.m_vTRIXCStartIndex = i;

                    rTRIXCPacketData.AddTail(i, vTRIXCerdiod);
                    RQPacketsItem.m_Packets[rTRIXCPacketData.m_nPacketIndex] = rTRIXCPacketData.GetData(rTRIXCPacketData.GetDataArraySize() - 1);

                    // Env 계산 Start

                    switch (vTRIXDType) {
                        case 0:
                            this.m_MData[i] = rInputPacketOData.m_DataArray[i].m_Data;
                            break;
                        case 1:
                            this.m_MData[i] = rInputPacketHData.m_DataArray[i].m_Data;
                            break;
                        case 2:
                            this.m_MData[i] = rInputPacketLData.m_DataArray[i].m_Data;
                            break;
                        case 3:
                            this.m_MData[i] = rInputPacketPData.m_DataArray[i].m_Data;
                            break;
                        case 4:
                            this.m_MData[i] = rInputPacketHLData.m_DataArray[i].m_Data;
                            break;
                        case 5:
                            this.m_MData[i] = rInputPacketHLCData.m_DataArray[i].m_Data;
                            break;
                    }

                    this.m_SaveData[0] += this.m_MData[i];

                    if (i > vTRIXPerdiod - 1) this.m_SaveData[0] = this.m_SaveData[0] - this.m_MData[i - vTRIXPerdiod];

                    if (i > vTRIXPerdiod - 2) {

                        this.m_M1Data[i] = this.m_SaveData[0] / vTRIXPerdiod;

                        this.m_SaveData[1] += this.m_M1Data[i];
                        if (i > vTRIXPerdiod * 2 - 2) this.m_SaveData[1] = this.m_SaveData[1] - this.m_M1Data[i - vTRIXPerdiod];
                        if (i > vTRIXPerdiod * 2 - 3) {

                            this.m_M2Data[i] = this.m_SaveData[1] / vTRIXPerdiod;

                            this.m_SaveData[2] += this.m_M2Data[i];
                            if (i > vTRIXPerdiod * 3 - 3) this.m_SaveData[2] = this.m_SaveData[2] - this.m_M2Data[i - vTRIXPerdiod];
                            if (i > vTRIXPerdiod * 3 - 4) {

                                this.m_M3Data[i] = this.m_SaveData[2] / vTRIXPerdiod;

                                nM3DataCount++;

                                if (nM3DataCount > 1) {
                                    this.m_MTData[i] = (this.m_M3Data[i] - this.m_M3Data[i - 1]) / this.m_M3Data[i - 1] * 100;

                                    var TRIXDataIndex = this.m_nResultTRIXData.length;
                                    this.m_nResultTRIXData[TRIXDataIndex] = this.m_MTData[i];

                                    if (this.m_vTRIXStartIndex == null)
                                        this.m_vTRIXStartIndex = i;

                                    rTRIXPacketData.AddTail(i, this.m_nResultTRIXData[TRIXDataIndex]);
                                    RQPacketsItem.m_Packets[rTRIXPacketData.m_nPacketIndex] = rTRIXPacketData.GetData(rTRIXPacketData.GetDataArraySize() - 1);

                                    if (this.m_MTData[i]) {

                                        this.m_MSnum++;

                                        this.m_SaveData[3] += this.m_MTData[i];

                                        if (this.m_MSnum > vTRIXSerdiod) this.m_SaveData[3] = this.m_SaveData[3] - this.m_MTData[i - vTRIXSerdiod];

                                        if (this.m_MSnum > vTRIXSerdiod - 1) {

                                            MSData[i] = this.m_SaveData[3] / vTRIXSerdiod;

                                            var TRIXSDataIndex = this.m_nResultTRIXSData.length;
                                            this.m_nResultTRIXSData[TRIXSDataIndex] = MSData[i];

                                            if (this.m_vTRIXSStartIndex == null)
                                                this.m_vTRIXSStartIndex = i;

                                            rTRIXSPacketData.AddTail(i, this.m_nResultTRIXSData[TRIXSDataIndex]);
                                            RQPacketsItem.m_Packets[rTRIXSPacketData.m_nPacketIndex] = rTRIXSPacketData.GetData(rTRIXSPacketData.GetDataArraySize() - 1);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        } else {

            var i = nDataLength - 1;
            var rDateTimeData = rDateTimePacketData.m_DataArray[i];
            var tDateTime = rDateTimeData.GetDateTimeT();

            if (rXScaleMng.m_tTimeArray[tDateTime] != undefined) {

                var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
                if (RQPacketsItem != undefined) {

                    if (this.m_vTRIXCStartIndex == null) this.m_vTRIXCStartIndex = i;

                    rTRIXCPacketData.UpdateData(i , vTRIXCerdiod);
                    RQPacketsItem.m_Packets[rTRIXCPacketData.m_nPacketIndex] = rTRIXCPacketData.GetData(rTRIXCPacketData.GetDataArraySize() - 1);

                    // Env 계산 Start

                    switch (vTRIXDType) {
                        case 0:
                            this.m_MData[i] = rInputPacketOData.m_DataArray[i].m_Data;
                            break;
                        case 1:
                            this.m_MData[i] = rInputPacketHData.m_DataArray[i].m_Data;
                            break;
                        case 2:
                            this.m_MData[i] = rInputPacketLData.m_DataArray[i].m_Data;
                            break;
                        case 3:
                            this.m_MData[i] = rInputPacketPData.m_DataArray[i].m_Data;
                            break;
                        case 4:
                            this.m_MData[i] = rInputPacketHLData.m_DataArray[i].m_Data;
                            break;
                        case 5:
                            this.m_MData[i] = rInputPacketHLCData.m_DataArray[i].m_Data;
                            break;
                    }



                    this.m_SaveData[0] += this.m_MData[i];

                    if (i > vTRIXPerdiod - 1) this.m_SaveData[0] = this.m_SaveData[0] - this.m_MData[i - vTRIXPerdiod];

                    if (i > vTRIXPerdiod - 2) {

                        this.m_M1Data[i] = this.m_SaveData[0] / vTRIXPerdiod;

                        this.m_SaveData[1] += this.m_M1Data[i];
                        if (i > vTRIXPerdiod * 2 - 2) this.m_SaveData[1] = this.m_SaveData[1] - this.m_M1Data[i - vTRIXPerdiod];
                        if (i > vTRIXPerdiod * 2 - 3) {

                            this.m_M2Data[i] = this.m_SaveData[1] / vTRIXPerdiod;

                            this.m_SaveData[2] += this.m_M2Data[i];
                            if (i > vTRIXPerdiod * 3 - 3) this.m_SaveData[2] = this.m_SaveData[2] - this.m_M2Data[i - vTRIXPerdiod];
                            if (i >= vTRIXPerdiod * 3 - 4) {
                                this.m_M3Data[i] = this.m_SaveData[2] / vTRIXPerdiod;

                                nM3DataCount++;
                                if (nM3DataCount > 1) {

                                    this.m_MTData[i] = (this.m_M3Data[i] - this.m_M3Data[i - 1]) / this.m_M3Data[i - 1] * 100;

                                    var TRIXDataIndex = this.m_nResultTRIXData.length - 1;
                                    this.m_nResultTRIXData[TRIXDataIndex] = this.m_MTData[i];

                                    if (this.m_vTRIXStartIndex == null)
                                        this.m_vTRIXStartIndex = i;

                                    rTRIXPacketData.UpdateData(i , this.m_nResultTRIXData[TRIXDataIndex]);
                                    RQPacketsItem.m_Packets[rTRIXPacketData.m_nPacketIndex] = rTRIXPacketData.GetData(rTRIXPacketData.GetDataArraySize() - 1);

                                    if (this.m_MTData[i]) {

                                        //	MSnum++;

                                        this.m_SaveData[3] += this.m_MTData[i];

                                        if (this.m_MSnum > vTRIXSerdiod) this.m_SaveData[3] = this.m_SaveData[3] - this.m_MTData[i - vTRIXSerdiod];

                                        if (this.m_MSnum > vTRIXSerdiod - 1) {

                                            MSData[i] = this.m_SaveData[3] / vTRIXSerdiod;

                                            var TRIXSDataIndex = this.m_nResultTRIXSData.length - 1;
                                            this.m_nResultTRIXSData[TRIXSDataIndex] = MSData[i];

                                            if (this.m_vTRIXSStartIndex == null)
                                                this.m_vTRIXSStartIndex = i;

                                            rTRIXSPacketData.UpdateData(i , this.m_nResultTRIXSData[TRIXSDataIndex]);
                                            RQPacketsItem.m_Packets[rTRIXSPacketData.m_nPacketIndex] = rTRIXSPacketData.GetData(rTRIXSPacketData.GetDataArraySize() - 1);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

//VR
function CVRIndicator(rRQSet, strIndicatorName) {
    CIndicator.call(this, rRQSet, strIndicatorName);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "Volume Ratio 지표";

    //계산결과 담을 패킷생성
    this.m_strVRPacketName = this.m_strKey + "VR_";
    rRQSet.AddNumPacketInfo(this.m_strVRPacketName, -1, false, 10, null, this.m_nDigit);

    this.m_strVRHPacketName = this.m_strKey + "_VRH_";
    rRQSet.AddNumPacketInfo(this.m_strVRHPacketName, -1, false, 10, null, this.m_nDigit);

    this.m_strVRLPacketName = this.m_strKey + "_VRL_";
    rRQSet.AddNumPacketInfo(this.m_strVRLPacketName, -1, false, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var VRSubGraph = new CIndicatorSubGraph(this);
    VRSubGraph.m_rRQSet = rRQSet;
    VRSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    VRSubGraph.SetPacketData(this.m_strVRPacketName);
    VRSubGraph.SetSubGraphName("VR");
    VRSubGraph.m_strSubGraphTitle = "Volume Ratio"; //E_High
    this.m_SubGraphArray.push(VRSubGraph);


    var VRHSubGraph = new CIndicatorSubGraph(this);
    VRHSubGraph.m_rRQSet = rRQSet;
    VRHSubGraph.m_LineTypeInfo.m_clrLine = '#FF0000';
    VRHSubGraph.SetPacketData(this.m_strVRHPacketName);
    VRHSubGraph.SetSubGraphName("VR_HIGH");
    VRHSubGraph.m_strSubGraphTitle = "상한선"; //E_High
    this.m_SubGraphArray.push(VRHSubGraph);


    var VRLSubGraph = new CIndicatorSubGraph(this);
    VRLSubGraph.m_rRQSet = rRQSet;
    VRLSubGraph.m_LineTypeInfo.m_clrLine = '#0000FF';
    VRLSubGraph.SetPacketData(this.m_strVRLPacketName);
    VRLSubGraph.SetSubGraphName("VR_LOW");
    VRLSubGraph.m_strSubGraphTitle = "하한선"; //E_High
    this.m_SubGraphArray.push(VRLSubGraph);


    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_", "_VOLUME_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 25);    //  기간
    this.AddVariable("Overheating", NUMERIC_TYPE, 150);    //  과열
    this.AddVariable("Stagnancy", NUMERIC_TYPE, 70);    //  침체
    this.AddVariable("DType", NUMERIC_TYPE, 3);    // 데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)
    this.AddVariable("ViewVR", NUMERIC_TYPE, true);  // OBV

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
}
CVRIndicator.prototype = new CIndicator();
CVRIndicator.prototype.constructor = CVRIndicator;
CVRIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];
    var rInputPacketVCData = this.m_InputPacketDataArray[6];

    if (rInputPacketPData == undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rVRPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strVRPacketName);
    var rVRHPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strVRHPacketName);
    var rVRLPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strVRLPacketName);

    rVRPacketData.InitDataArray();
    rVRHPacketData.InitDataArray();
    rVRLPacketData.InitDataArray();

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vVRPerdiod = this.m_VariableArray[0].m_strData;
    var vVRHPerdiod = this.m_VariableArray[1].m_strData;
    var vVRLPerdiod = this.m_VariableArray[2].m_strData;
    var vVRDType = this.m_VariableArray[3].m_strData;
    var vVRView = this.m_VariableArray[3].m_strData;

    ////////////////////////////////////////////////////////

    var vVRStartIndex = null;
    var vVRHStartIndex = null;
    var vVRLStartIndex = null;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var rNumPacketItemPData = [], rNumPacketItemHData = [], rNumPacketItemLData = [];
    var nResultVRData = [], nResultVRHData = [], nResultVRLData = [];
    var MData = [], OBVData = [], OBVSData = [], volData = [], vr = [];
    var volUp = 0, volDn = 0, volSm = 0, cal = 0, Hab = 0;

    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined)
            continue;

        if (vVRHStartIndex == null) vVRHStartIndex = i;
        nResultVRHData[i] = vVRHPerdiod;
        rVRHPacketData.AddTail(i, nResultVRHData[i]);
        RQPacketsItem.m_Packets[rVRHPacketData.m_nPacketIndex] = rVRHPacketData.GetData(rVRHPacketData.GetDataArraySize() - 1);

        if (vVRLStartIndex == null) vVRLStartIndex = i;
        nResultVRLData[i] = vVRLPerdiod;
        rVRLPacketData.AddTail(i, nResultVRLData[i]);
        RQPacketsItem.m_Packets[rVRLPacketData.m_nPacketIndex] = rVRLPacketData.GetData(rVRLPacketData.GetDataArraySize() - 1);

        // RSI 계산 Start

        switch (vVRDType) {
            case 0:
                MData[i] = rInputPacketOData.m_DataArray[i].m_Data;
                break;
            case 1:
                MData[i] = rInputPacketHData.m_DataArray[i].m_Data;
                break;
            case 2:
                MData[i] = rInputPacketLData.m_DataArray[i].m_Data;
                break;
            case 3:
                MData[i] = rInputPacketPData.m_DataArray[i].m_Data;
                break;
            case 4:
                MData[i] = rInputPacketHLData.m_DataArray[i].m_Data;
                break;
            case 5:
                MData[i] = rInputPacketHLCData.m_DataArray[i].m_Data;
                break;
        }

        volData[i] = rInputPacketVCData.m_DataArray[i].m_Data;

        if (i <= vVRPerdiod - 2) continue;

        volUp = 0;
        volDn = 0;
        volSm = 0;

        for (var j = i; j > i - vVRPerdiod; j--) {
            cal = MData[j] - MData[j - 1];

            if (cal < 0) {      //하락일
                volDn += volData[j];
            } else if (cal > 0) {//상승일
                volUp += volData[j];
            } else {          //보합일
                volSm += volData[j];
            }
        }

        volSm = volSm * 0.5;

        Hab = volDn + volSm;

        if (Hab != 0) {
            vr[i] = (volUp + volSm) * 100 / (Hab);
            

        } else {
            vr[i] = vr[i - 1];
            

        }

        if (vVRView) {

            if (vVRStartIndex == null) vVRStartIndex = i;
            nResultVRData[i] = vr[i];
            rVRPacketData.AddTail(i, nResultVRData[i]);
            RQPacketsItem.m_Packets[rVRPacketData.m_nPacketIndex] = rVRPacketData.GetData(rVRPacketData.GetDataArraySize() - 1);
        }
        

    }

    rVRPacketData.SetRQStartIndex(vVRStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    rVRHPacketData.SetRQStartIndex(vVRHStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    rVRLPacketData.SetRQStartIndex(vVRLStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!

    return true;

}

//LRS
function CLRSIndicator(rRQSet, strIndicatorName) {
    CIndicator.call(this, rRQSet, strIndicatorName);

    this.m_rRQSet = rRQSet;
    this.m_strTitle = "LRS 지표";

    //계산결과 담을 패킷생성
    this.m_strLRSPacketName = this.m_strKey + "_LRS_";
    rRQSet.AddNumPacketInfo(this.m_strLRSPacketName, -1, false, 10, null, this.m_nDigit);

    this.m_strLRSSPacketName = this.m_strKey + "_LRSS_";
    rRQSet.AddNumPacketInfo(this.m_strLRSSPacketName, -1, false, 10, null, this.m_nDigit);

    this.m_strLRSCPacketName = this.m_strKey + "_LRSC_";
    rRQSet.AddNumPacketInfo(this.m_strLRSCPacketName, -1, false, 10, null, this.m_nDigit);

    //서브그래프 추가 및 서브그래프와 계산결과 패킷데이터 연결
    var LRSSubGraph = new CIndicatorSubGraph(this);
    LRSSubGraph.m_rRQSet = rRQSet;
    LRSSubGraph.m_LineTypeInfo.m_clrLine = '#FF661F';
    LRSSubGraph.SetPacketData(this.m_strLRSPacketName);
    LRSSubGraph.SetSubGraphName("LRS");
    LRSSubGraph.m_strSubGraphTitle = "LRS"; //E_High
    this.m_SubGraphArray.push(LRSSubGraph);


    var LRSSSubGraph = new CIndicatorSubGraph(this);
    LRSSSubGraph.m_rRQSet = rRQSet;
    LRSSSubGraph.m_LineTypeInfo.m_clrLine = '#009C4A';
    LRSSSubGraph.SetPacketData(this.m_strLRSSPacketName);
    LRSSSubGraph.SetSubGraphName("Signal");
    LRSSSubGraph.m_strSubGraphTitle = "Signal";
    this.m_SubGraphArray.push(LRSSSubGraph);

    var LRSCSubGraph = new CIndicatorSubGraph(this);
    LRSCSubGraph.m_rRQSet = rRQSet;
    LRSCSubGraph.m_LineTypeInfo.m_clrLine = '#000000';
    LRSCSubGraph.SetPacketData(this.m_strLRSCPacketName);
    LRSCSubGraph.SetSubGraphName("BaseLine");
    LRSCSubGraph.m_strSubGraphTitle = "기준선";
    this.m_SubGraphArray.push(LRSCSubGraph);

    this.AddInputPacket(["_OPEN_", "_HIGH_", "_LOW_", "_CLOSE_", "_HL2_", "_HLC3_"]);
    this.AddVariable("Period", NUMERIC_TYPE, 14);    // 기간
    this.AddVariable("SignalPeriod", NUMERIC_TYPE, 3);    // Signal 기간
    this.AddVariable("BaseNum", NUMERIC_TYPE, 0);    // 기준선
    this.AddVariable("DType", NUMERIC_TYPE, 3);    // 데이터 (0:시, 1:고, 2:저, 3:종, 4:(고+저)/2, 5:(고+저+종)/3)
    this.AddVariable("ViewLRS", NUMERIC_TYPE, true);  // Momentum
    this.AddVariable("ViewLRSS", NUMERIC_TYPE, true);  // Signal

    //X축에 사용되는 패킷데이터
    this.m_rXAxisPacket = rRQSet.GetPacketData("_DATETIME_");
}
CLRSIndicator.prototype = new CIndicator();
CLRSIndicator.prototype.constructor = CLRSIndicator;
CLRSIndicator.prototype.Calc = function (bSetup=false, bAppend = false) {

    CIndicator.prototype.Calc.call(this, bSetup);

    var rInputPacketOData = this.m_InputPacketDataArray[0];
    var rInputPacketHData = this.m_InputPacketDataArray[1];
    var rInputPacketLData = this.m_InputPacketDataArray[2];
    var rInputPacketPData = this.m_InputPacketDataArray[3];
    var rInputPacketHLData = this.m_InputPacketDataArray[4];
    var rInputPacketHLCData = this.m_InputPacketDataArray[5];

    if (rInputPacketPData == undefined)
        return false;

    var strRQ = this.m_rRQSet.GetRQ();
    var rXScaleMng = this.GetXScaleMng();
    var rDateTimePacketData = this.m_rXAxisPacket;

    var rLRSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strLRSPacketName);
    var rLRSSPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strLRSSPacketName);
    var rLRSCPacketData = this.m_rRQSet.GetPacketDataByName(this.m_strLRSCPacketName);

    rLRSPacketData.InitDataArray();
    rLRSSPacketData.InitDataArray();
    rLRSCPacketData.InitDataArray();

    ////////////////////////////////////////////////////////
    //필요한 변수들은 여기서 꺼내놓는다.
    var vLRSPerdiod = this.m_VariableArray[0].m_strData;
    var vLRSSPerdiod = this.m_VariableArray[1].m_strData;
    var vLRSCPerdiod = this.m_VariableArray[2].m_strData;
    var vLRSDType = this.m_VariableArray[3].m_strData;
    var vLRSView = this.m_VariableArray[4].m_strData;
    var vLRSSView = this.m_VariableArray[5].m_strData;
    ////////////////////////////////////////////////////////
    var vLRSStartIndex = null;
    var vLRSCStartIndex = null;
    var vSignalStartIndex = null;

    var nDataLength = rInputPacketPData.m_DataArray.length;
    var rNumPacketItemPData = [], rNumPacketItemHData = [], rNumPacketItemLData = [];
    var nResultLRSData = [], nResultLRSSData = [], nResultLRSCData = [], nResultLRSCHData = [], nResultLRSCLData = [];
    var MData = [], average = [], deviation = [], LRSData = [], MA1Data = [], MA2Data = [], stDevia = [];
    var dValue1 = [], dValue2 = [], dValue3 = [], dValue4 = [], dValue5 = [], dValue6 = [], retData = [];
    var dValue1sum = 0, dValue2sum = 0, dValue3sum = 0, dValue4sum = 0, dValue5sum = 0, dValue36snum = 0, LRSSsnum = 0;

    for (var k = 0; k < nDataLength; k++) {
        dValue1[k] = k + 1;
    }

    for (var i = 0; i < nDataLength; i++) {
        var rDateTimeData = rDateTimePacketData.m_DataArray[i];
        var tDateTime = rDateTimeData.GetDateTimeT();

        if (rXScaleMng.m_tTimeArray[tDateTime] == undefined)
            continue;

        var RQPacketsItem = rXScaleMng.m_tTimeArray[tDateTime][strRQ];
        if (RQPacketsItem == undefined)
            continue;

        if (vLRSCStartIndex == null) vLRSCStartIndex = i;

        nResultLRSCData[i] = vLRSCPerdiod;
        rLRSCPacketData.AddTail(i, nResultLRSCData[i]);
        RQPacketsItem.m_Packets[rLRSCPacketData.m_nPacketIndex] = rLRSCPacketData.GetData(rLRSCPacketData.GetDataArraySize() - 1);

        // LRS 계산 Start

        switch (vLRSDType) {
            case 0:
                MData[i] = rInputPacketOData.m_DataArray[i].m_Data;
                break;
            case 1:
                MData[i] = rInputPacketHData.m_DataArray[i].m_Data;
                break;
            case 2:
                MData[i] = rInputPacketLData.m_DataArray[i].m_Data;
                break;
            case 3:
                MData[i] = rInputPacketPData.m_DataArray[i].m_Data;
                break;
            case 4:
                MData[i] = rInputPacketHLData.m_DataArray[i].m_Data;
                break;
            case 5:
                MData[i] = rInputPacketHLCData.m_DataArray[i].m_Data;
                break;
        }

        if (i <= vLRSPerdiod - 2) continue;

        dValue2sum = 0;
        dValue3sum = 0;
        dValue4sum = 0;
        dValue5sum = 0;

        for (var j = i; j > i - vLRSPerdiod; j--) {
            dValue2sum += dValue1[j];
            dValue3sum += rInputPacketPData.m_DataArray[j].m_Data;
            dValue4sum += dValue1[j] * rInputPacketPData.m_DataArray[j].m_Data;
            dValue5sum += dValue1[j] * dValue1[j];
        }
        dValue2[i] = dValue2sum;
        dValue3[i] = dValue3sum;
        dValue4[i] = dValue4sum;
        dValue5[i] = dValue5sum;
        dValue6[i] = (vLRSPerdiod * dValue5[i] - (dValue2[i] * dValue2[i]));
        retData[i] = (vLRSPerdiod * dValue4[i] - dValue2[i] * dValue3[i]) / dValue6[i];

        if (vLRSView) {
            if (vLRSStartIndex == null) vLRSStartIndex = i;

            nResultLRSData[i] = retData[i];
            rLRSPacketData.AddTail(i, nResultLRSData[i]);
            RQPacketsItem.m_Packets[rLRSPacketData.m_nPacketIndex] = rLRSPacketData.GetData(rLRSPacketData.GetDataArraySize() - 1);
        }

        if (vLRSSView) {
            LRSSsnum = 0;

            for (var h = i; h > i - vLRSSPerdiod; h--) {
                LRSSsnum += retData[h];
            }

            if (!LRSSsnum) LRSSsnum = retData[i];
            if (vSignalStartIndex == null) vSignalStartIndex = i;

            nResultLRSSData[i] = LRSSsnum / vLRSSPerdiod;

            rLRSSPacketData.AddTail(i, nResultLRSSData[i]);
            RQPacketsItem.m_Packets[rLRSSPacketData.m_nPacketIndex] = rLRSSPacketData.GetData(rLRSSPacketData.GetDataArraySize() - 1);
        }
        
    }

    rLRSPacketData.SetRQStartIndex(vLRSStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    rLRSSPacketData.SetRQStartIndex(vSignalStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!
    rLRSCPacketData.SetRQStartIndex(vLRSCStartIndex);//데이터 시작위치 지정(예:5일이평=4, 10일이평=9 등)=>매우중요!!

    return true;
}
*/

CHTMLChart.prototype.CreateIndicator = function (rRQSet, strIndicatorName, strKey) {

    var NewIndicator = null;
    switch(strIndicatorName)
    {
        case "_PRICE_":
            NewIndicator = new CPriceIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_VOLUME_":
            NewIndicator = new CVolumeIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_MA_":
            NewIndicator = new CMAIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_VMA_":
            NewIndicator = new CVMAIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_MACD_":
            NewIndicator = new CMACDIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_MACDOS_":
            NewIndicator = new CMACDOSIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_ADX_":
            NewIndicator = new CADXIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_CCI_":
            NewIndicator = new CCCIIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_Env_":
            NewIndicator = new CEnvelopeIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_BB_":
            NewIndicator = new CBBIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_MOM_":
            NewIndicator = new CMOMIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_RSI_":
            NewIndicator = new CRSIIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_StoF_":
            NewIndicator = new CStoFIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_StoS_":
            NewIndicator = new CStoSIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_WILL_":
            NewIndicator = new CWillIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_Disparity_":
            NewIndicator = new CDisparityIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_OBV_":
            NewIndicator = new COBVIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_PIVOT_":
            NewIndicator = new CPIVOTIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_ROC_":
            NewIndicator = new CROCIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_PSYCO_":
            NewIndicator = new CPSYCOIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_AB_":
            NewIndicator = new CABRatioIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_AD_":
            NewIndicator = new CADLineIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_ATR_":
            NewIndicator = new CATRIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_CO_":
            NewIndicator = new CCOIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_CV_":
            NewIndicator = new CCVIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_DMI_":
            NewIndicator = new CDMIIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_EOM_":
            NewIndicator = new CEOMIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_LRL_":
            NewIndicator = new CLRLIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_RCI_":
            NewIndicator = new CRCIIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_OSCV_":
            NewIndicator = new COSCVIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_MAC_":
            NewIndicator = new CMACIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_RAINBOW_":
            NewIndicator = new CRainbowIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_THREELINE_":
            NewIndicator = new CThreeLineIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_PANDF_":
            NewIndicator = new CPAndFIndicator(rRQSet, strIndicatorName, strKey);break;
        case "_HOGADEPTH_":
            NewIndicator = new CHogaDepthIndicator(rRQSet, strIndicatorName, strKey);break;
    }

    var DefaultPropertyInfo = this.GetDefaultIndicatorProperty(strIndicatorName, true);
    if (DefaultPropertyInfo) {
        NewIndicator.SetPropertyInfo(NewIndicator.m_strKey, DefaultPropertyInfo);
    }

    //LoadIndicatorDefaultProperty( NewIndicator, strIndicatorName );
    // 20190201 공현욱 : 지표 디폴트설정값 일반화 작업으로 인해 공통함수 작업중... <<

    //미사용 지표 추가적인 개발 필요
    /*
    else if (strIndicatorName === "_ADXR_") {  // ADXR
        NewIndicator = new CADXRIndicator(rRQSet, strIndicatorName);
    }
    else if (strIndicatorName === "_SONAR_") {  // SONAR
        NewIndicator = new CSONARIndicator(rRQSet, strIndicatorName);
    }
    else if (strIndicatorName === "_VR_") {  // OBV
        NewIndicator = new CVRIndicator(rRQSet, strIndicatorName);
    }
    else if (strIndicatorName === "_TRIX_") {  // TRIX
        NewIndicator = new CTRIXIndicator(rRQSet, strIndicatorName);
    }
    else if (strIndicatorName === "_LRS_") {  // PIVOT
        NewIndicator = new CLRSIndicator(rRQSet, strIndicatorName);
    }
    */
    return NewIndicator;
}
