'use strict';
const AppendObject = require('./AppendObject'),
      Vector = require('./Vector'),
      Tools = require('../panels/Tools'),
      abs = Math.abs,
      { TRANSPARENT_COLOR } = require('../constants'),
      { SELECT_TOOL } = require('../constants').events,
      { getRGBAComponents } = require('utils/color'),
      { inheritanceObject, defineGetter} = require('utils/object');
function Tool(name) {
  this.$type = 'button';
  AppendObject.call(this, 'tool');
  this.name = name;
  this.el.textContent = this.name[0];
  this.stroke = [];
  this.el.addEventListener('click', this.select.bind(this));
}
inheritanceObject(Tool, AppendObject);
defineGetter(Tool.prototype, 'canvas', function () {
  return Editor.canvas;
});
defineGetter(Tool.prototype, 'layer', function () {
  return Editor.canvas.artboard.layer;
});
Tool.prototype.onMouseUp = function () {};
Tool.prototype.onMouseMove = function () {};
Tool.prototype.onMouseDown = function () {};
Tool.prototype.addPixelStroke = function (pixel) {
  if (pixel) {
    this.stroke.push(pixel);
  }
};
Tool.prototype.select = function () {
  Tools.changeCurrentTool(this.name);
};
Tool.prototype.clonePixel = function (pixel) {
  return {
    cord : pixel.cord.clone(),
    color : pixel.color
  };
};
Tool.prototype.active = function () {};
Tool.prototype.getRectangle = function (x1, y1, x2, y2, color, fn) {
  let stepX = x1 < x2 ? 1 : -1,
    stepY = y1 < y2 ? 1 : -1,
    diffX = Math.abs(x1 - x2),
    diffY = Math.abs(y1 - y2),
    tempX1 = x1, tempY1 = y1;
  Editor.canvas.cleanPrev();
  while (diffX > 0) {
    diffX--;

    this.layer[fn]({x : tempX1, y : y1}, color);
    this.layer[fn]({x : tempX1, y : y2}, color);
    tempX1 += stepX;
  }
  this.layer[fn]({x : tempX1, y : y1}, color);
  this.layer[fn]({x : tempX1, y : y2}, color);

  while (diffY > 0) {
    diffY--;
    tempY1 += stepY;
    this.layer[fn]({x : x1, y : tempY1}, color);
    this.layer[fn]({x : x2, y : tempY1}, color);
  }
};
Tool.prototype.fill = function (initCord, newColor, oldColor, fn) {
  let stack = [initCord], current, aside,
    numPixels = 4 * (this.layer.width * this.layer.height),
    count = 0,
    dy = [-1, 0, 1, 0],
    dx = [0, 1, 0, -1],
    newComponents = getRGBAComponents(newColor),
    oldComponents = getRGBAComponents(oldColor);

  if (!this.layer.isSameColor(initCord.x, initCord.y, oldComponents, newComponents)) {
    return;
  }
  while (stack.length) {
    current = stack.pop();

    this.layer[fn]({x : current.x, y : current.y}, newColor);
    for (let i = 0; i < 4; i++) {
      aside = {x : current.x +  dx[i], y : current.y + dy[i]};
      if (this.layer.isSameColor(aside.x, aside.y, oldComponents, newComponents)) {
        stack.push(aside);
      }
    }
    if (count > numPixels) {
      break;
    }
    count++;
  }
  Editor.canvas.paintMain();
};
Tool.prototype.lineBetween = function (x1, y1, x2, y2, color, fn) {
  var dx = abs(x2 - x1),
    dy = abs(y2 - y1),
    sx = (x1 < x2) ? 1 : -1,
    sy = (y1 < y2) ? 1 : -1,
    err = dx - dy, e2;
  while (x1 !== x2 || y1 !== y2) {
    this.layer[fn]({x : x1, y : y1}, color);
    e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy; x1  += sx;
    }
    if (e2 < dx) {
      err += dx; y1  += sy;
    }
  }
  this.layer[fn]({x : x1, y : y1}, color);
};
module.exports = Tool;
