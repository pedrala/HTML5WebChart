import './js/common/selectui';

import CWebChart from './js/pc/CWebChart';
import CMobileWebChart from './js/mobile/CMobileWebChart';
import Tools from './json/analysis-tool.json';
import Indicators from './json/default-indicators.json';
import ChartTypes from './json/chart-type.json';

//-- jquery ui 설정
import 'webpack-jquery-ui/css';
import 'webpack-jquery-ui/tabs';
import 'webpack-jquery-ui/accordion';
import 'webpack-jquery-ui/autocomplete';
import 'webpack-jquery-ui/menu';
import 'webpack-jquery-ui/selectmenu'
import 'webpack-jquery-ui/draggable';
//--

//-- datetimepicker
import 'eonasdan-bootstrap-datetimepicker';
import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css';
//--

//-- jstree
import 'jstree/dist/jstree'
import 'jstree/dist/themes/default/style.css'

//-- perfect-scrollbar
import 'perfect-scrollbar/css/perfect-scrollbar.css'

//-- spectrum-colorpicker
import 'spectrum-colorpicker/spectrum';
import 'spectrum-colorpicker/spectrum.css';

//-- custom-widget
import './js/common/custom-widget'

//-- awesomefont 설정
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faSearch } from '@fortawesome/free-solid-svg-icons' // fas
library.add(faSearch)
dom.watch();
//--

//-- moment 설정
import moment from 'moment';
moment.updateLocale('ko', {
  longDateFormat: {
    LT: 'L HH:mm',
    L: 'YYYY/MM/DD',
  },
});
moment.updateLocale('en', {
  longDateFormat: {
    LT: 'L HH:mm',
  },
});
//--


// /* modal_chart.html 필요
export {
  CWebChart,
  CMobileWebChart,
  Tools,
  Indicators,
  ChartTypes
};

export {
  VERT_BLOCK_TYPE,
  CRQInfo,
  DRAW_CASE_TR,
  DRAW_CASE_RESIZE,
  DRAW_CASE_ADD_CHARTBLOCK,
  DRAW_CASE_REAL,
  PRICE_REAL_TYPE,
  DRAW_CASE_DEL_CHARTBLOCK,
  DRAW_CASE_SCROLL,
  TOOL_TYPE,
  LINE_TOOL,
  RECT_TOOL,
  CIRCLE_TOOL,
  VERT_LINE_TOOL,
  HOZR_LINE_TOOL,
  CROSS_LINE_TOOL,
  TRIANGLE_TOOL,
  TRISECT_LINE_TOOL,
  QUARTER_LINE_TOOL,
  FIBONACCI_FAN_TOOL,
  FIBONACCI_ARC_TOOL,
  FIBONACCI_RETRACE_TOOL,
  FIBONACCI_TIME_TOOL,
  DRAW_CASE_SET_GLOBAL_PROPERTY,
  PRICE_SUBGRAPH_CANDLE_TYPE,
  PRICE_SUBGRAPH_LINE_TYPE,
  PRICE_SUBGRAPH_BAR_TYPE,
  CYCLE_OPTIONS,
  PRICE_CHART_TYPE,
  HOGA_DEPTH_CHART_TYPE,
  TOTAL_SETUP_SAVE_TYPE,
  TOOL_SETUP_SAVE_TYPE,
}
from './js/chart/kfitsChart';
