goog.provide('anychart.charts.HeatMap');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.grids.Linear');
goog.require('anychart.core.reporting');
goog.require('anychart.core.series.HeatMap');
goog.require('anychart.core.ui.ChartScroller');
goog.require('anychart.core.utils.IZoomableChart');
goog.require('anychart.core.utils.OrdinalZoom');
goog.require('anychart.enums');
goog.require('anychart.scales.Ordinal');
goog.require('anychart.scales.OrdinalColor');



/**
 * AnyChart Hea tMap class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @implements {anychart.core.utils.IZoomableChart}
 * @extends {anychart.core.CartesianBase}
 * @constructor
 */
anychart.charts.HeatMap = function(opt_data, opt_csvSettings) {
  anychart.charts.HeatMap.base(this, 'constructor');

  /**
   * Zoom settings.
   * @type {anychart.core.utils.OrdinalZoom}
   * @private
   */
  this.yZoom_ = new anychart.core.utils.OrdinalZoom(this, false);

  this.setType(anychart.enums.ChartTypes.HEAT_MAP);

  /**
   * Series.
   * @type {anychart.core.series.Cartesian}
   * @private
   */
  this.series_ = this.createSeriesByType('heatMap', opt_data || null, opt_csvSettings);
  this.series_.a11y(/** @type {boolean|Object|undefined} */(anychart.getFullTheme(this.getType() + '.defaultSeriesSettings.base.a11y')));
};
goog.inherits(anychart.charts.HeatMap, anychart.core.CartesianBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.HeatMap.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.CartesianBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.HEATMAP_Y_SCROLLER;


/**
 * Series config for HeatMap chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.charts.HeatMap.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
  anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
  anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
  // anychart.core.series.Capabilities.ALLOW_ERROR |
  anychart.core.series.Capabilities.SUPPORTS_MARKERS |
  anychart.core.series.Capabilities.SUPPORTS_LABELS |
  0);
  res['heatMap'] = {
    drawerType: anychart.enums.SeriesDrawerTypes.HEAT_MAP,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathTopArea3DConfig,
      anychart.core.shapeManagers.pathBottom3DConfig,
      anychart.core.shapeManagers.pathLeft3DConfig,
      anychart.core.shapeManagers.pathRight3DConfig,
      anychart.core.shapeManagers.pathBack3DConfig,
      anychart.core.shapeManagers.pathFront3DConfig,
      // anychart.core.shapeManagers.pathRight3DHatchConfig,
      // anychart.core.shapeManagers.pathTop3DHatchConfig,
      anychart.core.shapeManagers.pathFront3DHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  return res;
})();


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getConfigByType = function(type) {
  if (this.series_)
    return null;
  return anychart.charts.HeatMap.base(this, 'getConfigByType', type);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.createSeriesInstance = function(type, config) {
  return new anychart.core.series.HeatMap(this, this, type, config, true);
};


// /** @inheritDoc */
// anychart.charts.HeatMap.prototype.setupSeries = function(series) {
//   anychart.charts.HeatMap
// };


//----------------------------------------------------------------------------------------------------------------------
//
//  Zoom
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Ensures that scales are ready for zooming.
 */
anychart.charts.HeatMap.prototype.ensureScalesReadyForZoom = function() {
  this.makeScaleMaps();
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES)) {
    if (!!this.xZoom().getSetup() || !!this.yZoom().getSetup())
      this.calculate();
  }
};


/**
 * Y Zoom settings getter/setter.
 * @param {(number|boolean|null|Object)=} opt_value
 * @return {anychart.charts.HeatMap|anychart.core.utils.OrdinalZoom}
 */
anychart.charts.HeatMap.prototype.yZoom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.suspendSignalsDispatching();
    this.yZoom_.setup(opt_value);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.yZoom_;
};


/**
 * Y Scroller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.ChartScroller|anychart.charts.HeatMap}
 */
