import baseHtml from '../../../../../html/mobile/setting/chart/three.html';
import { ChartSettingEvent } from '../../../event-handler';
import {
  getQuantityInput,
} from '../../../html-helper';

import { GetDataOfVariableArray, SetDataOfVariableArray } from '../../../../chart/kfitsChart.js';

// 차트유형 > 삼선전환도 설정창
export default (CMobileWebChart, Id) => {
  const PropertyInfo = CMobileWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceThreeLineBreakTypeInfo;
  const variableArray = PropertyInfo.m_VariableArray;
  console.log('SubGraphPropertyInfo', item);
  console.log('variableArray', variableArray);

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceThreeLineBreakTypeInfo = item;
    PropertyInfo.m_VariableArray = variableArray;
    CMobileWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CMobileWebChart.SetGlobalPropertyToChart();
  };

  const $baseHtml = $(baseHtml);

  let strBoxSize = GetDataOfVariableArray(variableArray, "BoxSize");
  $baseHtml    
    .find('#three-html-transform')
    .html(getQuantityInput(strBoxSize, undefined, false));

  $('.color_picker', $baseHtml).mobileSpectrumColorPicker({
    props: item,
    callback: function (id, val) {
      item[id] = val;
      applyChart();
    }
  });

  new ChartSettingEvent($baseHtml).quantity(function () {
    SetDataOfVariableArray(variableArray, "BoxSize", Number(this.value));    
    applyChart();
  });
  $baseHtml.localize();
  return $baseHtml;
};
