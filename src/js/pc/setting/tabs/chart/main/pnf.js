import baseHtml from '../../../../../../html/pc/setting/tabs/chart/main/pnf.html';
import {
  ChartSettingEvent
} from '../../../../event-handler';
import {
  getQuantityInput
} from '../../../../html-helper';

import { GetDataOfVariableArray, SetDataOfVariableArray } from '../../../../../chart/kfitsChart.js';

// 차트유형 > P&F 설정창
export default (CWebChart, Id) => {
  const PropertyInfo = CWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PricePAndFTypeInfo;
  const variableArray = PropertyInfo.m_VariableArray;
  console.log('SubGraphPropertyInfo', item);
  console.log('variableArray', variableArray);

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PricePAndFTypeInfo = item;
    PropertyInfo.m_VariableArray = variableArray;

    CWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CWebChart.SetGlobalPropertyToChart();
  };

  const $baseHtml = $(baseHtml);
  $baseHtml
    .find('#pnf-transform')
    .html(getQuantityInput(GetDataOfVariableArray(variableArray, 'BoxSize'), undefined, false))
    .end()
    .find('#pnf-size')
    .html(getQuantityInput(GetDataOfVariableArray(variableArray, 'UnitSize'), undefined, false));

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
    const val = Number($(this).val());
    switch ($(this).closest('.select_rgt_bx').attr('id')) {
      case 'pnf-transform':
        SetDataOfVariableArray(variableArray, 'BoxSize', val);
        break;
      case 'pnf-size':
        SetDataOfVariableArray(variableArray, 'UnitSize', val);
        SetDataOfVariableArray(variableArray, 'bUserInput', 1);        
        break;
      default:
        break;
    }

    applyChart();
  });

  $baseHtml.localize();
  return $baseHtml;
};
