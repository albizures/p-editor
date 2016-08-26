const React = require('react');
const { connect } = require('react-redux');

const { getPreviewSize } = require('utils/canvas.js');
const Context = require('./Context.js');
const { changeLayerPosition } = require('../ducks/frames.js').actions;
const { setCurrentLayer } = require('../ducks').actions;


const obj = {};

obj.displayName = 'Layer';

obj.getInitialState = function(){
  return {
    width : 0,
    height: 0,
    marginLeft: 0,
    marginTop: 0
  };
};

obj.componentDidMount = function() {
  this.setState(
    getPreviewSize(this.props.size, this.props.size, this.props.data.width, this.props.data.height)
  );
};

obj.componentWillReceiveProps = function (nextProps) {
  if (nextProps.data.index !== this.props.data.index) {
   this.setState(
      getPreviewSize(nextProps.size, nextProps.size, nextProps.data.width, nextProps.data.height)
    );
  }
};

obj.onClick = function() {
  this.props.setCurrentLayer(
    this.props.index
  );
};

obj.onDragOver = function(e) {
  e.preventDefault();
};
obj.onDragStart = function(e){
  e.dataTransfer.setData('index', this.props.index);
};
obj.onDrop = function (e) {
  var toIndex = Number(e.dataTransfer.getData('index'));
  this.props.changeLayerPosition(
    this.props.data.frame,
    this.props.index,
    toIndex
  );
};

obj.render = function(){
  let style = {};
  style.height = this.state.height;
  style.width = this.state.width;
  style.marginLeft = this.state.marginLeft;
  style.marginTop = this.state.marginTop;
  return <div onDrop={this.onDrop} draggable="true" onDragOver={this.onDragOver} onDragStart={this.onDragStart} style={style} onClick={this.onClick} className='transparent-bkg'>
    <Context width={this.state.width} height={this.state.height} image={this.props.data.context} version={this.props.data.version}/>
    <button className="btn btn-clone">c</button>
    <button className="btn btn-hidden">h</button>
    <button className="btn btn-delete">d</button>
    <span>{this.props.index + 1}</span>
  </div>;
};

const Layer = React.createClass(obj);

module.exports = connect(
  null,
  { setCurrentLayer, changeLayerPosition }
)(Layer);