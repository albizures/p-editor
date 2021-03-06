'use strict';
const {walkBitmap, imageSmoothingDisabled} = require('utils/canvas');
const { TRANSPARENT_COLOR } = require('../constants');
const Layer = require('./Layer');
const Action = require('./Action');
const Actions = require('../panels/Actions');
const Frames = require('../panels/Frames');
const Layers = require('../panels/Layers');
const { UPDATE_FRAME } = require('../constants').events;

function Frame(sprite, index, status, layers, clone, image) {
  this.sprite = sprite;
  this.index = index;
  this.status = status;
  this.layers = image? [] : layers || [new Layer(this, 0)];
  this.context = document.createElement('canvas').getContext('2d');
  if (!clone) {
    this.init(image);
  }
}
Frame.fetchFrame = function (sprite, index, image) {
  return new Frame(sprite, index, true, false, false, image);
};
Frame.prototype = {
  constructor : Frame,
  get canvas() {
    return Editor.canvas;
  },
  get imageData() {
    return this.context.getImageData(0, 0, this.sprite.width, this.sprite.height);
  },
  get width() {
    return this.sprite.width;
  },
  get height() {
    return this.sprite.height;
  }
};
Frame.prototype.init = function (image) {
  var tempCv = document.createElement('canvas');
  var tempCx = tempCv.getContext('2d');
  tempCv.width = this.width;
  tempCv.height = this.height;

  imageSmoothingDisabled(this.context);
  this.context.canvas.width = this.sprite.width;
  this.context.canvas.height = this.sprite.height;
  
  if (image) {
    var num = image.width / this.width;
    for (var j = 0; j < num; j++) {
      tempCx.drawImage(image,
        j * this.width, 0, this.width, this.height,
        0, 0, this.width, this.height
      );
      this.layers.push(Layer.fromContext(this, j, tempCx));
      tempCv = tempCv.cloneNode();
      tempCx = tempCv.getContext('2d');
    }
  }
  Frames.addPreview(this);
  this.paint(true);
};
Frame.prototype.resize = function (content, x, y) {
  this.context.canvas.width = this.width;
  this.context.canvas.height = this.height;
  for (let i = 0; i < this.layers.length; i++) {
    this.layers[i].resize(content, x, y);
  }
  Frames.resizeFrame(this.index);
  this.paint();
};
Frame.prototype.deleteLayer = function (index, unsaved) {
  if (this.layers.length == 1) {
    // TODO: create alert
    alert('can\'t delete last frames');
    return false;
  }else {
    let layerDelete = this.layers.splice(index, 1)[0];
    this.reIndexing();
    if (layerDelete && layerDelete.index == Editor.canvas.artboard.layer.index) {
      if (this.layers.length <= index) {
        index--;
      }
      this.layers[index].select();
    }
    this.paint();
    return layerDelete;
  }
};
Frame.prototype.delete = function (unsaved) {
  if (this.sprite.deleteFrame(this.index, unsaved)) {
    Frames.deletePreview(this.index);
  }
};
Frame.prototype.reIndexing = function () {
  for (let i = 0; i < this.layers.length; i++) {
    this.layers[i].index = i;
  }
};
Frame.prototype.cloneLayers = function (frame) {
  let layers = [];
  frame = frame || this;
  for (let i = 0; i < this.layers.length; i++) {
    let newLayer = this.layers[i].clone(frame);
    layers.push(newLayer);
  }
  return layers;
};
Frame.prototype.selectLayer = function (layer) {
  if (Number.isInteger(layer)) {
    layer = this.frames[layer];
  } else if (!(layer instanceof Layer)) {
    throw new Error();
  }
  layer.select();
};
Frame.prototype.select = function () {
  Frames.selectFrame(this.index);
  Layers.changeFrame(this);
  this.layers[0].select();
};
Frame.prototype.clone = function (sprite) {
  sprite = sprite || this.sprite;
  return new Frame(sprite, this.index + 1, this.status, this.cloneLayers(), true);
};
Frame.prototype.addLayer = function (layerClone, newIndex, restore) {
  let clone = false,
    newLayer;
  if (restore) {
    newLayer = layerClone;
    Layers.addPreview(newLayer);
  }  else {
    if (layerClone instanceof Layer) {
      clone = true;
    } else if (Number.isInteger(layerClone)) {
      clone = true;
      layerClone = this.layers[layerClone];
    }
    if (!Number.isInteger(newIndex)) {
      newIndex = clone ? layerClone.index + 1 : this.layers.length;
    }
    newLayer = clone ? layerClone.clone() : new Layer(this, newIndex, true);
    if (clone) {
      newLayer.index = newIndex;
    }
  }

  let tempLayers = this.layers.splice(newIndex);

  if (tempLayers.length !== 0) {
    this.layers = this.layers.concat([newLayer], tempLayers);
    this.reIndexing();
  } else {
    this.layers.push(newLayer);
  }
  if (clone) {
    newLayer.init();
  }
  newLayer.select();
  Layers.updateLayers(newLayer.index);
  this.paint();
  return newLayer;
};
Frame.prototype.getDataList = function () {
  return this.layers.map((item) => item.imageData.data);
};
Frame.prototype.getIMG = function () {
  let image = document.createElement('img');
  image.src = this.context.canvas.toDataURL();
  return image;
};
Frame.prototype.clean = function () {
  this.context.clearRect(0, 0,  this.context.canvas.width, this.context.canvas.height);
};
Frame.prototype.paint = function (init) {
  this.clean();
  for (let i = this.layers.length - 1; -1 < i; i--) {
    let layer = this.layers[i];
    this.context.drawImage(layer.context.canvas, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
  }
  Frames.paintFrame(this.index);
  this.sprite.paint();
};
Frame.prototype.moveFrame = function (oldIndex, newIndex) {
  let layer = this.layers.splice(oldIndex, 1),
    tempLayers;
  tempLayers = this.layers.splice(newIndex);
  this.layers = this.layers.concat(layer, tempLayers);
  this.reIndexing();
  this.paint();
};
Frame.prototype.generatePreview = function (scale, transparent) {
  let height = this.height * scale;
  let width = this.width * scale, data;
  let context = document.createElement('canvas').getContext('2d');
  
  context.canvas.width = width;
  context.canvas.height = height;
  data = this.imageData.data;
  imageSmoothingDisabled(context);
  context.drawImage(this.context.canvas, 0, 0, this.width, this.height, 0, 0, width, height);
  context.fillStyle = transparent;
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i] && !data[i + 1] && !data[i + 2] && !data[i + 3]) {
      let pos = i / 4,
        x = pos % 20,
        y = ~~(pos / 20);

      context.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return context;
};
Frame.prototype.save = function () {
  const context = document.createElement('canvas').getContext('2d');
  context.canvas.width = this.layers.length * this.width;
  context.canvas.height = this.height;
  this.layers.forEach(onForEach);

  function onForEach(item, index) {
    context.drawImage(item.context.canvas,
      0, 0, item.width, item.height,
      index * item.width , 0, item.width, item.height
    );
  }
  return context;
};
module.exports = Frame;
