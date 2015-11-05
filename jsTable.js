/* Globals */

var jsTable = {

  selectorPrefix: 'jstable-',

  resizeInfo : {
    currentDragWidth: 0,
    currentDragX: 0,
    currentSeparatorIndex: null,
    mouseDown: false
  },

  numberCols: [],

  separatorWidth : 0,
  numCols : 3,
  separatorClass : 'table-col-',

  initialize: function(initData) {
  	
  	if (JSON.stringify(initData.data) === '{}'){
  		return;
  	}

    determineColumnTypes(this, initData);

    initHTML(this, initData);

    setUpDynamicStyling(this);

    normalizeRowLengths(this, initData);

    setUpScroll(this, initData);

    setUpDocumentEvents(this);

    setUpSeparatorEvents(this);

    setUpSortEvents(this, initData);

  }
}

var determineColumnTypes = function(self, initData){
  for (var key in initData.data){
    for (var i=0; i<initData.data[key].length; i++){
      if (isNaN(initData.data[key][i])){
        break;
      } else if (i === initData.data[key].length - 1){
        self.numberCols.push(key);
      }
    }
  }
}

var initHTML = function(self, initData){
  var table = document.createElement('div');
  table.className = self.selectorPrefix+'table';

  var headerRow = document.createElement('div');
  headerRow.className = self.selectorPrefix+'header-row '+self.selectorPrefix+'table-row';

  /* Header columns */
  var i = 0;
  var validKey = '';
  for (var key in initData.data){
    var header = document.createElement('div');
    header.className = self.selectorPrefix+'row-content '+self.selectorPrefix+'data-content '+self.selectorPrefix+'table-col-'+i;;

    var textSpan = document.createElement('span');
    textSpan.innerHTML = key === '' ? ' ' : key;

    var separator = document.createElement('div');
    separator.className = self.selectorPrefix+'row-content '+self.selectorPrefix+'separator';
    separator.setAttribute('index', i);

    var sortIcon = document.createElement('span');
    sortIcon.className = self.selectorPrefix+'row-content '+self.selectorPrefix+'sort-icon '+self.selectorPrefix+'sort-icon-none';

    header.appendChild(textSpan);
    header.appendChild(sortIcon);
    headerRow.appendChild(header);
    headerRow.appendChild(separator);

    validKey = key;
    i+=1;
  }


  /* Data */
  var dataContainer = document.createElement('div');
  dataContainer.className = self.selectorPrefix+'data-container';

  var data = document.createElement('div');
  data.className = self.selectorPrefix+'data';

  for (var i=0; i<initData.data[validKey].length; i++){
    var row = document.createElement('div');
    row.className = self.selectorPrefix+'content-row '+self.selectorPrefix+'table-row';
    row.id = self.selectorPrefix+'data-row-'+i

    var j=0;
    for(var col in initData.data){
      var cell = document.createElement('div');
      cell.className = self.selectorPrefix+'row-content '+self.selectorPrefix+'data-content '+self.selectorPrefix+'table-col-'+j;
      cell.innerHTML = initData.data[col][i];
      row.appendChild(cell);

      j+=1;
    }

    data.appendChild(row);
  }

  dataContainer.appendChild(data);
  table.appendChild(headerRow);
  table.appendChild(dataContainer);
  initData.container.appendChild(table);
};

var setUpDynamicStyling = function(self){
  var style = document.createElement('style');
  style.id = self.selectorPrefix+'style';
  document.getElementsByTagName('head')[0].appendChild(style);
}

var normalizeRowLengths = function(self, initData){
  for (var i=0;i<Object.keys(initData.data).length;i++){
      var selector = self.selectorPrefix+self.separatorClass+i;
      var maxWidth = 0;
      var column = document.getElementsByClassName(selector);
      for (var j=0;j<column.length;j++){
        if (column[j].offsetWidth > maxWidth){
          maxWidth = column[j].offsetWidth;
        }
      }
      for (var j=0;j<column.length;j++){
        var width = maxWidth;
        if (j !== 0 && i !== 0){
          width = maxWidth + self.separatorWidth;
        }
        column[j].setAttribute('style', 'width:'+width+'px;');
        column[j].style.width = width;
        var textContainer = column[j];
        if (textContainer.childNodes[0] && textContainer.childNodes[0].setAttribute){
          textContainer = textContainer.childNodes[0];
        }
        textContainer.setAttribute('title', textContainer.innerHTML);
      }
    }
}

