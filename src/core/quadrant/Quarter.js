goog.provide('anychart.core.quadrant.Quarter');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');



/**
 * Quarter settings representation class.
 * @constructor
 * @extends {anychart.core.ui.Background}
 * @implements {anychart.core.settings.IObjectWithSettings}
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
};
goog.inherits(anychart.core.quadrant.Quarter, anychart.core.ui.Background);


//region --- infrastructure
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.quadrant.Quarter.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.Background.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.QUARTER_TITLE;


//endregion
//region --- own api
/** @inheritDoc */
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
    this.registerDisposable(this.margin_);
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
  // whatever has changed in margins affects chart size, so we need to redraw everything
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
    this.registerDisposable(this.padding_);
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
  // whatever has changed in paddings affects chart size, so we need to redraw everything
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


//endregion
//region --- drawing
/** @inheritDoc */
anychart.core.quadrant.Quarter.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var bounds = this.getPixelBounds();
  console.log(this.quarter_, bounds);

  anychart.core.quadrant.Quarter.base(this, 'draw');
  //if (this.hasInvalidationState(anychart.ConsistencyState.QUARTER_TITLE)) {
  //  this.markConsistent(anychart.ConsistencyState.QUARTER_TITLE);
  //}
};


//endregion
//region --- serialize/setup/dispose.
/** @inheritDoc */
anychart.core.quadrant.Quarter.prototype.serialize = function() {
  var json = anychart.core.quadrant.Quarter.base(this, 'serialize');
  json['title'] = this.title().serialize();
  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.quadrant.Quarter.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.quadrant.Quarter.base(this, 'setupByJSON', config);

  if ('title' in config)
    this.title(config['title']);

  if ('padding' in config)
    this.padding(config['padding']);

  if ('margin' in config)
    this.margin(config['margin']);
};


/** @inheritDoc */
anychart.core.quadrant.Quarter.prototype.disposeInternal = function() {
  goog.disposeAll(this.title_, this.margin_, this.padding_);
  this.title_ = null;
  this.margin_ = null;
  this.padding_ = null;
  anychart.core.quadrant.Quarter.base(this, 'disposeInternal');
};


//endregion
