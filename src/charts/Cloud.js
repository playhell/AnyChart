//region --- Requiring and Providing
goog.provide('anychart.charts.TagCloud');
goog.require('anychart.charts.SeparateChart');
//endregion



/**
 * TagCloud chart class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Resource Chart data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.charts.TagCloud = function(opt_data, opt_csvSettings) {
  anychart.charts.TagCloud.base(this, 'constructor');

  this.data(opt_data || null, opt_csvSettings);
};
goog.inherits(anychart.charts.TagCloud, anychart.core.SeparateChart);


//region --- Typedefs and consts
//------------------------------------------------------------------------------
//
//  Typedefs and consts
//
//------------------------------------------------------------------------------
/**
 * Word separators.
 * @type {String}
 * @const
 */
anychart.charts.TagCloud.WORD_SEPARATORS = /[ \f\n\r\t\v\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g;


/**
 * Unicode punctuation.
 * @type {String}
 * @const
 */
anychart.charts.TagCloud.PUNCTUATION = /[!-#%-*,-/:;?@\[-\]_{}\xa1\xa7\xab\xb6\xb7\xbb\xbf\u037e\u0387\u055a-\u055f\u0589\u058a\u05be\u05c0\u05c3\u05c6\u05f3\u05f4\u0609\u060a\u060c\u060d\u061b\u061e\u061f\u066a-\u066d\u06d4\u0700-\u070d\u07f7-\u07f9\u0830-\u083e\u085e\u0964\u0965\u0970\u0af0\u0df4\u0e4f\u0e5a\u0e5b\u0f04-\u0f12\u0f14\u0f3a-\u0f3d\u0f85\u0fd0-\u0fd4\u0fd9\u0fda\u104a-\u104f\u10fb\u1360-\u1368\u1400\u166d\u166e\u169b\u169c\u16eb-\u16ed\u1735\u1736\u17d4-\u17d6\u17d8-\u17da\u1800-\u180a\u1944\u1945\u1a1e\u1a1f\u1aa0-\u1aa6\u1aa8-\u1aad\u1b5a-\u1b60\u1bfc-\u1bff\u1c3b-\u1c3f\u1c7e\u1c7f\u1cc0-\u1cc7\u1cd3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205e\u207d\u207e\u208d\u208e\u2329\u232a\u2768-\u2775\u27c5\u27c6\u27e6-\u27ef\u2983-\u2998\u29d8-\u29db\u29fc\u29fd\u2cf9-\u2cfc\u2cfe\u2cff\u2d70\u2e00-\u2e2e\u2e30-\u2e3b\u3001-\u3003\u3008-\u3011\u3014-\u301f\u3030\u303d\u30a0\u30fb\ua4fe\ua4ff\ua60d-\ua60f\ua673\ua67e\ua6f2-\ua6f7\ua874-\ua877\ua8ce\ua8cf\ua8f8-\ua8fa\ua92e\ua92f\ua95f\ua9c1-\ua9cd\ua9de\ua9df\uaa5c-\uaa5f\uaade\uaadf\uaaf0\uaaf1\uabeb\ufd3e\ufd3f\ufe10-\ufe19\ufe30-\ufe52\ufe54-\ufe61\ufe63\ufe68\ufe6a\ufe6b\uff01-\uff03\uff05-\uff0a\uff0c-\uff0f\uff1a\uff1b\uff1f\uff20\uff3b-\uff3d\uff3f\uff5b\uff5d\uff5f-\uff65]/g;


/**
 * Unicode punctuation.
 * @type {String}
 * @const
 */
anychart.charts.TagCloud.DROP_TEXTS = /^(@|https?:|\/\/)/;


//endregion
//region --- Chart Infrastructure Overrides
//------------------------------------------------------------------------------
//
//  Chart Infrastructure Overrides
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.TagCloud.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES;


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getType = function() {
  return anychart.enums.ChartTypes.TagCloud;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getAllSeries = function() {
  return [];
};


//endregion
//region --- Private properties
//------------------------------------------------------------------------------
//
//  Private properties
//
//------------------------------------------------------------------------------
/**
 * Raw data holder.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.charts.TagCloud.prototype.rawData_;


/**
 * View to dispose on next data set, if any.
 * @type {goog.Disposable}
 * @private
 */
anychart.charts.TagCloud.prototype.parentViewToDispose_;


/**
 * Chart data.
 * @type {!anychart.data.View}
 * @private
 */
anychart.charts.TagCloud.prototype.data_;


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for chart data.
 * @param {?(anychart.data.View|anychart.data.Set|Array|anychart.data.DataSettings|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_settings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.charts.TagCloud|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.TagCloud.prototype.data = function(opt_value, opt_settings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (opt_value instanceof anychart.data.View)
        this.data_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.data_ = this.parentViewToDispose_ = opt_value.mapAs();
      else {
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_settings)).mapAs();
      }
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 *
 */
anychart.charts.TagCloud.prototype.ignoreList = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ignoreList_ != opt_value) {
      this.ignoreList_ = goog.isArray(opt_value) ? new RegExp('[' + t.join('|') + ']', 'g') : opt_value;
      this.invalidate();
    }
    return this;
  }
  return this.ignoreList_;
};


/**
 *
 */
anychart.charts.TagCloud.prototype.maxLength = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (this.maxLength_ != opt_value) {
      this.maxLength_ = opt_value;
      this.invalidate();
    }
    return this;
  }
  return this.maxLength_;
};


