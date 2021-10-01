import {
  getVisibleCheckbox,
  getVisibleRadio
} from '../html-helper';

import {
  ChartSettingEvent,
} from '../event-handler';

import Moment from 'moment';
import t from '../../common/i18n';

import Tools from '../../../json/analysis-tool.json';
import {
  TOOL_TYPE
} from '../../chart/kfitsChart';

// 화면 구성 요소 (그리기 툴)
const toolLst = Tools.reduce((sum, {
  depth
}) => {
  return sum.concat(depth.filter((p) => {
    return p.use;
  }))
}, []);

let strFormat, orgFormat, beforeVal = true;

export default (rChart, rToolInfo) => {

  const cycle = rToolInfo.m_Cycle; // 주기
  strFormat = cycle === 5 ? 'LT' : 'L'; // 날짜 포맷
  orgFormat = cycle === 5 ? 'YYYYMMDDHHmm' : 'YYYYMMDD'; // 전달된 데이터 날짜 포맷  

  console.log('rToolInfo____%O', rToolInfo);

  // 선택한 툴로 필터링  
  const filtered = toolLst.filter(({
    type
  }) => TOOL_TYPE[type] === rToolInfo.m_nToolType)[0];

  if (!filtered) return;

  const html = [];
  html.push('<div class="setting_modal">');
  html.push('<div class="rgt_modal">');
  html.push('<div class="pop_title">');
  html.push(`<strong class="src_tit">${t('chart.' + filtered.label)}</strong>`);
  html.push('</div>');
  html.push('<div class="pop_cont">');
  
  // 초기화 시 새로 그려주는 영역
  html.push(getHtml(filtered.prop, rToolInfo));
  
  html.push('</div>');

  /* S:버튼 영역 */
  html.push('<div class="pop_btn_bx">');
  html.push(`<a href="#reset" class="btn_setting" >${t('chart.reset')}</a>`);
  html.push('<span class="rgt_btn">');
  html.push(`<a href="#cancel" class="btn_gray">${t('chart.cancelbtn')}</a>`);
  html.push(`<a href="#confirm" class="btn_blue">${t('chart.okbtn')}</a>`);
  html.push('</span>');
  html.push('</div>');
  html.push(`<a href="#close" class="btn_setting_close"><span class="blind">${t('chart.popupclose')}</span></a>`);
  /* E:버튼 영역 */

  html.push('</div>');
  html.push('</div>');

  const $html = $(html.join(''));

  setEvent();

  // 이벤트 연결
  $html
    // 초기화
    .on('click', '.pop_btn_bx > .btn_setting', function (e) {
      e.preventDefault();
      rToolInfo.InitToolInfo();

      const $popCont = $(this).closest('.pop_btn_bx').siblings('.pop_cont');
      $popCont.empty().append(getHtml(filtered.prop, rToolInfo));
      
      setEvent();
      rChart.SetSelectedToolPropertyInfo(rToolInfo, true);
    })
    // 확인
    .on('click', '.pop_btn_bx > .rgt_btn > .btn_blue', function (e) {      
      rChart.SaveNCloseModal(e, 1);
    })
    // 취소
    .on('click', '.pop_btn_bx > .rgt_btn > .btn_gray', function (e) {
      e.preventDefault();
      rChart.RollBackToolPropertyInfo();
      rChart.RemoveWrapper();
    })
    // 팝업닫기
    .on('click', '.btn_setting_close', function (e) {
      e.preventDefault();
      rChart.RemoveWrapper();
    });  

  new ChartSettingEvent($html)
    .iCheckButton(setPropertyInfo)
    .iRadioButton(setPropertyInfo);
  
  // PropertyInfo 값 변경
  function setPropertyInfo(label, value) {
    // 피보나치 계수
    if (label.startsWith('m_arrShowFiboLine-')) {

      // 전체 선택/해제
      changeShowAllFiboLine(rToolInfo);

      const index = Number(label.split('-')[1]);

      // 최소 1개 선택 유지
      if($('[name^=m_arrShowFiboLine]:checked').length !== 0) {        
        const rArrShowFiboLine = rToolInfo.m_arrShowFiboLine;
        rArrShowFiboLine[index] = value;
      } else {
        $(`[name^=m_arrShowFiboLine]:eq(${index})`).prop('checked', true);
      }

      // 수열방식 0,1,1,2,3,5 의 경우 추가되는 1의 상태값을 저장
      if ($('[name=m_nFiboType]:checked').val() === '1' && index === 2) {
        beforeVal = value;
      }
    }
    // 그 외
    else {

      // 전체 선택
      if (label === 'm_bShowAllFiboLine') {
        const rArrShowFiboLine = rToolInfo.m_arrShowFiboLine;
        rArrShowFiboLine.forEach((v, i, arr) => {

          // 최소 1개 선택
          if (!value && i === 0) {
            arr[0] = true;
            $('[name^=m_arrShowFiboLine]:eq(0)').prop('checked', true);
          } else {
            arr[i] = value;
            $(`[name^=m_arrShowFiboLine]:eq(${i})`).prop('checked', value);
          }
        });
      }

      // 수열방식 변경
      else if (label === 'm_nFiboType') {

        const rArrFiboValue = rToolInfo.m_arrFiboValue;
        const rArrShowFiboLine = rToolInfo.m_arrShowFiboLine;

        switch (value) {
          case 0:
            rArrFiboValue.splice(2, 1);
            rArrShowFiboLine.splice(2, 1);
            break;
          case 1:
            rArrFiboValue.splice(2, 0, 1);
            rArrShowFiboLine.splice(2, 0, beforeVal);
            break;
        }        

        // 새로 그리기
        $('#fibo_lst').html(getFibonacciHtml(rToolInfo));

        // 전체 선택/해제
        changeShowAllFiboLine(rToolInfo);
      }

      // 선 종류/ 두께
      else if (label === 'm_nToolLineType' || label === 'm_nThickness') {
        value = Number(value);
      }

      rToolInfo[label] = value;
    }
    
    rChart.SetSelectedToolPropertyInfo(rToolInfo, true);
  }

  // 이벤트 연결
  function setEvent() {
    console.log('setEvent()_____');
    // 색상 변경    
    $('.color_picker', $html).spectrumColorPicker({
      props: rToolInfo,
      callback: setPropertyInfo
    });

    // 선 종류
    $('.lineTypeSelect', $html).linetypeselectmenu({
      props: rToolInfo,
      callback: setPropertyInfo
    });

    // 선 두께
    $('.lineThicknessSelect', $html).lineThicknessselectmenu({
      props: rToolInfo,
        callback: setPropertyInfo
    });

    $html
      .find('.input-group.date').datetimepicker({
        locale: Moment.locale(),
        ignoreReadonly: true,
        format: strFormat
      })
      .on('dp.change', function handler(e) {
        const strName = $(this).find('input').attr('name');
        const nValue = Moment(e.date).format(orgFormat);

        setPropertyInfo(strName, nValue);
      }).end()
      .find('.input-group.price > input')
      .on('focusout', function () {
        const strName = $(this).attr('name');
        const nValue = $(this).val();

        setPropertyInfo(strName, nValue);
      }).end();
  }
  
  $html.localize();

  $('.rgt_modal', $html).draggable({
    handle: '.pop_title',
    drag: function (event, ui) {
      // colorpicker도 같이 이동      
      $('.color_picker', ui.helper).spectrum('reflow');
    }
  });

  return $html;
};

