goog.provide('anychart.core.quadrant.Quarter');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Label');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');



/**
 * Quarter settings representation class.
 * @constructor
 * @extends {anychart.core.ui.Background}
 * @param {anychart.enums.Quarter} quarter Quarter.
 */
anychart.core.quadrant.Quarter = function(quarter) {
  anychart.core.quadrant.Quarter.base(this, 'constructor');

  /**
   * Quarter.
   * @type {anychart.enums.Quarter}
   * @private
   */
  this.quarter_ = quarter;

  /**
   * Quarter title.
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.title_ = null;

  /**
   * @type {anychart.core.utils.Margin}
   * @private
   */
  this.margin_ = null;

  /**
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * Quarter labels.
   * @type {Array.<anychart.core.ui.Label>}
   * @private
   */
  this.labels_ = [];
};
goog.inherits(anychart.core.quadrant.Quarter, anychart.core.ui.Background);


//region --- infrastructure
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.quadrant.Quarter.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.Background.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.QUARTER_TITLE |
    anychart.ConsistencyState.QUARTER_LABELS;


/**
 * Title zIndex.
 * @type {number}
 */
anychart.core.quadrant.Quarter.prototype.TITLE_ZINDEX = 10;


/**
 * Custom labels zIndex.
 * @type {number}
 */
anychart.core.quadrant.Quarter.prototype.LABEL_ZINDEX = 20;


//endregion
//region --- own api
/**
 * Returns quarter.
 * @return {anychart.enums.Quarter} Quarter.
 */
anychart.core.quadrant.Quarter.prototype.getQuarter = function() {
  return this.quarter_;
};


/**
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value .
 * @return {!(anychart.core.ui.Title|anychart.core.quadrant.Quarter)} .
 */
anychart.core.quadrant.Quarter.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.setParentEventTarget(this);
    this.title_.listenSignals(this.titleInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.quadrant.Quarter.prototype.titleInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.QUARTER_TITLE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // If there are no signals - !state and nothing will happen.
  this.invalidate(state, signal);
};


/**
 * Getter/setter for margin.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.quadrant.Quarter|anychart.core.utils.Margin)} .
 */
anychart.core.quadrant.Quarter.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom,
                                                           opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.margin_.listenSignals(this.marginInvalidated_, this);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  } else {
    return this.margin_;
  }
};


/**
 * Internal margin invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.quadrant.Quarter.prototype.marginInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.quadrant.Quarter|anychart.core.utils.Padding)} .
 */
anychart.core.quadrant.Quarter.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom,
                                                            opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.paddingInvalidated_, this);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  } else {
    return this.padding_;
  }
};


/**
 * Internal padding invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.quadrant.Quarter.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Getter/setter for quarter label default settings.
 * @param {Object=} opt_value Object with label settings.
 * @return {Object}
 */
anychart.core.quadrant.Quarter.prototype.defaultLabelSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!this.defaultLabelSettings_)
      this.defaultLabelSettings_ = goog.object.clone(opt_value);
    else
      goog.object.extend(this.defaultLabelSettings_, opt_value);
    return this;
  }
  return this.defaultLabelSettings_ || {};
};


/**
 * Getter/setter for label.
 * @param {(null|boolean|Object|string|number)=} opt_indexOrValue Chart label instance to add.
 * @param {(null|boolean|Object|string)=} opt_value Chart label instance.
 * @return {!(anychart.core.ui.Label|anychart.core.quadrant.Quarter)} Chart label instance or itself for chaining call.
 */
anychart.core.quadrant.Quarter.prototype.label = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var label = this.labels_[index];
  if (!label) {
    label = new anychart.core.ui.Label();
    label.setParentEventTarget(this);
    label.setup(this.defaultLabelSettings());
    this.labels_[index] = label;
    label.listenSignals(this.labelInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.QUARTER_LABELS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    label.setup(value);
    return this;
  } else {
    return label;
  }
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.quadrant.Quarter.prototype.labelInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.QUARTER_LABELS, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- drawing
/** @inheritDoc */
anychart.core.quadrant.Quarter.prototype.getBoundsForDrawing = function() {
  return this.margin().tightenBounds(this.getPixelBounds());
};


/** @inheritDoc */
anychart.core.quadrant.Quarter.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.invalidate(anychart.ConsistencyState.QUARTER_TITLE | anychart.ConsistencyState.QUARTER_LABELS);
  }

  // draw background
  anychart.core.quadrant.Quarter.base(this, 'draw');

  var title = this.title();
  if (this.hasInvalidationState(anychart.ConsistencyState.QUARTER_TITLE)) {
    title.suspendSignalsDispatching();
    if (!title.container()) title.container(this.rootElement);
    title.zIndex(this.TITLE_ZINDEX);
    title.parentBounds(this.getPixelBounds());
    title.resumeSignalsDispatching(false);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.QUARTER_TITLE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.QUARTER_LABELS)) {
    var bounds = this.getBoundsForDrawing();
    for (var i = 0, count = this.labels_.length; i < count; i++) {
      var label = this.labels_[i];
      if (label) {
        label.suspendSignalsDispatching();
        if (!label.container() && label.enabled()) label.container(this.rootElement);
        label.parentBounds(this.padding().tightenBounds(bounds));
        label.zIndex(this.LABEL_ZINDEX);
        label.resumeSignalsDispatching(false);
        label.draw();
      }
    }
    this.markConsistent(anychart.ConsistencyState.QUARTER_LABELS);
  }

  return this;
};


//endregion
//region --- serialize/setup/dispose.
/** @inheritDoc */
anychart.core.quadrant.Quarter.prototype.serialize = function() {
  var json = anychart.core.quadrant.Quarter.base(this, 'serialize');
  json['quarter'] = this.quarter_;
  json['title'] = this.title().serialize();
  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  var labels = [];
  for (var i = 0; i < this.labels_.length; i++) {
    if (this.labels_[i])
      labels.push(this.labels_[i].serialize());
  }
  if (labels.length > 0)
    json['labels'] = labels;
  return json;
};


/** @inheritDoc */
anychart.core.quadrant.Quarter.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.quadrant.Quarter.base(this, 'setupByJSON', config);

  if ('defaultLabelSettings' in config)
    this.defaultLabelSettings(config['defaultLabelSettings']);

  if ('title' in config)
    this.title(config['title']);

  if ('padding' in config)
    this.padding(config['padding']);

  if ('margin' in config)
    this.margin(config['margin']);

  var labels = config['labels'];
  if (goog.isArray(labels)) {
    for (var i = 0; i < labels.length; i++)
      this.label(i, labels[i]);
  }
};


/** @inheritDoc */
anychart.core.quadrant.Quarter.prototype.disposeInternal = function() {
  goog.disposeAll(this.title_, this.margin_, this.padding_, this.labels_);
  this.title_ = null;
  this.margin_ = null;
  this.padding_ = null;
  this.labels_ = null;
  anychart.core.quadrant.Quarter.base(this, 'disposeInternal');
};


//endregion
//region --- exports
(function() {
  var proto = anychart.core.quadrant.Quarter.prototype;
  proto['title'] = proto.title;
  proto['margin'] = proto.margin;
  proto['padding'] = proto.padding;
  proto['label'] = proto.label;
})();
//endregion
