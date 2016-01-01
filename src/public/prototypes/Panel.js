'use strict';
function createPanel() {
  let params = arguments;
  return (function () {
    let zIndex, name,position,width,height,div,parent;
    function Panel(name) {
      this.name = name;
    }
    Panel.prototype = {
      constructor : Panel,
      get name(){return name;},
      set name(val){name = val;},
      get parent(){return parent;},
      set parent(val){parent = val;},
      get div(){return div;},
      set div(val){div = val;}
    };
    Panel.prototype.init = function () {
      if(!hasVal(parent)) return console.error('parent undefined');
      div = document.createElement('div');
      div.classList.add('panel');
      div.classList.add('panel-'+name.toLowerCase());
      parent.appendChild(div);
      if(hasVal(this.mainInit)) this.mainInit();
    };
    return new Panel(params[0]);
  })();
}
module.exports = createPanel;
