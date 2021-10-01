import baseHtml from '../../../../html/pc/setting/tabs/alarm.html';

export default (rChart) => {

  const $baseHtml = $(baseHtml);
  const rGlobalProperty = rChart.GetGlobalProperty(),
    rTradingLineInfo = rGlobalProperty.GetTradingLineInfo() || {},
    rSmartSignalLineInfo = rGlobalProperty.GetSmartSignalLineInfo() || {};  
  
  // 색상 변경
  $('.color_picker', $baseHtml).each(function () {
    const type = $(this).closest('ul').data('type'),
      rLineInfo = (type === 'trading') ? rTradingLineInfo : rSmartSignalLineInfo;
    $(this).spectrumColorPicker({      
      props: rLineInfo,
      callback: setGlobalProperty
    });
  });

  // 라인 타입 변경
  $('.lineTypeSelect', $baseHtml).each(function () {
    const type = $(this).closest('ul').data('type'),
      rLineInfo = (type === 'trading') ? rTradingLineInfo : rSmartSignalLineInfo;
    $(this).linetypeselectmenu({
      props: rLineInfo,
      callback: setGlobalProperty
    });
  });

  // 라인 두께 변경
  $('.lineThicknessSelect', $baseHtml).each(function () {
    const type = $(this).closest('ul').data('type'),
      rLineInfo = (type === 'trading') ? rTradingLineInfo : rSmartSignalLineInfo;
    $(this).lineThicknessselectmenu({
      props: rLineInfo,
      callback: setGlobalProperty
    });
  });

  // GlobalProperty 값 변경
  function setGlobalProperty(label, value) {

    switch (label) {
      case "m_clrNonContractLine":
        rTradingLineInfo.SetClrNonContractLine(value);
        break;
      case "m_clrAlarmLine":
        rTradingLineInfo.SetClrAlarmLine(value);
        break;
      case "m_clrAvgBuyPriceLine":
        rTradingLineInfo.SetClrAvgBuyPriceLine(value);
        break;
      case "m_clrBuying":
        rSmartSignalLineInfo.SetClrBuying(value);
        break;
      case "m_clrTargetPrice":
        rSmartSignalLineInfo.SetClrTargetPrice(value);
        break;
      case "m_clrStopLoss":
        rSmartSignalLineInfo.SetClrStopLoss(value);
        break;
      case "m_clrSell":
        rSmartSignalLineInfo.SetClrSell(value);
        break;
      default:
        if (typeof value === "string")
          value = Number(value);

        if (/noncontract/i.test(label) || /alarm/i.test(label) || /avgbuyprice/i.test(label)) {
          rTradingLineInfo[label] = value;
        } else if (/smartsignal/i.test(label) || /buying/i.test(label) || /targetprice/i.test(label) || /stoploss/i.test(label) || /sell/i.test(label)) {
          rSmartSignalLineInfo[label] = value;
        }
    }

    rChart.SetGlobalPropertyToChart();
  }

  // 국제화 언어 적용
  $baseHtml.localize();
  
  return $baseHtml;
}