//endregion
//region --- Utils
/**
 * Parsing text.
 * @param {string} Text for parse.
 * @return {}
 */
anychart.charts.TagCloud.prototype.parseText = function(text) {
  var tags = {};
  var e = {};

  text.split(anychart.charts.Resource.WORD_SEPARATORS).forEach(function(t) {
    if (!anychart.charts.Resource.DROP_TEXTS.test(t)) {
      t = t.replace(anychart.charts.Resource.PUNCTUATION, '');
      if (!this.ignoreList_.test(t.toLowerCase())) {
        t = t.substr(0, this.maxLength_);
        e[t.toLowerCase()] = t;
        tags[t = t.toLowerCase()] = (tags[t] || 0) + 1;
      }
    }
  });

  tags = anychart.utils.entries(tags).sort(function(t, e) {
    return e.value - t.value;
  });

  goog.array.forEach(tags, function(t) {
    t.key = e[t.key];
  });

  return tags;
};


//endregion
//region --- Calculate
/**
 * Calculating.
 */
anychart.charts.TagCloud.prototype.calculate = function() {

  while (++i < n) {
    var d = data[i];
    d.x = (size[0] * (random() + .5)) >> 1;
    d.y = (size[1] * (random() + .5)) >> 1;
    cloudSprite(contextAndRatio, d, data, i);
    if (d.hasText && place(board, d, bounds)) {
      tags.push(d);
      event.call("word", cloud, d);
      if (bounds) cloudBounds(bounds, d);
      else bounds = [{
        x: d.x + d.x0,
        y: d.y + d.y0
      }, {
        x: d.x + d.x1,
        y: d.y + d.y1
      }];
      // Temporary hack
      d.x -= size[0] >> 1;
      d.y -= size[1] >> 1;
    }
  }
};


//endregion
//region --- Drawing
/**
 * Drawing.
 */
anychart.charts.TagCloud.prototype.draw = function() {
  this.calculate();


};



//endregion
//region --- Setup and Dispose
/** @inheritDoc */
anychart.charts.TagCloud.prototype.setupByJSON = function(config) {
  anychart.charts.TagCloud.base(this, 'setupByJSON', config);
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.serialize = function() {
  var json = anychart.charts.TagCloud.base(this, 'serialize');
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.disposeInternal = function() {
  anychart.charts.TagCloud.base(this, 'disposeInternal');
};


//endregion
//region --- Exports

//exports
//endregion
