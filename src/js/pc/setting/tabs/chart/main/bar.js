import baseHtml from '../../../../../../html/pc/setting/tabs/chart/main/bar.html';
import {
  getVisibleCheckbox,
  getDescriptionHtml,
}
from '../../../../html-helper';
import {
  PRICE_STEADY_TYPE_GROUPS
} from '../../../../../chart/kfitsChart';
import t from '../../../../../common/i18n';

// 차트유형 > 바 설정창
export default (CWebChart, Id) => {
  const PropertyInfo = CWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceBarTypeInfo;
  console.log('SubGraphPropertyInfo', item);

  const $baseHtml = $(baseHtml);
  const $descLst = $baseHtml.find('#desc_lst');

  $baseHtml
    .find('#m_bUseHLCType')
    .html(getVisibleCheckbox(item.m_bUseHLCType, t('chart.barhighlowclose')))
    .end()
    .find('#m_bUseThinType')
    .html(getVisibleCheckbox(item.m_bUseThinType, t('chart.showthinbar')))
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
        case 'm_clrDropMinus':
          item.SetClrDropMinus(val);
          break;
        default:
          break;
      }
      applyChart();
    })
  });

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceBarTypeInfo = item;
    CWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CWebChart.SetGlobalPropertyToChart();
  };

  $baseHtml.on('change', 'input:checkbox', function () {
    const $self = $(this);
    const id = $self.closest('li').attr('id');
    item[id] = $self.is(':checked');
    applyChart();
  });

  // 설명
  //$descLst.html(getDescriptionHtml(SubType));

  $baseHtml.localize();
  return $baseHtml;
};
