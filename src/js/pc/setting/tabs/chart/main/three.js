import baseHtml from '../../../../../../html/pc/setting/tabs/chart/main/three.html';
import {
  ChartSettingEvent
} from '../../../../event-handler';
import {
  getQuantityInput
} from '../../../../html-helper';

import { GetDataOfVariableArray, SetDataOfVariableArray } from '../../../../../chart/kfitsChart.js';

// 차트유형 > 삼선전환도 설정창
export default (CWebChart, Id) => {
  const PropertyInfo = CWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceThreeLineBreakTypeInfo;
  const variableArray = PropertyInfo.m_VariableArray;
  console.log('SubGraphPropertyInfo', item);
  console.log('variableArray', variableArray);

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceThreeLineBreakTypeInfo = item;
    PropertyInfo.m_VariableArray = variableArray;

    CWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CWebChart.SetGlobalPropertyToChart();
  };

  const $baseHtml = $(baseHtml);
  $baseHtml
    .find('#three-transform')
    .html(getQuantityInput(GetDataOfVariableArray(variableArray,'BoxSize'), undefined, false));

  // 색상 변경    
  $('.color_picker', $baseHtml).spectrumColorPicker({
    props: item,
    classname: 'picker_select1',
    callback: ((id, val) => {
      item[id] = val;
      applyChart();
    })
  });

  new ChartSettingEvent($baseHtml).quantity(function () {
    SetDataOfVariableArray(variableArray, 'BoxSize', Number(this.value));    
    applyChart();
  });

  $baseHtml.localize();
  return $baseHtml;
};
