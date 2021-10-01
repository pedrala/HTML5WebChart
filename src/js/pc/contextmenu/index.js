import baseHtml from '../../../html/pc/contextmenu/index.html'
import {
  TOOL_TYPE
} from '../../chart/kfitsChart';
import t from '../../common/i18n';
import utils from '../../common/utils';
import PerfectScrollbar from 'perfect-scrollbar'
import xlsx from 'xlsx'

export default (rChart, nClientX, nClientY, nMenuX, nMenuY) => {  

  let rChartBlock = rChart.GetChartBlockByXY(nMenuX, nMenuY);
  if (rChartBlock.IsEmpty())
    return null;

  const $baseHtml = $(baseHtml);
  const $chart_contextmenu = $('.chart_contextmenu', $baseHtml);

  // 표시되어 있는 차트 유형의 property 얻기
  const strRQ = rChart.GetSelectedRQ(),
    isSpecialChartType = rChart.IsSpecialChartType();
  const strIndiKey = isSpecialChartType ? rChart.GetSpecialIndicatorKey() : rChart.GetPriceIndicatorKey(strRQ);

  // 특수 차트 적용시 사용불가메뉴 disabled
  $('> :not(li.use-all)', $chart_contextmenu).toggleClass('ui-state-disabled', isSpecialChartType)

  // 지표 넣기
  $('#chart_indicator', $chart_contextmenu).append(() => {
    const indicators = utils.getIndicators();

    // 표시되어 있는 모든 지표의 property 얻기
    const strNames = rChart.GetIndicatorPropertyInfo().m_strNames;

    const $parent = $('<ul></ul>');    
    indicators
    // parent 추출 (중복제거)
    .reduce((result, {parent}) => {
      if (result.indexOf(parent) < 0) result.push(parent);
      return result;
    }, [])
    // depth 생성
    .forEach((d) => {
      let $parentLi = $('<li><div>' + d + '</div></li>');
      $parentLi.data('noaction', true);

      let $children = $('<ul></ul>');
      indicators
      .filter(({parent}) => {
        return d === parent;
      })
      .forEach(({label, name}) => {
        $('<li></li>')
        .html('<div>' + label + '</div>')
        .data({
          rootId: 'chart_indicator',
          name: name
        })
        .toggleClass('active', strNames[name] !== undefined)
        .appendTo($children);
      });

      // perfect-scrollbar 적용을 위한 클래스
      if ($('li', $children).length > 10) {
        $children.addClass('ps-use');
      }

      $parentLi.append($children).appendTo($parent);
    });

    return $parent;
  });

  // 선 넣기
  $('#chart_linetool', $chart_contextmenu).append(() => {
    const $ul = $('<ul></ul>');
    utils.getTools()
    .forEach(({text, name}) => {
      $('<li></li>')
        .html('<div>' + text + '</div>')
        .data({
          rootId: 'chart_linetool',
          name: name
        })
        .appendTo($ul);
    });

    // perfect-scrollbar 적용을 위한 클래스
    if ($('li', $ul).length > 10) {
      $ul.addClass('ps-use');
    }

    return $ul;
  });

  // 차트유형
  $('#chart_type', $chart_contextmenu).append(() => {

    const IndiProperty = rChart.GetPropertyInfo(strIndiKey);
    const nSubType = IndiProperty ? IndiProperty.m_SubGraphPropertyInfoArray[0].m_nSubGraphSubType : null;
    
    const $ul = $('<ul></ul>');
    utils.getChartTypeList()
    .forEach(({strText, nValue}) => {
      $('<li></li>')
      .html('<div>' + t(strText) + '</div>')
      .data({
        rootId: 'chart_type',
        name: nValue
      })
      .toggleClass('active', nSubType === nValue)
      .appendTo($ul);
    });    

    return $ul;
  });

  // 메뉴 생성  
  $chart_contextmenu.contextmenu({
    icons: {
      submenu: "ui-icon-blank"
    },
    create: function() {
      $(this)
      // 테마 변경
      .addClass(rChart.m_strThemeName)
      // 위치 조정
      .css({
        left: nClientX,
        top: nClientY,
      });

      // perfect-scrollbar ui 적용
      $('.ps-use', this).each((i, element) => {
        new PerfectScrollbar(element, {
          suppressScrollX: true
        });
      });

      // 20190122 이문수 log 차트 기능추가 >>
      $('#btn_convert_log', this).toggleClass('active', rChart.GetLogYScaleByXY(nMenuX, nMenuY) !== null);
      // 20190122 이문수 log 차트 기능추가 <<

      // 20190123 이문수 Invert 차트 기능추가 >>
      $('#btn_chart_reverse', this).toggleClass('active', rChart.GetInvertYScaleByXY(nMenuX, nMenuY) !== null);
      // 20190123 이문수 Invert 차트 기능추가 <<

      // 하단메뉴 확장여부 체크
      $('#btn_bottom_extend', this).toggleClass('active', rChart.m_GlobalProperty.IsVisibleBottomArea());      

      // 국제화 적용
      $baseHtml.localize();
    },
    select: function (event, ui) {
      if (ui.item.data('noaction')) {
        return;
      }
      const selectedId = ui.item.attr('id') || ui.item.data('rootId');
      switch (selectedId) {
        case 'chart_indicator': {
          const type = ui.item.data('name');
          // 표시되어 있는 모든 지표의 property 얻기
          const strNames = rChart.GetIndicatorPropertyInfo().m_strNames;
          if (strNames[type] !== undefined) {
            rChart.SimpleDeleteIndicator(type, true);
          } else {
            rChart.SimpleAddIndicator(type, true);
          }
          break;
        }
        case 'chart_linetool': {
          if (rChart) {
            const type = ui.item.data('name');
            rChart.AddTool(TOOL_TYPE[type]);
          }
          break;
        }
        // 차트 유형
        case 'chart_type': {
          const hasClass = ui.item.hasClass('active');
          if (!hasClass) {
            ui.item.addClass('active').siblings().removeClass('active');
           
            let IndiProperty = rChart.GetPropertyInfo(strIndiKey);
            IndiProperty.m_SubGraphPropertyInfoArray[0].m_nSubGraphSubType = ui.item.data('name'); //타입변경
            rChart.SetPropertyInfo(strIndiKey, IndiProperty);
            rChart.SetGlobalPropertyToChart();
          }
          break;
        }
        // 차트 log 변환
        case 'btn_convert_log': {
          const hasClass = ui.item.toggleClass('active').hasClass('active');
          rChart.SetLogYScaleByXY(nMenuX, nMenuY, hasClass); //
          break;  
        }
        // 차트 뒤집기
        case 'btn_chart_reverse': {          
          const hasClass = ui.item.toggleClass('active').hasClass('active');
          rChart.SetInvertYScaleByXY(nMenuX, nMenuY, hasClass); //
          break;
        }
        // 깊이차트 전환
        case 'btn_high_chart': {
          rChart.SendEvent('Event_ChangeDepthChart');
          break;
        }
        // 하단메뉴 확장
        case 'btn_bottom_extend': {
          const hasClass = ui.item.toggleClass('active').hasClass('active');
          rChart.SendEvent('Event_ExtendBottomArea', hasClass);
          break;
        }
        // 초기화
        case 'btn_reset': {
          rChart.Confirm(t('chart.resetmessage'), function () {
            rChart.SendEvent('Event_ResetChart')
          });
          break;
        }
        // 지표만제거
        case 'btn_del_only_indicator': {
          // 그려져 있는 지표
          let rStrNames = rChart.GetIndicatorPropertyInfo().m_strNames;

          // 지표넣기 : 저장값 셋팅
          $('.ui-menu-item.active', '#chart_indicator').each((i, element) => {
            const key = $(element).data('name');
            let m_strKeys = rStrNames[key];
            for (let i in m_strKeys) {
              rChart.SettingDeleteIndicator(m_strKeys[i]);
              $(element).removeClass('active');
            }
          });
          break;
        }
        // 드로잉 툴만 제거
        case 'btn_only_drawing': {
          rChart.RemoveAllTool();
          break;
        }
        // 환경설정
        case 'btn_setting': {
          rChart.ShowModalSetting();
          break;
        }
        // 엑셀 다운로드
        case 'btn_excel': {
          const wb = xlsx.utils.book_new();

          // data
          let rExcelDataInfo = rChart.GetChartDataInExcelFormat();
          if (rExcelDataInfo) {
            const ws = xlsx.utils.json_to_sheet(rExcelDataInfo.m_ExcelDataArray, {
              skipHeader: true
            });
            // sheet
            xlsx.utils.book_append_sheet(wb, ws, rExcelDataInfo.m_strSheetName);
            xlsx.writeFile(wb, rExcelDataInfo.m_strFileName);
          }
          break;
        }
        default : break;
      }

      $('#context_menu', 'body').remove();
    }
  });

  return $baseHtml;
} 