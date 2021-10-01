import baseHtml from '../../../../../../html/pc/setting/tabs/chart/sub/volume.html';
import {
  getDescriptionHtml,
  getVisibleRadio,
} from '../../../../html-helper';
import { COMPARE_TYPE_GROUPS } from '../../../../../chart/kfitsChart';
import t from '../../../../../common/i18n';

// 보조지표 > 거래량
export default (CWebChart, SubType, Id) => {
  const PropertyInfo = CWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const $baseHtml = $(baseHtml);
  const $descLst = $baseHtml.find('#desc_lst');
  const $acountTabBx = $baseHtml.find('#acount_tab_bx');
  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0];

  // 막대/선
  $acountTabBx.find('.acount_rdo_lst').html(function () {
    const acountRaidoHtml = [];
    [{ strText: 'chart.bar', nValue: 0 }, { strText: 'chart.line', nValue: 1 }].forEach(
      (obj) => {
        acountRaidoHtml.push(
          `<li>${getVisibleRadio(
            obj.nValue === item.m_nSubGraphSubType,
            t(obj.strText),
            obj.nValue,
            null,
            'acount_rdo',
          )}</li>`,
        );
      },
    );

    return acountRaidoHtml.join('');
  })
  // 모바일 UI 와 맞지 않아 잠시 숨김
  .hide();

  function createHtml() {
    
    const variableName = item.m_nSubGraphSubType === 0 ?
      'm_VolumeBarTypeInfo' :
      'm_VolumeLineTypeInfo';

    // 색상 변경    
    $('.color_picker', $acountTabBx).spectrumColorPicker({
      props: item[variableName],
      callback: ((id, val) => {
        item[variableName][id] = val;
        applyChart();
      })
    });

    // 비교대상
    $('#compare_lst', $acountTabBx).optsselectmenu({
      width: 112,
      props: item.m_VolumeBarTypeInfo,
      opts: COMPARE_TYPE_GROUPS,
      callback: function (id, val) {
        const variableName = item.m_nSubGraphSubType === 0 ?
          'm_VolumeBarTypeInfo' :
          'm_VolumeLineTypeInfo';
        item[variableName].m_nCompareType = Number(val);
        applyChart();
        setColorPickerEvent();
      }
    });

    // 막대바 채우기
    $('input[name="fill"]', $acountTabBx)
    .prop('checked', item.m_VolumeBarTypeInfo.m_bFill);
  }
  
  createHtml();

  // 설명
  $descLst.html(getDescriptionHtml(SubType));

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0] = item;
    CWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CWebChart.SetGlobalPropertyToChart();
  };

  // 막대 or 선
  $baseHtml
    .on('change', 'input:radio', function () {
      item.m_nSubGraphSubType = Number($(this).val());      
      applyChart();
      createHtml();
    })
    .on('change', 'input:checkbox', function () {
      const isChecked = $(this).is(':checked');      
      const variableName = item.m_nSubGraphSubType === 0 ?
        'm_VolumeBarTypeInfo' :
        'm_VolumeLineTypeInfo';
      switch ($(this).attr('name')) {
        // 막대바 채우기
        case 'fill':
          item[variableName].m_bFill = isChecked;
          applyChart();
          break;
        // 마지막 값
        case 'lastMark':
          if (isChecked) {
            $baseHtml.find('input[name="allMark"]').prop('disabled', false);
          } else {
            $baseHtml
              .find('input[name="allMark"]')
              .prop('checked', false)
              .prop('disabled', true);
          }
          PropertyInfo.m_nShowLatestDataType = $(this).is(':checked');
          $baseHtml.find('input[name="allMark"]').trigger('change');
          break;
        // 모든 라인
        case 'allMark':
          PropertyInfo.m_bShowLatestDataOfAllSubGraph = $(this).is(':checked');
          applyChart();
          break;
        default:
          break;
      }
    });

  setColorPickerEvent();

  // 비교대상-가격차트 인 경우 색상 변경 금지
  function setColorPickerEvent() {
    if (item.m_VolumeBarTypeInfo.m_nCompareType !== COMPARE_TYPE_GROUPS[6].nValue) {
      $('.color_picker', $acountTabBx).spectrum('enable');
    } else {
      $('.color_picker', $acountTabBx).spectrum('disable');
    }
  }

  $baseHtml.localize();
  return $baseHtml;
};
