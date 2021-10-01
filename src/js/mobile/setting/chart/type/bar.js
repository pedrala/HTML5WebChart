import baseHtml from '../../../../../html/mobile/setting/chart/bar.html';
import { ChartSettingEvent } from '../../../event-handler';
import {
  getSelectButtonHtml,
  getVisibleCheckbox,
} from '../../../html-helper';
import { PRICE_STEADY_TYPE_GROUPS } from '../../../../chart/kfitsChart';
import t from '../../../../common/i18n';

// 차트유형 > 바 설정창
export default (CMobileWebChart, Id) => {
  const PropertyInfo = CMobileWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceBarTypeInfo;
  console.log('SubGraphPropertyInfo', item);

  const $baseHtml = $(baseHtml);

  $baseHtml    
    .find('#m_bUseHLCType')
    .html(getVisibleCheckbox(item.m_bUseHLCType, t('chart.barhighlowclose')))
    .end()
    .find('#m_bUseThinType')
    .html(getVisibleCheckbox(item.m_bUseThinType, t('chart.showthinbar')))
    .end()
    .find('#m_bSteadyClrFollowToUpDropClr')
    .html(
      getSelectButtonHtml(
        item.m_bSteadyClrFollowToUpDropClr,
        PRICE_STEADY_TYPE_GROUPS,
      ),
    );

  $('.color_picker', $baseHtml).mobileSpectrumColorPicker({
    props: item,
    callback: function (id, val) {
      switch (id) {
        case 'm_clrUpturnPlus':
          item.SetClrUpturnPlus(val);
          break;
        case 'm_clrDropMinus':
          item.SetClrDropMinus(val);
          break;
        default:
          break;
      }
      applyChart();
    }
  });

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceBarTypeInfo = item;
    CMobileWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CMobileWebChart.SetGlobalPropertyToChart();
  };

  $baseHtml.on('change', 'input:checkbox', function () {
    const $self = $(this);
    const id = $self.closest('li').attr('id');
    item[id] = $self.is(':checked');
    applyChart();
  });

  new ChartSettingEvent($baseHtml)
    .select((id, val) => {
      item.m_bSteadyClrFollowToUpDropClr = JSON.parse(val);
      applyChart();
    });

  $baseHtml.localize();
  return $baseHtml;
};
