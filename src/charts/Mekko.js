goog.provide('anychart.charts.Mekko');
goog.require('anychart.core.ChartWithAxes');
goog.require('anychart.core.series');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.enums');



/**
 * Mekko chart class.<br/>
 * To get the chart use any of these methods:
 *  <ul>
 *      <li>{@link anychart.mosaic}</li>
 *      <li>{@link anychart.mekko}</li>
 *      <li>{@link anychart.barmekko}</li>
 *  </ul>
 * @param {boolean=} opt_useCategoryScale
 * @extends {anychart.core.ChartWithAxes}
 * @constructor
 */
anychart.charts.Mekko = function(opt_useCategoryScale) {
  anychart.charts.Mekko.base(this, 'constructor', true);

  /**
   * Scale for LEFT oriented Y axis. Uses first categories values to calculate weights.
   * @type {anychart.scales.Ordinal}
   * @private
   */
  this.leftCategoriesScale_ = null;

  /**
   * Scale for RIGHT oriented Y axis. Uses last categories values to calculate weights.
   * @type {anychart.scales.Ordinal}
   * @private
   */
  this.rightCategoriesScale_ = null;

  /**
   * Should Y Axis use category scales or not.
   * @type {boolean}
   * @private
   */
  this.useCategoryScale_ = !!opt_useCategoryScale;

  /**
   * @type {number}
   * @private
   */
  this.pointsPadding_ = 0;

  this.defaultSeriesType(anychart.enums.MekkoSeriesType.MEKKO);
};
goog.inherits(anychart.charts.Mekko, anychart.core.ChartWithAxes);


//region --- Infrastucture
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastucture
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series config for Mekko chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.charts.Mekko.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);

  res[anychart.enums.MekkoSeriesType.MEKKO] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.charts.Mekko, anychart.charts.Mekko.prototype.seriesConfig);


/**
 * Supported consistency states. Adds CATEGORY_SCALE state.
 * @type {number}
 */
anychart.charts.Mekko.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithAxes.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.MEKKO_CATEGORY_SCALE;


//endregion
//region --- Scales
//----------------------------------------------------------------------------------------------------------------------
//
//  Scales
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for leftCategoriesScale.
 * @return {!anychart.scales.Ordinal}
 */
anychart.charts.Mekko.prototype.leftCategoriesScale = function() {
  if (!this.leftCategoriesScale_) {
    this.leftCategoriesScale_ = /** @type {anychart.scales.Ordinal} */(this.createScaleByType('ordinal', true, false));
    this.leftCategoriesScale_.listenSignals(this.categoriesScaleInvalidated, this);
  }
  return /** @type {!anychart.scales.Ordinal} */(this.leftCategoriesScale_);
};


/**
 * Getter for rightCategoriesScale.
 * @return {!anychart.scales.Ordinal}
 */
anychart.charts.Mekko.prototype.rightCategoriesScale = function() {
  if (!this.rightCategoriesScale_) {
    this.rightCategoriesScale_ = /** @type {anychart.scales.Ordinal} */(this.createScaleByType('ordinal', true, false));
    this.rightCategoriesScale_.listenSignals(this.categoriesScaleInvalidated, this);
  }
  return /** @type {!anychart.scales.Ordinal} */(this.rightCategoriesScale_);
};


/**
 * Left and right categories scales invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @protected
 */
anychart.charts.Mekko.prototype.categoriesScaleInvalidated = function(event) {
  this.suspendSignalsDispatching();
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    var state = anychart.ConsistencyState.SCALE_CHART_SCALES |
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
        anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS;
    this.invalidate(state, anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);
  }
  this.resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.allowLegendCategoriesMode = function() {
  return false;
};


//endregion
//region --- Axes
//----------------------------------------------------------------------------------------------------------------------
//
//  Axes
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Mekko.prototype.setYAxisScale = function(axis) {
  if (this.useCategoryScale_) {
    var straight = !this.xScale().inverted();
    if (axis.orientation() == anychart.enums.Orientation.LEFT || axis.orientation() == anychart.enums.Orientation.TOP)
      axis.scale(straight ? this.leftCategoriesScale() : this.rightCategoriesScale());
    else if (axis.orientation() == anychart.enums.Orientation.RIGHT || axis.orientation() == anychart.enums.Orientation.BOTTOM)
      axis.scale(straight ? this.rightCategoriesScale() : this.leftCategoriesScale());

  } else {
    axis.scale(/** @type {anychart.scales.Base} */(this.yScale()));
  }
};