// 반복되는 화면 구성 요소
function getHtml({
  start,
  end,
  extend,
  style,
  text,
  sequence,
  coefficient
}, rToolInfo) {

  const rToolType = rToolInfo.m_nToolType;
  // 수평선, 수직선 일 경우 
  const widthClazz = (rToolType === 3 || rToolType === 4) ? 'small' : '';

  const contHtml = [];
  contHtml.push(`<ul class="modal_form_lst ${widthClazz}">`);

  // 시작
  if (start) {
    let name, localeDate;
    start.forEach((item, i) => {
      const liClazz = i > 0 ? 'lst_li' : '';
      contHtml.push(`<li class="${liClazz}">`);

      switch (item) {
        case 'date':
          name = 'm_strStartDateTime';
          // 수직선, 피보나치 시간대 일 경우
          if (rToolType === 3 || rToolType === 12) {
            name = 'm_strEndDateTime';
          }
          localeDate = Moment(rToolInfo[name], orgFormat);
          contHtml.push(
            getCalendarInputHtml('chart.startdate', localeDate.format(strFormat) || 0, name)
          );
          break;
        case 'price':
          contHtml.push(
            getVisibleInput('chart.price', rToolInfo['m_strStartValue'] || 0, 'm_strStartValue', 'input_rgt'),
          );
          break;
      }

      contHtml.push('</li>');
    });
  }

  // 종료
  if (end) {
    let localeDate;
    end.forEach((item, i) => {
      const liClazz = i > 0 ? 'lst_li' : '';
      contHtml.push(`<li class="${liClazz}">`);

      switch (item) {
        case 'date':
          localeDate = Moment(rToolInfo['m_strEndDateTime'], orgFormat);
          contHtml.push(
            getCalendarInputHtml('chart.enddate', localeDate.format(strFormat) || 0, 'm_strEndDateTime')
          );
          break;
        case 'price':
          contHtml.push(
            getVisibleInput('chart.price', rToolInfo['m_strEndValue'] || 0, 'm_strEndValue', 'input_rgt'),
          );
          break;
      }

      contHtml.push('</li>');
    });
  }
  
  // 확장
  if (extend) {
    contHtml.push('<li class="full_lst">');
    contHtml.push('<div class="ctm_bx">');

    extend.forEach(item => {
      let label, name;
      switch (item) {
        case 'left':
          name = 'm_bExpandLeft';
          label = 'chart.extendleft';
          break;
        case 'right':
          name = 'm_bExpandRight';
          label = 'chart.extendright';
          break;
        case 'log':
          name = 'm_bLog';
          label = 'chart.applylogs';
          break;
        case 'section':
          name = 'm_bUsePriceRange';
          label = 'chart.pricerange';
          break;
      }
      contHtml.push(
        getVisibleCheckbox(
          rToolInfo[name], t(label), true, 'boolean', name,
        ),
      );
    });

    contHtml.push('</div>');
    contHtml.push('</li>');
  }

  // 선스타일
  if (style) {
    contHtml.push('<li class="full_lst">');
    contHtml.push(`<strong class="tit">${t('chart.style')}</strong>`);
    contHtml.push('<div class="cont_lst">');

    contHtml.push('<fieldset class="select_ui">');
    contHtml.push('<input type="text" class="color_picker" name="m_clrTool">');
    contHtml.push('<select name="m_nToolLineType" class="lineTypeSelect"></select>');
    contHtml.push('<select name="m_nThickness" class="lineThicknessSelect"></select>');
    contHtml.push('</fieldset>');

    contHtml.push('</div>');
    contHtml.push('</li>');
  }

  // 텍스트
  if (text) {
    contHtml.push('<li class="form_lst">');
    contHtml.push(`<strong class="tit">${t('chart.text')}</strong>`);
    contHtml.push('<div class="cont_lst">');

    text.forEach(item => {
      let label, name;
      switch (item) {
        case 'left':
          name = 'm_bShowLeftText';
          label = 'chart.left';
          break;
        case 'right':
          name = 'm_bShowRightText';
          label = 'chart.right';
          break;
        case 'top':
          name = 'm_bShowTopText';
          label = 'chart.top';
          break;
        case 'bottom':
          name = 'm_bShowBottomText';
          label = 'chart.bottom';
          break;
        case 'show':
          name = 'm_bShowLeftText';
          label = 'chart.show';
          break;
      }
      contHtml.push(
        getVisibleCheckbox(
          rToolInfo[name], t(label), true, 'boolean', name,
        ),
      );
    });

    contHtml.push('</div>');
    contHtml.push('</li>');
  }

  // 수열방식
  if (sequence) {
    contHtml.push('<li class="form_lst">');
    contHtml.push(`<strong class="tit">${t('chart.sequence')}</strong>`);
    contHtml.push('<div class="cont_lst">');

    sequence.forEach(type => {
      let label;
      switch (type) {
        case 0:
          label = '0,1,2,3,5…';
          break;
        case 1:
          label = '0,1,1,2,3,5…';
          break;
      }
      contHtml.push(
        getVisibleRadio(
          rToolInfo['m_nFiboType'] === type, label, type, 'Number', 'm_nFiboType',
        ),
      );
    });

    contHtml.push('</div>');
    contHtml.push('</li>');
  }

  // 피보나치 계수
  if (coefficient) {
    contHtml.push('<li class="check_form_lst">');
    contHtml.push(`<strong class="tit">${t('chart.coefficient')}</strong>`);
    contHtml.push('<div class="cont_lst">');
    contHtml.push('<ul class="check_lst" id="fibo_lst">');    

    contHtml.push(getFibonacciHtml(rToolInfo));

    contHtml.push('</ul>');
    contHtml.push('</div>');
    contHtml.push('</li>');
  }

  contHtml.push('</ul>');

  return contHtml.join('');
}

