//### Create Crossfilter Dimensions and Groups
//See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
var csv = "546_0803"
d3.select("#title-info").html("benchmark test<br/>data from: "+csv)
queue()
    .defer(d3.csv, "testdata_tempheaders/"+csv+".csv")
    .await(ready);

function getMaxKeyLength(group){
    var keyLengthMax =0
    for(var i in group.all()){
        var key = group.all()[i]["key"]
        if(key.length>keyLengthMax){
            keyLengthMax = key.length
        }
    }
    return keyLengthMax
}

var colors = ["#2e7c23","#9e9a1c","#31a750","#76a51a","#5e8f20","#37a029","#6ba841"]

function newRowChart(column,width,ndx,row){    
    var divName = column.split(" ").join("_")
    d3.select("#row"+row).append("div").attr("id",divName).attr("class","rowChart").html(column+"</br>")

    var ndimension = dimensionColumn(column,ndx)
    var ngroup = groupDimension(ndimension)
    
    var categories = ngroup.size()
    var marginLeft = getMaxKeyLength(ngroup)*7.5
    var marginBottom = 50

    var newChart = dc.rowChart("#"+divName)        
    newChart.width(width+marginLeft)
        .height(categories*12+marginBottom)
        .margins({top: 0, left: marginLeft, right: 0, bottom: marginBottom})
		.labelOffsetX(-marginLeft)
        .group(ngroup)
        .dimension(ndimension)
       // .data(function(ngroup){return ngroup.top(10)})
    	.ordering(function(d){return -d.value})
        .label(function (d) {
            return d.key;
        })
        .title(function (d) {
            return d.value;
        })
       // .x(d3.scale.linear().domain([0,50]))
        .elasticX(true)
        .ordinalColors([colors[row]])
        .gap(1)
        .xAxis()
}
function timelineChart(column, width,height,ndx,color){
    var minTime=1000000000000
    var maxTime=0
    var nDimension = ndx.dimension(function (d) {
        if(parseInt(d["timestamp"])>maxTime){maxTime=parseInt(d["timestamp"])}
        if(parseInt(d["timestamp"])<minTime){minTime=parseInt(d["timestamp"])}
           return d["timestamp"]/1000
       });
    var range = [minTime/1000,maxTime/1000]
    var divName = column.split(" ").join("_")
    d3.select("#row2").append("div").attr("id",divName).attr("class","rowChart").html(column+"</br>")

    var nGroup = groupDimension(nDimension)
    var categories = nGroup.size()
    
    var newChart = dc.barChart("#"+divName)        
    
    newChart.width(width)
        .height(height)
        .margins({top: 0, left: 30, right: 10, bottom: 20})
        .group(nGroup)
        .dimension(nDimension)
        .elasticY(true)
        //.centerBar(true)
        .round(dc.round.floor)
        .alwaysUseRounding(true)
        .x(d3.scale.linear().domain(range))
        .ordinalColors([colors[color]])
        .xAxis().tickFormat(function (v) { 
            return v/100; });
    
    
    newChart.on("preRedraw", function (chart) {
        chart.rescale();
    });
     newChart.on("preRender", function (chart) {
        chart.rescale();
    });

}
function newBarChart(column, width,height,ndx,color){
    var nDimension = dimensionColumn(column, ndx)[0]
    var range = dimensionColumn(column, ndx)[1]
    var divName = column.split(" ").join("_")
    d3.select("#row2").append("div").attr("id",divName).attr("class","rowChart").html(column+"</br>")

    var nGroup = groupDimension(nDimension)
    var categories = nGroup.size()
    
    var newChart = dc.barChart("#"+divName)        
    
    newChart.width(width)
        .height(height)
        .margins({top: 0, left: 30, right: 10, bottom: 20})
        .group(nGroup)
        .dimension(nDimension)
        .elasticY(true)
        //.centerBar(true)
        .round(dc.round.floor)
        .alwaysUseRounding(true)
        .x(d3.scale.linear().domain(range))
        .ordinalColors([colors[color]])
        .xAxis().tickFormat(function (v) { return v/100; });
    
    


}
function bubbleChart(ndx){
    
    d3.select("#row1").attr("class","rowChart").html("Lat and Lng (not projected)<br/>")
    
    var coordinatesBubbleChart = dc.bubbleChart("#row1");
    var maxlat = 0
    var minlat = 360
    var maxlng = -360
    var minlng = 360
    
    var latDimension = ndx.dimension(function (d) {
           
        if(parseFloat(d["lat"])>maxlat){maxlat = parseFloat(d["lat"])}
           if(parseFloat(d["lng"])>maxlng){maxlng = parseFloat(d["lng"])}
           
           if(parseFloat(d["lat"])<minlat){
               minlat = parseFloat(d["lat"])}
           if(parseFloat(d["lng"])<minlng){minlng = parseFloat(d["lng"])}
         //  return {lat:d["lat"],lng:d["lng"],value:d["column a"]}
           return d["lat"]+"_"+d["lng"]+"_"+d["column a"];
       });
    var latGroup = latDimension.group() 
       
     var latRange = maxlat-minlat
     var lngRange = Math.abs(maxlng-minlng)
    
    coordinatesBubbleChart.width(lngRange*350000)
        .height(latRange*350000)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
       
        .dimension(latDimension)
        .group(latGroup)
        .keyAccessor(function (p) {
         //  console.log(p)
            return p.key.split("_")[1];
        })
        .valueAccessor(function (p) {
            return p.key.split("_")[0];
            })
        .colors("#000")
        .radiusValueAccessor(function (p) {
            //return 1
            return p.value
            return p.key.split("_")[2];
                })
                .y(d3.scale.linear().domain([minlat-latRange*.05,maxlat+latRange*.05]))
                .x(d3.scale.linear().domain([minlng-lngRange*.05,maxlng+lngRange*.05]))
        .r(d3.scale.linear().domain([1,60]))   
        .maxBubbleRelativeSize(0.4)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .renderLabel(false)
        .xAxisLabel('Longitude')
        .yAxisLabel('latitude')
                
}
function dimensionColumn(column, ndx){
    var min = 999999999
    var max = -99999999
    var newDimension = ndx.dimension(function(d){
        if(d[column]!=""){
            if(parseInt(d[column]*100)>max){max = parseInt(d[column]*100)}
            if(parseInt(d[column]*100)<min){min = parseInt(d[column]*100)}
            return parseInt(d[column]*100)
        }

    })
    return [newDimension,[parseFloat(min),parseFloat(max)]]
}

