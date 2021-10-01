import t from '../../common/i18n';

export default {

  Create: function (rChart) {

    if ($(".chart_nav_grp").length > 0) {
      return false;
    }

    const html = [];
    html.push('<ul class="btn_char_nav">');
    html.push('<li class="btn_lft"><a href="#left">좌측</a></li>');
    html.push('<li class="btn_minus"><a href="#scaledown">축소</a></li>');
    html.push('<li class="btn_reset"><a href="#reset">초기화</a></li>');
    html.push('<li class="btn_big"><a href="#scaleup">확대</a></li>');
    html.push('<li class="btn_rgt"><a href="#right">우측</a></li>');
    html.push('</ul>');

    const m_ChartNavWrapper = document.createElement('div');
    m_ChartNavWrapper.classList.add('chart_nav_grp', rChart.m_strThemeName);
    m_ChartNavWrapper.innerHTML = html.join('');

    const m_ChartWrapper = document.getElementById(rChart.m_DrawingInfo.m_rChartParentDIV.id);
    m_ChartWrapper.appendChild(m_ChartNavWrapper);

    // 차트 네비
    $(m_ChartWrapper)
      .on('mouseover', function () {
        $(".btn_char_nav").stop().fadeIn();
      })
      .on('mouseout', function () {
        $(".btn_char_nav").stop().fadeOut();
      })
      .on('mouseover', 'a', function () {
        $(this).closest('.btn_char_nav').addClass('over');
      })
      .on('mouseout', 'a', function () {
        $(this).closest('.btn_char_nav').removeClass('over');
      })
      // 좌측
      .on('click', '.btn_lft > a', function (e) {
        e.preventDefault();
      })
      // 축소
      .on('click', '.btn_minus > a', function (e) {
        e.preventDefault();
        rChart.ZoomOut(10);
      })
      // 초기화
      .on('click', '.btn_reset > a', function (e) {
        e.preventDefault();
      })
      // 확대
      .on('click', '.btn_big > a', function (e) {
        e.preventDefault();
        rChart.ZoomIn(10);
      })
      // 우측
      .on('click', '.btn_rgt > a', function (e) {
        e.preventDefault();
      });
  },

  Show: function () {
    $(".btn_char_nav").stop().fadeIn();
  },

  Hide: function () {
    $(".btn_char_nav").stop().fadeOut();
  },

  Destory: function () {
    if ($(".chart_nav_grp").length > 0) {
      $(".chart_nav_grp").remove();
    }
  }
}