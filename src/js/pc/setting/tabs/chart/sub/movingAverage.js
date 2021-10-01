import baseHtml from '../../../../../../html/pc/setting/tabs/chart/sub/movingAverage.html';
import {
  getDescriptionHtml,
  getQuantityInput,
  getVisibleCheckbox,
} from '../../../../html-helper';
import {
  PRICE_TYPE_GROUPS,
  MV_TYPE_GROUPS,
} from '../../../../../chart/kfitsChart';
import { ChartSettingEvent } from '../../../../event-handler';

// 보조지표 > 주가이동평균
export default (CWebChart, SubType, Id) => {
  const PropertyInfo = CWebChart.GetPropertyInfo(Id, true);
  console.log('PropertyInfo', PropertyInfo);

  const MAPropertyInfoArray = PropertyInfo.m_MAPropertyInfoArray;

  const $baseHtml = $(baseHtml);
  const $averageContLst = $baseHtml.find('#average_cont_lst');
  const $descLst = $baseHtml.find('#desc_lst');  

  $('#top_m_nInputPacketDataType', $baseHtml).optsselectmenu({
    width: 65,
    opts: PRICE_TYPE_GROUPS,
    callback: function (id, val) {
      $(`select[name="${id}"]`, $averageContLst).each((idx, obj) => {
        MAPropertyInfoArray[idx][id] = Number(val);
        $(obj).val(val).selectmenu('refresh');
      });      
      
      applyChart();
    }
  });

  $('#top_m_nMAType', $baseHtml).optsselectmenu({
    width: 65,
    shape: 'marginright67',
    opts: MV_TYPE_GROUPS,
    callback: function (id, val) {
      $(`select[name="${id}"]`, $averageContLst).each((idx, obj) => {
        MAPropertyInfoArray[idx][id] = Number(val);
        $(obj).val(val).selectmenu('refresh');
      });

      applyChart();
    }
  });

  $('#top_m_nLineType', $baseHtml).linetypeselectmenu({
    width: 65,
    callback: function (id, val) {
      $(`select[name="${id}"]`, $averageContLst).each((idx, obj) => {
        MAPropertyInfoArray[idx].m_MASubGraphPropertyInfo.m_LineTypeInfo[id] = Number(val);
        $(obj).val(val).linetypeselectmenu('refresh');
      });

      applyChart();
    }
  });

  $('#top_m_nThickness', $baseHtml).lineThicknessselectmenu({
    width: 57,
    callback: function (id, val) {
      $(`select[name="${id}"]`, $averageContLst).each((idx, obj) => {
        MAPropertyInfoArray[idx].m_MASubGraphPropertyInfo.m_LineTypeInfo[id] = Number(val);
        $(obj).val(val).lineThicknessselectmenu('refresh')
      });

      applyChart();
    }
  });

  $.each(MAPropertyInfoArray, (idx, rMAPropertyInfo) => {
    const item = rMAPropertyInfo.m_MASubGraphPropertyInfo;
    const $fieldset = $('<fieldset>', {
      'class': 'select_ui'
    })
    .append('<select class="packetDataTypeSelect" name="m_nInputPacketDataType"></select>')
    .append('<select class="maTypeSelect" name="m_nMAType"></select>')
    .append('<input type="text" class="color_picker" name="m_clrLine">')
    .append('<select class="lineTypeSelect" name="m_nLineType"></select>')
    .append('<select class="lineThicknessSelect" name="m_nThickness"></select>');

    const $li = $('<li>')
      .append(getVisibleCheckbox(item.m_bShow))
      .append(getQuantityInput(rMAPropertyInfo.m_nMA))
      .append($fieldset).appendTo($averageContLst);

    //
    $('.packetDataTypeSelect', $li).optsselectmenu({
      width: 65,
      props: rMAPropertyInfo,
      opts: PRICE_TYPE_GROUPS,
      callback: function (id, val) {
        rMAPropertyInfo[id] = Number(val);
        applyChart();
      }
    });

    //
    $('.maTypeSelect', $li).optsselectmenu({
      width: 65,
      props: rMAPropertyInfo,
      opts: MV_TYPE_GROUPS,
      callback: function (id, val) {
        rMAPropertyInfo[id] = Number(val);
        applyChart();
      }
    });

    // 색상 변경    
    $('.color_picker', $li).spectrumColorPicker({
      props: item.m_LineTypeInfo,
      callback: ((id, val) => {
        item.m_LineTypeInfo[id] = val;
        applyChart();
      })
    });

    // 라인 타입 변경
    $('.lineTypeSelect', $li).linetypeselectmenu({
      width: 65,
      props: item.m_LineTypeInfo,
      callback: ((id, val) => {
        item.m_LineTypeInfo[id] = val;
        applyChart();
      })
    });

    // 라인 두께 변경
    $('.lineThicknessSelect', $li).lineThicknessselectmenu({
      width: 57,
      props: item.m_LineTypeInfo,
      callback: ((id, val) => {
        item.m_LineTypeInfo[id] = Number(val);
        applyChart();
      })
    });
  });

  // 설명
  $descLst.html(getDescriptionHtml(SubType));

  const applyChart = () => {
    PropertyInfo.m_MAPropertyInfoArray = MAPropertyInfoArray;
    CWebChart.SetPropertyInfo(Id, PropertyInfo, true);
    CWebChart.SetGlobalPropertyToChart();
  };

  // 전체 선택
  $baseHtml
    .on('change', '#top_show', function () {
      const isChecked = $(this).is(':checked');
      $averageContLst.find('input[name="show"]').prop('checked', isChecked);
      for (let i = 0, size = MAPropertyInfoArray.length; i < size; i++) {
        MAPropertyInfoArray[i].m_MASubGraphPropertyInfo.m_bShow = isChecked;
      }
      applyChart();
    })
    .on('change', 'input[name="show"]', function () {
      const $self = $(this);
      const idx = $self.closest('li').index();
      MAPropertyInfoArray[idx].m_MASubGraphPropertyInfo.m_bShow = $self.is(
        ':checked',
      );
      applyChart();
    });

  new ChartSettingEvent($baseHtml)
    .quantity(function () {
      const $self = $(this);
      const idx = $self.closest('li').index();
      MAPropertyInfoArray[idx].m_nMA = Number($self.val());
      applyChart();
    });

  $baseHtml.localize();

  return $baseHtml;
};