function groupDimension(dimension){
     var newGroup = dimension.group()
    return newGroup
}   
 
function ready(error, data){
	//format dates
//    2014-09-30T08:29:38.000Z
    var dateFormat = d3.time.format('%Y-%m-%d');
    var numberFormat = d3.format(".2f");
    var ndx = crossfilter(data);
    var all = ndx.groupAll();
    //var headers = Object.keys(data[0])
    //var headers = ["timestamp","bench id","lat","lng"]
   // newBarChart("timestamp",200,200,ndx,1)
    
    //var indicators = ["column  a","column b","column c","column d","column e","column f","column g","column h","column i","column j","column  k","column l","column m","column n","column  o","column p"]
    var indicators = ["column a","column b","column d","column e","column g","column k","column l","column n","column o"]

    for(var i in indicators){
        var column = indicators[i]
        newBarChart(column,400,200,ndx,i%colors.length)
    }
    bubbleChart(ndx)
  
    
    
dc.dataCount(".dc-data-count")
    .dimension(ndx)
    .group(all)
    // (optional) html, for setting different html for some records and all records.
    // .html replaces everything in the anchor with the html given using the following function.
    // %filter-count and %total-count are replaced with the values obtained.
    .html({
        some:"%filter-count selected out of <strong>%total-count</strong> records | <a href='javascript:dc.filterAll(); dc.renderAll();''>Reset All</a>",
        all:"All  %total-count records selected."
    })
    
    dc.renderAll();
    dc.redrawAll();
};

//#### Version
//Determine the current version of dc with `dc.version`
d3.selectAll("#version").text(dc.version);
