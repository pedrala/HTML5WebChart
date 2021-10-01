import baseHtml from '../../../../../../html/pc/setting/tabs/chart/main/candle.html';
import {
  PRICE_STEADY_TYPE_GROUPS
} from '../../../../../chart/kfitsChart';

// 차트유형 > 캔들 설정창
export default (rChart, strKey) => {
  const PropertyInfo = rChart.GetPropertyInfo(strKey, true);
  console.log('PropertyInfo', PropertyInfo);

  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceCandleTypeInfo;
  console.log('SubGraphPropertyInfo', item);

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceCandleTypeInfo = item;
    rChart.SetPropertyInfo(strKey, PropertyInfo, true);
    rChart.SetGlobalPropertyToChart();
  };

  const $baseHtml = $(baseHtml);

  $baseHtml
    .find('#UpturnPlus')    
    .find(':checkbox')
    .prop('checked', item.m_bFillUpturnPlus)
    .end()
    .end()    
    .find('#DropPlus')    
    .find(':checkbox')
    .prop('checked', item.m_bFillDropPlus)
    .end()
    .end()
    .find('#UpturnMinus')    
    .find(':checkbox')
    .prop('checked', item.m_bFillUpturnMinus)
    .end()
    .end()
    .find('#DropMinus')    
    .find(':checkbox')
    .prop('checked', item.m_bFillDropMinus)
    .end()
    .end();

  // 보합(시가=종가) 색상
  $('#m_bSteadyClrFollowToUpDropClr', $baseHtml).optsselectmenu({
    width: 155,
    props: item,
    opts: PRICE_STEADY_TYPE_GROUPS,
    callback: function (id, val) {
      item[id] = JSON.parse(val);
      applyChart();
    }
  });

  // 색상 변경    
  $('.color_picker', $baseHtml).spectrumColorPicker({
    props: item,
    classname: 'picker_select1',
    callback: ((id, val) => {
      switch (id) {
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
  });

  $baseHtml.on('change', ':checkbox', function () {
    const variable = $(this)
      .closest('li')
      .attr('id');
    const variableName = `m_bFill${variable}`;
    item[variableName] = $(this).is(':checked');
    applyChart();
  });

  $baseHtml.localize();
  return $baseHtml;
};
