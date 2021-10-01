import { getBaseLineHtml } from './html-helper';

export function ChartSettingEvent($elm) {
  this.$elm = $elm;
  return this;
}

// 수량 증감 버튼
ChartSettingEvent.prototype.quantity = function (callbackFn) {
  this.$elm.off('click', '.count_arrow a').on('click', '.count_arrow a', function (e) {
    e.preventDefault();

    const $inputField = $(this).parent().siblings('input');
    const hasDecimals = $inputField.val().indexOf('.') !== -1;
    let nCnt = parseFloat($inputField.val() || 0);

    if ($(this).hasClass('count_top')) {
      if (hasDecimals) {
        nCnt += 0.01;
        nCnt = nCnt.toFixed(2);
      } else {
        nCnt += 1;
      }
    } else if (nCnt > 0) {
      if (hasDecimals) {
        nCnt -= 0.01;
        nCnt = nCnt.toFixed(2);
      } else {
        nCnt -= 1;
      }
    }

    $inputField.val(nCnt);
    if (callbackFn) callbackFn.call($inputField[0]);
  })
    .off('focusout', 'input.cout_input')
    .on('focusout', 'input.cout_input', function () {
      if (callbackFn) callbackFn.call(this);
    })
    .off('keydown', 'input.cout_input')
    .on('keydown', 'input.cout_input', function (e) {
      if (e.keyCode === 13) {
        if (callbackFn) callbackFn.call(this);
      }
    });
  return this;
};

// 지표목록 추가/삭제
ChartSettingEvent.prototype.baseLineAddRemove = function (callbackFn) {
  const $self = this.$elm;
  const $lineFormLft = $self.find('.line_form_lft');
  const $prdCount = $lineFormLft.find('.prd_count');
  const $formSrcLst = $lineFormLft.find('.form_src_lst');

  $self.off('click', '.form_btn_bx a').on('click', '.form_btn_bx a', function (e) {
    e.preventDefault();

    const inputField = $prdCount.find('input');
    const rowArray = $formSrcLst.find('a');
    if (e.target.id === 'btn_add') {
      let isAddable = true;
      rowArray.each((idx, obj) => {
        if ($(obj).text() === inputField.val()) {
          isAddable = false;
          return false;
        }
        return true;
      });
      if (isAddable) {
        const baselineHtml = getBaseLineHtml(inputField.val());

        $(baselineHtml).appendTo($formSrcLst.find('ul'));
      }
    } else if (e.target.id === 'btn_delete') {
      rowArray.each((idx, obj) => {
        if ($(obj).text() === inputField.val()) {
          $(obj).remove();
          return false;
        }
        return true;
      });
    } else if (e.target.id === 'btn_delete_all') {
      $formSrcLst.find('ul').empty();
    }
    if (callbackFn) callbackFn.call(this);
  });
  return this;
};

// on/off 토글
ChartSettingEvent.prototype.toggleSwitch = function (callbackFn) {
  this.$elm.off('change', '.rdo_check label').on('change', '.rdo_check label', function () {
    $(this).siblings().removeClass('active').end().addClass('active');    
    const inputTag = $(this).find('input');
    const strName = inputTag.attr('name');
    const strParam = inputTag.attr('param');
    const bShow = inputTag.val() === 'true';

    if (callbackFn) callbackFn.call(this, strName, bShow, Number(strParam));
  });
  return this;
};

// 라디오 버튼
ChartSettingEvent.prototype.iRadioButton = function (callbackFn) {
  this.$elm.off('change', '.i_radio').on('change', '.i_radio', function () {
    const strName = $(this).attr('name');
    const type = $(this).attr('data-type');
    let value = $(this).val();

    if (type === 'Number') value = Number(value);

    if (callbackFn) callbackFn.call(this, strName, value);
  });
  return this;
};

// 체크박스
ChartSettingEvent.prototype.iCheckButton = function (callbackFn) {
  this.$elm.off('click', '.i_check').on('click', '.i_check', function () {
    const strName = $(this).attr('name');
    const isChecked = $(this).is(':checked');
    const type = $(this).attr('data-type');
    let value = $(this).val();

    if (type === 'Number') {
      value = Number(isChecked);
    } else {
      value = isChecked;
    }

    if (callbackFn) callbackFn.call(this, strName, value);
  });
  return this;
};

// select click
ChartSettingEvent.prototype.select = function (callbackFn) {
  this.$elm.find('.select_ui').selectUi({
    callback: callbackFn,
  });
  return this;
};