anychart.charts.HeatMap.prototype.yScroller = function(opt_value) {
  if (!this.yScroller_) {
    this.yScroller_ = new anychart.core.ui.ChartScroller();
    this.yScroller_.setParentEventTarget(this);
    this.yScroller_.listenSignals(this.yScrollerInvalidated_, this);
    this.eventsHandler.listen(this.yScroller_, anychart.enums.EventType.SCROLLER_CHANGE, this.scrollerChangeHandler);
    this.eventsHandler.listen(this.yScroller_, anychart.enums.EventType.SCROLLER_CHANGE_FINISH, this.scrollerChangeHandler);
    this.invalidate(
        anychart.ConsistencyState.HEATMAP_Y_SCROLLER |
        anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.yScroller_.setup(opt_value);
    return this;
  } else {
    return this.yScroller_;
  }
};


/**
 * Scroller signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.HeatMap.prototype.yScrollerInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.HEATMAP_Y_SCROLLER;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  this.invalidate(state, signal);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.scrollerChangeHandler = function(e) {
  var zoom = e.target == this.xScroller() ? /** @type {anychart.core.utils.OrdinalZoom} */(this.xZoom()) : this.yZoom_;
  if (zoom.continuous() ^ e.type == anychart.enums.EventType.SCROLLER_CHANGE_FINISH) {
    e.preventDefault();
    this.suspendSignalsDispatching();
    zoom.setTo(e['startRatio'], e['endRatio']);
    this.resumeSignalsDispatching(true);
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.checkXScaleType = function(scale) {
  var res = (scale instanceof anychart.scales.Ordinal);
  if (!res)
    anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['HeatMap chart scale', 'ordinal']);
  return res;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.onGridSignal = function(event) {
  this.series_.invalidate(anychart.ConsistencyState.SERIES_POINTS);
  this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS | anychart.ConsistencyState.SERIES_CHART_SERIES,
      anychart.Signal.NEEDS_REDRAW);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.checkYScaleType = anychart.charts.HeatMap.prototype.checkXScaleType;


/** @inheritDoc */
anychart.charts.HeatMap.prototype.createScaleByType = function(value, isXScale, returnNullOnError) {
  value = String(value).toLowerCase();
  return (returnNullOnError && value != 'ordinal' && value != 'ord' && value != 'discrete') ?
      null :
      anychart.scales.ordinal();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Color scale.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Color scale.
 * @param {anychart.scales.OrdinalColor=} opt_value
 * @return {anychart.charts.HeatMap|anychart.scales.OrdinalColor}
 */
anychart.charts.HeatMap.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colorScale_ != opt_value) {
      if (this.colorScale_)
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
      this.colorScale_ = opt_value;
      if (this.colorScale_)
        this.colorScale_.listenSignals(this.colorScaleInvalidated_, this);

      this.invalidate(anychart.ConsistencyState.HEATMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.colorScale_;
};


/**
 * Chart scale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.charts.HeatMap.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.HEATMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.HeatMap.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    // we need to calculate statistics
    this.calculate();
    var scale = this.colorScale();
    if (scale && scale instanceof anychart.scales.OrdinalColor) {
      var series = this.seriesList[0];
      var ranges = scale.getProcessedRanges();
      for (i = 0, count = ranges.length; i < count; i++) {
        var range = ranges[i];
        data.push({
          'text': range.name,
          'iconEnabled': true,
          'iconType': anychart.enums.LegendItemIconType.SQUARE,
          'iconFill': range.color,
          'disabled': !this.enabled(),
          'sourceUid': goog.getUid(this),
          'sourceKey': i,
          'meta': {
            series: series,
            scale: scale,
            range: range
          }
        });
      }
    }
  }
  return data;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.CATEGORIES);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemClick = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;
  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = meta.series;
    var scale = meta.scale;

    if (scale && series) {
      var points = [];
      var range = meta.range;
      var iterator = series.getResetIterator();

      while (iterator.advance()) {
        var pointValue = iterator.get('heat');
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
          tag.points_ = {
            series: series,
            points: points
          };
        } else {
          tag.points_ = [{
            series: series,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.core.series.HeatMap} */(meta.series);
    var scale = meta.scale;
    if (scale && series) {
      var range = meta.range;
      var iterator = series.getResetIterator();

      var points = [];
      while (iterator.advance()) {
        var pointValue = iterator.get('heat');
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
          tag.points_ = {
            series: series,
            points: points
          };
        } else {
          tag.points_ = [{
            series: series,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemOut = function(item, event) {
  var meta = /** @type {Object} */(item.meta());

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag)
        tag.series = meta.series;
    }
  }
};


/**
 * Labels display mode.
 * @param {(string|anychart.enums.LabelsDisplayMode)=} opt_value Mode to set.
 * @return {string|anychart.enums.LabelsDisplayMode|anychart.charts.HeatMap}
 */
anychart.charts.HeatMap.prototype.labelsDisplayMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLabelsDisplayMode(opt_value);
    if (this.labelDisplayMode_ != opt_value) {
      this.labelDisplayMode_ = opt_value;
      this.series_.invalidate(anychart.ConsistencyState.SERIES_LABELS);
      this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.labelDisplayMode_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.HeatMap.prototype.createEventSeriesStatus = function(seriesStatus, opt_empty) {
  var eventSeriesStatus = [];
  for (var i = 0, len = seriesStatus.length; i < len; i++) {
    var status = seriesStatus[i];
    var nearestPointToCursor = status.nearestPointToCursor;
    var nearestPointToCursor_;
    if (nearestPointToCursor) {
      nearestPointToCursor_ = {
        'index': status.nearestPointToCursor.index,
        'distance': status.nearestPointToCursor.distance
      };
    } else {
      nearestPointToCursor_ = {
        'index': NaN,
        'distance': NaN
      };
    }
    eventSeriesStatus.push({
      'series': this,
      'points': opt_empty ? [] : status.points ? goog.array.clone(status.points) : [],
      'nearestPointToCursor': nearestPointToCursor_
    });
  }
  return eventSeriesStatus;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.makeCurrentPoint = function(seriesStatus, event, opt_empty) {
  var currentPoint = anychart.charts.HeatMap.base(this, 'makeCurrentPoint', seriesStatus, event, opt_empty);

  currentPoint['series'] = this;

  return currentPoint;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getPoint = function(index) {
  return this.series_.getPoint(index);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getValueFieldToSearchInData = function() {
  return 'heat';
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getBoundsWithoutAxes = function(contentAreaBounds, opt_scrollerSize) {
  var yScroller = /** @type {anychart.core.ui.ChartScroller} */(this.yScroller());
  var res = this.resetScrollerPosition(yScroller, contentAreaBounds);
  this.yScrollerSize_ = res.scrollerSize;
  return anychart.charts.HeatMap.base(this, 'getBoundsWithoutAxes', res.contentAreaBounds, opt_scrollerSize);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.applyScrollerOffset = function(offsets, scrollerSize) {
  offsets = anychart.charts.HeatMap.base(this, 'applyScrollerOffset', offsets, scrollerSize);
  var yScroller = /** @type {anychart.core.ui.ChartScroller} */(this.yScroller());
  return this.applyScrollerOffsetInternal(offsets, yScroller, this.yScrollerSize_);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getBoundsChangedSignal = function() {
  return anychart.charts.HeatMap.base(this, 'getBoundsChangedSignal') |
      anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
      anychart.ConsistencyState.HEATMAP_Y_SCROLLER;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.drawElements = function() {
  anychart.charts.HeatMap.base(this, 'drawElements');
  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_Y_SCROLLER)) {
    this.yScroller().container(this.rootElement);
    this.yScroller().draw();
    this.markConsistent(anychart.ConsistencyState.HEATMAP_Y_SCROLLER);
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.applyComplexZoom = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_ZOOM)) {
    var start, factor;

    start = this.xZoom().getStartRatio();
    factor = 1 / (this.xZoom().getEndRatio() - start);
    this.xScale().setZoom(factor, start);

    start = this.yZoom().getStartRatio();
    factor = 1 / (this.yZoom().getEndRatio() - start);
    this.yScale().setZoom(factor, start);

    this.xScroller().setRangeInternal(this.xZoom().getStartRatio(), this.xZoom().getEndRatio());
    this.yScroller().setRangeInternal(this.yZoom().getStartRatio(), this.yZoom().getEndRatio());

    this.markConsistent(anychart.ConsistencyState.CARTESIAN_ZOOM);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_X_SCROLLER | anychart.ConsistencyState.HEATMAP_Y_SCROLLER);
  }
};


anychart.charts.HeatMap.prototype.calculateXYScales = function() {
  var needsCalc = this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES |
      anychart.ConsistencyState.SCALE_CHART_Y_SCALES);

  anychart.charts.HeatMap.base(this, 'calculateXYScales');

  if (needsCalc) {
    var xFieldName, yFieldName, valueIndex, name;
    var xAutoNames = null;
    var yAutoNames = null;
    var yScale = this.yScale();
    var xScale = this.xScale();
    var xScaleNamesField = xScale.getNamesField();
    var yScaleNamesField = yScale.getNamesField();

    if (xScaleNamesField || yScaleNamesField) {
      if (xScaleNamesField) {
        xFieldName = xScaleNamesField;
        xAutoNames = [];
      }

      if (yScaleNamesField) {
        yFieldName = yScaleNamesField;
        yAutoNames = [];
      }

      var iterator = this.series_.getResetIterator();
      while (iterator.advance()) {
        if (xScaleNamesField) {
          valueIndex = xScale.getIndexByValue(iterator.get('x'));
          name = iterator.get(xFieldName);
          if (!goog.isDef(xAutoNames[valueIndex]))
            xAutoNames[valueIndex] = name || iterator.get('x') || iterator.get('heat');
        }


        if (yScaleNamesField) {
          valueIndex = yScale.getIndexByValue(iterator.get('y'));
          name = iterator.get(yFieldName);
          if (!goog.isDef(yAutoNames[valueIndex]))
            yAutoNames[valueIndex] = name || iterator.get('y') || iterator.get('heat');
        }
      }

      if (xScaleNamesField)
        xScale.setAutoNames(xAutoNames);
      if (yScaleNamesField)
        yScale.setAutoNames(yAutoNames);
    }
  }
};


/**
 * @inheritDoc
 */
anychart.charts.HeatMap.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES |
          anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
          anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS)) {
    var iterator, value;

    var yScale = /** @type {anychart.scales.Base} */(this.yScale());
    var xScale = /** @type {anychart.scales.Base} */(this.xScale());

    this.series_.xScale(xScale);
    this.series_.yScale(yScale);

    var xScaleNeedAutoCalc = xScale.needsAutoCalc();
    var yScaleNeedAutoCalc = yScale.needsAutoCalc();

    if (xScaleNeedAutoCalc || yScaleNeedAutoCalc) {
      if (xScaleNeedAutoCalc) xScale.startAutoCalc();
      if (yScaleNeedAutoCalc) yScale.startAutoCalc();

      iterator = this.series_.getResetIterator();
      while (iterator.advance()) {
        if (xScaleNeedAutoCalc) {
          value = iterator.get('x');
          if (goog.isDef(value)) {
            xScale.extendDataRange(value);
          }
        }

        if (yScaleNeedAutoCalc) {
          value = iterator.get('y');
          if (goog.isDef(value)) {
            yScale.extendDataRange(value);
          }
        }
      }
    }

    var scalesChanged = false;

    if (this.xScale().needsAutoCalc())
      scalesChanged |= this.xScale().finishAutoCalc();

    if (this.yScale().needsAutoCalc())
      scalesChanged |= this.yScale().finishAutoCalc();

    if (scalesChanged) {
      this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.SCALE_CHART_STATISTICS);
      this.series_.invalidate(anychart.ConsistencyState.SERIES_COLOR);
    }
    this.markConsistent(anychart.ConsistencyState.SCALE_CHART_SCALES |
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
        anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_COLOR_SCALE)) {
    if (this.colorScale_ && this.colorScale_.needsAutoCalc()) {
      this.colorScale_.startAutoCalc();
      iterator = this.series_.getResetIterator();
      while (iterator.advance()) {
        this.colorScale_.extendDataRange(iterator.get('heat'));
      }
      this.colorScale_.finishAutoCalc();
    }
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES);
    this.series_.invalidate(anychart.ConsistencyState.SERIES_COLOR);
    this.markConsistent(anychart.ConsistencyState.HEATMAP_COLOR_SCALE);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Overwritten series methods. (for encapsulation series)
//
//----------------------------------------------------------------------------------------------------------------------
(function() {
  /**
   * A proxy template to make partials for the methods of series.
   * @param {string} name
   * @param {...*} var_args
   * @return {anychart.charts.HeatMap|*}
   * @this {anychart.charts.HeatMap}
   */
  var proxy = function(name, var_args) {
    var args = [];
    for (var i = 1; i < arguments.length; i++)
      args.push(arguments[i]);
    var res = this.series_[name].apply(this.series_, args);
    return goog.isDef(args[1]) ? res : this;
  };
  var methods = [
    'fill',
    'hoverFill',
    'selectFill',
    'stroke',
    'hoverStroke',
    'selectStroke',
    'hatchFill',
    'hoverHatchFill',
    'selectHatchFill',
    // it seems that default chart labels method should work ok
    // 'labels',
    // 'hoverLabels',
    // 'selectLabels',
    'markers',
    'hoverMarkers',
    'selectMarkers'
  ];
  for (var i = 0; i < methods.length; i++) {
    var name = methods[i];
    anychart.charts.HeatMap.prototype[name] = goog.partial(proxy, name);
  }
})();


/**
 * Getter/setter for mapping.
 * @param {?(anychart.data.View|anychart.data.Set|anychart.data.TableData|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.charts.HeatMap|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.HeatMap.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) this.title(title);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }
    this.series_.data(opt_value, opt_csvSettings);
    return this;
  }
  return /** @type {!anychart.data.View} */(this.series_.data());
};


/**
 * If index is passed, hovers a point by its index, else hovers all points.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.charts.HeatMap} instance for method chaining.
 */
anychart.charts.HeatMap.prototype.hover = function(opt_indexOrIndexes) {
  this.series_.hover(opt_indexOrIndexes);
  return this;
};


/**
 * Imitates selects a point by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.charts.HeatMap} instance for method chaining.
 */
anychart.charts.HeatMap.prototype.select = function(opt_indexOrIndexes) {
  this.series_.select(opt_indexOrIndexes);
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.charts.HeatMap.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.HeatMap.base(this, 'setupByJSON', config, opt_default);

  if ('defaultXAxisSettings' in config)
    this.defaultXAxisSettings(config['defaultXAxisSettings']);

  if ('defaultYAxisSettings' in config)
    this.defaultYAxisSettings(config['defaultYAxisSettings']);

  if ('defaultGridSettings' in config)
    this.defaultGridSettings(config['defaultGridSettings']);

  var i, json, scale;
  var grids = config['grids'];
  var xAxes = config['xAxes'];
  var yAxes = config['yAxes'];
  var scales = config['scales'];
  var type = this.getType();

  var scalesInstances = {};
  if (goog.isArray(scales)) {
    for (i = 0; i < scales.length; i++) {
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type, anychart.enums.ScaleTypes.ORDINAL);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  } else if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type, anychart.enums.ScaleTypes.ORDINAL);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  }

  json = config['xScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], true);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.xScale(scale);

  json = config['yScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], false);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.yScale(scale);

  json = config['colorScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], null);
    if (scale)
      scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.colorScale(scale);

  if (goog.isArray(xAxes)) {
    for (i = 0; i < xAxes.length; i++) {
      json = xAxes[i];
      this.xAxis(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.xAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(yAxes)) {
    for (i = 0; i < yAxes.length; i++) {
      json = yAxes[i];
      this.yAxis(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.yAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(grids)) {
    for (i = 0; i < grids.length; i++) {
      json = grids[i];
      this.grid(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.grid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isFunction(this['fill']))
    this.fill(config['fill']);
  if (goog.isFunction(this['hoverFill']))
    this.hoverFill(config['hoverFill']);
  if (goog.isFunction(this['selectFill']))
    this.selectFill(config['selectFill']);

  if (goog.isFunction(this['stroke']))
    this.stroke(config['stroke']);
  if (goog.isFunction(this['hoverStroke']))
    this.hoverStroke(config['hoverStroke']);
  if (goog.isFunction(this['selectStroke']))
    this.selectStroke(config['selectStroke']);

  if (goog.isFunction(this['hatchFill']))
    this.hatchFill(config['hatchFill']);
  if (goog.isFunction(this['hoverHatchFill']))
    this.hoverHatchFill(config['hoverHatchFill']);
  if (goog.isFunction(this['selectHatchFill']))
    this.selectHatchFill(config['selectHatchFill']);

  if ('data' in config)
    this.data(config['data'] || null);

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.hoverLabels().setupInternal(!!opt_default, config['hoverLabels']);
  this.selectLabels().setupInternal(!!opt_default, config['selectLabels']);

  this.markers().setup(config['markers']);
  this.hoverMarkers().setup(config['hoverMarkers']);
  this.selectMarkers().setup(config['selectMarkers']);

  this.labelsDisplayMode(config['labelsDisplayMode']);

  this.xScroller(config['xScroller']);
  this.yScroller(config['yScroller']);

  var xZoom = config['xZoom'];
  var tmp;
  if (goog.isObject(xZoom) && (goog.isNumber(xZoom['scale']) || goog.isString(xZoom['scale']))) {
    tmp = xZoom['scale'];
    xZoom['scale'] = scalesInstances[xZoom['scale']];
    this.xZoom(xZoom);
    xZoom['scale'] = tmp;
  } else {
    this.xZoom(xZoom);
  }

  var yZoom = config['yZoom'];
  if (goog.isObject(yZoom) && (goog.isNumber(yZoom['scale']) || goog.isString(yZoom['scale']))) {
    tmp = yZoom['scale'];
    yZoom['scale'] = scalesInstances[yZoom['scale']];
    this.xZoom(yZoom);
    yZoom['scale'] = tmp;
  } else {
    this.xZoom(yZoom);
  }
};


/**
 * @inheritDoc
 */
anychart.charts.HeatMap.prototype.serialize = function() {
  var json = anychart.charts.HeatMap.base(this, 'serialize');
  var i;
  var scalesIds = {};
  var scales = [];
  var axesIds = [];

  var scale;
  var config;
  var objId;
  var axisId;
  var axis;
  var axisIndex;
  var axisScale;
  var axisOrientation;
  var isHorizontal;

  scalesIds[goog.getUid(this.xScale())] = this.xScale().serialize();
  scales.push(scalesIds[goog.getUid(this.xScale())]);
  json['xScale'] = scales.length - 1;

  if (this.xScale() != this.yScale()) {
    scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
    scales.push(scalesIds[goog.getUid(this.yScale())]);
  }
  json['yScale'] = scales.length - 1;

  if (this.colorScale()) {
    scalesIds[goog.getUid(this.colorScale())] = this.colorScale().serialize();
    scales.push(scalesIds[goog.getUid(this.colorScale())]);
    json['colorScale'] = scales.length - 1;
  }

  json['type'] = this.getType();

  var xAxes = [];
  for (i = 0; i < this.xAxes_.length; i++) {
    var xAxis = this.xAxes_[i];
    if (xAxis) {
      config = xAxis.serialize();
      scale = xAxis.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }
      xAxes.push(config);
    }
  }
  if (xAxes.length)
    json['xAxes'] = xAxes;

  var yAxes = [];
  for (i = 0; i < this.yAxes_.length; i++) {
    var yAxis = this.yAxes_[i];
    if (yAxis) {
      config = yAxis.serialize();
      scale = yAxis.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }
      yAxes.push(config);
    }
  }
  if (yAxes.length)
    json['yAxes'] = yAxes;


  var grids = [];
  for (i = 0; i < this.grids_.length; i++) {
    var grid = this.grids_[i];
    if (grid) {
      config = grid.serialize();
      scale = grid.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }

      axis = grid.axis();
      if (axis) {
        axisId = goog.getUid(axis);
        axisIndex = goog.array.indexOf(axesIds, axisId);
        if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
          axisScale = axis.scale();
          if (!('layout' in config)) {
            axisOrientation = axis.orientation();
            isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
            config['layout'] = isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
          }
          if (!('scale' in config)) { //doesn't override the scale already set.
            objId = goog.getUid(axisScale);
            if (!scalesIds[objId]) {
              scalesIds[objId] = axisScale.serialize();
              scales.push(scalesIds[objId]);
              config['scale'] = scales.length - 1;
            } else {
              config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
            }
          }
        } else {
          config['axis'] = axisIndex;
        }
      }

      grids.push(config);
    }
  }
  if (grids.length)
    json['grids'] = grids;

  if (scales.length)
    json['scales'] = scales;

  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series fill']
      );
    } else {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
    }
  }
  if (goog.isFunction(this['hoverFill'])) {
    if (goog.isFunction(this.hoverFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverFill']
      );
    } else {
      json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
    }
  }
  if (goog.isFunction(this['selectFill'])) {
    if (goog.isFunction(this.selectFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectFill']
      );
    } else {
      json['selectFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFill()));
    }
  }

  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series stroke']
      );
    } else {
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
    }
  }
  if (goog.isFunction(this['hoverStroke'])) {
    if (goog.isFunction(this.hoverStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverStroke']
      );
    } else {
      json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
    }
  }
  if (goog.isFunction(this['selectStroke'])) {
    if (goog.isFunction(this.selectStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectStroke']
      );
    } else {
      json['selectStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectStroke()));
    }
  }

  if (goog.isFunction(this['hatchFill'])) {
    if (goog.isFunction(this.hatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hatchFill']
      );
    } else {
      json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
    }
  }
  if (goog.isFunction(this['hoverHatchFill'])) {
    if (goog.isFunction(this.hoverHatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverHatchFill']
      );
    } else {
      var hoverHatchFill = this.hoverHatchFill();
      if (goog.isDef(hoverHatchFill)) {
        json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(hoverHatchFill));
      }
    }
  }
  if (goog.isFunction(this['selectHatchFill'])) {
    if (goog.isFunction(this.selectHatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectHatchFill']
      );
    } else {
      json['selectHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.selectHatchFill()));
    }
  }

  json['data'] = this.data().serialize();

  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().getChangedSettings();
  json['selectLabels'] = this.selectLabels().getChangedSettings();
  if (goog.isNull(json['hoverLabels']['enabled'])) {
    delete json['hoverLabels']['enabled'];
  }
  if (goog.isNull(json['selectLabels']['enabled'])) {
    delete json['selectLabels']['enabled'];
  }

  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();
  json['selectMarkers'] = this.selectMarkers().serialize();

  json['labelsDisplayMode'] = this.labelsDisplayMode();

  json['xScroller'] = this.xScroller().serialize();
  json['yScroller'] = this.yScroller().serialize();
  json['xZoom'] = this.xZoom().serialize();
  json['yZoom'] = this.yZoom().serialize();

  return {'chart': json};
};


/**
 * @inheritDoc
 */
anychart.charts.HeatMap.prototype.disposeInternal = function() {
  anychart.charts.HeatMap.base(this, 'disposeInternal');
  goog.disposeAll(this.yScroller_);
  this.yScroller_ = null;
  this.series_ = null;
};


//exports
(function() {
  var proto = anychart.charts.HeatMap.prototype;
  proto['getType'] = proto.getType;
  proto['grid'] = proto.grid;
  proto['xAxis'] = proto.xAxis;
  proto['yAxis'] = proto.yAxis;
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  proto['labelsDisplayMode'] = proto.labelsDisplayMode;
  // generated methods:
  // proto['fill'] = proto.fill;
  // proto['hoverFill'] = proto.hoverFill;
  // proto['selectFill'] = proto.selectFill;
  // proto['stroke'] = proto.stroke;
  // proto['hoverStroke'] = proto.hoverStroke;
  // proto['selectStroke'] = proto.selectStroke;
  // proto['hatchFill'] = proto.hatchFill;
  // proto['hoverHatchFill'] = proto.hoverHatchFill;
  // proto['selectHatchFill'] = proto.selectHatchFill;
  // proto['labels'] = proto.labels;
  // proto['hoverLabels'] = proto.hoverLabels;
  // proto['selectLabels'] = proto.selectLabels;
  // proto['markers'] = proto.markers;
  // proto['hoverMarkers'] = proto.hoverMarkers;
  // proto['selectMarkers'] = proto.selectMarkers;
  proto['hover'] = proto.hover;
  proto['select'] = proto.select;
  proto['unhover'] = proto.unhover;
  proto['unselect'] = proto.unselect;
  proto['data'] = proto.data;
  proto['colorScale'] = proto.colorScale;
  proto['xZoom'] = proto.xZoom;
  proto['yZoom'] = proto.yZoom;
  proto['xScroller'] = proto.xScroller;
  proto['yScroller'] = proto.yScroller;
  proto['annotations'] = proto.annotations;
})();
