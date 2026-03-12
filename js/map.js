// إنشاء الخريطة
var map = L.map('map').setView([26.3351,17.2283],6);

// طبقة الخريطة
L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
maxZoom:18
}).addTo(map);


// طبقات البيانات
var hotelLayer = L.layerGroup().addTo(map);
var restaurantLayer = L.layerGroup().addTo(map);
var cafeLayer = L.layerGroup().addTo(map);


// تحميل الفنادق
fetch("data/hotels.geojson")
.then(response=>response.json())
.then(data=>{

L.geoJSON(data,{

pointToLayer:function(feature,latlng){

return L.marker(latlng);

},

onEachFeature:function(feature,layer){

layer.bindPopup(
"<b>"+feature.properties.name+"</b><br>"
+
feature.properties.city
);

}

}).addTo(hotelLayer);

});
