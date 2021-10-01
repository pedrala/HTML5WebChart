import {
  COMPARE_TYPE_GROUPS,
  PRICE_TYPE_GROUPS,
  PS_LINETYPE_GROUPS,
  PS_THICKNESS_GROUPS,
  MV_TYPE_GROUPS,
} from '../chart/kfitsChart';
import t from '../common/i18n';

/**
 * 선택 checkbox html
 * @param isShow
 * @param label
 * @param name
 * @param value
 * @param type
 * @param isDisabled
 * @returns {string}
 */
export function getVisibleCheckbox(
  isShow = false,
  label = '',
  value = '',
  type = '',
  name = 'show',
  isDisabled = false,
) {
  const html = [];
  html.push('<label class="rdo_type">');
  html.push(`<input class="i_check" name="${name}" type="checkbox"
      ${value ? `value="${value}"` : ''}
      ${type ? `data-type="${type}"` : ''}`);
  if (isShow) {
    html.push(' checked');
  }
  if (isDisabled) {
    html.push(' disabled');
  }
  html.push('>');
  if (label) {
    html.push(`<span class="txt">${t(label)}</span>`);
  } else {
    html.push(`<span class="blind">${t('common.choose')}</span>`);
  }
  html.push('</label>');
  return html.join('');
}

/**
 * 선택 radio html
 * @param isShow
 * @param label
 * @param value
 * @param type
 * @param name
 * @param isDisabled
 * @returns {string}
 */
export function getVisibleRadio(
  isShow = false,
  label = '',
  value = '',
  type = '',
  name = 'show',
  isDisabled = false,
) {
  const html = [];
  html.push('<label class="rdo_type">');
  html.push(`<input class="i_radio" name="${name}" type="radio"
      ${value ? `value="${value}"` : ''}
      ${type ? `data-type="${type}"` : ''}`);
  if (isShow) {
    html.push(' checked');
  }
  if (isDisabled) {
    html.push(' disabled');
  }
  html.push('>');
  if (label) {
    html.push(`<span class="txt">${t(label)}</span>`);
  }
  html.push('</label>');
  return html.join('');
}

/**
 * 수량 input html
 * @param value
 * @param pattern
 * @param showButton
 * @returns {string}
 */
export function getQuantityInput(value = '', pattern = '[-?(\\d+\\.?\\d*)$|(\\d*\\.?\\d+)]', showButton = true) {
  const html = [];
  html.push('<div class="prd_count">');
  html.push(
    `<input class="cout_input" type="number" min="0" pattern="${pattern}" value="${value}"/>`,
  );
  if (showButton) {
    html.push('<span class="count_arrow">');
    html.push(
      '<a href="#plus" class="count_top"><span class="blind">수량증가</span></a>',
    );
    html.push(
      '<a href="#minus" class="count_btm"><span class="blind">수량감소</span></a>',
    );
    html.push('</span>');
  }
  html.push('</div>');
  return html.join('');
}

// --------------- OPTION 영역 S -----------------

/**
 * 라인 타입 option html
 * @param value
 * @returns {String}
 */
export function getLineTypeOptionHtml(value = PS_LINETYPE_GROUPS[0].nValue) {
  const html = [];
  PS_LINETYPE_GROUPS.forEach((obj) => {
    html.push(
      `<button class="line_bx line_type${`0${obj.nValue + 1}`.slice(
        -2,
      )}" value="${obj.nValue}"`,
    );
    if (value !== obj.nValue) {
      html.push(' style="display:none;"');
    } else {
      html.push(' style="display:inline-block;"');
    }
    html.push('>');
    html.push(`<span class="blind">${t(obj.strText)}</span>`);
    html.push('</button>');
  });
  return html.join('');
}

/**
 * 라인 픽셀 size option html
 * @param value
 * @returns {String}
 */
export function getNThicknessOptionHtml(value = PS_THICKNESS_GROUPS[0].nValue) {
  const html = [];
  PS_THICKNESS_GROUPS.forEach((obj) => {
    html.push(`<button class="line_bx" value="${obj.nValue}"`);
    if (value !== obj.nValue) {
      html.push(' style="display:none;"');
    } else {
      html.push(' style="display:inline-block;"');
    }
    html.push('>');
    html.push(`${t(obj.strText)}</button>`);
  });
  return html.join('');
}

/**
 * ON / OFF 토글 스위치
 * @param isChecked
 * @param value
 * @param name
 * @returns {String}
 */
export function getOnOffToggle(isChecked = false, value = '', name = '') {
  const html = [];
  html.push('<label class="switch">');
  html.push(`<input type="checkbox" name="${name}"
    ${value ? `value="${value}"` : ''}
    ${isChecked ? 'checked' : ''}>`);
  html.push('<span class="slider round"></span>');
  html.push('</label>');
  return html.join('');
}

/**
 * 버튼 선택형 html
 * @param value
 * @param option
 * @returns {string}
 */
export function getSelectButtonHtml(value, option) {
  const html = [];
  html.push(
    `<button class="select_tit">${
      t(option.find(obj => obj.nValue === value).strText)
    }</button>`,
  );
  html.push('<div class="select_lst">');
  html.push('<ul class="select">');
  option.forEach((obj) => {
    html.push(
      `<li><button class="data_button" value="${obj.nValue}">${t(obj.strText)}</button></li>`,
    );
  });
  html.push('</ul>');
  html.push('</div>');
  return html.join('');
}

/**
 * 이동평균 상위 기준 option html
 * @param value
 * @returns {string}
 */
export function getSubGraphPropertyInfoTypeOptionHtml(
  value = PRICE_TYPE_GROUPS[0].nValue,
) {
  return getSelectButtonHtml(value, PRICE_TYPE_GROUPS);
}

/**
 * 이동평균 하위 기준 option html
 * @param value
 * @returns {string}
 */
export function getSubGraphPropertyInfoSubTypeOptionHtml(
  value = MV_TYPE_GROUPS[0].nValue,
) {
  return getSelectButtonHtml(value, MV_TYPE_GROUPS);
}

/**
 * 비교 대상
 * @param value
 */
export function getLineBaseOptionHtml(value = COMPARE_TYPE_GROUPS[0].nValue) {
  return getSelectButtonHtml(value, COMPARE_TYPE_GROUPS);
}

// --------------- OPTION 영역 E -----------------
