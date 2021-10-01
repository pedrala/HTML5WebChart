import baseHtml from '../../../html/pc/depth/index.html';

export default (rChart, rStrKey) => {

  const $baseHtml = $(baseHtml);

  rChart.BackupChartFullProperty();
  
  const rGlobalProperty = rChart.GetGlobalProperty(),
    rPropertyInfo = rChart.GetPropertyInfo(rStrKey),
    rSubGraphPropertyInfo = rPropertyInfo.m_SubGraphPropertyInfoArray[0],
    rHogaDepthTypeInfo = rSubGraphPropertyInfo.m_HogaDepthTypeInfo;

  // 색상 변경    
  $('.color_picker', $baseHtml).spectrumColorPicker({
    props: rHogaDepthTypeInfo,
    callback: setPropertyInfo
  });

  // 십자선
  $('.i_check', $baseHtml).checkbox({
    props: rGlobalProperty,
    callback: setPropertyInfo
  });

  // 선 종류
  $('.lineTypeSelect', $baseHtml).linetypeselectmenu({
    props: rGlobalProperty,
    callback: setPropertyInfo
  });

  // 선 두께
  $('.lineThicknessSelect', $baseHtml).lineThicknessselectmenu({
    props: rGlobalProperty,
    callback: setPropertyInfo
  });
      
  // 초기화
  $baseHtml
  .on('click', '#btnReset', function (e) {
    e.preventDefault();

    rChart.InitializeGlobalProperty(false);

    const rPropertyInfo = rChart.GetDefaultIndicatorProperty("_HOGADEPTH_");
    if (!rPropertyInfo) {
      return;
    }

    const rSubGraphPropertyInfo = rPropertyInfo.m_SubGraphPropertyInfoArray[0];
    if (!rSubGraphPropertyInfo) {
      return;
    }

    const rHogaDepthTypeInfo = rSubGraphPropertyInfo.m_HogaDepthTypeInfo;

    // 색상 변경    
    $('.color_picker', $baseHtml).each(function() {
      $(this).spectrum('set', rHogaDepthTypeInfo[$(this).attr('name')]);
    });

    // 십자선
    $('.i_check', $baseHtml).prop('checked', function () {
      return rGlobalProperty[$(this).attr('name')];
    });

    // 선 종류
    $('.lineTypeSelect', $baseHtml).val(function () {      
      return rGlobalProperty[$(this).attr('name')];
    }).linetypeselectmenu('refresh');

    // 선 두께
    $('.lineThicknessSelect', $baseHtml).val(function () {
      return rGlobalProperty[$(this).attr('name')];
    }).lineThicknessselectmenu('refresh');

    rChart.SetGlobalPropertyToChart(false);
    rChart.SetDefaultIndicatorPropertyToChart(rStrKey, "_HOGADEPTH_");

  })  
  // 취소
  .on('click', '#btnCancel', function (e) {
    rChart.DoNotSaveNCloseModal(e);
  })
  // 확인
  .on('click', '#btnConfirm', function (e) {
    rChart.SaveNCloseModal(e);
  })
  // 팝업닫기
  .on('click', '#btnClose', function (e) {
    rChart.DoNotSaveNCloseModal(e);
  });  

  // 국제화
  $baseHtml.localize();

  // 드래그를 통한 팝업창 이동
  $('.calender_modal', $baseHtml).draggable({
    handle: '.pop_title',
    drag: function (event, ui) {
      // colorpicker도 같이 이동      
      $('.color_picker', ui.helper).spectrum('reflow');
    }
  });
  
  // PropertyInfo 값 변경
  function setPropertyInfo(label, value) {
    let tmpValue = value;
    if (label === 'm_nCrossLineType' || label === 'm_nCrossLineThickness') {
      tmpValue = Number(value);
    } else {
      tmpValue = value;
    }

    switch (label) {
      // 매수 색상
      case 'm_clrBuyLine':
        rHogaDepthTypeInfo['m_clrBuyLine'] = tmpValue;
        rHogaDepthTypeInfo['m_clrBuyRange'] = tmpValue;
        break;
      // 매도 색상
      case 'm_clrSellLine':
        rHogaDepthTypeInfo['m_clrSellLine'] = tmpValue;
        rHogaDepthTypeInfo['m_clrSellRange'] = tmpValue;
        break;
      // 그 외
      default:
        rGlobalProperty[label] = tmpValue;
    }

    rChart.SetGlobalPropertyToChart();
  }

  return $baseHtml;
}