var setUpScroll = function(self, initData, heightOnly){

  var dataHeight = initData.container.offsetHeight - document.getElementsByClassName(self.selectorPrefix+'header-row')[0].offsetHeight - 10;
  document.getElementsByClassName(self.selectorPrefix+'data')[0].setAttribute('style', 'height:'+dataHeight+'px;');

  if (heightOnly) { return; }

	var tableWidth = document.getElementsByClassName(self.selectorPrefix+'header-row')[0].offsetWidth+10;
	document.getElementsByClassName(self.selectorPrefix+'table')[0].setAttribute('style', 'width:'+tableWidth+'px;');

  var data = document.getElementsByClassName('jstable-data')[0];

  data.onscroll = function(e){
    console.log(e);
    console.log(scrollTop);
  }

};

var setUpDocumentEvents = function(self){
  document.documentElement.addEventListener('mousemove', function(e) {
      if (self.resizeInfo.mouseDown){
        var width = self.resizeInfo.currentDragWidth+(e.pageX-self.resizeInfo.currentDragX);
        var tableWidth = self.resizeInfo.currentTableWidth+(e.pageX-self.resizeInfo.currentDragX);
        if (e.pageX !== 0 && width >= 20){
          var column = document.getElementsByClassName(self.selectorPrefix+'table-col-'+self.resizeInfo.currentSeparatorIndex);
          for(var j=0;j<column.length;j++){
            /* Update column width */
            var addedWidth = 0;
            column[j].setAttribute('style', 'width:'+(width+addedWidth)+'px;');
            document.getElementsByClassName(self.selectorPrefix+'header-row')[0].setAttribute('style', 'width:'+(tableWidth)+'px;');

            /*
             *
             * Update column text
             *
             */

            /* If it gets smaller */

            var textContainer = column[j];
            if (textContainer.childNodes[0] && textContainer.childNodes[0].setAttribute){
              textContainer = textContainer.childNodes[0];
            }
            if(e.pageX < self.resizeInfo.lastX) {
              var text = textContainer.innerHTML;
              while (column[j].scrollWidth > column[j].clientWidth && text !== '..'){
                text = text.slice(0, text.length-1)
                if (text.length < 1){
                  text = '..';
                }
                textContainer.innerHTML = text === '..' ? text : text+'..';
              }
            }
            /* If it gets bigger */
            else {
              var fullText = textContainer.getAttribute('title');
              var text = textContainer.innerHTML;
              if (text.indexOf('..', text.length-2) === text.length -2){
                text = fullText.slice(0, text.length - 2);
              }
              var text = textContainer.innerHTML;
              var inLoop = false;
              while (column[j].scrollWidth === column[j].clientWidth && fullText !== textContainer.innerHTML){
                inLoop = true;
                text = fullText.slice(0, text.length + 1);
                textContainer.innerHTML = text === fullText ? text : text +'..';
              }
              if (fullText !== textContainer.innerHTML && inLoop) {
                textContainer.innerHTML = fullText.slice(0, text.length - 3)+'..';
              }
              while (column[j].scrollWidth > column[j].clientWidth && text !== '..'){
                text = text.slice(0, text.length-1)
                if (text.length < 1){
                  text = '..';
                }
                textContainer.innerHTML = text === '..' ? text : text+'..';
              }
            }
          }

          /* Update the table width if necessary */
          var tableWidthActual = document.getElementsByClassName(self.selectorPrefix+'header-row')[0].offsetWidth+10;
          var tableWidthSet = pxToNumber(document.getElementsByClassName(self.selectorPrefix+'table')[0].style.width);
          if (e.pageX > self.resizeInfo.lastX && tableWidthActual > tableWidthSet){
          	var tableWidth = self.resizeInfo.currentTableWidth+(e.pageX-self.resizeInfo.currentDragX);
          	document.getElementsByClassName(self.selectorPrefix+'table')[0].setAttribute('style', 'width:'+tableWidth+'px;')
          }

          /* Set the last X */
          self.resizeInfo.lastX = e.pageX;
        }
      }
    });

    document.documentElement.addEventListener('mouseup', function(e) {
      /* Disengage */
      if (self.resizeInfo.mouseDown){

        /* Deal with the cursor */
        var style = document.getElementById(self.selectorPrefix+'style')
        if (style.childNodes[0]){
          style.removeChild(style.childNodes[0]);
        }
      }
      self.resizeInfo.mouseDown = false;
    });
};