function getCalendarInputHtml(label = '', value = '', name = '', clazz = '') {
  const html = [];
  html.push(`<label class="tit">${t(label)}</label>`);
  html.push('<div class="input-group date">');
  html.push(`<input type="text" class="form-control input_type ${clazz}" name="${name}" value="${value}" readonly/>`);
  html.push('<span class="input-group-addon">');
  html.push('<span class="glyphicon glyphicon-calendar"></span>');
  html.push('</span>');
  html.push('</div>');

  return html.join('');
}

function getVisibleInput(label = '', value = '', name = '', clazz = '') {
  const html = [];
  html.push(`<label class="tit">${t(label)}</label>`);
  html.push('<div class="input-group price">');
  html.push(`<input type="text" class="form-control input_type ${clazz}" name="${name}" value="${value}" autocomplete="off"/>`);
  html.push('</div>');

  return html.join('');
}

// 피보나치 툴
function getFibonacciHtml(rToolInfo) {  
  
  const html = [];
  html.push('<li class="full_li">');
  html.push('<label class="form_label">');
  html.push(`<input class="i_check" type="checkbox" name="m_bShowAllFiboLine" ${rToolInfo.m_bShowAllFiboLine ? 'checked' : ''}>`);
  html.push('<i class="check"></i><span class="txt">ALL</span>');
  html.push('</label>');
  html.push('</li>');

  const rArrFiboValue = rToolInfo.m_arrFiboValue;
  const rArrShowFiboLine = rToolInfo.m_arrShowFiboLine;

  rArrFiboValue.forEach((value, i) => {
    html.push('<li>');
    html.push(
      getVisibleCheckbox(
        rArrShowFiboLine[i], String(value), true, 'Boolean', `m_arrShowFiboLine-${i}`,
      ),
    );
    html.push('</li>');
  });
  return html.join('');
}

function changeShowAllFiboLine(rToolInfo) {
  // 전체 선택/해제
  $('[name=m_bShowAllFiboLine]').prop('checked', function () {
    return $('[name^=m_arrShowFiboLine]').length === $('[name^=m_arrShowFiboLine]:checked').length;
  });

  // 전체 선택 값
  const bChecked = $('[name=m_bShowAllFiboLine]').prop('checked');
  rToolInfo['m_bShowAllFiboLine'] = bChecked;
}

// 피보나치 수열
const fibonacci_series = (n) => {
  if (n === 1) {
    return [0, 1];
  } else {
    const s = fibonacci_series(n - 1);
    s.push(s[s.length - 1] + s[s.length - 2]);
    return s;
  }
};

// 중복제거
/**
 * @param {Number} n : 수열 갯수
 * @param {Number} t : 타입(0:중복제거, 1:중복허용)
 */
function dedupFibonacci(n, t) {
  switch (t) {
    case 0:
      return fibonacci_series(n).filter((item, idx, array) => array.indexOf(item) === idx);
    case 1:
      return fibonacci_series(n);
  }
}
