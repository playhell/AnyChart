goog.provide('anychart.core.series.Mekko');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.utils.IInteractiveSeries');



/**
 * Class that represents a series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.core.series.Mekko = function(chart, plot, type, config, sortedMode) {
  anychart.core.series.Mekko.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.core.series.Mekko, anychart.core.series.Cartesian);


/** @inheritDoc */
anychart.core.series.Mekko.prototype.getDrawingData = function(data, dataPusher, xNormalizer, xMissingChecker, opt_nameField) {
  // anychart.performance.start('Drawing plan calc');
  var dataSource = /** @type {anychart.data.IView} */(this.data());
  var iterator = dataSource.getIterator();
  var yScale = /** @type {anychart.scales.Base} */ (this.yScale());
  var hasXErrors = false;
  var hasYErrors = false;

  var additionalNames = [];

  if (opt_nameField && dataSource.checkFieldExist(opt_nameField))
    additionalNames.push(opt_nameField);

  while (iterator.advance()) {
    var xValue = xNormalizer(iterator.get('x'));
    if (xMissingChecker(xValue)) // we do not add missings for points that have undefined X
      continue;
    var pointData = {};
    pointData['x'] = xValue;
    var i, len, name, val, missing = false;
    var yValueNames = this.getYValueNames();
    for (i = 0, len = yValueNames.length; i < len; i++) {
      name = yValueNames[i];
      val = this.normalizeValue_(iterator.get(name));
      missing = missing || yScale.isMissing(val);
      pointData[name] = val;
    }
    for (i = 0, len = additionalNames.length; i < len; i++) {
      name = additionalNames[i];
      pointData[name] = iterator.get(name);
    }

    var meta = {};
    meta['missing'] = missing ? anychart.core.series.PointAbsenceReason.VALUE_FIELD_MISSING : 0;
    meta['rawIndex'] = iterator.getIndex();

    var point = {
      data: pointData,
      meta: meta
    };
    dataPusher(data, point);
  }

  // anychart.performance.end('Drawing plan calc');
  this.invalidate(anychart.ConsistencyState.SERIES_DATA);
  return this.drawingPlan = {
    data: data,
    series: this,
    hasPointLabels: this.supportsLabels() &&
        (
            dataSource.checkFieldExist('label') ||
            dataSource.checkFieldExist('hoverLabel') ||
            dataSource.checkFieldExist('selectLabel')
        ),
    hasPointMarkers: this.supportsMarkers() &&
        (
            dataSource.checkFieldExist('marker') ||
            dataSource.checkFieldExist('hoverMarker') ||
            dataSource.checkFieldExist('selectMarker')
        ),
    hasPointOutliers: this.supportsOutliers() &&
        (
            dataSource.checkFieldExist('outliers') ||
            dataSource.checkFieldExist('outlierMarker') ||
            dataSource.checkFieldExist('hoverOutlierMarker') ||
            dataSource.checkFieldExist('selectOutlierMarker')
        ),
    hasPointXErrors: hasXErrors,
    hasPointYErrors: hasYErrors,
    hasPointErrors: hasXErrors || hasYErrors
  };
};


/**
 * @param {number} value
 * @return {number}
 * @private
 */
anychart.core.series.Mekko.prototype.normalizeValue_ = function(value) {
  return value > 0 ? value : 0;
};