var setUpSeparatorEvents = function(self){
  var headerRow = document.getElementsByClassName(self.selectorPrefix+'header-row')[0];
  var sepHeight = headerRow.offsetHeight;
  var separators = document.getElementsByClassName(self.selectorPrefix+'separator');
    for (var i=0;i<separators.length;i++){

      /* Set the separators to the appropriate heights */
      separators[i].setAttribute('style', 'height:'+sepHeight+'px;');

      separators[i].addEventListener('mousedown', function(e) {
        e.preventDefault();

        /* Deal with the cursor */
        var style = document.getElementById(self.selectorPrefix+'style')
        style.appendChild(document.createTextNode(
        'html, .jstable-data, .jstable-header-row .jstable-data-content {'+
          'cursor: col-resize; !important'+
        '}'));

        var width = document.querySelector('.'+self.selectorPrefix+'header-row '+'.'+self.selectorPrefix+'table-col-'+this.getAttribute('index')).style.width;
        var intWidth = pxToNumber(width);
        var tableWidth = document.getElementsByClassName(self.selectorPrefix+'header-row')[0].offsetWidth;
        self.resizeInfo.currentDragWidth = intWidth;
        self.resizeInfo.currentTableWidth = tableWidth;
        self.resizeInfo.currentDragX = e.pageX;
        self.resizeInfo.lastX = e.pageX;
        self.resizeInfo.mouseDown = true;
        self.resizeInfo.currentSeparatorIndex = this.getAttribute('index');
      });
    }
}

var setUpSortEvents = function(self, initData){
  var headers = document.getElementsByClassName(self.selectorPrefix+'header-row')[0].childNodes;
  for(var i=0; i<headers.length; i++){
    headers[i].addEventListener('click', function(e){

      if (this.className.indexOf(self.selectorPrefix+'separator') === -1){

        /* Deal with the icons */
        var sortIcon = this.getElementsByClassName(self.selectorPrefix+'sort-icon')[0]
        var sortIconClass = sortIcon.className;
        var descend = true;

        if (sortIconClass.indexOf(self.selectorPrefix+'sort-icon-none') !== -1){
          sortIconClass = sortIconClass.split(self.selectorPrefix+'sort-icon-none').join('');
          sortIconClass = sortIconClass+self.selectorPrefix+'sort-icon-down';
        } else if (sortIconClass.indexOf(self.selectorPrefix+'sort-icon-down') !== -1){
          sortIconClass = sortIconClass.split(self.selectorPrefix+'sort-icon-down').join('');
          sortIconClass = sortIconClass+self.selectorPrefix+'sort-icon-up';
          descend = false;
        } else {
          sortIconClass = sortIconClass.split(self.selectorPrefix+'sort-icon-up').join('');
          sortIconClass = sortIconClass+self.selectorPrefix+'sort-icon-down';
        }

        var up = document.getElementsByClassName(self.selectorPrefix+'sort-icon-up')
        if (up[0] && up[0] !== sortIcon){
          var className = up[0].className.split(self.selectorPrefix+'sort-icon-up').join('');
          className = className+self.selectorPrefix+'sort-icon-none';
          up[0].className = className;
        }

        var down = document.getElementsByClassName(self.selectorPrefix+'sort-icon-down')
        if (down[0] && down[0] !== sortIcon){
          var className = down[0].className.split(self.selectorPrefix+'sort-icon-down').join('');
          className = className+self.selectorPrefix+'sort-icon-none';
          down[0].className = className;
        }

        sortIcon.className = sortIconClass;

        /* Sort the data */
        var data = initData.data[this.childNodes[0].getAttribute('title')];
        var indexedData = [];
        for(var j=0; j<data.length; j++){
          indexedData.push({
            index: j,
            data: data[j]
          });
        }

        var sortedData = [];
        if (self.numberCols.indexOf(this.childNodes[0].getAttribute('title')) !== -1){
          sortedData = indexedData.sort(function(a, b){
            return parseFloat(a.data) > parseFloat(b.data) ? 1 : -1;
          });
        } else {
          sortedData = indexedData.sort(function(a, b){
            return (''+a.data).localeCompare(''+b.data);
          });
        }

        if (!descend){
          sortedData = sortedData.reverse();
        }

        /* Change the display */
        var newDataContainer = document.createElement('div');
        newDataContainer.className = self.selectorPrefix+'data-container';

        var newData = document.createElement('div');
        newData.className = self.selectorPrefix+'data';

        for(var j=0; j<sortedData.length; j++){
          newData.appendChild(document.getElementById(self.selectorPrefix+'data-row-'+sortedData[j].index));
        }

        newDataContainer.appendChild(newData);
        var table = document.getElementsByClassName(self.selectorPrefix+'table')[0];
        var oldDataContainer = document.getElementsByClassName(self.selectorPrefix+'data-container')[0];

        table.removeChild(oldDataContainer);
        table.appendChild(newDataContainer);

        setUpScroll(self, initData, true);
      }

    });
  }
}

var pxToNumber = function(px){
	return Math.round(px.slice(0, px.length-2));
}
