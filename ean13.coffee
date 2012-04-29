###
This file is part of the EAN-13 Barcode Canvas Drawer package.

(c) Dawid Spiechowicz <spiechu@gmail.com>

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.
###

class EAN13Generator
  @START_SENTINEL   : '101'
  @CENTRAL_SENTINEL : '01010'
  @END_SENTINEL     : '101'
  @EAN_13_CODE_TABLE:
    0:
      left:
        odd : '0001101'
        even: '0100111'
      right : '1110010'
    1:
      left:
        odd : '0011001'
        even: '0110011'
      right : '1100110'
    2:
      left:
        odd : '0010011'
        even: '0011011'
      right : '1101100'
    3:
      left:
        odd : '0111101'
        even: '0100001'
      right : '1000010'
    4:
      left:
        odd : '0100011'
        even: '0011101'
      right : '1011100'
    5:
      left:
        odd : '0110001'
        even: '0111001'
      right : '1001110'
    6:
      left:
        odd : '0101111'
        even: '0000101'
      right : '1010000'
    7:
      left:
        odd : '0111011'
        even: '0010001'
      right : '1000100'
    8:
      left:
        odd : '0110111'
        even: '0001001'
      right : '1001000'
    9:
      left:
        odd : '0001011'
        even: '0010111'
      right : '1110100'
     
  @LEFT_SIDE_CODING:
    0: ['odd', 'odd',  'odd',  'odd',  'odd',  'odd' ]
    1: ['odd', 'odd',  'even', 'odd',  'even', 'even']
    2: ['odd', 'odd',  'even', 'even', 'odd',  'even']
    3: ['odd', 'odd',  'even', 'even', 'even', 'odd' ]
    4: ['odd', 'even', 'odd',  'odd',  'even', 'even']
    5: ['odd', 'even', 'even', 'odd',  'odd',  'even']
    6: ['odd', 'even', 'even', 'even', 'odd',  'odd' ]
    7: ['odd', 'even', 'odd',  'even', 'odd',  'even']
    8: ['odd', 'even', 'odd',  'even', 'even', 'odd' ]
    9: ['odd', 'even', 'even', 'odd',  'even', 'odd' ]
    
  constructor: (eanString) ->
    try
    
      # some error checking
      if not eanString? then throw new Error 'You need to provide some string'
      if typeof eanString is not 'string' then throw new Error 'eanString is not string'
      if eanString.length != 12 then throw new Error 'You need to provide exact 12 digits'
      
      # make object property containing array
      @eanArray = eanString.split ''
      
      # we need 13th digit
      checkDigit = @computeControlSum()
      @eanArray.push String(checkDigit)
    catch error
      alert error.message

  computeControlSum: ->
    sum = 0
    
    # this one line of array comprehension substitutes four lines in pure JS
    sum += (if key % 2 then 3 else 1) * value for value, key in @eanArray
    controlSum = 10 - sum % 10
    if controlSum == 10 then controlSum = 0
    return controlSum
      
  generateEANcode: ->
  
    # we're using class property to find out first 6 digits coding
    codingStyle = EAN13Generator.LEFT_SIDE_CODING[@eanArray[0]]
    eanCode = EAN13Generator.START_SENTINEL
    for i in [1..6]
      if codingStyle[i-1] == 'odd'
        eanCode += EAN13Generator.EAN_13_CODE_TABLE[@eanArray[i]].left.odd
      else
        eanCode += EAN13Generator.EAN_13_CODE_TABLE[@eanArray[i]].left.even
    eanCode += EAN13Generator.CENTRAL_SENTINEL       
    eanCode += (EAN13Generator.EAN_13_CODE_TABLE[@eanArray[i]].right) for i in [7..12]
    eanCode += EAN13Generator.END_SENTINEL 

class EAN13CanvasDrawer extends EAN13Generator
  constructor: (eanString, @canvasId) ->
  
    # we're launching EAN13Generator constructor
    super(eanString)
    try
      if not jc? then throw new Error 'jCanvaScript object not found'
      
      # barcode lines coordinates
      @textStartX = 1
      @textStartY = 240
      @textStep = 35
      @textBreak = 18
      @textSize = 42

      # barcode text coordinates
      @barStartX = 30
      @barStartY = 1
      @barWidth = 5
      @barHeight = 200
      @barLongerHeight = 225
    catch error
      alert error.message
  
  drawBarcode: ->
    jc.clear @canvasId
    jc.start @canvasId
    splitArray = @generateEANcode().split ''   
    barStartActual = @barStartX  
    for i, key in splitArray
      barHeightActual = @barHeight
      
      # barcode longer 'whiskers'
      if key in [0,1,2,45,46,47,48,49,92,93,94] then barHeightActual = @barLongerHeight
      
      # draw white stripe
      if i == '0'
        jc.rect barStartActual, @barStartY, @barWidth, barHeightActual, 'rgb(255,255,255)', true
      else
        jc.rect barStartActual, @barStartY, @barWidth, barHeightActual, 'rgb(0,0,0)', true
      barStartActual += @barWidth    
    jc.start @canvasId
    textStartActual = @textStartX
    for i, key in @eanArray
      if key in [1,7] then textStartActual += @textBreak
      jc.text(i, textStartActual, @textStartY).font "#{@textSize}px courier bold"
      textStartActual += @textStep
    jc.start @canvasId

$ ->

  # configuring jQuery Validator plugin
  $('form#ean_13_form').validate
    rules:
      ean_13:
        required: true
        minlength: 12
        maxlength: 12
        digits: true
    messages:
      ean_13:
        required: 'Type 12 digits'
        minlength: 'Not enough digits'
        maxlength: 'Too many digits'
        digits: 'Type only digits'
    errorLabelContainer: '#error_msgs'
    submitHandler: ->
      barcodeDrawer = new EAN13CanvasDrawer $('input#ean_13').val(), 'canvas_1'
      barcodeDrawer.drawBarcode()
    