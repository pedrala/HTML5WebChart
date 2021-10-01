import baseHtml from '../../../../../../html/mobile/setting/chart/etc.html';

import { ChartSettingEvent } from '../../../../event-handler';
import {
  getSubGraphPropertyInfoSubTypeOptionHtml,
  getLineTypeOptionHtml,
  getNThicknessOptionHtml,
  getQuantityInput,
  getSelectButtonHtml,
  getVisibleCheckbox,
} from '../../../../html-helper';
import { CBaseLine, PRICE_TYPE_GROUPS } from '../../../../../chart/kfitsChart';
import t from '../../../../../common/i18n';

export default (CMobileWebChart, Indicator, Id, Type, SubType) => {
  const $baseHtml = $(baseHtml);
  const PropertyInfo = CMobileWebChart.GetPropertyInfo(Id);
  const $variableLst = $baseHtml.find('#variable_lst');
  const $styleLst = $baseHtml.find('#style_lst');
  const $baselineLst = $baseHtml.find('#baseline_lst');
  const isRainBow = SubType === '_RAINBOW_';

  const VariableArray = PropertyInfo.m_VariableArray;
  const SubGraphPropertyInfoArray = PropertyInfo.m_SubGraphPropertyInfoArray;
  const BaseLineArray = PropertyInfo.m_BaseLineArray;

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray = SubGraphPropertyInfoArray;
    PropertyInfo.m_VariableArray = VariableArray;
    PropertyInfo.m_BaseLineArray = BaseLineArray;
    CMobileWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CMobileWebChart.SetGlobalPropertyToChart();
  };

  // 타이틀 변경
  $baseHtml.find('.modal_pop_tit').text(t(Indicator.m_strTitleLangKey));

  const variableHtml = [];
  const styleHtml = [];
  const baseLineHtml = [];

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
        } else if (item.m_strName === 'MAType') {
          variableHtml.push(
            `<td><div class="select_ui full_select">${getSubGraphPropertyInfoSubTypeOptionHtml(
              item.m_strData,
            )}</div></td>`,
          );
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

  // 색/굵기 설정
  // 그물차트 인 경우 스타일 설정 1개 row 로 변경
  const tmpArray = isRainBow
    ? [
      Object.assign(Object.assign({}, SubGraphPropertyInfoArray[0]), {
        m_strSubGraphName: t('common.all'),
      }),
    ]
    : SubGraphPropertyInfoArray;
  console.log('subGraphPropertyInfoArray', SubGraphPropertyInfoArray);
  if (SubGraphPropertyInfoArray.length) {
    const isChk = '_MACDOS_,_OSCV_'.indexOf(SubType) > -1;
    for (let i = 0, size = tmpArray.length; i < size; i++) {
      const item = tmpArray[i];
      if (isChk) {
        styleHtml.push('<li>');
        styleHtml.push('  <div class="lst_bx">');
        styleHtml.push(
          getVisibleCheckbox(item.m_bShow, 'Chaikins OSC<br />Signal'),
        );
        styleHtml.push('    <div class="check_rgt_bx color_select_bx">');

        styleHtml.push('    <input type="text" class="color_picker" name="m_clrLine">');
        styleHtml.push('    </div>');
        styleHtml.push('  </div>');
        styleHtml.push('</li>');
      } else {
        styleHtml.push('<li>');
        styleHtml.push('  <div class="lst_bx">');
        styleHtml.push(
          getVisibleCheckbox(item.m_bShow, item.m_strSubGraphName),
        );
        styleHtml.push('    <div class="check_rgt_bx color_select_bx">');
        styleHtml.push('      <div class="line_select_bx line_height_bx">');
        styleHtml.push(getLineTypeOptionHtml(item.m_LineTypeInfo.m_nLineType));
        styleHtml.push('      </div>');
        styleHtml.push('      <div class="line_select_bx line_px_bx">');
        styleHtml.push(
          getNThicknessOptionHtml(item.m_LineTypeInfo.m_nThickness),
        );
        styleHtml.push('      </div>');
        styleHtml.push('    <input type="text" class="color_picker" name="m_clrLine">');
        styleHtml.push('    </div>');
        styleHtml.push('  </div>');
        styleHtml.push('</li>');
      }
    }

    // 기준선 설정
    console.log('baseLineArray', BaseLineArray);
    if (BaseLineArray.length) {
      for (let i = 0, size = BaseLineArray.length; i < size; i++) {
        const item = BaseLineArray[i];
        baseLineHtml.push('<li>');
        baseLineHtml.push('  <div class="lst_bx">');
        baseLineHtml.push(getQuantityInput(item.m_dBaseValue));
        baseLineHtml.push(
          `<div class="check_rgt_bx ${!i ? 'plus' : 'minus'}">`,
        );
        baseLineHtml.push(
          '          <div class="line_select_bx line_height_bx">',
        );
        baseLineHtml.push(getLineTypeOptionHtml(item.m_nLineType));
        baseLineHtml.push('          </div>');
        baseLineHtml.push('          <div class="line_select_bx line_px_bx">');
        baseLineHtml.push(getNThicknessOptionHtml(item.m_nThickness));
        baseLineHtml.push('          </div>');
        baseLineHtml.push('    <input type="text" class="color_picker" name="m_clrLine">');
        if (!isRainBow) {
          baseLineHtml.push(
            '<a href="#" class="btn_rgt"><span class="blind"></span></a>',
          );
        }
        baseLineHtml.push('  </div>');
        baseLineHtml.push('</li>');
      }
    }

    if (styleHtml.length) {
      $styleLst.show().find('.candel_change_lst').html(styleHtml.join(''));

      $('.color_picker', $styleLst).each(function (index) {
        $(this).mobileSpectrumColorPicker({
          props: tmpArray[index].m_LineTypeInfo,
          param: index,
          callback: function (id, val, idx) {
            if (isRainBow) {
              for (let i = 0, size = SubGraphPropertyInfoArray.length; i < size; i++) {
                SubGraphPropertyInfoArray[i].m_LineTypeInfo[id] = val;
              }
            } else {
              SubGraphPropertyInfoArray[idx].m_LineTypeInfo[id] = val;
            }
            applyChart();
          }
        });
      });
    
      new ChartSettingEvent($styleLst).lineType(function (id, val) {
        const idx = $(this).closest('li').index();
        const key = $(this).hasClass('line_height_bx') ? 'm_nLineType' : 'm_nThickness'
        if (isRainBow) {
          for (
            let i = 0, size = SubGraphPropertyInfoArray.length;
            i < size;
            i++
          ) {
            SubGraphPropertyInfoArray[i].m_LineTypeInfo[key] = Number(val);
          }
        } else {
          SubGraphPropertyInfoArray[idx].m_LineTypeInfo[key] = Number(val);
        }
        applyChart();
      });
    }
    if (baseLineHtml.length) {
      $baselineLst.show()
        .find('.candel_change_lst')
        .html(baseLineHtml.join(''));

      $('.color_picker', $baselineLst).each(function (idx) {
        $(this).mobileSpectrumColorPicker({
          props: BaseLineArray[idx],
          callback: function (id, val) {
            BaseLineArray[idx][id] = val;
            applyChart();
          }
        });
      });

      new ChartSettingEvent($baselineLst).quantity(function () {
        const idx = $(this).closest('li').index();
        BaseLineArray[idx].m_dBaseValue = parseFloat($(this).val());
        applyChart();
      }).lineType(function (id, val) {
        const idx = $(this).closest('li').index();
        const $self = $(this);
        if ($self.hasClass('line_height_bx')) {
          BaseLineArray[idx].m_nLineType = Number(val);
        } else {
          BaseLineArray[idx].m_nThickness = Number(val);
        }
        applyChart();
      });

      $baselineLst.on('click', '.check_rgt_bx .btn_rgt', function (e) {
        e.preventDefault();
        const $selectedLi = $(this).closest('li');
        const $checkRgtBx = $selectedLi.find('.check_rgt_bx');
        if ($checkRgtBx.hasClass('plus')) {
          const baseLine = new CBaseLine();
          baseLine.m_dBaseValue = 0;
          BaseLineArray.push(baseLine);
          const $selectedClone = $selectedLi.parent().find('li:last').clone();
          const copyHtml = $selectedClone[0].outerHTML;
          $(copyHtml)
            .find('input.cout_input').val(baseLine.m_dBaseValue)
            .end()
            .find('.check_rgt_bx')
            .removeClass('plus')
            .addClass('minus')
            .end()
            .appendTo($selectedLi.parent());
        } else {
          $selectedLi.remove();
          BaseLineArray.splice($selectedLi.index(), 1);
        }
        applyChart();
      });
    }
  }
  $baseHtml.localize();
  return $baseHtml;
};
