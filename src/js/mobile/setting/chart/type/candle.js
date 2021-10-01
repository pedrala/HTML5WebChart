import baseHtml from '../../../../../html/mobile/setting/chart/candle.html';
import { ChartSettingEvent } from '../../../event-handler';
import { getSelectButtonHtml } from '../../../html-helper';
import { PRICE_STEADY_TYPE_GROUPS } from '../../../../chart/kfitsChart';

// 차트유형 > 캔들 설정창
export default (CMobileWebChart, Id) => {
  const PropertyInfo = CMobileWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceCandleTypeInfo;
  console.log('SubGraphPropertyInfo', item);

  const $baseHtml = $(baseHtml);

  $baseHtml
    .find('#UpturnPlus')
    .find('.picker_disp')
    .css('background-color', item.m_clrUpturnPlus)
    .end()
    .find('input:checkbox')
    .prop('checked', item.m_bFillUpturnPlus)
    .end()
    .end()    
    .find('#DropPlus')
    .find('.picker_disp')
    .css('background-color', item.m_clrDropPlus)
    .end()
    .find('input:checkbox')
    .prop('checked', item.m_bFillDropPlus)
    .end()
    .end()
    .find('#UpturnMinus')
    .find('.picker_disp')
    .css('background-color', item.m_clrUpturnMinus)
    .end()
    .find('input:checkbox')
    .prop('checked', item.m_bFillUpturnMinus)
    .end()
    .end()
    .find('#DropMinus')
    .find('.picker_disp')
    .css('background-color', item.m_clrDropMinus)
    .end()
    .find('input:checkbox')
    .prop('checked', item.m_bFillDropMinus)
    .end()
    .end()
    .find('#m_bSteadyClrFollowToUpDropClr')
    .html(getSelectButtonHtml(item.m_bFillDropMinus, PRICE_STEADY_TYPE_GROUPS));

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceCandleTypeInfo = item;
    CMobileWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CMobileWebChart.SetGlobalPropertyToChart();
  };

  $baseHtml.on('change', ':checkbox', function () {
    const variable = $(this)
      .closest('span.check_rgt_bx')
      .attr('id');
    const variableName = `m_bFill${variable}`;
    item[variableName] = $(this).is(':checked');
    applyChart();
  });

  new ChartSettingEvent($baseHtml)
    .colorPicker(function (id, val) {
      const variable = $(this)
        .closest('span.check_rgt_bx')
        .attr('id');
      const variableName = `m_clr${variable}`;
      switch (variableName) {
        case 'm_clrUpturnPlus':
          item.SetClrUpturnPlus(val);
          break;        
        case 'm_clrDropPlus':
          item.SetClrDropPlus(val);
          break;
        case 'm_clrUpturnMinus':
          item.SetClrUpturnMinus(val);
          break;
        case 'm_clrDropMinus':
          item.SetClrDropMinus(val);
          break;
        default:
          break;
      }
      applyChart();
    })
    .select((id, val) => {
      item.m_bSteadyClrFollowToUpDropClr = JSON.parse(val);
      applyChart();
    });

  $baseHtml.localize();
  return $baseHtml;
};
