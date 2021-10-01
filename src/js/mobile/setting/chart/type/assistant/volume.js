import baseHtml from '../../../../../../html/mobile/setting/chart/volume.html';

import { ChartSettingEvent } from '../../../../event-handler';
import {
  getLineTypeOptionHtml,
  getNThicknessOptionHtml,
  getSelectButtonHtml,
  getVisibleRadio,
} from '../../../../html-helper';
import { COMPARE_TYPE_GROUPS } from '../../../../../chart/kfitsChart';
import t from '../../../../../common/i18n';

export default (CMobileWebChart, Indicator, Id) => {
  const $baseHtml = $(baseHtml);

  const PropertyInfo = CMobileWebChart.GetPropertyInfo(Id);
  const SubGraphPropertyInfoArray = PropertyInfo.m_SubGraphPropertyInfoArray;
  console.log('PropertyInfo', PropertyInfo);

  const item = SubGraphPropertyInfoArray[0];

  function createHtml() {
    const acountRaidoHtml = [];
    [{ strText: 'chart.bar', nValue: 0 }, { strText: 'chart.line', nValue: 1 }].forEach(
      (obj) => {
        acountRaidoHtml.push(
          getVisibleRadio(
            Number(obj.nValue) === item.m_nSubGraphSubType,
            obj.strText,
            obj.nValue,
            'acount_rdo',
          ),
        );
      },
    );

    $baseHtml.find('#m_nSubGraphSubType')
      .html(acountRaidoHtml.join(''))
      .end()
      .find('#m_nCompareType')
      .html(
        getSelectButtonHtml(
          item.m_VolumeBarTypeInfo.m_nCompareType,
          COMPARE_TYPE_GROUPS,
        ),
      );

    if (item.m_nSubGraphSubType === 0) {
      $baseHtml
        .find('.bar')
        .show()
        .end()
        .find('.line')
        .hide();
    } else {
      const html = [];
      html.push('  <div class="lst_bx">');
      html.push(t('chart.'));
      html.push('    <div class="check_rgt_bx color_select_bx">');
      html.push('      <div class="line_select_bx line_height_bx">');
      html.push(getLineTypeOptionHtml(item.m_VolumeLineTypeInfo.m_nLineType));
      html.push('      </div>');
      html.push('      <div class="line_select_bx line_px_bx">');
      html.push(
        getNThicknessOptionHtml(item.m_VolumeLineTypeInfo.m_nThickness),
      );
      html.push('      </div>');
      html.push('      <input type="text" class="color_picker" name="m_clrLine">');
      html.push('    </div>');
      html.push('  </div>');
      $baseHtml.find('.line')
        .html(html.join(''))
        .show()
        .end()
        .find('.bar')
        .hide();      
    }

    $('.color_picker', $baseHtml).each(function () {
      const variableName = item.m_nSubGraphSubType === 0 ?
        'm_VolumeBarTypeInfo' :
        'm_VolumeLineTypeInfo';
      $(this).mobileSpectrumColorPicker({
        props: item[variableName],
        callback: function (id, val) {
          item[variableName][id] = val;
          applyChart();
        }
      });
    });
  }

  createHtml();

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0] = item;
    CMobileWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CMobileWebChart.SetGlobalPropertyToChart();
  };

  $baseHtml.on('change', 'input:radio', function () {
    item.m_nSubGraphSubType = Number($(this).val());
    // applyChart();
    createHtml();
  });

  function setColorPicker() {
    if (item.m_VolumeBarTypeInfo.m_nCompareType !== COMPARE_TYPE_GROUPS[6].nValue) {
      $('.color_picker', $baseHtml).spectrum('enable');      
    } else {
      $('.color_picker', $baseHtml).spectrum('disable');
    }
  }

  setColorPicker();

  new ChartSettingEvent($baseHtml).select((id, val) => {
    item.m_VolumeBarTypeInfo.m_nCompareType = Number(val);
    applyChart();
    setColorPicker();
  }).lineType(function (id, val) {
    const variableName = item.m_nSubGraphSubType === 0
      ? 'm_VolumeBarTypeInfo'
      : 'm_VolumeLineTypeInfo';
    if ($(this).hasClass('line_height_bx')) {
      item[variableName].m_nLineType = val;
    } else {
      item[variableName].m_nThickness = val;
    }
  });

  $baseHtml.localize();
  return $baseHtml;
};
