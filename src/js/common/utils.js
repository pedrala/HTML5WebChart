import Indicators from '../../json/default-indicators.json';
import Tools from '../../json/analysis-tool.json';
import ChartTypes from '../../json/chart-type.json';

import t from './i18n';

export default {

  getIndicators: function () {
    return Object.keys(Indicators).filter((key) => {
      return Indicators[key].use;
    }).map((key) => {
      const indicator = Indicators[key];
      return {
        id: "", 
        label: t(indicator.m_strTitleLangKey),
        parent: t(indicator.m_strGroupTitleLangKey),
        type: indicator.type,
        name: indicator.m_strName
      }
    });
  },
  //
  getIndicator: function(strName) {
    return Indicators[strName];
  },
  // 그리기 도구
  getTools: function () {
    const result = [];
    Tools.filter(({use}) => {
      return use;
    }).forEach(({depth}) => {
      depth.forEach(({label, type}) => {
        result.push({
          text: t('chart.' + label),
          name: type
        });
      });
    });
    return result;
  },
  // 차트 유형
  getChartTypeList: function () {
    return ChartTypes.filter((type) => {
      return type.use;
    }).map(({label, type}) => {
      return {
        strText: label,
        nValue: type
      }
    });
  },
  // 주기
  getCycleName: function (cycle) {
    switch (String(cycle)) {
      case '1': return t('cycle.day');
      case '2': return t('cycle.week');
      case '3': return t('cycle.month');
      case '4': return t('cycle.year');
      case '5': return t('cycle.min');
      default: return '';
    }
  }
}

export function sprintf(d, num) { // sprintf 함수
  let str = "";
  for (let i = 0; i < d; i++) {
    str += "0";
  }
  str += num;

  return str.slice("-" + d);
}