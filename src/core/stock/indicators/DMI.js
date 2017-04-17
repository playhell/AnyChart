goog.provide('anychart.core.stock.indicators.DMI');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.dmi');
goog.require('anychart.utils');



/**
 * DMI indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.DMI = function(plot, mapping, opt_period, opt_seriesType) {
  anychart.core.stock.indicators.DMI.base(this, 'constructor', plot, mapping);

  /**
   * DMI period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);

  this.declareSeries('main', opt_seriesType);
  this.init();
};
goog.inherits(anychart.core.stock.indicators.DMI, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.DMI.prototype.createComputer = function(mapping) {
  return anychart.math.dmi.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.core.stock.indicators.DMI.prototype.createNameForSeries = function(seriesId, series) {
  return 'DMI(' + this.period_ + ')';
};


/** @inheritDoc */
anychart.core.stock.indicators.DMI.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  // TODO: remove if there is only one series
  switch (seriesId) {
    case 'seriesId1':
      mapping.addField('value', computer.getFieldIndex('result1'));
      break;
    case 'seriesId2':
      mapping.addField('value', computer.getFieldIndex('result2'));
      break;
  }
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.DMI|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.DMI.prototype.series = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.DMI|anychart.core.series.Stock} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.DMI|number}
 */
anychart.core.stock.indicators.DMI.prototype.period = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.period_, false);
    if (period != this.period_) {
      this.period_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.period_;
};


//exports
(function() {
  var proto = anychart.core.stock.indicators.DMI.prototype;
  proto['series'] = proto.series;
  proto['period'] = proto.period;
})();
