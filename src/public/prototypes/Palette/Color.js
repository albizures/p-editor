const AppendObject = require('../../prototypes/AppendObject.js');
const {inheritanceObject} = require('../../utils.js');
const {
	SIZE_COLOR_BLOCK,CHANGE_COLOR
} = require('../../constants').palette;
function Color(color,active) {
  this.color = color;
  this.el = document.createElement('div');
  this.el.classList.add('palette-color');
	if(active) this.el.classList.add('active');
  this.el.style.background = color;
	this.active = active;
  this.el.style.height = this.el.style.width = SIZE_COLOR_BLOCK + 'px';
	Editor.events.on(CHANGE_COLOR + '.' + this.color,this.changeColor,this);
}
inheritanceObject(Color,AppendObject);
Color.prototype.changeColor = function (color) {
	if(this.color == color){
		this.el.classList.add('active');
		this.active = true;
	}else if(this.active){
		this.el.classList.remove('active');
	}
};
module.exports = Color;