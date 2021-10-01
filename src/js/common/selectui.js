$(() => {
  $.fn.selectUi = function (opts) {
    $.fn.selectUi.defaults = {
      showToTop: true, // list 위에서 보여질때 true, 디폴트는 아래도 나옴
      arrow: true, // 화살표 활성화 (css class on 으로 설정)
      duration: 200, // 슬라이드 속도 컨트롤
      listDuration: 200, // 리스트 항목 클릭 후 사라질 때 속도 컨트롤
      listItems: 7, // 리스트 항목의 보여줄 갯수 설정
      listWid: false, // 리스트 width 값이 클때 true로 설정 후 아래의 listWidVal 값으로 width 설정 (두가지 옵션은 셋트임)
      listWidVal: 200,
    };
    return this.each(function () {
      opts = $.extend({}, $.fn.selectUi.defaults, opts || {});
      const $self = $(this);
      const list = $self.find('.select_lst');

      function listHide(drt) {
        $self.find('.select_lst').slideUp(drt);
      }

      function rmClass() {
        if (opts.arrow) {
          $self.find('.select_tit').removeClass('on');
        }
      }

      $self.off('mouseleave').on('mouseleave', function () {
        $(this).find('.select_lst').stop().slideUp(100)
          .removeAttr('style');
        $(this).find('.select_tit').removeClass('on');
      })
        .off('click', '.select_tit')
        .on('click', '.select_tit', function () {
          const $list = $self.find('.select_lst');

          if ($self.find('.select_lst').is(':hidden')) {
            $list.slideDown(opts.duration);
            if (opts.arrow) {
              $(this).addClass('on');
            }
          } else {
            listHide(opts.duration);
            rmClass();
            $self.off('click', '.select_lst');
          }

          // 필요한 부분인지..?
          $('.chart_cont .time_select .select-items').addClass('select-hide');
          $('.chart_cont .time_select .select-selected')
            .removeClass('select-arrow-active');

          return false;
        })
        .off('click', '.select_lst li button.data_button')
        .on('click', '.select_lst li button.data_button', function () {
          const selectTit = $('.select_tit');
          const self = $(this);
          const $target = $self.find('.select_tit');
          const dataTxt = self.text();
          const bindVal = self.val();

          selectTit.attr('title', dataTxt);
          listHide(opts.listDuration);
          $target.html(self.html());
          rmClass();

          list.find('button.data_button').removeClass('active');
          $(this).addClass('active');

          // 즉시 적용
          const targetId = $target.attr('id');
          const param = $target.attr('param');

          if (opts.callback) {
            opts.callback.call($self[0], targetId, bindVal, param);
          }
        });

      if (opts.listWid) {
        list.css({
          width: opts.listWidVal,
        });
      }
    });
  };
}); // selectbox
