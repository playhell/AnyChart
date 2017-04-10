goog.provide('anychart.charts.Quadrant');
goog.require('anychart.charts.Scatter');
goog.require('anychart.core.quadrant.Quarter');



/**
 * Quadrant chart class.
 * @extends {anychart.charts.Scatter}
 * @constructor
 */
anychart.charts.Quadrant = function() {
  anychart.charts.Quadrant.base(this, 'constructor');

  /**
   * Quarters.
   * @type {Array.<anychart.core.quadrant.Quarter>}
   * @private
   */
  this.quarters_ = [];
};
goog.inherits(anychart.charts.Quadrant, anychart.charts.Scatter);


//region --- infrastructure
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Quadrant.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.charts.Scatter.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.QUADRANT_QUARTER |
    anychart.ConsistencyState.QUADRANT_CROSSLINES;


/** @inheritDoc */
anychart.charts.Quadrant.prototype.getType = function() {
  return anychart.enums.ChartTypes.QUADRANT;
};


//endregion
//region --- drawing
/**
 * Calculates bounds for all quarters.
 */
anychart.charts.Quadrant.prototype.calculateQuarterBounds = function() {
  /**
   * @type {Object.<string, anychart.math.Rect>}
   * @private
   */
  this.quarterBounds_ = {};
  var w = this.dataBounds.width / 2;
  var h = this.dataBounds.height / 2;

  this.quarterBounds_[anychart.enums.Quarter.RIGHT_TOP] = anychart.math.rect(
      this.dataBounds.left + w,
      this.dataBounds.top, w, h);
  this.quarterBounds_[anychart.enums.Quarter.LEFT_TOP] = anychart.math.rect(
      this.dataBounds.left,
      this.dataBounds.top, w, h);
  this.quarterBounds_[anychart.enums.Quarter.LEFT_BOTTOM] = anychart.math.rect(
      this.dataBounds.left,
      this.dataBounds.top + h, w, h);
  this.quarterBounds_[anychart.enums.Quarter.RIGHT_BOTTOM] = anychart.math.rect(
      this.dataBounds.left + w,
      this.dataBounds.top + h, w, h);
};


/** @inheritDoc */
anychart.charts.Quadrant.prototype.drawContent = function(bounds) {
  anychart.charts.Quadrant.base(this, 'drawContent', bounds);
  if (this.isConsistent()) {
    return;
  }
  if (!this.crossline_)
    this.crossline_ = this.rootElement.path().zIndex(2);

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var lineBounds = this.dataBounds.clone();
    var thickness = acgraph.vector.getThickness(this.crosslinesStroke_);
    var middleX = anychart.utils.applyPixelShift(lineBounds.left + lineBounds.width / 2, thickness);
    var middleY = anychart.utils.applyPixelShift(lineBounds.top + lineBounds.height / 2, thickness);
    this.crossline_
        .clear()
        .moveTo(middleX, lineBounds.top)
        .lineTo(middleX, lineBounds.top + lineBounds.height)
        .moveTo(lineBounds.left, middleY)
        .lineTo(lineBounds.left + lineBounds.width, middleY)
        .close();
    this.calculateQuarterBounds();
    this.invalidate(anychart.ConsistencyState.QUADRANT_QUARTER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.QUADRANT_CROSSLINES)) {
    this.crossline_.stroke(this.crosslinesStroke_);
    this.markConsistent(anychart.ConsistencyState.QUADRANT_CROSSLINES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.QUADRANT_QUARTER)) {
    for (var i = 0; i < this.quarters_.length; i++) {
      var quarter = this.quarters_[i];
      if (!quarter.container())
        quarter.container(this.rootElement);
      quarter.parentBounds(this.quarterBounds_[quarter.getQuarter()]);
      quarter.draw();
    }
    this.markConsistent(anychart.ConsistencyState.QUADRANT_QUARTER);
  }
};


//endregion
//region --- own api
/**
 * Returns instance by quarter name.
 * @param {anychart.enums.Quarter} quarter
 * @return {?anychart.core.quadrant.Quarter}
 */
anychart.charts.Quadrant.prototype.getQuarterInstance = function(quarter) {
  for (var i = 0; i < this.quarters_.length; i++) {
    if (quarter === this.quarters_[i].getQuarter())
      return this.quarters_[i];
  }
  return null;
};


/**
 * Set settings for quarter.
 * @param {string} quarter
 * @param {Object=} opt_value
 * @return {anychart.charts.Quadrant|anychart.core.quadrant.Quarter} Quadrant or quarter.
 */
anychart.charts.Quadrant.prototype.quarter = function(quarter, opt_value) {
  quarter = anychart.enums.normalizeQuarter(quarter);

  var quarterInstance = this.getQuarterInstance(quarter);
  if (!quarterInstance) {
    quarterInstance = new anychart.core.quadrant.Quarter(quarter);
    quarterInstance.zIndex(1);
    quarterInstance.setup(this.defaultQuarterSettings());
    this.quarters_.push(quarterInstance);
    quarterInstance.listenSignals(this.quarterInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.QUADRANT_QUARTER, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    quarterInstance.setup(opt_value);
    return this;
  } else {
    return quarterInstance;
  }
};


/**
 * Quarter invalidation.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.charts.Quadrant.prototype.quarterInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.QUADRANT_QUARTER, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for crosslines stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.charts.Quadrant|acgraph.vector.Stroke|Function} .
 */
anychart.charts.Quadrant.prototype.crosslinesStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.crosslinesStroke_) {
      this.crosslinesStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.QUADRANT_CROSSLINES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.crosslinesStroke_;
};


/**
 * Getter/setter for axis default settings.
 * @param {Object=} opt_value Object with x-axis settings.
 * @return {Object}
 */
anychart.charts.Quadrant.prototype.defaultQuarterSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!this.defaultQuarterSettings_)
      this.defaultQuarterSettings_ = goog.object.clone(opt_value);
    else
      goog.object.extend(this.defaultQuarterSettings_, opt_value);
    return this;
  }
  return this.defaultQuarterSettings_ || {};
};


//endregion
//region --- serialize/setup/dispose
/** @inheritDoc */
anychart.charts.Quadrant.prototype.serialize = function() {
  var json = anychart.charts.Quadrant.base(this, 'serialize');
  json['crosslinesStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.crosslinesStroke()));

  var quarters = [];
  for (var i = 0; i < this.quarters_.length; i++) {
    if (this.quarters_[i])
      quarters.push(this.quarters_[i].serialize());
  }
  if (quarters.length > 0)
    json['quarters'] = quarters;

  return json;
};


/** @inheritDoc */
anychart.charts.Quadrant.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Quadrant.base(this, 'setupByJSON', config, opt_default);
  if ('defaultQuarterSettings' in config)
    this.defaultQuarterSettings(config['defaultQuarterSettings']);
  this.crosslinesStroke(config['crosslinesStroke']);

  var quarters = config['quarters'];
  if (goog.isArray(quarters)) {
    for (var i = 0; i < quarters.length; i++) {
      this.quarter(quarters[i]['quarter'], quarters[i]);
    }
  }
};


/** @inheritDoc */
anychart.charts.Quadrant.prototype.disposeInternal = function() {
  goog.disposeAll(this.quarters_, this.crossline_);
  this.quarters_ = null;
  this.crossline_ = null;
  anychart.charts.Quadrant.base(this, 'disposeInternal');
};
//endregion
//region --- exports
(function() {
  var proto = anychart.charts.Quadrant.prototype;
  proto['quarter'] = proto.quarter;
  proto['crosslinesStroke'] = proto.crosslinesStroke;
})();
//endregion
