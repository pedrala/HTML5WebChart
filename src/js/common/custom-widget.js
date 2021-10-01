import {
  PS_LINETYPE_GROUPS, PS_THICKNESS_GROUPS
} from '../chart/kfitsChart'
import t from './i18n'


/**
 * Spectrum (color-picker)
 * 참고URL: https://bgrins.github.io/spectrum/
 */
$.widget("custom.spectrumColorPicker", {
  options: {
    color: '#ffffff',
    props: null,
    param: 0,
    classname: '', // colorpicker 스타일 (picker_select, picker_select1)
    callback: null
  },
  _create: function () {
    const that = this;

    if (this.options.props) {
      this.options.color = this.options.props[this.element.attr('name')];
    }

    // 색상창 생성 및 color 셋팅
    this.element
      .spectrum({
        appendTo: '#setting_modal_bx', //
        //containerClassName: 'picker_container', // 선택창
        replacerClassName: this.options.classname ? this.options.classname : 'picker_select', // 결과창
        color: this.options.color,
        preferredFormat: "hex",
        showPaletteOnly: true, // palette 만 노출
        hideAfterPaletteSelect: true, // palette 선택시 자동 닫힘
        togglePaletteOnly: true,
        togglePaletteMoreText: t('chart.spectrum.more'), // 더보기
        togglePaletteLessText: t('chart.spectrum.less'), // 숨기기
        showInitial: true,
        showInput: true,
        showButtons: true,        
        chooseText: t('chart.spectrum.choose'), // 선택
        cancelText: t('chart.spectrum.cancel'), // 취소
        palette: [
          ['#eb1e1e', '#0e63ff', '#edad6d', '#f44a64', '#3699d2', '#4f6685'],
          ['#3a9ad6', '#688ba7', '#85ccc8', '#f0673b', '#ffd0cf', '#e36460'],
          ['#6e91ad', '#7da6f5', '#d6edf3', '#3e527a', '#3ba597', '#ffffff'],
          ['#000000', '#892008', '#ab611f', '#46603a', '#3e527a', '#503567']
        ],
        change: function (color) {
          // callback 함수 호출
          that.options.callback.call(
            this,
            that.element.attr('name'),
            color.toHexString(),
            that.options.param
          );
        }
      });
  },
  _destroy: function () {
    this.element.spectrum('destroy');
  }
});

/**
 * MTS 용 
 */
$.widget("custom.mobileSpectrumColorPicker", {
  options: {
    color: '#ffffff',
    props: null,
    param: 0,
    callback: null
  },
  _create: function () {
    const that = this;

    if (this.options.props) {
      this.options.color = this.options.props[this.element.attr('name')];
    }

    // 색상창 생성 및 color 셋팅
    this.element
      .spectrum({
        appendTo: '#popup_wrapper_mobile', //
        color: this.options.color,
        preferredFormat: "hex",
        hideAfterPaletteSelect: true, // palette 선택시 자동 닫힘
        clickoutFiresChange: true,
        showPalette: true, // palette 만 노출
        showInitial: true,
        showButtons: true,
        chooseText: t('chart.spectrum.choose'), // 선택
        cancelText: t('chart.spectrum.cancel'), // 취소
        palette: [
          ['#eb1e1e', '#0e63ff', '#edad6d', '#f44a64', '#3699d2'],
          ['#3a9ad6', '#688ba7', '#85ccc8', '#f0673b', '#ffd0cf'],
          ['#6e91ad', '#7da6f5', '#d6edf3', '#3e527a', '#3ba597'],
          ['#000000', '#892008', '#ab611f', '#46603a', '#3e527a']
        ],
        change: function (color) {
          // callback 함수 호출
          that.options.callback.call(
            this,
            that.element.attr('name'),
            color.toHexString(),
            that.options.param
          );
        },
        show: function () {
          $('#popup_wrapper_mobile').append('<div class="dim"></div>');
        },
        hide: function () {          
          $('#popup_wrapper_mobile > div.dim').remove();
        }
      });
  },
  _destroy: function () {
    this.element.spectrum('destroy');
  }
});

/**
 * 선 종류 선택
 * 참고URL: https://api.jqueryui.com/selectmenu/#method-instance
 */
$.widget("custom.linetypeselectmenu", $.ui.selectmenu, {
  options: {
    appendTo: '#setting_modal_bx',
    icons: {button: 'ui-icon-custom'},
    classes: {'ui-selectmenu-menu': 'linetype'},
    change: null, // 변경시 이벤트
    width: 80, // 가로너비 지정
    props: null, // 조회 및 저장이 이루어지는 obj
    param: 0,
    callback: null //
  },
  _create: function () {
    const that = this;

    let selected;
    if (this.options.props) {
      selected = this.options.props[this.element.attr('name')];
    }

    $.each(PS_LINETYPE_GROUPS, function (i, obj) {
      $('<option>', {
          'data-class': 'line_type0' + (obj.nValue + 1),
          value: obj.nValue
        }).html(function () {
          return $('<span>', {
            'class': 'blind',
            text: t(obj.strText)
          });
        })
        .prop('selected', obj.nValue == selected)
        .appendTo(that.element);
    });

    this.options.change = this.change;
    this._super(this.options);    
  },
  _renderButtonItem: function (item) {
    const buttonItem = $("<span>", {
      "class": "ui-icon " + item.element.attr("data-class")
    }).html(item.element.html());

    return buttonItem;
  },
  _renderItem: function (ul, item) {
    const li = $("<li>"),
      wrapper = $("<div>", {
        html: item.element.html()
      });

    if (item.disabled) {
      li.addClass("ui-state-disabled");
    }

    $("<span>", {
        style: item.element.attr("data-style"),
        "class": "ui-icon " + item.element.attr("data-class")
      })
      .appendTo(wrapper);

    return li.append(wrapper).appendTo(ul);
  },
  change: function (event, data) {
    const ref = $(this).linetypeselectmenu('instance');
    // callback 함수 호출
    ref.options.callback.call(
      this,
      ref.element.attr('name'),
      data.item.index,
      ref.options.param
    );
  }
});

