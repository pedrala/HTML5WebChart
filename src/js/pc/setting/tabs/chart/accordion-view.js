import PerfectScrollbar from 'perfect-scrollbar'

export default {
  /**
   * jQuery UI Autocomplete 위젯 적용
   * 참고URL: https: //jqueryui.com/autocomplete/#categories
   * @param {Object} $baseHtml
   * @param {Object} indicators 
   */
  catcomplete: function ($baseHtml, indicators) {
    const $indi_grp_view = $('.indi_grp_view', $baseHtml);    
    const $accordion_area = $('.accordion_area', $indi_grp_view);
    const $move_btn_area = $('.move_btn_area', $baseHtml);    

    // 지표검색 INPUT에 FOCUS 이동 시 autocomplate ui 적용
    $('.input_inner', $indi_grp_view).on({
      focus: function () {
        $(this).catcomplete({
          appendTo: '#catcomplete',
          delay: 0,
          source: indicators,
          create: function (event, ui) {
            const appendTo = $(this).catcomplete('option', 'appendTo');
            const $target = $('.ui-autocomplete', appendTo);            
            this.ps = new PerfectScrollbar($target[0], {
              suppressScrollX: true
            });
          },
          // 해당 아코디언 영역 펼치고 해당 지표 선택, 트리영역에 해당 지표 추가
          select: function (event, ui) {
            const $accordion_content = $('div.ui-accordion-content', $accordion_area),
              nOffsetHeight = $accordion_area[0].offsetHeight,
              nScrollHeight = $accordion_area[0].scrollHeight;
            
            // 아코디언 영역 내 지표 목록
            $('li', $accordion_area)
              .removeClass('active')
              .each((i, li) => {
                const $li = $(li);
                if (ui.item.name === $li.data('name')) {
                  $li.addClass('active');
                  const idx = $accordion_content.index($li.closest('div.ui-accordion-content'));
                  $accordion_area
                    // 선택한 지표가 포함된 그룹 펼침
                    .accordion('option', 'active', idx)
                    // 스크롤 이동
                    .scrollTop(nOffsetHeight - (nScrollHeight - $li.offset().top));
                  return false;
                }
              });

            // 지표 추가
            $('button#btnAdd', $move_btn_area).trigger('click');
          }
        });
      }
    });
  },
  /**
   * jQuery UI Accordion 위젯 적용
   * 참고 URL: https: //jqueryui.com/accordion/
   * @param {Object} $baseHtml 
   * @param {Object} indicators 
   */
  accordion: function ($baseHtml, indicators) {
    const $accordion_area = $('.accordion_area', $baseHtml);
    const $move_btn_area = $('.move_btn_area', $baseHtml);

    // 아코디언 영역 section 생성
    $accordion_area.append(() => {
        indicators.forEach((item) => {
          const parentId = item.parent || '-';

          if ($('#' + parentId, $accordion_area).length === 0) {
            $('' +
                '<h3>' + item.parent + '</h3>' +
                '<div>' +
                `<ul id='${parentId}'></ul>` +
                '</div>' +
                '')
              .appendTo($accordion_area);
          }

          if (parentId) {
            $('#' + parentId, $accordion_area).append(`<li data-name='${item.name}'>${item.label}</li>`);
          }
        })
      })
      // 아코디언 UI 적용
      .accordion({
        animate: 0,
        collapsible: true,
        heightStyle: 'content',
        icons: {
          'header': 'ui-icon-triangle-1-s',
          'activeHeader': 'ui-icon-triangle-1-n'
        },
        create: function (event, ui) {
          const target = event.target;
          ui.ps = new PerfectScrollbar(target, {
            suppressScrollX: true
          });
        }
      })
      // 지표 목록 스타일 지정
      .find('li')
      .on({
        mouseenter: function () {
          $(this).addClass('inside');
        },
        mouseleave: function () {
          $(this).removeClass('inside');
        },
        click: function () {
          $('li', $accordion_area).removeClass('active');
          $(this).addClass('active');
        },
        dblclick: function () {
          $('button#btnAdd', $move_btn_area).trigger('click');
        }
      });
  }
}