'use strict';
const AppendObject = require('./AppendObject'),
    { inheritanceObject } = require('utils/object'),
    make = require('make'),
    {TRANSPARENT_IMG_URL, RIGHT_CLICK, LEFT_CLICK} = require('../constants'),
    Tools = require('../panels/Tools'),
    {SIZE_COLOR_BLOCK, CHANGE_COLOR} = require('../constants').palette;
function Color(color, active, size, offEvents) {
  AppendObject.call(this, 'color');
  this.color = color;
  if (active) {
    this.el.classList.add('active');
  }
  this.colorEl = make(['div', {parent : this.el}]);
  this.el.style.backgroundImage = 'url(' + TRANSPARENT_IMG_URL + ')';
  this.colorEl.style.background = color;
  this.active = active;
  this.el.style.height = this.el.style.width =  (size || SIZE_COLOR_BLOCK) + 'px';
  if (!offEvents) {
    $(this.el).on('mousedown.select', this.select.bind(this));
  }
}
inheritanceObject(Color, AppendObject);
Color.prototype.select = function (evt) {
  console.log('click', evt.which);
  if (evt.which === RIGHT_CLICK) {
    Tools.setSecudaryColor(this.color);
  } else if (evt.which === LEFT_CLICK) {
    Tools.setPrimaryColor(this.color);
  }
};
Color.prototype.changeColor = function (color) {
  this.color = color;
  this.colorEl.style.background = color;
};

module.exports = Color;
