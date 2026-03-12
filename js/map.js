var map = L.map('map').setView([27.5,17],6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
 attribution:'© OpenStreetMap'
}).addTo(map);


// الطبقات
var hotelsLayer = L.layerGroup().addTo(map);
var restaurantsLayer = L.layerGroup().addTo(map);
var cafesLayer = L.layerGroup().addTo(map);
var heritageLayer = L.layerGroup().addTo(map);
var officesLayer = L.layerGroup().addTo(map);


// دالة تحميل GeoJSON
function loadLayer(url, layer){

fetch(url)

.then(function(response){
 return response.json();
})

.then(function(data){

var geo = L.geoJSON(data,{

pointToLayer:function(feature,latlng){

return L.marker(latlng);

},

onEachFeature:function(feature,layer){

var p = feature.properties;

var name = p.name || p.ar_name || p["اسم المطعم"] || p["إسم المرفق"] || "موقع سياحي";

var popup = "<b>"+name+"</b>";

if(p.city) popup += "<br>"+p.city;

layer.bindPopup(popup);

}

});

geo.addTo(layer);

})

.catch(function(error){

console.log("خطأ تحميل:",url,error);

});

}



// تحميل الطبقات

loadLayer("data/hotels.geojson",hotelsLayer);

loadLayer("data/restaurants.geojson",restaurantsLayer);

loadLayer("data/cafes.geojson",cafesLayer);

loadLayer("data/heritage_sites.geojson",heritageLayer);

loadLayer("data/tourism_offices.geojson",officesLayer);



// التحكم بالطبقات

var overlays = {

"الفنادق":hotelsLayer,
"المطاعم":restaurantsLayer,
"المقاهي":cafesLayer,
"المواقع الأثرية":heritageLayer,
"المكاتب السياحية":officesLayer

};

L.control.layers(null,overlays).addTo(map);
