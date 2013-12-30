function Table(col, header){
  this.columns = cloneArray(col);
  this.names = cloneArray(col);
  this.tableProperties = {"table":{}, "head-row":{}, "head-data":{},"body-row":{}, "body-data":{}};
  this.columnProcesses = [];
  this.headerProperties = [];
  this.columnProperties = [];
  this.headerProcesses = [];
  this.advancedColumnProcesses = [];
  if(header != undefined){
    for(var i = 0; header.length > i; i++){
      this.names[i] = header[i];
    }
  }

  this.setColumns = function(col){
    this.columns = cloneArray(col);
  }

  this.setHeaders = function(header){
    this.names = cloneArray(this.columns);
    for(var i = 0; header.length > i; i++){
      this.names[i] = header[i];
    }
  }
  
  this.setProperties = function(type, prop){
    setObject(this.tableProperties[type], prop);
  }

  this.addColumnProperty = function(col, proc){
    this.columnProperties[col] = proc;
  }

  this.addHeaderProcessor = function(col, proc){
    this.headerProcesses[col] = proc;
  }

  this.addColumnProcessor = function(col, proc){
    this.columnProcesses[col] = proc;
  }

  this.addAdvancedColumnProcessor = function(col, proc){
    this.advancedColumnProcesses[col] = proc;
  }

  this.buildTable = function(rows){
    var table = createElement("table", this.tableProperties["table"]);
    var head = createElement("thead");
    var headRow = createElement("tr", this.tableProperties["head-row"]);
    var body = createElement("tbody");

    for(row in this.names){
      var properties = cloneArray(this.tableProperties["head-data"]);
      var data = this.names[row];
      for (var attrname in this.columnProperties[this.columns[row]]) { properties[attrname] = this.columnProperties[this.columns[row]][attrname]; }
      console.log(properties);
      var header = createElement("th", properties);
      if(this.columns[row] in this.headerProcesses){
        data = this.headerProcesses[this.columns[row]](data);
      }
      if(typeof data == "object")
        insertElementAt(data, header);
      else
        header.innerHTML = data;
      insertElementAt(header, headRow);
    }
    for(row in rows){
      var properties = cloneArray(this.tableProperties["body-data"]);
      var bodyRow = createElement("tr", this.tableProperties["body-row"]);
      var workingRow = rows[row];

      for(col in this.columns){
        console.log(this.tableProperties["body-data"]);
        var properties = cloneArray(this.tableProperties["body-data"]);
        var data = workingRow[this.columns[col]];
        for (var attrname in this.columnProperties[this.columns[col]]) { properties[attrname] = this.columnProperties[this.columns[col]][attrname]; }
        console.log(properties);
        var cell = createElement("td", properties);

        if(this.columns[col] in this.columnProcesses){
          data = this.columnProcesses[this.columns[col]](data);
        }
        if(this.columns[col] in this.advancedColumnProcesses){
          data = this.advancedColumnProcesses[this.columns[col]](workingRow);
        }
        if(typeof data == "object")
          insertElementAt(data, cell)
        else
          cell.innerHTML = data;
        insertElementAt(cell, bodyRow);
      }
      insertElementAt(bodyRow, body);
    }
    insertElementAt(headRow, head);
    insertElementAt(head, table);
    insertElementAt(body, table);
    return table;
  }
   return this;
}
