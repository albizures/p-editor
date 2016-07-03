const React = require('react');
const ReactDOM = require('react-dom');
const http = require('http');
const { connect } = require('react-redux');
const { editProp } = require('utils/ducks.js');

//const EditorClass = require('../../Editor');
const ducks = require('./ducks');
const Canvas = require('./components/Canvas');
const Panel = require('./components/Panel.js');
const Frame = require('./components/Frame.js');
const Layer = require('./components/Layer.js');
const Tools = require('./components/Tools.js');
const List = require('./components/List.js');
const Preview = require('./components/Preview.js');
const Palette = require('./components/Palette.js');
const Palettes = require('./components/Palettes.js');

const Editor = React.createClass({
  render () {
    var frameFilter;
    var layerFilter;
    if (this.props.sprite !== null && this.props.frame !== null && this.props.layer !== null) {
      frameFilter = this.props.sprites[this.props.sprite].frames;
      layerFilter = this.props.frames[this.props.frame].layers;
    }
    return <div className="editor-content">
      <Canvas/>
      <Panel name='Menus' style={this.state.Menus} dragBar={false}>
        {'Menus'}
      </Panel>
      <Panel name='Left' contentPanels tabs style={this.state.Left} tabDefault={0} dragBar={false}>
        <Panel name='frames' dragBar={false}>
          <button className="add-frame" onClick={this.onClickAddFrame}>add frame</button>
          <List name='frames' component={Frame} filter={frameFilter} items={this.props.frames} current={this.props.frame}/>
        </Panel>
        <Panel name='layers' dragBar={false}>
          <button className='add-layer' onClick={this.onClickAddLayer}>add layer</button>
          <List name='layers' component={Layer} filter={layerFilter} items={this.props.layers} current={this.props.layer}/>
        </Panel>
      </Panel>
      <Palettes style={this.state.Palettes} items={this.props.palettes}/>
      <Panel name="Right" contentPanels style={this.state.Right} dragBar={false}>
        <Panel name="Preview" style={this.state.Preview}>
          <Preview frames={this.props.frames} fps={12}/>
        </Panel>
        <Palette style={this.state.Palette} />
      </Panel>
      <Tools style={this.state.Tools}/>
    </div>;
  },
  getInitialState () {
    return {
      Menus : {
        top : 0,
        left : 0,
        width : '100%',
        height : '25px'
      },
      Left : {
        top : '25px',
        left : 0,
        width : '12%',
        height : 'calc(100% - 25px)'
      },
      Right: {
        top : '25px',
        right : 0,
        width : '15%',
        height : 'calc(100% - 25px)'
      },
      Palette : {
        position: 'initial',
        width : '100%',
      },
      Palettes : {
        top : '100px',
        left : '400px',
        visibility : 'hidden'
      },
      Preview : {
        position : 'initial',
        top: 0,
        left: 0,
        width: '100%'
      },
      Tools : {
        top : '100px',
        left : '150px',
        width : '60px'
      }
    };
  },
  componentDidMount() {
    this.setState({
      width : window.innerWidth,
      height : window.innerHeight
    });
    if (this.props.params.id) {
      http.get('/api/sprites/' + this.props.params.id, this.onGetSprite);
    } else {
      this.createSprite('test', 36, 36);
    }
  },
  onClickAddFrame() {
    let sprite = this.props.sprite;
    let numLayers = this.props.frames[this.props.frame].layers.length;
    let frame = this.createFrame({sprite});
    console.info(frame, numLayers);
    for (let j = 0; j < numLayers; j++) {
      let layer = this.createLayer({
        sprite,
        frame
      });
      if (j == 0) {
        this.props.setCurrentLayer(layer);
      }
    }
    this.props.setCurrentFrame(frame);
  },
  onClickAddLayer() {
    let sprite = this.props.sprite;
    let frames = this.props.sprites[sprite].frames;
    for (let j = 0; j < frames.length; j++) {
      let frame = frames[j];
      let layer = this.createLayer({
        sprite,
        frame
      });
      if (frame == this.props.frame) {
        this.props.setCurrentLayer(layer);
      }
    }
  },
  createSprite(name, width, height) {
    let sprite, frame;
    sprite = this.props.addSprite({
      name,
      width,
      height
    });
    frame = this.props.addFrame({
      width,
      height,
      sprite
    });
    this.props.addFrameSprite(sprite, frame);

    this.props.setCurrentSprite(sprite);
    this.props.setCurrentFrame(frame);
    this.props.setCurrentLayer(this.createLayer({sprite, frame, width, height}));
  },
  onGetSprite(result) {
    let sprite, image = new Image(), width, height; 
    let context = document.createElement('canvas').getContext('2d');
    if (result.code !== 0) {
      return; // TODO: create toast alerts
    }
    sprite = result.data;
    context.canvas.width = width = sprite.width * sprite.layers;
    context.canvas.height = height = sprite.height;
    sprite.index = this.props.addSprite(sprite);
    this.props.setCurrentSprite(sprite.index);
    image.onload = () => {
      context.drawImage(image,
        0, 0, width, height,
        0, 0, width, height
      );
      this.props.setCurrentFrame(
        this.createFrameFromContext(sprite, context)
      );
      for (let j = 1; j < sprite.frames; j++) {
        context.drawImage(image,
          0, j * height, width, height,
          0, 0, width, height
        );
        this.createFrameFromContext(sprite, context);
      }
    };
    image.src = '/api/images/sprite/' + sprite._id;
  },
  createFrameFromContext(sprite, image) {
    let context = document.createElement('canvas').getContext('2d');
    let contextTemp = document.createElement('canvas').getContext('2d');
    let index;
    contextTemp.canvas.width = context.canvas.width = sprite.width;
    contextTemp.canvas.height = context.canvas.height = sprite.height;
    
    for (var j = sprite.layers -1; j >= 0; j--) {
      context.drawImage(image.canvas,
        sprite.width * j, 0, sprite.width, sprite.height,
        0, 0, sprite.width, sprite.height
      );
    }
    index = this.props.addFrame({
      sprite : sprite.index,
      width : sprite.width,
      height : sprite.height,
      context : context,
      layers : []
    });
    this.props.addFrameSprite(
      sprite.index,
      index
    );
    for (let j = 0; j < sprite.layers; j++) {
      let layerIndex;
      contextTemp.canvas.height = sprite.height;// clean
      contextTemp.drawImage(image.canvas,
        sprite.width * j, 0, sprite.width, sprite.height,
        0, 0, sprite.width, sprite.height
      );
      layerIndex = this.createLayersFromContext(sprite, contextTemp, index);
      this.props.addLayerFrame(
        index,
        layerIndex
      );
      if (j == 0) {
        this.props.setCurrentLayer(layerIndex);
      }
    }
    return index;
  },
  createLayersFromContext(sprite, image, frame) {
    let context = document.createElement('canvas').getContext('2d');
    context.canvas.width = sprite.width;
    context.canvas.height = sprite.height;
    context.drawImage(image.canvas,
      0, 0, sprite.width, sprite.height,
      0, 0, sprite.width, sprite.height
    );
    return this.props.addLayer({
      context : context,
      width : sprite.width,
      height : sprite.height,
      sprite : sprite.index,
      frame : frame
    });
  },
  createFrame({sprite, context}){
    let width = this.props.sprites[sprite].width;
    let height = this.props.sprites[sprite].height;
    let frame = this.props.addFrame({
      width,
      height,
      sprite,
      context
    });
    this.props.addFrameSprite(sprite, frame);
    return frame;
  },
  createLayer({sprite, frame, context, width, height}) {
    var layer;
    width = width || this.props.sprites[sprite].width;
    height = height || this.props.sprites[sprite].height;
    layer = this.props.addLayer({
      width,
      height,
      sprite,
      frame,
      context
    });
    this.props.addLayerFrame(frame, layer);
    return layer;
  }
});

function mapStateToProps(state, props) {
  return {
    sprite : state.Editor.sprite,
    frame : state.Editor.frame,
    layer : state.Editor.layer,
    sprites :  state.Editor.sprites,
    frames :  state.Editor.frames,
    layers :  state.Editor.layers,
    palettes :  state.Editor.palettes
  };
}

module.exports = connect(mapStateToProps, ducks.actions)(Editor);