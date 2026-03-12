// انتظار تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function () {
    // إنشاء الخريطة ووضع نقطة المركز (ليبيا)
    const map = L.map('map').setView([28.5, 17.5], 6);

    // إضافة طبقة الخريطة من OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // قائمة المواقع السياحية (يمكنك تعديلها أو إضافة المزيد)
    const sites = [
        { name: 'المدينة القديمة - طرابلس', city: 'طرابلس', lat: 32.899, lng: 13.180, desc: 'منطقة تاريخية تضم أسواقاً قديمة ومساجد أثرية.' },
        { name: 'قوس ماركوس أوريليوس', city: 'طرابلس', lat: 32.902, lng: 13.185, desc: 'قوس روماني أثري يعود للقرن الثاني الميلادي.' },
        { name: 'المدينة القديمة - بنغازي', city: 'بنغازي', lat: 32.117, lng: 20.067, desc: 'البلاد القديمة ببنغازي بمبانيها التقليدية.' },
        { name: 'قصر المنار', city: 'بنغازي', lat: 32.097, lng: 20.080, desc: 'قصر تاريخي على شاطئ البحر.' },
        { name: 'شاطئ مصراتة', city: 'مصراتة', lat: 32.375, lng: 15.092, desc: 'شاطئ جميل على البحر الأبيض المتوسط.' },
        { name: 'قلعة مصراتة', city: 'مصراتة', lat: 32.378, lng: 15.090, desc: 'حصن قديم في وسط المدينة.' },
        { name: 'قلعة سبها', city: 'سبها', lat: 27.038, lng: 14.428, desc: 'قلعة تاريخية تطل على المدينة.' },
        { name: 'بحيرة قبرون', city: 'سبها', lat: 26.587, lng: 13.565, desc: 'بحيرة طبيعية في وسط الصحراء.' }
    ];

    // مجموعة تحتوي كل العلامات (لتسهيل إزالتها وإضافتها)
    const markerLayer = L.layerGroup().addTo(map);
    const markers = []; // مصفوفة لحفظ كل علامة وبياناتها

    // إنشاء العلامات وإضافتها للمجموعة والمصفوفة
    sites.forEach(site => {
        const marker = L.marker([site.lat, site.lng]).bindPopup(`
            <b>${site.name}</b><br>
            ${site.desc}<br>
            المدينة: ${site.city}
        `);
        markerLayer.addLayer(marker);
        markers.push({
            marker: marker,
            name: site.name,
            city: site.city
        });
    });

    // عناصر التحكم
    const searchInput = document.getElementById('search');
    const citySelect = document.getElementById('cityFilter');

    // دالة التصفية
    function filterMarkers() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedCity = citySelect.value;

        // إزالة جميع العلامات من الخريطة
        markerLayer.clearLayers();

        // إضافة العلامات التي تطابق الشروط فقط
        markers.forEach(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesCity = selectedCity === '' || item.city === selectedCity;

            if (matchesSearch && matchesCity) {
                markerLayer.addLayer(item.marker);
            }
        });
    }

    // ربط الأحداث بالبحث والتصفية
    searchInput.addEventListener('input', filterMarkers);
    citySelect.addEventListener('change', filterMarkers);
});