/**
 * 선 두께 선택
 */
$.widget("custom.lineThicknessselectmenu", $.ui.selectmenu, {
  options: {
    appendTo: '#setting_modal_bx',
    icons: {button: 'ui-icon-custom'},
    classes: {'ui-selectmenu-menu': 'linethickness'},    
    change: null, // 변경시 이벤트
    width: 80, // 가로너비 지정
    props: null, // 조회 및 저장이 이루어지는 obj
    param: 0,
    callback: null //
  },
  _create: function () {
    const that = this;

    let selected;
    if (this.options.props) {
      selected = this.options.props[this.element.attr('name')];
    }

    $.each(PS_THICKNESS_GROUPS, function (i, obj) {
      $('<option>', {
          text: t(obj.strText),
          value: obj.nValue
        })
        .prop('selected', obj.nValue == selected)
        .appendTo(that.element);
    });

    this.options.change = this.change;
    this._super(this.options);
  },  
  change: function (event, data) {
    const ref = $(this).lineThicknessselectmenu('instance');
    // callback 함수 호출
    ref.options.callback.call(
      this,
      ref.element.attr('name'),
      data.item.value,
      ref.options.param
    );
  }
});

/**
 * 선종류/선두께 를 제외한 셀렉트메뉴
 */
$.widget("custom.optsselectmenu", {
  options: {
    width: 80, // 너비값
    shape: '', // 사용처에 따른 스타일
    opts: [], // option 태그 생성시 text 및 value 값
    param: -1,
    props: null, // global property 
    callback: null
  },
  _create: function () {
    const that = this;

    let selected;
    if (this.options.props) {      
      const idx = this.options.param,
        name = this.element.attr('name');
      if (idx > -1 && Array.isArray(this.options.props)) {
        selected = this.options.props[idx][name];
      } else {
        selected = this.options.props[name];
      }
    }
    
    $.each(this.options.opts, function (i, obj) {
      $('<option>', {
          text: t(obj.strText),
          value: obj.nValue
        })
        .prop('selected', obj.nValue == selected)
        .appendTo(that.element);
    });

    this.element.selectmenu({
      appendTo: '#setting_modal_bx',
      icons: {
        button: 'ui-icon-custom'
      },
      width: this.options.width,
      change: function (event, data) {
        // callback 함수 호출
        that.options.callback.call(
          this,
          that.element.attr('name'),
          data.item.value,
          that.options.param
        );
      }
    });

    switch (this.options.shape) {
      case 'bordernone': {
        this.element.selectmenu("option", "classes.ui-selectmenu-button", "ui-border-none");
        break;
      }
      case 'chartselect': {
        this.element.selectmenu("option", "classes.ui-selectmenu-button", "chart_select");
        break;
      }
      case 'marginright67': {
        this.element.selectmenu("option", "classes.ui-selectmenu-button", "mr67");
        break;
      }
      default:
        break;
    }
  }
});

/**
 * 체크박스
 */
$.widget("custom.checkbox", {
  options: {
    props: null, // 조회 및 저장이 이루어지는 obj
    callback: null //
  },
  _create: function() {
    const $icheck = $('<i>', {
      'class': 'check'
    });
    
    this.element
    .after($icheck)
    .prop('checked', () => {
      if (!this.options.props) return false;
      return this.options.props[this.element.attr('name')];
    });

    this._on($icheck, {
      click: "change"
    });
  },
  change: function() {
    // callback 함수 호출
    this.options.callback.call(
      this,
      this.element.attr('name'),
      !this.element.is(':checked')
    );
  }
})

/**
 * 카테고리 자동완성 위젯 설정
 * 참고URL: https://jqueryui.com/autocomplete/#categories
 */
$.widget("custom.catcomplete", $.ui.autocomplete, {
  _create: function () {
    this._super();
    this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
  },
  _renderMenu: function (ul, items) {
    let that = this,
      currentCategory = "";
    $.each(items, function (index, item) {
      // 카테고리 영역
      if (item.parent != currentCategory) {
        ul.append("<li class='ui-autocomplete-category'>" + item.parent + "</li>");
        currentCategory = item.parent;
      }
      that._renderItemData(ul, item);
    });
  },
  _renderItem: function (ul, item) {
    const that = this,
      $li = $('<li></li>');

    if (item.parent) {
      $li.attr("aria-label", item.parent + " : " + item.label);

      // 지표 검색에 입력한 부분이 굵게 표시됨
      const matcher = new RegExp(that.term, "giu");
      if (matcher.test(item.label)) {

        $li.append(() => {
          const $div = $('<div></div>'),
            res = item.label.match(matcher);
          res.filter((ele, idx) => {
            return res.indexOf(ele) === idx;
          }).forEach((ele, idx) => {
            $div.html(item.label.split(ele).join('<span class="highlight">' + ele + '</span>'));
          });

          return $div;
        });
      }
    }

    return $li.appendTo(ul);
  }
});

/**
 * context menu 생성
 * 참고URL: https://api.jqueryui.com/menu/
 */
$.widget("custom.contextmenu", $.ui.menu, {
  _create: function () {
    this._super();
  },
  _closeOnDocumentClick: function (e) {
    if ($('#context_menu', 'body').length) 
      $('#context_menu', 'body').remove();
    return false;
  }
});