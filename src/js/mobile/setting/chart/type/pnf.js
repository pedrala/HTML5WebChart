import baseHtml from '../../../../../html/mobile/setting/chart/pnf.html';
import { ChartSettingEvent } from '../../../event-handler';
import {
  getQuantityInput,
} from '../../../html-helper';

import { GetDataOfVariableArray, SetDataOfVariableArray } from '../../../../chart/kfitsChart.js';

// 차트유형 > P&F 설정창
export default (CMobileWebChart, Id) => {
  const PropertyInfo = CMobileWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PricePAndFTypeInfo;
  const variableArray = PropertyInfo.m_VariableArray;
  console.log('SubGraphPropertyInfo', item);
  console.log('variableArray', variableArray);

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PricePAndFTypeInfo = item;
    PropertyInfo.m_VariableArray = variableArray;
    CMobileWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CMobileWebChart.SetGlobalPropertyToChart();
  };

  const $baseHtml = $(baseHtml);
    
  let strBoxSize =  GetDataOfVariableArray(variableArray, "BoxSize");
  let strUnitSize = GetDataOfVariableArray(variableArray, "UnitSize");    
  
  $baseHtml    
    .find('#pnf-html-transform')
    .html(getQuantityInput(strBoxSize, undefined, false))
    .end()
    .find('#pnf-html-size')
    .html(getQuantityInput(strUnitSize, undefined, false));

  $('.color_picker', $baseHtml).mobileSpectrumColorPicker({
    props: item,
    callback: function (id, val) {
      item[id] = val;
      applyChart();
    }
  });

  new ChartSettingEvent($baseHtml).quantity(function () {
    const val = Number($(this).val());
    switch ($(this).closest('.check_rgt_bx').attr('id')) {
      case 'pnf-html-transform':
        SetDataOfVariableArray(variableArray, "BoxSize", val);        
        break;
      case 'pnf-html-size':
        SetDataOfVariableArray(variableArray, "UnitSize", val);
        SetDataOfVariableArray(variableArray, "bUserInput", 1);
        break;
      default:
        break;
    }
    applyChart();
  });

  $baseHtml.localize();
  return $baseHtml;
};
