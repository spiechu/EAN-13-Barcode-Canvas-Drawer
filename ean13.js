/*
This file is part of the EAN-13 Barcode Canvas Drawer package.

(c) Dawid Spiechowicz <spiechu@gmail.com>

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.
*/

var EAN13CanvasDrawer, EAN13Generator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

EAN13Generator = (function() {

  EAN13Generator.name = 'EAN13Generator';

  EAN13Generator.START_SENTINEL = '101';

  EAN13Generator.CENTRAL_SENTINEL = '01010';

  EAN13Generator.END_SENTINEL = '101';

  EAN13Generator.EAN_13_CODE_TABLE = {
    0: {
      left: {
        odd: '0001101',
        even: '0100111'
      },
      right: '1110010'
    },
    1: {
      left: {
        odd: '0011001',
        even: '0110011'
      },
      right: '1100110'
    },
    2: {
      left: {
        odd: '0010011',
        even: '0011011'
      },
      right: '1101100'
    },
    3: {
      left: {
        odd: '0111101',
        even: '0100001'
      },
      right: '1000010'
    },
    4: {
      left: {
        odd: '0100011',
        even: '0011101'
      },
      right: '1011100'
    },
    5: {
      left: {
        odd: '0110001',
        even: '0111001'
      },
      right: '1001110'
    },
    6: {
      left: {
        odd: '0101111',
        even: '0000101'
      },
      right: '1010000'
    },
    7: {
      left: {
        odd: '0111011',
        even: '0010001'
      },
      right: '1000100'
    },
    8: {
      left: {
        odd: '0110111',
        even: '0001001'
      },
      right: '1001000'
    },
    9: {
      left: {
        odd: '0001011',
        even: '0010111'
      },
      right: '1110100'
    }
  };

  EAN13Generator.LEFT_SIDE_CODING = {
    0: ['odd', 'odd', 'odd', 'odd', 'odd', 'odd'],
    1: ['odd', 'odd', 'even', 'odd', 'even', 'even'],
    2: ['odd', 'odd', 'even', 'even', 'odd', 'even'],
    3: ['odd', 'odd', 'even', 'even', 'even', 'odd'],
    4: ['odd', 'even', 'odd', 'odd', 'even', 'even'],
    5: ['odd', 'even', 'even', 'odd', 'odd', 'even'],
    6: ['odd', 'even', 'even', 'even', 'odd', 'odd'],
    7: ['odd', 'even', 'odd', 'even', 'odd', 'even'],
    8: ['odd', 'even', 'odd', 'even', 'even', 'odd'],
    9: ['odd', 'even', 'even', 'odd', 'even', 'odd']
  };

  function EAN13Generator(eanString) {
    var checkDigit;
    try {
      if (!(eanString != null)) {
        throw new Error('You need to provide some string');
      }
      if (typeof eanString === !'string') {
        throw new Error('eanString is not string');
      }
      if (eanString.length !== 12) {
        throw new Error('You need to provide exact 12 digits');
      }
      this.eanArray = eanString.split('');
      checkDigit = this.computeControlSum();
      this.eanArray.push(String(checkDigit));
    } catch (error) {
      alert(error.message);
    }
  }

  EAN13Generator.prototype.computeControlSum = function() {
    var controlSum, key, sum, value, _i, _len, _ref;
    sum = 0;
    _ref = this.eanArray;
    for (key = _i = 0, _len = _ref.length; _i < _len; key = ++_i) {
      value = _ref[key];
      sum += (key % 2 ? 3 : 1) * value;
    }
    controlSum = 10 - sum % 10;
    if (controlSum === 10) {
      controlSum = 0;
    }
    return controlSum;
  };

  EAN13Generator.prototype.generateEANcode = function() {
    var codingStyle, eanCode, i, _i, _j;
    codingStyle = EAN13Generator.LEFT_SIDE_CODING[this.eanArray[0]];
    eanCode = EAN13Generator.START_SENTINEL;
    for (i = _i = 1; _i <= 6; i = ++_i) {
      if (codingStyle[i - 1] === 'odd') {
        eanCode += EAN13Generator.EAN_13_CODE_TABLE[this.eanArray[i]].left.odd;
      } else {
        eanCode += EAN13Generator.EAN_13_CODE_TABLE[this.eanArray[i]].left.even;
      }
    }
    eanCode += EAN13Generator.CENTRAL_SENTINEL;
    for (i = _j = 7; _j <= 12; i = ++_j) {
      eanCode += EAN13Generator.EAN_13_CODE_TABLE[this.eanArray[i]].right;
    }
    return eanCode += EAN13Generator.END_SENTINEL;
  };

  return EAN13Generator;

})();

