/* Globals */

var jsTable = {

  resizeInfo : {
    currentDragWidth: 0,
    currentDragX: 0,
    currentSeparatorIndex: null,
    mouseDown: false
  },

  separatorWidth : 0,
  numCols : 3,
  separatorClass : 'table-col-',

  intitalize: function(initData) {

    initHTML(initData);

    normalizeRowLengths(this);

    setUpScroll(initData);

    setUpDocumentEvents(this);
    
    setUpSeparatorEvents(this);

  }
}

var normalizeRowLengths = function(self){
  for (var i=0;i<self.numCols;i++){
      var selector = self.separatorClass+i;
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
        column[j].setAttribute('title', column[j].innerHTML);
      }
    }
}

var initHTML = function(initData){
  var table = document.createElement('div');
  table.className = 'table';

  var headerRow = document.createElement('div');
  headerRow.className = 'header-row table-row';

  /* Header columns */
  var i = 0;
  var validKey = '';
  for (var key in initData.data){
    var header = document.createElement('div');
    header.className = 'row-content data-content table-col-'+i;
    header.innerHTML = key;

    var separator = document.createElement('div');
    separator.className = 'row-content separator';
    separator.index = i;

    headerRow.appendChild(header);
    headerRow.appendChild(separator);

    validKey = key;
    i+=1;
  }

  var data = document.createElement('data');
  data.className = 'data';

  /* Data */
  for (var i=0; i<initData.data[validKey].length; i++){
    var row = document.createElement('div');
    row.className = 'content-row table-row';

    var j=0;
    for(var col in initData.data){
      var cell = document.createElement('div');
      cell.className = 'row-content data-content table-col-'+j;
      console.log(initData.data[col][i]);
      cell.innerHTML = initData.data[col][i];
      row.appendChild(cell);

      j+=1;
    }

    data.appendChild(row);
  }

  table.appendChild(headerRow);
  table.appendChild(data);
  console.log(table);
  initData.container.appendChild(table);
};

var setUpScroll = function(initData){
  var dataHeight = initData.container.offsetHeight - document.getElementsByClassName('header-row')[0].offsetHeight;
  document.getElementsByClassName('data')[0].setAttribute('style', 'height:'+dataHeight+'px;overflow:auto;');
};

var setUpDocumentEvents(self){
  document.documentElement.addEventListener('mousemove', function(e) {
      if (self.resizeInfo.mouseDown){
        width = self.resizeInfo.currentDragWidth+(e.layerX-self.resizeInfo.currentDragX);
        if (e.layerX !== 0 && width >= 10){
          var column = document.getElementsByClassName('table-col-'+self.resizeInfo.currentSeparatorIndex);
          for(var j=0;j<column.length;j++){
            var addedWidth = 0;
            if (j !== 0 && self.resizeInfo.currentSeparatorIndex !== '0'){
              addedWidth = separatorWidth;
            }
            column[j].setAttribute('style', 'width:'+(width+addedWidth)+'px;');

            var text = column[j].getAttribute('title');
            column[j].innerHTML = text;
            while (column[j].scrollWidth > column[j].clientWidth && text !== '..'){
              text = text.slice(0, text.length-1)
              if (text.length < 1){
                text = '..'
              }
              column[j].innerHTML = text === '..' ? text : text+'..';
            }
          }
        }
      }
    });

    document.documentElement.addEventListener('mouseup', function(e) {
      if (self.resizeInfo.mouseDown){
        document.documentElement.style.cursor = 'default';
      }
      self.resizeInfo.mouseDown = false;
    });
};

var setUpSeparatorEvents = function(self){
  var separators = document.getElementsByClassName('separator');
    for (var i=0;i<separators.length;i++){
      headerRow = document.getElementsByClassName('header-row')[0];

      separators[i].setAttribute('style', 'height:'+headerRow.offsetHeight+'px;');

      separators[i].addEventListener('mousedown', function(e) {
        e.preventDefault();

        document.documentElement.style.cursor = 'col-resize';

        self.resizeInfo.currentDragWidth = document.querySelector('.header-row '+'.table-col-'+self.getAttribute('index')).offsetWidth;
        self.resizeInfo.currentDragX = e.layerX;
        self.resizeInfo.mouseDown = true;
        self.resizeInfo.currentSeparatorIndex = self.getAttribute('index');
      });


    }
}
