var map = L.map('map').setView([27.5,17],6)

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
 attribution:'OpenStreetMap'
}
).addTo(map)



var hotelsLayer = L.layerGroup().addTo(map)
var restaurantsLayer = L.layerGroup().addTo(map)
var cafesLayer = L.layerGroup().addTo(map)
var heritageLayer = L.layerGroup().addTo(map)
var officeLayer = L.layerGroup().addTo(map)



function loadLayer(file,layer){

fetch("data/"+file)

.then(res=>res.json())

.then(data=>{

L.geoJSON(data,{

onEachFeature:function(feature,layer){

var p = feature.properties

var popup = "<b>"+(p.name||p.ar_name)+"</b>"

if(p.city) popup += "<br>"+p.city

if(p.phone) popup += "<br>"+p.phone

layer.bindPopup(popup)

}

}).addTo(layer)

})

}



loadLayer("hotels.geojson",hotelsLayer)
loadLayer("restaurants.geojson",restaurantsLayer)
loadLayer("cafes.geojson",cafesLayer)
loadLayer("heritage.geojson",heritageLayer)
loadLayer("tourism_offices.geojson",officeLayer)



var overlays = {

"الفنادق":hotelsLayer,
"المطاعم":restaurantsLayer,
"المقاهي":cafesLayer,
"المواقع الأثرية":heritageLayer,
"المكاتب السياحية":officeLayer

}

L.control.layers(null,overlays).addTo(map)
