var map = L.map('map').setView([27.0, 17.0], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
 attribution:'© OpenStreetMap'
}).addTo(map);


// طبقات
var hotelsLayer = L.layerGroup().addTo(map);
var restaurantsLayer = L.layerGroup().addTo(map);
var cafesLayer = L.layerGroup().addTo(map);
var heritageLayer = L.layerGroup().addTo(map);
var officeLayer = L.layerGroup().addTo(map);


// الفنادق
fetch("data/hotels.geojson")
.then(res=>res.json())
.then(data=>{
 L.geoJSON(data,{
  onEachFeature:function(f,l){
   l.bindPopup("<b>"+f.properties.name+"</b><br>"+f.properties.city)
  }
 }).addTo(hotelsLayer)
})


// المطاعم
fetch("data/restaurants.geojson")
.then(res=>res.json())
.then(data=>{
 L.geoJSON(data,{
  onEachFeature:function(f,l){
   l.bindPopup("<b>"+f.properties.name+"</b>")
  }
 }).addTo(restaurantsLayer)
})


// المقاهي
fetch("data/cafes.geojson")
.then(res=>res.json())
.then(data=>{
 L.geoJSON(data).addTo(cafesLayer)
})


// المواقع الأثرية
fetch("data/heritage.geojson")
.then(res=>res.json())
.then(data=>{
 L.geoJSON(data).addTo(heritageLayer)
})


// المكاتب السياحية
fetch("data/tourism_offices.geojson")
.then(res=>res.json())
.then(data=>{
 L.geoJSON(data).addTo(officeLayer)
})