//endregion
//region --- Calculations
//----------------------------------------------------------------------------------------------------------------------
//
//  Calculations
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Mekko.prototype.calculate = function() {
  var needsXScaleUpdate = this.hasInvalidationState(
      anychart.ConsistencyState.SCALE_CHART_SCALES |
      anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS);

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES |
          anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS |
          anychart.ConsistencyState.SCALE_CHART_Y_SCALES))
    this.invalidate(anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);

  anychart.charts.Mekko.base(this, 'calculate');

  if (needsXScaleUpdate) {
    // xScale weights calculation
    var i;
    var j;
    var seriesData;
    var weights = [];
    for (i = 0; i < this.drawingPlans.length; i++) {
      seriesData = this.drawingPlans[i].data;
      for (j = 0; j < seriesData.length; j++) {
        var value = seriesData[j].data['value'];
        if (weights[j] == undefined) {
          weights.push(value);
        } else {
          weights[j] += value;
        }
      }
    }

    this.xScale().weights(weights);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MEKKO_CATEGORY_SCALE)) {
    this.calculateCategoriesScales();
    this.markConsistent(anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);
  }
};


/**
 * Left and right categories scales values and weights calculation.
 */
anychart.charts.Mekko.prototype.calculateCategoriesScales = function() {
  if (this.drawingPlans.length) {
    var values = [];
    var leftWeights = [];
    var rightWeights = [];
    var rightIndex = this.drawingPlans[0].data.length - 1;
    for (var i = 0; i < this.drawingPlans.length; i++) {
      values.push(this.drawingPlans[i].series.name());
      leftWeights.push(this.drawingPlans[i].data[0].data['value']);
      rightWeights.push(this.drawingPlans[i].data[rightIndex].data['value']);
    }
    this.leftCategoriesScale().values(values).weights(leftWeights);
    this.rightCategoriesScale().values(values).weights(rightWeights);
  }
};


//endregion
//region --- Series
//----------------------------------------------------------------------------------------------------------------------
//
//  Series
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for points padding.
 * @param {number=} opt_value
 * @return {(number|!anychart.charts.Mekko)}
 */
anychart.charts.Mekko.prototype.pointsPadding = function(opt_value) {
  if (goog.isDef(opt_value) && this.pointsPadding_ != opt_value) {
    opt_value = anychart.utils.toNumber(opt_value);
    this.pointsPadding_ = isNaN(opt_value) ? 0 : (opt_value >= 0 ? opt_value : -opt_value);
    this.invalidate(anychart.ConsistencyState.ALL, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.pointsPadding_;
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.createSeriesInstance = function(type, config) {
  return new anychart.core.series.Cartesian(this, this, type, config, false);
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizeMekkoSeriesType(type);
};


//endregion
//region --- Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Mekko.prototype.serialize = function() {
  var json = anychart.charts.Mekko.base(this, 'serialize');
  json['type'] = this.getType();

  if (this.pointsPadding())
    json['pointsPadding'] = this.pointsPadding();

  return {'chart': json};
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.serializeWithScales = function(json, scales, scaleIds) {
  this.serializeScale(json, 'leftCategoriesScale', /** @type {anychart.scales.Base} */(this.leftCategoriesScale()), scales, scaleIds);
  this.serializeScale(json, 'rightCategoriesScale', /** @type {anychart.scales.Base} */(this.rightCategoriesScale()), scales, scaleIds);

  anychart.charts.Mekko.base(this, 'serializeWithScales', json, scales, scaleIds);
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Mekko.base(this, 'setupByJSON', config, opt_default);

  this.pointsPadding(config['pointsPadding']);
};


//endregion


//exports
(function() {
  var proto = anychart.charts.Mekko.prototype;
  proto['leftCategoriesScale'] = proto.leftCategoriesScale;
  proto['rightCategoriesScale'] = proto.rightCategoriesScale;
  proto['pointsPadding'] = proto.pointsPadding;
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  proto['barsPadding'] = proto.barsPadding;
  proto['barGroupsPadding'] = proto.barGroupsPadding;
  proto['crosshair'] = proto.crosshair;
  proto['xAxis'] = proto.xAxis;
  proto['getXAxesCount'] = proto.getXAxesCount;
  proto['yAxis'] = proto.yAxis;
  proto['getYAxesCount'] = proto.getYAxesCount;
  proto['getSeries'] = proto.getSeries;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['annotations'] = proto.annotations;
})();
