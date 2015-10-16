(function () {
	'use strict';
	function createSprite() {
		let params = arguments;
		return (function () {
			let width, height,frames = [];
			function Sprite(w,h) {
				width = w;
				height = h;
				this.addFrame();
			}
			Sprite.prototype = {
				constructor : Sprite,
				get width(){return width},
				set width(val){width = val},
				get height(){return height},
				set height(val){height = val},
				get frames(){return frames}
			};
			Sprite.prototype.addFrame = function () {
				let index  = frames.length;
				frames.push(Frame(this,frames.length));
				return index;
			};
			return new Sprite(params[0],params[1]);
		})();
	}
	window.Sprite = createSprite;

})();
