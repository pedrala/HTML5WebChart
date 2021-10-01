import description from '../../json/indicators-description.json'
import t from '../common/i18n';

// --------------- 하위 TAB 영역 S -----------------

/**
 * 기준선설정 tab list row html
 * @param val
 * @returns {string}
 */
export function getBaseLineHtml(val) {
  return `<li><a href="#" class="lst_lnk">${val}</a></li>`;
}

/**
 * 기준선설정 tab html
 * @param data
 * @returns {string}
 */
export function getBaseLinesHtml(data = []) {
  if (!data.length) return '';

  const html = [];
  for (let i = 0, size = data.length; i < size; i++) {
    html.push(getBaseLineHtml(data[i].m_dBaseValue));
  }
  return html.join('');
}

/**
 * 설명 tab html
 * @param type
 * @returns {string}
 */
export function getDescriptionHtml(type) {
  const html = [];
  const data = description[type];
  for (let i = 0, size = data.length; i < size; i++) {
    const descInfo = data[i];
    html.push('<li>');
    html.push(`<strong class="info_src_tit">${t(descInfo.title)}</strong>`);
    html.push(`  <p class="info_src_txt">${t(descInfo.content)}</p>`);
    html.push('</li>');
  }
  return html.join('');
}

// --------------- 하위 TAB 영역 E -----------------

/**
 * 선택 radio html
 * @param isChecked
 * @param label
 * @param value
 * @param type
 * @param name
 * @param isDisabled
 * @returns {string}
 */
export function getVisibleRadio(
  isChecked = false,
  label = '',
  value = '',
  type = '',
  name = 'show',
  isDisabled = false,
) {
  const html = [];
  html.push('<label class="form_label">');
  html.push(`<input class="i_radio" name="${name}" type="radio"
      ${value !== '' ? `value="${value}"` : ''}
      ${type ? `data-type="${type}"` : ''}`);
  if (isChecked) {
    html.push(' checked');
  }
  if (isDisabled) {
    html.push(' disabled');
  }
  html.push('>');
  html.push('    <i class="rdo"></i>');
  if (label) {
    html.push(`<span class="txt">${label}</span>`);
  }
  html.push('</label>');
  return html.join('');
}

/**
 * 선택 checkbox html
 * @param isShow
 * @param label
 * @param value
 * @param type
 * @param name
 * @param isDisabled
 * @param clazz
 * @returns {string}
 */
export function getVisibleCheckbox(
  isShow = false,
  label = '',
  value = '',
  type = '',
  name = 'show',
  isDisabled = false,
  clazz = '',
) {
  const html = [];
  html.push(`<label class="form_label ${clazz}">`);
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
  html.push('    <i class="check"></i>');
  if (label) {
    html.push(`<span class="txt">${label}</span>`);
  }
  html.push('</label>');
  return html.join('');
}

/**
 * 수량 input html
 * @param value
 * @param name
 * @param showButton
 * @returns {string}
 */
export function getQuantityInput(value = '', name = '', showButton = true) {
  const html = [];
  html.push('<div class="prd_count">');
  html.push(
    `<input class="cout_input" type="text" value="${value}" name="${name}" oninput="this.value = this.value.replace(/[^-?(\\d+\\.?\\d*)$|(\\d*\\.?\\d+)]/g, '').replace(/(\\..*)\\./g, '$1');" />`,
  );
  if (showButton) {
    html.push('<span class="count_arrow">');

    html.push(
      '<a href="#" class="count_top"><span class="blind"></span></a>',
    );
    html.push(
      '<a href="#" class="count_btm"><span class="blind"></span></a>',
    );
    html.push('</span>');
  }
  html.push('</div>');
  return html.join('');
}

// --------------- OPTION 영역 S -----------------

const TOGGLE_ON_OFF_TYPES = [
  { label: 'chart.off', value: false },
  { label: 'chart.on', value: true },
];

/**
 * ON/OFF 토글 스위치
 * @param value
 * @param name
 * @param param (부가정보저장용도-필요할 때 추가적인 정보로 사용하기 위함)
 * @return {String}
 */
export function getOnOffToggle(
  value = TOGGLE_ON_OFF_TYPES[0].value,
  name,
  param = undefined,
) {
  const html = [];
  TOGGLE_ON_OFF_TYPES.forEach((obj) => {
    html.push(`<label class="${obj.value === value ? 'active' : ''}">`);
    html.push(
      `<span class="txt">${t(
        obj.label,
      )}</span><input class="check_rdo" value="${
        obj.value
      }" name="${name}" type="radio" ${obj.value === value
        ? 'checked'
        : ''} ${
        param !== undefined ? `param="${param}"` : ''
      } />`,
    );
    html.push('</label>');
  });
  return html.join('');
}

// --------------- OPTION 영역 E -----------------
