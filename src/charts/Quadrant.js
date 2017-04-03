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
   * @type {Object.<string, anychart.charts.Quadrant.Quarter>}
   * @private
   */
  this.quarters_ = {};
};
goog.inherits(anychart.charts.Quadrant, anychart.charts.Scatter);

//region --- working with data


//endregion
//region --- drawing
/** @inheritDoc */
anychart.charts.Quadrant.prototype.drawContent = function(bounds) {
  return anychart.charts.Quadrant.base(this, 'drawContent', bounds);
};


//endregion
//region --- own api
/**
 * Set settings for quarter.
 * @param {string} quarter
 * @param {string=} opt_value
 * @return {anychart.charts.Quadrant|anychart.charts.Quadrant.Quarter} Quadrant or quarter.
 */
anychart.charts.Quadrant.prototype.quarter = function(quarter, opt_value) {
  quarter = anychart.enums.normalizeQuarter(quarter);

  var quarterInstance = this.quarters_[quarter];
  if (goog.isDef(opt_value)) {
    quarterInstance.setup(opt_value);
    return this;
  } else {
    return quarterInstance;
  }
};


/**
 * Stroke.
 */
anychart.charts.Quadrant.prototype.crosslinesStroke = function() {
  //
};


//endregion
//region --- serialize/setup/dispose
/** @inheritDoc */
anychart.charts.Quadrant.prototype.serialize = function() {
  var json = anychart.charts.Quadrant.base(this, 'serialize');
  var quarters = {};
  for (var key in anychart.enums.Quarter) {
    if (this.quarters_[key])
      quarters[key] = this.quarters_[key].serialize();
  }
  json['quarters'] = quarters;
  return json;
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


/**
 * Setup quarters with defaults.
 */
anychart.charts.Quadrant.prototype.setupDefaultQuarter = function(opt_quarter) {
  if (!goog.isDef(opt_quarter)) {
    for (var quarter in anychart.enums.Quarter) {
      this.setupDefaultQuarter(quarter);
    }
  } else {
    this.quarter(opt_quarter, this.defaultQuarterSettings_);
  }
};


/** @inheritDoc */
anychart.charts.Quadrant.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Quadrant.base(this, 'setupByJSON', config, opt_default);
  if ('defaultQuarterSettings' in config)
    this.defaultQuarterSettings(config['defaultQuarterSettings']);
  if ('quarters' in config) {
    var quarters = config['quarters'];
    for (var quarter in anychart.enums.Quarter) {
      if (quarters[quarter]) {
        this.quarter(quarter, quarters[quarter]);
      } else {
        this.setupDefaultQuarter(quarter);
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.Quadrant.prototype.disposeInternal = function() {
  goog.disposeAll(this.quarters_);
  this.quarters_ = null;
  anychart.charts.Quadrant.base(this, 'disposeInternal');
};
//endregion
//region --- exports
(function() {
  var proto = anychart.charts.Quadrant.prototype;
})();
//endregion
