import baseHtml from '../../../../../../html/pc/setting/tabs/chart/sub/etc.html';
import {
  getBaseLineHtml,
  getBaseLinesHtml,
  getDescriptionHtml,
  getQuantityInput,
  getVisibleCheckbox,
} from '../../../../html-helper';
import { ChartSettingEvent } from '../../../../event-handler';
import {
  CBaseLine,
  PRICE_TYPE_GROUPS,
  MV_TYPE_GROUPS
} from '../../../../../chart/kfitsChart';
import t from '../../../../../common/i18n';

import PerfectScrollbar from 'perfect-scrollbar'

// 보조지표 > 유형2
export default (rChart, strName, strKey) => {
  const $baseHtml = $(baseHtml),
    $variableLst = $('#variable_lst', $baseHtml),
    $styleLst = $('#style_lst', $baseHtml),
    $baselineLst = $('#baseline_lst', $baseHtml),
    $descLst = $('#desc_lst', $baseHtml);

  const $lineFormLft = $('.line_form_lft', $baselineLst),
    $lineFormRgt = $('.line-form_rgt', $baselineLst);  

  const PropertyInfo = rChart.GetPropertyInfo(strKey, true);
  console.log('PropertyInfo', PropertyInfo);
  const VariableArray = PropertyInfo.m_VariableArray;
  const SubGraphPropertyInfoArray = PropertyInfo.m_SubGraphPropertyInfoArray;
  const BaseLineArray = PropertyInfo.m_BaseLineArray || [];

  const applyChart = () => {
    PropertyInfo.m_SubGraphPropertyInfoArray = SubGraphPropertyInfoArray;
    PropertyInfo.m_VariableArray = VariableArray;
    PropertyInfo.m_BaseLineArray = BaseLineArray;
    rChart.SetPropertyInfo(strKey, PropertyInfo, true);
    rChart.SetGlobalPropertyToChart();
  };  

  const isRainBow = (strName === '_RAINBOW_');

  // 그물차트 인 경우 마지막값표시, 모든라인표시 삭제
  if (isRainBow) {
    $('#sub_tab_cont2', $baseHtml)
    .find('.btm_form_lst').remove().end()
    .find('.data_scr_lst').css('height', '232px');
  }  

  // 변수 설정
  if (VariableArray.length > 0) {
    const variableHtml = [];
    for (let i = 0, size = VariableArray.length; i < size; i++) {
      const item = VariableArray[i];

      variableHtml.push('<tr>');
      variableHtml.push(`<td class="txt_td">${item.m_title || item.m_strName}</td>`);
      if (item.m_strName === 'DType') {
        variableHtml.push('<td><fieldset class="select_ui">');
        variableHtml.push('<select name="m_strData" id="price_lst"></select>');
        variableHtml.push('</fieldset></td>');
      } else if (item.m_strName === 'MAType') {
        variableHtml.push('<td><fieldset class="select_ui">');
        variableHtml.push('<select name="m_strData" id="mv_lst"></select>');
        variableHtml.push('</fieldset></td>');
      } else {
        variableHtml.push(
          `<td><input value="${
            item.m_strData
          }" class="input_type" type="text"/></td>`,
        );
      }
      variableHtml.push('</tr>');
    }
    $variableLst
      .html(variableHtml.join(''))
      .on('focusout', 'input[type="text"]', function () {
        const idx = $(this)
          .closest('tr')
          .index();
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
    
    const $mv_lst = $('#mv_lst', $variableLst);
    $mv_lst.optsselectmenu({
      width: 161,
      shape: 'bordernone',
      props: VariableArray,
      param: $mv_lst.closest('tr').index(),
      opts: MV_TYPE_GROUPS,
      callback: function (id, val, idx) {
        VariableArray[idx][id] = Number(val);
        applyChart();
      }
    });
  } else {
    $baseHtml
      .find('.sub_tab_lst li:first')
      .remove()
      .end()
      .find('.sub_tab_cont:first')
      .remove();
  }

  // 스타일 설정
  // 그물차트 인 경우 스타일 설정 1개 row 로 변경
  const tmpArray = isRainBow
    ? [
      Object.assign(Object.assign({}, SubGraphPropertyInfoArray[0]), {
        m_strSubGraphName: t('common.all'),
      }),
    ]
    : SubGraphPropertyInfoArray;  
  console.log('tmpArray(subGraphPropertyInfoArray): %O', tmpArray);
  if (tmpArray.length) {

    $.each(tmpArray, (idx, info = {}) => {      
      const $tr = $('<tr>');
      $('<td>').append(getVisibleCheckbox(info.m_bShow)).appendTo($tr);
      $('<td>', {
        'class': 'txt_td'
      }).text(info.m_strSubGraphName).appendTo($tr);
      $('<td>').append('<input type="text" class="color_picker" name="m_clrLine">').appendTo($tr);
      $('<td>').append(function() {
        const html = [];
        html.push('<fieldset class="select_ui">');
        html.push('<select class="lineTypeSelect" name="m_nLineType"></select>');
        html.push('</fieldset>');
        return html.join('');
      }).appendTo($tr);
      $('<td>').append(function() {
        const html = [];
        html.push('<fieldset class="select_ui">');
        html.push('<select class="lineThicknessSelect" name="m_nThickness"></select>');
        html.push('</fieldset>');
        return html.join('');
      }).appendTo($tr);

      $tr.appendTo($styleLst);

      // 색상 변경    
      $('.color_picker', $tr).spectrumColorPicker({
        classname: 'picker_select1',
        props: info.m_LineTypeInfo,
        param: idx,
        callback: setStypeProperty
      });

      // 라인 타입 변경
      $('.lineTypeSelect', $tr).linetypeselectmenu({
        width: 119,
        props: info.m_LineTypeInfo,
        param: idx,
        callback: setStypeProperty
      });

      // 라인 두께 변경
      $('.lineThicknessSelect', $tr).lineThicknessselectmenu({
        width: 119,
        props: info.m_LineTypeInfo,
        param: idx,
        callback: setStypeProperty
      });
    });
  }

  $styleLst
    .on('change', 'input:checkbox', function () {
      const isChecked = $(this).is(':checked');
      if (isRainBow) {
        for (
          let i = 0, size = SubGraphPropertyInfoArray.length; i < size; i++
        ) {
          SubGraphPropertyInfoArray[i].m_bShow = isChecked;
        }
      } else {
        SubGraphPropertyInfoArray[
          $(this)
          .closest('tr')
          .index()
        ].m_bShow = isChecked;
      }
      applyChart();
    });

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

  function setStypeProperty(label, value, idx) {
    if (label !== 'm_clrLine') {
      value = Number(value);
    }
    if (isRainBow) {
      for (let i = 0, size = SubGraphPropertyInfoArray.length; i < size; i++) {
        SubGraphPropertyInfoArray[i].m_LineTypeInfo[label] = value;
      }
    } else {
      SubGraphPropertyInfoArray[idx].m_LineTypeInfo[label] = value;
    }

    applyChart();
  }

  

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
        $(this)
        .closest('li')
        .index()
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
      const idx = $lineFormLft.find('li.active').index();
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
            toggleLineFormRgt(!BaseLineArray.length);
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

  function setPropertyInfo(id, val) {
    if (id !== 'm_clrLine') val = Number(val);
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
  $descLst.html(getDescriptionHtml(strName));

  $baseHtml.localize();
  return $baseHtml;
};
