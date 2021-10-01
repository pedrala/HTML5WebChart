import baseHtml from '../../../../../../html/pc/setting/tabs/chart/sub/oscillator.html';
import {
  getBaseLineHtml,
  getBaseLinesHtml,
  getDescriptionHtml,
  getQuantityInput
} from '../../../../html-helper';
import { ChartSettingEvent } from '../../../../event-handler';
import {
  CBaseLine,
  COMPARE_TYPE_GROUPS,
  PRICE_TYPE_GROUPS,
} from '../../../../../chart/kfitsChart';

import PerfectScrollbar from 'perfect-scrollbar'

// 보조지표 > MACD Oscillator
export default (CWebChart, SubType, Id) => {
  const PropertyInfo = CWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const $baseHtml = $(baseHtml);
  const $variableLst = $baseHtml.find('#variable_lst');
  const $styleLst = $baseHtml.find('#style_lst');
  const $baselineLst = $baseHtml.find('#baseline_lst');
  const $descLst = $baseHtml.find('#desc_lst');
  const $lineFormLft = $baselineLst.find('.line_form_lft');
  const $lineFormRgt = $baselineLst.find('.line-form_rgt');

  const VariableArray = PropertyInfo.m_VariableArray;
  const SubGraphPropertyInfo = PropertyInfo.m_SubGraphPropertyInfoArray[0];
  const BaseLineArray = PropertyInfo.m_BaseLineArray || [];

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray[0] = SubGraphPropertyInfo;
    PropertyInfo.m_VariableArray = VariableArray;
    PropertyInfo.m_BaseLineArray = BaseLineArray;
    CWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CWebChart.SetGlobalPropertyToChart();
  };

  // 변수 설정
  const variableHtml = [];
  for (let i = 0, size = VariableArray.length; i < size; i++) {
    const item = VariableArray[i];

    variableHtml.push('<tr>');
    variableHtml.push(
      `<td class="txt_td">${item.m_title || item.m_strName}</td>`,
    );
    if (item.m_strName === 'DType') {
      variableHtml.push('<td><fieldset class="select_ui">');
      variableHtml.push('<select name="m_strData" id="price_lst"></select>');
      variableHtml.push('</fieldset></td>');
    } else {
      variableHtml.push(
        `<td><input value="${
          item.m_strData
        }" class="input_type" type="text" /></td>`,
      );
    }
    variableHtml.push('</tr>');
  }  

  $variableLst
    .html(variableHtml.join(''))
    .on('focusout', 'input[type="text"]', function () {
      const idx = $(this).closest('tr').index();
      VariableArray[idx].m_strData = Number($(this).val());
      applyChart();
    }).on('keyup', 'input[type="text"]', function (e) {
      this.value = this.value.replace(/[^\d]/g, '');
      if (e.keyCode === 13) {
        const idx = $(this)
          .closest('tr')
          .index();
        VariableArray[idx].m_strData = Number($(this).val());
        applyChart();
      }
    });

  const $price_lst = $('#price_lst', $variableLst);
  $price_lst.optsselectmenu({
    width: 161,
    shape: 'bordernone',
    props: VariableArray,
    param: $price_lst.closest('tr').index(),
    opts: PRICE_TYPE_GROUPS,
    callback: function (id, val, idx) {
      VariableArray[idx][id] = Number(val);
      applyChart();
    }
  });

  // 스타일 설정
  console.log('subGraphPropertyInfoArray', SubGraphPropertyInfo);
  const variableName = SubGraphPropertyInfo.m_nSubGraphSubType === 1 ? 'm_BarTypeInfo' : 'm_LineTypeInfo';

  // 색상 변경    
  $('.color_picker', $styleLst).spectrumColorPicker({
    props: SubGraphPropertyInfo[variableName],
    callback: ((id, val) => {
      SubGraphPropertyInfo[variableName][id] = val;
      applyChart();
    })
  });

  // 비교대상
  $('#compare_lst', $styleLst).optsselectmenu({
    width: 111,
    props: SubGraphPropertyInfo[variableName],
    opts: COMPARE_TYPE_GROUPS,
    callback: function (id, val) {
      SubGraphPropertyInfo[variableName][id] = val;
      applyChart();
    }
  });
    
  // 막대바 채우기
  $('input[name="fill"]', $styleLst).prop('checked', SubGraphPropertyInfo[variableName].m_bFill);

  $baseHtml // 마지막 값 표시
    .on('change', '#m_nShowLatestDataType', function () {
      const isChecked = $(this).is(':checked');
      if (isChecked) {
        $baseHtml
          .find('#m_bShowLatestDataOfAllSubGraph')
          .prop('disabled', false);
      } else {
        $baseHtml
          .find('#m_bShowLatestDataOfAllSubGraph')
          .prop('checked', false)
          .prop('disabled', true);
      }
      PropertyInfo.m_nShowLatestDataType = $(this).is(':checked');
      $baseHtml.find('#m_bShowLatestDataOfAllSubGraph').trigger('change');
    }) // 모든 라인 표시
    .on('change', '#m_bShowLatestDataOfAllSubGraph', function () {
      PropertyInfo.m_bShowLatestDataOfAllSubGraph = $(this).is(':checked');
      applyChart();
    })
    .find('#m_nShowLatestDataType')
    .prop('checked', PropertyInfo.m_nShowLatestDataType)
    .end()
    .find('#m_bShowLatestDataOfAllSubGraph')
    .prop('checked', PropertyInfo.m_bShowLatestDataOfAllSubGraph);

  $styleLst.on('change', 'input:checkbox', function () {
    const isChecked = $(this).is(':checked');
    switch ($(this).attr('name')) {
      // 막대바 채우기
      case 'fill':
        SubGraphPropertyInfo[variableName].m_bFill = isChecked;
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


  // 기준선 스타일 disable/enable
  const toggleLineFormRgt = function (isDisable) {
    if (isDisable) {
      $lineFormRgt
        .find('.color_picker')
        .spectrum('set', '#ff0000')
        .spectrum('disable').end()
        // 선 종류 설정
        .find('.lineTypeSelect')
        .linetypeselectmenu('disable').end()
        // 선 두께 설정
        .find('.lineThicknessSelect')
        .lineThicknessselectmenu('disable').end()
        //
        .find('button.select_tit')
        .prop('disabled', true);
    } else {
      $lineFormRgt
        .find('.color_picker')
        .spectrum('enable').end()
        // 선 종류 설정
        .find('.lineTypeSelect')
        .linetypeselectmenu('enable').end()
        // 선 두께 설정
        .find('.lineThicknessSelect')
        .lineThicknessselectmenu('enable').end()
        //
        .find('button.select_tit')
        .prop('disabled', false);
    }
  }

  // 기준선 설정
  $lineFormLft
    .find('.form_bx')
    .prepend(getQuantityInput())
    .on('focus', '.prd_count .cout_input', function () {
      // 선택된 기준선 선택 초기화
      $(this).parent('.prd_count').next().find('li').removeClass('active');

      // 기준선 스타일 disable
      toggleLineFormRgt(true);
    })
    .find('.form_src_lst .form_lst').html(function () {
      if (BaseLineArray.length) {
        return getBaseLinesHtml(BaseLineArray);
      }
      return '';
    })
    // 추가된 기준선 클릭 이벤트
    .on('click', '.lst_lnk', function (e) {
      e.preventDefault();
      $(this).closest('li').addClass('active').siblings().removeClass('active');

      // enable
      toggleLineFormRgt(false);

      const item = BaseLineArray[
        $(this).closest('li').index()
      ] || {};

      $lineFormRgt
        // 색상 설정
        .find('.color_picker')
        .spectrum('set', item.m_clrLine).end()
        // 선 종류 설정
        .find('.lineTypeSelect')
        .val(item.m_nLineType).linetypeselectmenu('refresh').end()
        // 선 두께 설정
        .find('.lineThicknessSelect')
        .val(item.m_nThickness).lineThicknessselectmenu('refresh');
    });


  // 스크롤 ui 변경
  new PerfectScrollbar($('.form_src_lst', $lineFormLft)[0], {
    suppressScrollX: true
  });

  new ChartSettingEvent($lineFormLft)
    .quantity()
    .baseLineAddRemove(function () {
      const $self = $(this);
      let idx = $lineFormLft.find('li.active').index();
      const $input = $lineFormLft.find('input.cout_input');
      const val = $input.val();
      const copyBaseLine = new CBaseLine();

      switch ($self.attr('id')) {
        case 'btn_add': {
          if (val) {
            copyBaseLine.m_dBaseValue = Number(val);
            BaseLineArray.unshift(copyBaseLine);
            $lineFormLft.find('.form_lst').prepend(getBaseLineHtml(val))
              .find('.lst_lnk:first').trigger('click');
            $input.val('');
            applyChart();
          }
          break;
        }
        case 'btn_delete': {
          if (idx > -1) {
            BaseLineArray.splice(idx, 1);
            $lineFormLft.find('li.active').remove();
            applyChart();            
            
            // 재선택
            if (idx) idx -= 1;
            $lineFormLft.find('.form_lst').find('.lst_lnk').eq(idx).trigger('click');

            // disable
            if (!BaseLineArray.length) {
              toggleLineFormRgt(true);
            }
          }
          break;
        }
        case 'btn_delete_all': {
          if (idx > -1) {
            BaseLineArray.splice(0, BaseLineArray.length);
            $lineFormLft.find('.form_lst').html(getBaseLinesHtml(BaseLineArray));
            applyChart();

            toggleLineFormRgt(true);
          }
          break;
        }
        default:
          break;
      }
    });

  // 기준선 스타일 
  $lineFormRgt
    // 색상 변경    
    .find('.color_picker')
    .spectrumColorPicker({
      color: '#ff0000',
      props: BaseLineArray,
      callback: setPropertyInfo
    }).end()
    // 선 종류
    .find('.lineTypeSelect')
    .linetypeselectmenu({
      width: 73,
      props: BaseLineArray,
      callback: setPropertyInfo
    }).end()
    // 선 두께
    .find('.lineThicknessSelect')
    .lineThicknessselectmenu({
      width: 61,
      props: BaseLineArray,
      callback: setPropertyInfo
    }).end();

  function setPropertyInfo (id, val) {
    const idx = $lineFormLft.find('li.active').index();
    BaseLineArray[idx][id] = val;
    applyChart();
  }  

  // 초기 disable 설정
  if (BaseLineArray.length > 0) {
    $lineFormLft
      .find('.form_lst')
      .find('.lst_lnk:first')
      .trigger('click');
  } else {
    toggleLineFormRgt(true);
  }


  // 설명
  $descLst.html(getDescriptionHtml(SubType));

  $baseHtml.localize();
  return $baseHtml;
};
