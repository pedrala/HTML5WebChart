import {
    getVisibleCheckbox,
    getVisibleRadio,
    getOnOffToggle,
    getLineTypeOptionHtml,
    getNThicknessOptionHtml
} from '../html-helper';

import {
  normal as components
} from './components.json'

import {
    ChartSettingEvent
} from '../event-handler';

import t from '../../common/i18n';

// 탭 01: 일반설정
export default (rChart) => {
    
    const rGlobalProperty = rChart.GetGlobalProperty();    

    // html 생성
    let html = [];
    html.push('<ul class="candel_change_lst">');
    html.push('<li>');

    const length = components.length;
    for (let i = 0; i < length; i++) {
        let component = components[i];        

        html.push('<div class="lst_bx sign_tab_cont bg_clr">');
        html.push(`<strong class="tit">${t(component.title)}</strong>`);
        html.push('</div>');

        html.push('<ul class="candel_change_lst">');

        let rows = component.rows;
        rows.forEach((row, j) => {
            let label = row.label,
                toggle = row.toggle,
                input = row.input,
                radio = row.radio,
                checkbox = row.checkbox,
                color = row.color,
                type = row.type,
                thickness = row.thickness,
                desc = row.desc,
                sub = row.sub;

            if (sub !== 'end') html.push('<li>');

            if (radio) {                    
                html.push('<div class="rod_lst_bx">');
            } else if (checkbox && sub) {
                html.push('<div class="chk_lst_bx">');
            } else {
                html.push('<div class="lst_bx">');
            }                            

            if (toggle) {
                html.push(`<strong class="tit">${t(toggle.label)}</strong>`);
                html.push('<div class="check_rgt_bx color_select_bx">');
                html.push(getOnOffToggle(Boolean(rGlobalProperty[toggle.name]), toggle.defaultValue, toggle.name));
                html.push('</div>');
            }

            if (input) {
                html.push(`<label class="tit" for="${input.name}">${t(input.label)}</label>`);
                html.push('<div class="check_rgt_bx">');
                html.push('<span class="px_input_bx">');
                html.push(`<input class="pop_input" id="${input.name}" name="${input.name}" value="${rGlobalProperty[input.name]}" type="number" min="${input.min}" max="${input.max}" />`);
                html.push('<span class="txt">px</span>');
                html.push('</span>');
                html.push('</div>');
            }

            if (radio) {
                let isDisabled;
                for (const item of radio) {
                    isDisabled = !rGlobalProperty[item.pName];                  
                    html.push(getVisibleRadio((rGlobalProperty[item.name] === item.value), item.label, item.value, item.type, item.name, isDisabled));
                }
            }

            if (checkbox) {
                if (sub === 'end') {
                    html.push('<div class="sub tit01">');                    
                } else {
                    html.push('<div class="sub">');
                }
                let isDisabled = rGlobalProperty[checkbox.pName] === 0;
                html.push(getVisibleCheckbox(Boolean(rGlobalProperty[checkbox.name]), checkbox.label, checkbox.defaultValue, checkbox.type, checkbox.name, isDisabled));
                html.push('</div>');
            }

            if (label) {
                html.push(`<strong class="tit">${t(label)}</strong>`);
                html.push('<div class="check_rgt_bx color_select_bx">');
            }

            if (type) {
                html.push(`<div class="line_select_bx line_height_bx" id="${type}">`);
                html.push(getLineTypeOptionHtml(rGlobalProperty[type]));
                html.push('</div>');
            }

            if (thickness) {
                html.push(`<div class="line_select_bx line_px_bx" id="${thickness}">`);
                html.push(getNThicknessOptionHtml(rGlobalProperty[thickness]));
                html.push('</div>');
            }

            if (color) {
                html.push(`<input type="text" class="color_picker" name="${color}">`);
            }

            if (desc) {
              if (sub === 'end') {
                html.push('<div class="sub tit01">');
              } else {
                html.push('<div class="sub">');
              }

              html.push('<span class="txt">');
              html.push(t(desc.label));
              html.push('</span>');
              html.push('</div>');
            }

            if (label) html.push('</div>');
            html.push('</div>');
            if (sub !== 'start') html.push('</li>');
           
        });

        html.push('</ul>');
    }

    html.push('</li>');
    html.push('</ul>');

    let wrapper = document.createElement("div");
    wrapper.className = "tab_cont";
    wrapper.innerHTML = html.join('');

    let $wrapper = $(wrapper);

    $('.color_picker', $wrapper).mobileSpectrumColorPicker({
        //color: '#ff0000',
        props: rGlobalProperty,
        callback: function (id, val) {
            switch (id) {
              case "m_clrBack":
                rGlobalProperty.SetClrBack(val);
                break;
              case "m_clrText":
                rGlobalProperty.SetClrText(val);
                break;
              case "m_clrVertLine":
                rGlobalProperty.SetClrVertLine(val);
                break;
              case "m_clrHorzLine":
                rGlobalProperty.SetClrHorzLine(val);
                break;
              case "m_clrCrossLine":
                rGlobalProperty.SetClrCrossLine(val);
                break;
              default:
                return;
            }

            rChart.SetGlobalPropertyToChart();
        }
      })

    // 이벤트 연결
    $wrapper
    .find('.pop_input').on('keyup', function() {
        let strName = $(this).attr("name"),
            nValue = Number($(this).val());

        let nPrevValue = rGlobalProperty[strName];
        if (setGlobalProperty(strName, nValue) === false) {
            $(this).val(nPrevValue);
        }
    }).end()
    .find('[name=m_nShowLatestPriceType]').on('change', function () {
        $('[name=m_nPriceChangeRatioType]').prop("disabled", !$(this).is(":checked"));
    }).end()
    .find('[name=m_nShowLatestVolumeType]').on('change', function () {
        $('[name=m_nVolumeChangeRatioType]').prop('disabled', !$(this).is(":checked"));
    }).end()
    .find('[name=m_bShowIndicatorName]').on('change', function () {
        $('[name=m_bShowIndicatorParameter]').prop('disabled', !$(this).is(":checked"));
    }).end();

    // 이벤트 연결
    new ChartSettingEvent($wrapper)
        .lineType(setGlobalProperty)
        .toggleSwitch(setGlobalProperty)
        .iRadioButton(setGlobalProperty)
        .iCheckButton(setGlobalProperty);

    // GlobalProperty 값 변경
    function setGlobalProperty(label, value) {
        
        switch (label) {
            case "m_nRightMargin":
                if (rGlobalProperty.SetRightMargin(value) === false)
                    return false;
                break;
            case "m_nTopBottomMargin":
                if (rGlobalProperty.SetTopBottomMargin(value) === false)
                    return false;
                break;
            case "m_nShowLatestPriceType":
                rGlobalProperty.SetShowLatestPriceTypeForSetupHtml(value);
                break;
            case "m_nPriceChangeRatioType":
                rGlobalProperty.SetPriceChangeRatioTypeWithShowLatestPriceType(value);
                break;
            case "m_bInvertPriceYAxis":
                rGlobalProperty.SetInvertYScale(value);
                break;
            case "m_bLogPriceYAxis":
                rGlobalProperty.SetLogYScale(value);
                break;
            case "m_nShowLatestVolumeType":
                rGlobalProperty.SetShowLatestVolumeType(value);
                break;
            case "m_nVolumeChangeRatioType":
                rGlobalProperty.SetVolumeChangeRatioType(value);
                break;
            default:
                rGlobalProperty[label] = value;
                break;
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