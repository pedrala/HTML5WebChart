import i18next from 'i18next';
import jqueryI18next from 'jquery-i18next';
import Moment from 'moment';
import en from '../../i18n/en.json';
import kr from '../../i18n/kr.json';

/**
 * i18n 설정
 * @param lng
 * @returns {Promise<i18next.TFunction | never>}
 */
export function init(lng = 'kr') {
  return i18next.init({
    lng: lng.toLocaleLowerCase(),
    fallbackLng: 'kr',
    load: 'currentOnly',
    debug: true,
    resources: {
      en,
      kr,
    },
  }).then(() => {    
    const sLng = lng.toLowerCase();
    Moment.locale(sLng === 'kr' ? 'ko' : sLng);
    jqueryI18next.init(i18next, $);
  });
}

export function changeLng(lng) {
  const sLng = lng.toLowerCase();
  Moment.locale(sLng === 'kr' ? 'ko' : sLng);
  return i18next.changeLanguage(lng);
}

export function getLang() {
  return i18next.language;
}

const locales = {
  en: 'en-US',
  kr: 'ko-KR',
};

let localeOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
};

export function getLocaleDate(date, timeZone = 'Asia/Seoul', isShowTime) {
  if (isShowTime) {
    localeOptions = Object.assign({
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
  }
  localeOptions.timeZone = timeZone;
  return Intl.DateTimeFormat(locales[getLang()]).format(date, localeOptions);
}

export default function (...arg) {
  return i18next.t(arg);
}