EAN13CanvasDrawer = (function(_super) {

  __extends(EAN13CanvasDrawer, _super);

  EAN13CanvasDrawer.name = 'EAN13CanvasDrawer';

  function EAN13CanvasDrawer(eanString, canvasId) {
    this.canvasId = canvasId;
    EAN13CanvasDrawer.__super__.constructor.call(this, eanString);
    try {
      if (!(typeof jc !== "undefined" && jc !== null)) {
        throw new Error('jCanvaScript object not found');
      }
      this.textStartX = 1;
      this.textStartY = 240;
      this.textStep = 35;
      this.textBreak = 18;
      this.textSize = 42;
      this.barStartX = 30;
      this.barStartY = 1;
      this.barWidth = 5;
      this.barHeight = 200;
      this.barLongerHeight = 225;
    } catch (error) {
      alert(error.message);
    }
  }

  EAN13CanvasDrawer.prototype.drawBarcode = function() {
    var barHeightActual, barStartActual, i, key, splitArray, textStartActual, _i, _j, _len, _len1, _ref;
    jc.clear(this.canvasId);
    jc.start(this.canvasId);
    splitArray = this.generateEANcode().split('');
    barStartActual = this.barStartX;
    for (key = _i = 0, _len = splitArray.length; _i < _len; key = ++_i) {
      i = splitArray[key];
      barHeightActual = this.barHeight;
      if (key === 0 || key === 1 || key === 2 || key === 45 || key === 46 || key === 47 || key === 48 || key === 49 || key === 92 || key === 93 || key === 94) {
        barHeightActual = this.barLongerHeight;
      }
      if (i === '0') {
        jc.rect(barStartActual, this.barStartY, this.barWidth, barHeightActual, 'rgb(255,255,255)', true);
      } else {
        jc.rect(barStartActual, this.barStartY, this.barWidth, barHeightActual, 'rgb(0,0,0)', true);
      }
      barStartActual += this.barWidth;
    }
    jc.start(this.canvasId);
    textStartActual = this.textStartX;
    _ref = this.eanArray;
    for (key = _j = 0, _len1 = _ref.length; _j < _len1; key = ++_j) {
      i = _ref[key];
      if (key === 1 || key === 7) {
        textStartActual += this.textBreak;
      }
      jc.text(i, textStartActual, this.textStartY).font("" + this.textSize + "px courier bold");
      textStartActual += this.textStep;
    }
    return jc.start(this.canvasId);
  };

  return EAN13CanvasDrawer;

})(EAN13Generator);

$(function() {
  return $('form#ean_13_form').validate({
    rules: {
      ean_13: {
        required: true,
        minlength: 12,
        maxlength: 12,
        digits: true
      }
    },
    messages: {
      ean_13: {
        required: 'Type 12 digits',
        minlength: 'Not enough digits',
        maxlength: 'Too many digits',
        digits: 'Type only digits'
      }
    },
    errorLabelContainer: '#error_msgs',
    submitHandler: function() {
      var barcodeDrawer;
      barcodeDrawer = new EAN13CanvasDrawer($('input#ean_13').val(), 'canvas_1');
      return barcodeDrawer.drawBarcode();
    }
  });
});
