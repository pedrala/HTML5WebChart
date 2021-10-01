import baseHtml from '../../../../../html/mobile/setting/chart/line.html';
import { ChartSettingEvent } from '../../../event-handler';
import {
  getLineTypeOptionHtml,
  getNThicknessOptionHtml,
  getSubGraphPropertyInfoTypeOptionHtml,
} from '../../../html-helper';

// 차트유형 > 라인 설정창
export default (CMobileWebChart, Id) => {
  const PropertyInfo = CMobileWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceLineTypeInfo;
  console.log('SubGraphPropertyInfo', item);

  const $baseHtml = $(baseHtml);

  $baseHtml
    .find('#lineBase')
    .html(getSubGraphPropertyInfoTypeOptionHtml(item.m_DType))
    .end()
    .find('#lineType')
    .html(getLineTypeOptionHtml(item.m_nLineType))
    .end()
    .find('#nThickness')
    .html(getNThicknessOptionHtml(item.m_nThickness));

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceLineTypeInfo = item;
    CMobileWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CMobileWebChart.SetGlobalPropertyToChart();
  };

  $('.color_picker', $baseHtml).mobileSpectrumColorPicker({
    props: item,
    callback: function (id, val) {
      item[id] = val;
      applyChart();
    }
  });

  new ChartSettingEvent($baseHtml)
    .select(function (id, val) {
      if ($(this).hasClass('line_height_bx')) {
        item.m_nLineType = val;
      } else {
        item.m_nThickness = val;
      }
      applyChart();
    });

  $baseHtml.localize();
  return $baseHtml;
};
