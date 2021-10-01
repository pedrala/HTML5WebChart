export function ChartSettingEvent($elm) {
  this.$elm = $elm;
  return this;
}

// 수량 증감 버튼
ChartSettingEvent.prototype.quantity = function (callbackFn) {
  this.$elm.off('click', '.count_arrow a').on('click', '.count_arrow a', function (e) {
    e.preventDefault();

    const $inputField = $(this)
      .parent()
      .siblings('input');
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
    });
  return this;
};

// 라인 선택
ChartSettingEvent.prototype.lineType = function (callbackFn) {
  this.$elm.off('click', '.line_select_bx > button').on('click', '.line_select_bx > button', function () {
    const $self = $(this);
    const parentLi = $self.closest('li');
    const lineSelectBx = $self.closest('.line_select_bx');
    const lineBx = lineSelectBx.find('.line_bx').hide();

    if ($self.is(':last-child')) {
      lineBx.first().show();
    } else {
      $self.next().show();
    }

    const id = lineSelectBx.attr('id');
    const nValue = Number(lineSelectBx.find('button:visible').attr('value'));
    const nIdx = Number(parentLi.attr('data-idx'));

    if (callbackFn) callbackFn.call(lineSelectBx[0], id, nValue, nIdx);
  });
  return this;
};

// on/off 토글
ChartSettingEvent.prototype.toggleSwitch = function (callbackFn) {
  this.$elm.off('click', '.switch > input').on('click', '.switch > input', function () {
    const parentLi = $(this).closest('li');
    const name = $(this).attr('name');
    const bShow = $(this).is(':checked');

    const nIdx = Number(parentLi.attr('data-idx'));

    if (callbackFn) callbackFn.call(this, name, bShow, nIdx);
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
  this.$elm.find('.select_ui').selectUi({ callback: callbackFn });
  return this;
};
