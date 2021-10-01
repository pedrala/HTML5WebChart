import baseHtml from '../../../../../../html/mobile/setting/chart/etc.html';

import { ChartSettingEvent } from '../../../../event-handler';
import {
  getLineTypeOptionHtml,
  getNThicknessOptionHtml,
  getQuantityInput,
  getSubGraphPropertyInfoSubTypeOptionHtml,
  getSubGraphPropertyInfoTypeOptionHtml,
  getVisibleCheckbox,
} from '../../../../html-helper';

import t from '../../../../../common/i18n';

export default (CMobileWebChart, Indicator, Id) => {
  const PropertyInfo = CMobileWebChart.GetPropertyInfo(Id);
  const $baseHtml = $(baseHtml);
  const $variableLst = $baseHtml.find('#variable_lst');

  console.log('PropertyInfo', PropertyInfo);

  // 타이틀 변경
  $baseHtml.find('.modal_pop_tit').text(t(Indicator.m_strTitleLangKey));

  const variableHtml = [];
  const MAPropertyInfoArray = PropertyInfo.m_MAPropertyInfoArray;

  for (let i = 0, size = MAPropertyInfoArray.length; i < size; i++) {
    const item = MAPropertyInfoArray[i].m_MASubGraphPropertyInfo;

    variableHtml.push('<li>');
    variableHtml.push('  <div class="lst_bx">');
    variableHtml.push('    <div class="average_type01">');
    variableHtml.push(getVisibleCheckbox(item.m_bShow));
    variableHtml.push('      <div class="average_form">');
    variableHtml.push('        <div class="check_lft_bx">');
    variableHtml.push(getQuantityInput(item.m_strSubGraphTitle));
    variableHtml.push('        </div>');
    variableHtml.push('        <div class="check_rgt_bx color_select_bx">');
    variableHtml.push('          <div class="line_select_bx line_height_bx">');
    variableHtml.push(getLineTypeOptionHtml(item.m_LineTypeInfo.m_nLineType));
    variableHtml.push('          </div>');
    variableHtml.push('          <div class="line_select_bx line_px_bx">');
    variableHtml.push(
      getNThicknessOptionHtml(item.m_LineTypeInfo.m_nThickness),
    );
    variableHtml.push('          </div>');
    variableHtml.push('<input type="text" class="color_picker" name="m_clrLine">');
    variableHtml.push('        </div>');
    variableHtml.push('      </div>');
    variableHtml.push('      <div class="average_form">');
    variableHtml.push('        <div class="check_lft_bx">');
    variableHtml.push('          <div class="select_ui">');
    variableHtml.push(
      getSubGraphPropertyInfoTypeOptionHtml(MAPropertyInfoArray[i].m_nInputPacketDataType),
    );
    variableHtml.push('          </div>');
    variableHtml.push('        </div>');
    variableHtml.push('        <div class="check_rgt_bx">');
    variableHtml.push('          <div class="select_ui sub-type">');
    variableHtml.push(
      getSubGraphPropertyInfoSubTypeOptionHtml(MAPropertyInfoArray[i].m_nMAType),
    );
    variableHtml.push('          </div>');
    variableHtml.push('        </div>');
    variableHtml.push('      </div>');
    variableHtml.push('    </div>');
    variableHtml.push('  </div>');
    variableHtml.push('</li>');
  }
  $variableLst.html(variableHtml.join(''));

  const applyChart = () => {
    PropertyInfo.m_MAPropertyInfoArray = MAPropertyInfoArray;
    CMobileWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CMobileWebChart.SetGlobalPropertyToChart();
  };

  $('.color_picker', $variableLst).each(function (idx) {
    $(this).mobileSpectrumColorPicker({
      props: MAPropertyInfoArray[idx].m_MASubGraphPropertyInfo.m_LineTypeInfo,
      callback: function (id, val) {
        MAPropertyInfoArray[idx].m_MASubGraphPropertyInfo.m_LineTypeInfo[id] = val;        
        applyChart();
      }
    });
  });

  new ChartSettingEvent($baseHtml)
    .lineType(function (id, val) {
      const idx = $(this)
        .closest('li')
        .index();
      if ($(this).hasClass('line_height_bx')) {
        MAPropertyInfoArray[
          idx
        ].m_MASubGraphPropertyInfo.m_LineTypeInfo.m_nLineType = val;
      } else {
        MAPropertyInfoArray[
          idx
        ].m_MASubGraphPropertyInfo.m_LineTypeInfo.m_nThickness = val;
      }
      applyChart();
    })
    .quantity(function () {
      const idx = $(this)
        .closest('li')
        .index();
      MAPropertyInfoArray[idx].m_MASubGraphPropertyInfo.m_strSubGraphTitle = $(
        this,
      ).val();
      applyChart();
    })
    .select(function (id, val) {
      const idx = $(this)
        .closest('li')
        .index();
      if ($(this).hasClass('sub-type')) {
        MAPropertyInfoArray[idx].m_nMAType = Number(val);
      } else {
        MAPropertyInfoArray[idx].m_nInputPacketDataType = Number(val);
      }
      applyChart();
    });

  $baseHtml.localize();
  return $baseHtml;
};
