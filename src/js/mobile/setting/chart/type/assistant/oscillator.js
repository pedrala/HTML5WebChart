import baseHtml from '../../../../../../html/mobile/setting/chart/oscillator.html';

import { ChartSettingEvent } from '../../../../event-handler';
import {
  getLineTypeOptionHtml,
  getNThicknessOptionHtml,
  getQuantityInput,
  getSelectButtonHtml,
  getVisibleRadio,
} from '../../../../html-helper';
import {
  COMPARE_TYPE_GROUPS,
  PRICE_TYPE_GROUPS,
} from '../../../../../chart/kfitsChart';
import t from '../../../../../common/i18n';

export default (CMobileWebChart, Indicator, Id) => {
  const $baseHtml = $(baseHtml);
  const PropertyInfo = CMobileWebChart.GetPropertyInfo(Id);
  const $variableLst = $baseHtml.find('#variable_lst');
  const $styleLst = $baseHtml.find('#style_lst');

  const VariableArray = PropertyInfo.m_VariableArray;
  const SubGraphPropertyInfo = PropertyInfo.m_SubGraphPropertyInfoArray[0];
  const BaseLineArray = PropertyInfo.m_BaseLineArray;

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0] = SubGraphPropertyInfo;
    PropertyInfo.m_VariableArray = VariableArray;
    PropertyInfo.m_BaseLineArray = BaseLineArray;
    CMobileWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CMobileWebChart.SetGlobalPropertyToChart();
  };

  // 타이틀 변경
  $baseHtml.find('.modal_pop_tit').text(t(Indicator.m_strTitleLangKey));

  const variableHtml = [];

  // 변수 설정
  console.log('variableArray', VariableArray);
  if (VariableArray.length) {
    for (let i = 0, size = VariableArray.length; i < size; i++) {
      const item = VariableArray[i];
      const key = item.m_strName;
      if (!key.startsWith('View')) {
        let data = item.m_strData;
        let pattern;
        if (key === 'SDMNum') {
          // 표준편차승수, 상승율(%), 하락율(%)
          data += '.00';
          pattern = '[0-9]+([\\.][0-9]+)';
        }
        variableHtml.push('<li>');
        variableHtml.push('  <div class="lst_bx">');
        variableHtml.push(
          `    <strong class="tit">${item.m_title || item.m_strName}</strong>`,
        );
        variableHtml.push('    <div class="check_rgt_bx">');
        if (item.m_strName === 'DType') {
          variableHtml.push(`<div class="select_ui full_select">${
            getSelectButtonHtml(item.m_strData, PRICE_TYPE_GROUPS)
          }</div>`);
        } else {
          variableHtml.push(getQuantityInput(data, pattern));
        }
        variableHtml.push('    </div>');
        variableHtml.push('  </div>');
        variableHtml.push('</li>');
      }
    }

    $variableLst.html(variableHtml.join(''));

    new ChartSettingEvent($variableLst).select(function (id, val) {
      const idx = $(this).closest('li').index();
      VariableArray[idx].m_strData = Number(val);
      applyChart();
    }).quantity(function () {
      const idx = $(this).closest('li').index();
      VariableArray[idx].m_strData = Number($(this).val());
      applyChart();
    });
  } else {
    $variableLst.hide();
  }

  console.log('SubGraphPropertyInfo', SubGraphPropertyInfo);
  function createHtml() {
    const acountRaidoHtml = [];
    [{ strText: 'chart.line', nValue: '0' }, { strText: 'chart.bar', nValue: '1' }].forEach(
      (obj) => {
        acountRaidoHtml.push(
          getVisibleRadio(
            Number(obj.nValue) === SubGraphPropertyInfo.m_nSubGraphSubType,
            obj.strText,
            obj.nValue,
            'acount_rdo',
          ),
        );
      },
    );
    $styleLst
      .find('#m_nSubGraphSubType')
      .html(acountRaidoHtml.join(''))
      .end()
      .find('#m_nCompareType')
      .html(
        getSelectButtonHtml(
          SubGraphPropertyInfo.m_BarTypeInfo.m_nCompareType,
          COMPARE_TYPE_GROUPS,
        ),
      );
    if (SubGraphPropertyInfo.m_nSubGraphSubType === 1) {
      $styleLst
        .find('.bar')
        .show()
        .end()
        .find('.line')
        .hide();
    } else {
      const html = [];
      html.push('  <div class="lst_bx">');
      html.push('거래량');
      html.push('    <div class="check_rgt_bx color_select_bx">');
      html.push('      <div class="line_select_bx line_height_bx">');
      html.push(getLineTypeOptionHtml(SubGraphPropertyInfo.m_LineTypeInfo.m_nLineType));
      html.push('      </div>');
      html.push('      <div class="line_select_bx line_px_bx">');
      html.push(
        getNThicknessOptionHtml(SubGraphPropertyInfo.m_LineTypeInfo.m_nThickness),
      );
      html.push('      </div>');
      html.push('      <input type="text" class="color_picker" name="m_clrLine">');
      html.push('    </div>');
      html.push('  </div>');
      $styleLst
        .find('.line')
        .html(html.join(''))
        .show()
        .end()
        .find('.bar')
        .hide();
    }

    $('.color_picker', $baseHtml).each(function () {
      const variableName = SubGraphPropertyInfo.m_nSubGraphSubType === 1 ?
        'm_BarTypeInfo' :
        'm_LineTypeInfo';
      $(this).mobileSpectrumColorPicker({
        props: SubGraphPropertyInfo[variableName],
        callback: function (id, val) {
          SubGraphPropertyInfo[variableName][id] = val;
          applyChart();
        }
      });
    });
  }
  createHtml();

  $styleLst.on('change', 'input:radio', function () {
    SubGraphPropertyInfo.m_nSubGraphSubType = Number($(this).val());
    // applyChart();
    createHtml();
  });

  new ChartSettingEvent($styleLst)
    .select((id, val) => {
      const variableName = SubGraphPropertyInfo.m_nSubGraphSubType === 1
        ? 'm_BarTypeInfo'
        : 'm_LineTypeInfo';
      SubGraphPropertyInfo[variableName].m_nCompareType = val;
      applyChart();
    }).lineType(function (id, val) {
      const variableName = SubGraphPropertyInfo.m_nSubGraphSubType === 1
        ? 'm_BarTypeInfo'
        : 'm_LineTypeInfo';
      if ($(this).hasClass('line_height_bx')) {
        SubGraphPropertyInfo[variableName].m_nLineType = val;
      } else {
        SubGraphPropertyInfo[variableName].m_nThickness = val;
      }
    });

  $baseHtml.localize();
  return $baseHtml;
};
