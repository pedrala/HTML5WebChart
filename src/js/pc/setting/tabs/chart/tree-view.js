import settingView from './setting-view'
import PerfectScrollbar from 'perfect-scrollbar'
import t from '../../../../common/i18n';
import baseHtml from '../../../../../html/pc/setting/tabs/chart/index.html';

export default {
  /**
   * jstree 적용
   * 참고URL: https://www.jstree.com/
   * @param {Object} $baseHtml
   * @param {Object} indicatorGroup 
   */
  tree: function ($baseHtml, rChart, selectedId) {
    const that = this;
    const $setting_tab = $('#setting_tab', document), // 상단 탭
      $indi_grp_view = $('.indi_grp_view', $baseHtml), // 지표검색/목록 영역
      $catcomplete_input = $('#catcomplete > input', $indi_grp_view), // 지표 검색
      $accordion_area = $('.accordion_area', $indi_grp_view), // 지표 목록
      $move_btn_area = $('.move_btn_area', $baseHtml), // 추가/삭제 버튼 영역
      $buttons1 = $('button', $move_btn_area), // 지표 추가/삭제
      $indi_ctrl_view = $('.indi_ctrl_view', $baseHtml), // 트리영역
      $buttons2 = $('button', $indi_ctrl_view); // 영역 추가/삭제

    /**
     * 적용되어 있는 지표 목록에 트리 UI 적용
     */
    $('.tree_area', $indi_ctrl_view).jstree({
        'core': {
          'animation': 0,
          'check_callback': true,          
          'data': function (obj, callback) {
            callback.call(this, that.getBlockData(rChart, this.currentId || selectedId));
          },
        },
        'types': that.types,
        'plugins': [
          'types',  // 아이콘 지정을 위한 types
          'wholerow', // row 전체 선택
        ]
      })
      // 초기 로드 이벤트
      .on('ready.jstree', function (e, data) {
        // 스크롤 UI 적용
        data.ps = new PerfectScrollbar(e.target, {
          suppressScrollX: true
        });

        // 선택된 지표 설정 표시
        const ref = data.instance,
          selected = ref.get_selected();

        if(selected){
          let selectedNode = ref.get_node(selected[0]);
          settingView.draw($baseHtml, rChart, selectedNode, ref);

          ref.set_state({
            core: {
              'selected': [selected]
            }          
          });
          //that.EnableMoveBtns($baseHtml, ref, rChart, selected[0]);
        }
      })
      // 트리영역 선택 이벤트
      .on('select_node.jstree', function (e, data) {

        const $set_tab = $('#setting_tab', document);

        const ref = data.instance,
          rootNode = ref.get_node('#'),
          children = rootNode.children_d,
          selected = data.selected[0],
          selectedNode = ref.get_node(selected);

        let AreaList = ref.get_children_dom('#');

        // 특수차트 선택 시 미사용 요소 비활성화
        const isSpecialChartType = rChart.IsSpecialChartType();
        $catcomplete_input.prop('disabled', isSpecialChartType);
        $buttons1.prop('disabled', isSpecialChartType);
        $buttons2.prop('disabled', isSpecialChartType);        

        if (isSpecialChartType) {
          $set_tab.tabs('option', 'disabled', [1, 2, 3, 4]);
          $accordion_area.accordion("disable");

          // 설정창 표시      
          settingView.draw($baseHtml, rChart, selectedNode, ref);

        } else {
          $set_tab.tabs('enable');
          $accordion_area.accordion("enable");
          
          // 영역 선택시 지표삭제 버튼 토글
          $('button#btnRemove', $move_btn_area).prop('disabled', ref.get_type(selected) === 'area');

          that.EnableMoveBtns($baseHtml, ref, rChart, selected);
        }

      })      
      .on('refresh.jstree', function (e, data) {
        const ref = data.instance;
        ref.set_state({
          core: {
            'selected': [ref.currentId || selectedId]
          }          
        });

        ref.currentId = null;
      });
  },
  // 트리영역에 노출될 지표 데이터
  getBlockData: function (rChart, selectedId) {    
    // 선택한 지표가 있으면 선택한 지표 KEY, 없으면 가격차트 KEY
    const strKey = selectedId ||
      (!rChart.IsSpecialChartType()
        ? rChart.GetPriceIndicatorKey()
        : rChart.GetSpecialIndicatorKey());    
    
    const blockData = [];
    rChart.m_MainBlock.m_ChartBlockArray.forEach(({
      m_GraphArray,
      m_strChartBlockKey,
      m_nAreaIndex,
    }, i) => {      
      
      blockData.push({
        "id": "area_" + m_nAreaIndex,
        "parent": "#",
        "text": t('chart.area') + m_nAreaIndex,
        "type": "area",
        "data": {          
          "index": i,
          "block_key":m_strChartBlockKey
        },
        "state": {
          "opened": true
        }
      });
      
      m_GraphArray.forEach(({
        m_strKey,        
        m_strName,
        m_strGroup,
        m_strOverlayGraphName,
        m_strTitle,
        m_strTitleLangKey,
        m_rRQSet
      }) => {        
        let isPriceChart = false; // 차트유형이 캔들/라인/바/PNF/삼선전환도 인 경우 가격차트로 묶는다.
        let canNotDelete = false; // 삭제불가 flat (기본RQ이고 가격차트 일 경우)
        let iconType = 'defalut'; // 지표 아이콘        
        switch (m_strGroup) {
          case 'PRICE': {
            // _Env_ _BB_ _PIVOT_ _MAC_ _MA_ _RAINBOW_
            if (m_strOverlayGraphName === '_PRICE_') {
              iconType = 'overlay';
            } 
            // _PRICE_ _PANDF_ _THREELINE_ _HOGADEPTH_
            else {
              let strTitle = '';
              // 삭제 불가
              if (m_rRQSet.m_strRQ === rChart.m_strDefaultRQ) {                
                canNotDelete = true;
              }

              // 타이틀 변경
              if (m_strName === '_PRICE_') {
                m_strTitle = (canNotDelete ? '*' : '') + t('chart.pricechart');
              } else {
                m_strTitle = (canNotDelete ? '*' : '') + m_strTitle;
              }
              
              isPriceChart = true;
              iconType = 'price';
            }

            break;
          }
          // _VOLUME_ _VMA_ _OBV_ _OSCV_
          case 'VOLUME': {
            iconType = 'volume';
            break;
          }
          default: {
            iconType = 'default';
            break;
          }
        }

        blockData.push({
          "id": m_strKey,
          "parent": "area_" + m_nAreaIndex,
          "text": m_strTitle, // 
          "type": iconType,
          "data": {
            "name": m_strName,
            "isPriceChart": isPriceChart,
            "canNotDelete": canNotDelete,
            "m_RQInfo": m_rRQSet.m_RQInfo
          },
          "state": {
            "selected": m_strKey === strKey
          }
        });
      });
    });

    return blockData;
  },
  createArea: function(rTree, rChartBlock){

    let nBlockIndex = rChartBlock.GetBlockIndex();
    let nAreaIndex = rChartBlock.GetAreaIndex();
    let strBlockID = "area_" + (nAreaIndex);
    rTree.create_node('#', 
      {
        "id": strBlockID, 
        "parent":"#", 
        "text":t('chart.area') + nAreaIndex, 
        "type":"area",
        "data":{
          "index":nBlockIndex,
          "block_key":rChartBlock.m_strChartBlockKey
        },
        "state":{
          "opened":true          
        }
      },"last", function(){});

    return strBlockID;
  },
  createGraph:function(rTree, strBlockID, rGraph)
  {

    let isPriceChart = false; // 차트유형이 캔들/라인/바/PNF/삼선전환도 인 경우 가격차트로 묶는다.    
    let iconType = 'defalut'; // 지표 아이콘        
    switch (rGraph.m_strGroup) {
      case 'PRICE': {
        // _Env_ _BB_ _PIVOT_ _MAC_ _MA_ _RAINBOW_
        if (rGraph.m_strOverlayGraphName === '_PRICE_') {
          iconType = 'overlay';
        } 
        // _PRICE_ _PANDF_ _THREELINE_ _HOGADEPTH_
        else {
          let strTitle = '';          

          // 타이틀 변경
          if (rGraph.m_strName === '_PRICE_') {
            rGraph.m_strTitle = t('chart.pricechart');
          }
          
          isPriceChart = true;
          iconType = 'price';
        }

        break;
      }
      // _VOLUME_ _VMA_ _OBV_ _OSCV_
      case 'VOLUME': {
        iconType = 'volume';
        break;
      }
      default: {
        iconType = 'default';
        break;
      }
    }
    rTree.create_node(strBlockID, 
      {
        "id": rGraph.m_strKey,
        "parent":strBlockID,
        "text":rGraph.m_strTitle,
        "type":iconType,
        "data":{
          "name":rGraph.m_strName,
          "isPriceChart":isPriceChart,
          "m_RQInfo":rGraph.m_rRQSet.m_RQInfo
        },
        "state":{
          "selected": false
        }
      }, "last", function(){});

  },
  EnableMoveBtns:function($baseHtml, rTree, rChart, selected)
  {   
    const $indi_ctrl_view = $('.indi_ctrl_view', $baseHtml); // 트리영역

    if(!selected){
      selected = rTree.get_selected();      
    }

    let selectedNode = rTree.get_node(selected);
    let AreaList = rTree.get_children_dom('#');

    // 특수차트 선택 시 미사용 요소 비활성화
    const isSpecialChartType = rChart.IsSpecialChartType();       

    if (!isSpecialChartType) {

      // 영역/지표 선택 시 이동버튼 토글
      // TODO: 현재 영역/지표를 하나의 배열로 나열하여 처음인지 마지막인지만 구분.. 영역/지표를 나눠 토글 필요....          
      const $btnsUp = $('button#btnDbUp, button#btnUp', $indi_ctrl_view),
        $btnsDown = $('button#btnDbDown, button#btnDown', $indi_ctrl_view);
      
      //영역을 선택한 경우
      if(selected.indexOf('area') !== -1){
        let i, nodeArea, nListLength = AreaList.length;
        for(i = 0 ; i < nListLength; i++ ){
          nodeArea = AreaList[i];
          if(nodeArea.id === selected){
            if( i === 0 ){
              $btnsUp.attr('disabled', 'disabled');
              $btnsDown.removeAttr('disabled');
            }
            else if(i === nListLength - 1){
              $btnsUp.removeAttr('disabled');
              $btnsDown.attr('disabled', 'disabled');
            }
            else{
              $btnsUp.removeAttr('disabled');
              $btnsDown.removeAttr('disabled');
            }
            break;
          }
        }
      }
      else{

        let rSelectGraph = rChart.GetGraphByKey(selected);
        if(rSelectGraph){
          let rSelBlock = rSelectGraph.m_rBlock;
          let nGraphIndex = rSelectGraph.GetGraphIndexInBlock();
          let nBlockIndex = rSelBlock.GetBlockIndex();
          let nChartBlockLen = rChart.GetChartBlockArrayLength();
          if(nBlockIndex === 0 && nGraphIndex === 0){
            $btnsUp.attr('disabled', 'disabled');
            $btnsDown.removeAttr('disabled');
          }
          else if(nBlockIndex === nChartBlockLen - 1 && nGraphIndex === rSelBlock.m_GraphArray.length - 1){
            $btnsUp.removeAttr('disabled');
            $btnsDown.attr('disabled', 'disabled');
          }
          else{
            $btnsUp.removeAttr('disabled');
            $btnsDown.removeAttr('disabled');
          }
        }
      }
    }

    // 설정창 표시      
    settingView.draw($baseHtml, rChart, selectedNode, rTree);
  },
  // 트리 영역 types (아이콘, 타입)
  types: {
    "#": {
      "max_children": 999999,
      "max_depth": 2,
      "valid_children": ["area"]
    },
    "area": {
      "icon": "icon02",
      "max_children": 999999,
      "max_depth" : 1,
      "valid_children": ["price", "overlay", "volume", "default"]
    },
    "price": {
      "icon": "icon03",
    },
    "overlay": {
      "icon": "icon04",
    },
    "volume": {
      "icon": "icon05",
    },
    "default": {
      "icon": "icon06",
    }
  }
}