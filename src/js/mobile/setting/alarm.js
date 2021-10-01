import {
    getLineTypeOptionHtml,
    getNThicknessOptionHtml,
    getOnOffToggle
} from '../html-helper';

import {
  alarm as components
} from './components.json'

import {
    ChartSettingEvent
} from '../event-handler';

import t from '../../common/i18n';
// 탭 03: 알림선
export default (rChart) => {
    
    const rGlobalProperty = rChart.GetGlobalProperty(),
        tradingLineInfo = rGlobalProperty.GetTradingLineInfo() || {},
        smartSignalLineInfo = rGlobalProperty.GetSmartSignalLineInfo() || {};

    // html 생성
    let html = [];
    html.push('<ul class="candel_change_lst">');

    let length = components.length;
    for (let i = 0; i < length; i++) {
        let component = components[i],
            title = component.title,
            //radio1dep = component.radio,
            rows = component.rows;
        
        let target;
        switch (component.type) {
            case 'trading': {
                target = tradingLineInfo;
                break;
            }
            case 'smartsignal': {
                target = smartSignalLineInfo;
                break;
            }
        }

        html.push('<li>');
        html.push('<div class="lst_bx sign_tab_cont">');
        html.push(`<strong class="tit">${t(title)}</strong>`);
/*
        if (radio1dep) {
            html.push('<div class="check_rgt_bx color_select_bx">');
            html.push(getOnOffToggle(target[radio1dep], true, radio1dep));
            html.push('</div>');
        }
*/
        html.push('</div>');

        html.push(`<ul class="candel_change_lst" data-type='${component.type}'>`);

        rows.forEach(({label, color, type, thickness, radio}, j) => {            
            html.push('<li>');
            html.push('<div class="lst_bx">');
            html.push(`<strong class="tit01">${t(label)}</strong>`);
            html.push('<div class="check_rgt_bx color_select_bx">');
            
            // 라인 타입 선택
            if (type) {
                html.push(`<div class="line_select_bx line_height_bx" id="${type}">`);
                html.push(getLineTypeOptionHtml(target[type]));
                html.push('</div>');
            }

            // 라인 픽셀 선택
            if (thickness) {
                html.push(`<div class="line_select_bx line_px_bx" id="${thickness}">`);
                html.push(getNThicknessOptionHtml(target[thickness]));
                html.push('</div>');
            }

            // 라인 색상 선택
            if (color) {
                html.push(`<input type="text" class="color_picker" name="${color}">`);
            }
/*
            // 노출여부 선택
            if (radio) {
                html.push(getOnOffToggle(target[radio], true, radio));
            }
*/
            html.push('</div>');
            html.push('</div>');
            html.push('</li>');
        });

        html.push('</ul>');
        html.push('</li>');
    }

    html.push('</ul>');


    let wrapper = document.createElement("div");
    wrapper.className = "tab_cont";
    wrapper.innerHTML = html.join('');

    let $wrapper = $(wrapper);

    // 색상 변경
    $('.color_picker', $wrapper).each(function () {
      const type = $(this).closest('ul').data('type'),
        rLineInfo = (type === 'trading') ? tradingLineInfo : smartSignalLineInfo;
      $(this).mobileSpectrumColorPicker({
        props: rLineInfo,
        callback: setGlobalProperty
      });
    });
    
    // 이벤트 연결    
    new ChartSettingEvent($wrapper)
        .lineType(setGlobalProperty)
        .toggleSwitch(setGlobalProperty);    

    // GlobalProperty 값 변경
    function setGlobalProperty(label, value) {

        switch (label) {
            case "m_clrNonContractLine":
                tradingLineInfo.SetClrNonContractLine(value);
                break;
            case "m_clrAlarmLine":
                tradingLineInfo.SetClrAlarmLine(value);
                break;
            case "m_clrAvgBuyPriceLine":
                tradingLineInfo.SetClrAvgBuyPriceLine(value);
                break;
            case "m_clrBuying":
                smartSignalLineInfo.SetClrBuying(value);
                break;
            case "m_clrTargetPrice":
                smartSignalLineInfo.SetClrTargetPrice(value);
                break;
            case "m_clrStopLoss":
                smartSignalLineInfo.SetClrStopLoss(value);
                break;
            case "m_clrSell":
                smartSignalLineInfo.SetClrSell(value);
                break;
            default:
                if (/noncontract/i.test(label) || /alarm/i.test(label) || /avgbuyprice/i.test(label)) {
                    tradingLineInfo[label] = value;
                } else if (/smartsignal/i.test(label) || /buying/i.test(label) || /targetprice/i.test(label) || /stoploss/i.test(label) || /sell/i.test(label)) {
                    smartSignalLineInfo[label] = value;
                }
        }
        
        rChart.SetGlobalPropertyToChart();
    }

    $wrapper.localize();

    // resize
    $(function () {
        $(".modal_chart_type .tab_cont").css('height', $(window).height() - 86);
    });

    return $wrapper;
}