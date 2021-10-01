import baseHtml from '../../../../../../html/pc/setting/tabs/chart/main/line.html';

// 차트유형 > 라인 설정창
export default (rChart, strKey) => {
  const PropertyInfo = rChart.GetPropertyInfo(strKey, true);
  console.log('PropertyInfo', PropertyInfo);

  const item = PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceLineTypeInfo;
  console.log('SubGraphPropertyInfo', item);

  const $baseHtml = $(baseHtml);

  // 색상 변경    
  $('.color_picker', $baseHtml).spectrumColorPicker({
    props: item,
    callback: setGlobalProperty
  });

  // 라인 타입 변경
  $('.lineTypeSelect', $baseHtml).linetypeselectmenu({
    props: item,
    callback: setGlobalProperty
  });

  // 라인 두께 변경
  $('.lineThicknessSelect', $baseHtml).lineThicknessselectmenu({
    props: item,
    callback: setGlobalProperty
  });

  // GlobalProperty 값 변경
  function setGlobalProperty(label, value) {

    if (label === 'm_nThickness') {
      value = Number(value);
    } 

    item[label] = value;

    PropertyInfo.m_SubGraphPropertyInfoArray[0].m_PriceLineTypeInfo = item;
    rChart.SetPropertyInfo(strKey, PropertyInfo, true);
    rChart.SetGlobalPropertyToChart();
  }

  $baseHtml.localize();

  return $baseHtml;
};
