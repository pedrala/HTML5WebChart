import candleHtml from './main/candle';
import lineHtml from './main/line';
import pnfHtml from './main/pnf';
import threeHtml from './main/three';
import barHtml from './main/bar';

import movingAverageHtml from './sub/movingAverage';
import volumeHtml from './sub/volume';
import oscillatorHtml from './sub/oscillator';
import assistantEtcHtml from './sub/etc';

import utils from '../../../../common/utils'
import PerfectScrollbar from 'perfect-scrollbar'

export default {
  ps: null, // perfect-scrollbar
  /**
   * 
   * @param {Object} $baseHtml 차트/지표 설정 영역
   * @param {Object} rChart 차트 엔진
   * @param {Object} selectedNode 트리에서 선택된 노드
   */
  draw: function ($baseHtml, rChart, selectedNode, jstree) {
    const that = this;
    const $setting_view_header = $('.setting_view_header', $baseHtml);
    const $setting_view_content = $('.setting_view_content', $baseHtml);      
    const $setting_view_footer = $('.setting_view_footer', $baseHtml);

    // 타이틀 변경
    $('.src_tit', $setting_view_header).text(selectedNode.text);
    $('.price_toolbar', $setting_view_header).remove();

    // 탭 영역 삭제
    $setting_view_content.empty();

    // 영역을 선택했을 경우에는 상단에 명칭만 표시되고 UI가 나타나지 않음
    if (selectedNode.type === 'area') {
      $setting_view_content.hide();
      $setting_view_footer.hide();
    }
    // 설정 탭 표시
    else {
      const strKey = selectedNode.id, // 지표 KEY
        isPriceChart = selectedNode.data.isPriceChart // 가격차트

      // 가격차트
      if (isPriceChart) {
        // 차트 타입 선택 박스 생성
        const $fieldset = $('<fieldset>', {
            'class': 'select_ui'
          }), $price_select = $('<select>', {
            'class': '',
            'name': 'nValue'
          }).appendTo($fieldset), 
          $price_toolbar = $('<div>', {
          'class': 'price_toolbar'
        }).html($fieldset).appendTo($setting_view_header);        

        // 차트유형 넣기
        const rPropertyInfo = rChart.GetPropertyInfo(strKey),
          nSubGraphSubType = rPropertyInfo.m_SubGraphPropertyInfoArray[0].m_nSubGraphSubType;
        const chartTypeList = utils.getChartTypeList();

        $price_select.optsselectmenu({
          width: 110,
          shape: 'chartselect',
          opts: chartTypeList,
          props: chartTypeList,
          param: nSubGraphSubType,
          callback: (id, type) => {
            const strCurrentKey = !rChart.IsSpecialChartType() ?
              rChart.GetPriceIndicatorKey() :
              rChart.GetSpecialIndicatorKey();

            // 선택한 차트TYPE 적용
            const rPropertyInfo = rChart.GetPropertyInfo(strCurrentKey);
            rPropertyInfo.m_SubGraphPropertyInfoArray[0].m_nSubGraphSubType = Number(type);
            const strIndicatorKey = rChart.SetPropertyInfo(strCurrentKey, rPropertyInfo, true);
            rChart.SetGlobalPropertyToChart();

            // tree refresh 및 지표 재선택을 위한 key 저장
            if (jstree) {
              jstree.currentId = strIndicatorKey;
              jstree.refresh();
            }
          }
        });

        // 상단 종목[주기] 추가        
        $('<span>', {class: 'src_label'})
        .text(function() {
          const rRQInfo = selectedNode.data.m_RQInfo;
          return rRQInfo.m_strItemName + '[' + utils.getCycleName(rRQInfo.m_nCycle) + ']';
        }).appendTo($price_toolbar);
      }
      // 가격 차트 외
      else {        
        $setting_view_content.removeClass('price');
      }      

      // 차트/지표 설정 영역
      $setting_view_content.append(that.getHtml(rChart, strKey));
      
      // 스크롤 이벤트 (스크롤 이동시 selectmenu 닫기 위해 사용)
      if (that.ps !== null) {

        if(!that.m_fScroll){

          that.m_fScroll = function(e){
            $(".select_ui select", e.target).each((idx, obj) => {
              if ($(obj).hasClass('lineTypeSelect')) {
                $(obj).linetypeselectmenu('close');
              } else if ($(obj).hasClass('lineThicknessSelect')) {
                $(obj).lineThicknessselectmenu('close');
              } else {
                $(obj).selectmenu('close');
              }
            });
          }
        }
        that.ps.element.addEventListener('ps-scroll-y', that.m_fScroll);        
      }

      $setting_view_content.show();
      $setting_view_footer.show();
    }
  },
  getHtml: function (rChart, strKey) {
    const that = this;
    const strName = rChart.GetPropertyInfo(strKey).m_strName;
    
    let $sub_tab_area;
    switch (strName) {
      // 가격차트, PNF, 삼선전환도
      case '_PRICE_':
      case '_PANDF_':
      case '_THREELINE_':
        $sub_tab_area = $(that.priceChartHtml(rChart, strKey));
        break;
        // 주가이동평균, 거래량 이동평균
      case '_MA_':
      case '_VMA_':
        $sub_tab_area = $(movingAverageHtml(rChart, strName, strKey));
        break;
        // 거래량
      case '_VOLUME_':
        $sub_tab_area = $(volumeHtml(rChart, strName, strKey));
        break;
      case '_MACDOS_':
        $sub_tab_area = $(oscillatorHtml(rChart, strName, strKey));
        break;
      default:
        $sub_tab_area = $(assistantEtcHtml(rChart, strName, strKey));
        break;
    }

    // 탭 /스크롤 UI 적용
    $sub_tab_area.tabs({
      create: function (event, ui) {
        that.ps = that.bindPerfectScroll(ui.panel, strName);
      },
      beforeActivate: function (event, ui) {
        if (that.ps !== null) {
          if(that.m_fScroll){
            that.ps.element.removeEventListener('ps-scroll-y', that.m_fScroll);
          }
          that.ps.destroy();
          that.ps = null;
        }
      },
      activate: function (event, ui) {
        that.ps = that.bindPerfectScroll(ui.newPanel, strName);
      }
    });

    // 임시: 가격 차트 일 경우 설명 탭 비활성화
    if (strName === '_PRICE_') {
      $sub_tab_area.tabs("disable", 1);
    }

    return $sub_tab_area;
  },
  // 가격차트 - 차트타입에 따른 화면 변경
  priceChartHtml: function (rChart, strKey) {
    //
    const rPropertyInfo = rChart.GetPropertyInfo(strKey);
    const nSubGraphSubType = rPropertyInfo.m_SubGraphPropertyInfoArray[0].m_nSubGraphSubType;
    switch (String(nSubGraphSubType)) {
      // 캔들
      case '0': return candleHtml(rChart, strKey);
      // 라인        
      case '1': return lineHtml(rChart, strKey);
      // 바
      case '2': return barHtml(rChart, strKey);
      // P&F
      case '3': return pnfHtml(rChart, strKey);
      // 삼선전환도
      case '4': return threeHtml(rChart, strKey);
      default: break;
    }
  },
  bindPerfectScroll: function ($panel, strName) {
    let target;
    switch ($panel.attr('id')) {
      // 변수 설정
      case 'sub_tab_cont1': {
        // 가격이평 일 경우 전체 선택을 제외한 리스트에 스크롤 적용
        if (strName === '_MA_' || strName === '_VMA_') {
          target = $('#average_cont_lst', $panel)[0];
        } else {
          target = $('.data_scr_lst', $panel)[0];
        }
        break;
      }
      // 스타일 설정
      case 'sub_tab_cont2': {
        target = $('.data_scr_lst', $panel)[0];
        break;
      }
      // 설명
      case 'sub_tab_cont4': {
        target = $('#desc_lst', $panel)[0];
        break;
      }
      default: {
        target = $panel[0];
        break;
      }
    }

    if (target) {
      return new PerfectScrollbar(target, {
        suppressScrollX: true
      });
    }
    return null;
  }
}