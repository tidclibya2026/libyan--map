// انتظار تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function () {
    // إنشاء الخريطة ووضع نقطة المركز (ليبيا)
    const map = L.map('map').setView([28.5, 17.5], 6);

    // إضافة طبقة الخريطة من OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // طبقة تحتوي كل العلامات (لتحديثها عند التصفية)
    const markerLayer = L.layerGroup().addTo(map);
    let allMarkers = []; // مصفوفة لحفظ كل العلامات وبياناتها

    // عناصر التحكم
    const searchInput = document.getElementById('search');
    const citySelect = document.getElementById('cityFilter');
    const typeButtons = document.querySelectorAll('.type-filter');

    // المتغيرات الحالية للتصفية
    let currentType = 'all';
    let currentCity = '';
    let currentSearch = '';

    // تحميل البيانات من ملفات JSON
    Promise.all([
        fetch('data/cofiee.json').then(res => res.json()),
        fetch('data/hotels.json').then(res => res.json()),
        fetch('data/office.json').then(res => res.json()),
        fetch('data/resturnt.json').then(res => res.json())
    ]).then(([cafes, hotels, offices, restaurants]) => {
        // تنظيف البيانات من السجلات الفارغة وتحويلها إلى تنسيق موحد
        const cafesData = parseCafes(cafes);
        const hotelsData = parseHotels(hotels);
        const officesData = parseOffices(offices);
        const restaurantsData = parseRestaurants(restaurants);

        // دمج كل البيانات
        allMarkers = [
            ...cafesData,
            ...hotelsData,
            ...officesData,
            ...restaurantsData
        ];

        // إنشاء العلامات وإضافتها للمصفوفة
        createMarkers(allMarkers);

        // تطبيق التصفية الأولية (الكل)
        filterMarkers();

    }).catch(error => {
        console.error('خطأ في تحميل ملفات JSON:', error);
        alert('حدث خطأ في تحميل البيانات. تأكد من وجود الملفات في المجلد data/');
    });

    // دوال تحليل كل ملف JSON وتحويله إلى تنسيق موحد
    function parseCafes(data) {
        return data
            .filter(item => item.الاسم && item.x && item.y)  // استبعاد الفارغ
            .map(item => ({
                name: item.الاسم,
                city: item.المدينة,
                lat: parseFloat(item.y),
                lng: parseFloat(item.x),
                type: 'cafe',
                details: {
                    address: item.العنوان,
                    phone: item['رقم الهاتف'],
                    email: item['البريد الالكتروني'],
                    englishName: item.الاسم_الانجليزي
                }
            }));
    }

    function parseHotels(data) {
        return data
            .filter(item => item['إسم المــــــرفق'] && item.Y && item.X)
            .map(item => ({
                name: item['إسم المــــــرفق'],
                city: item['المدينـــة'],
                lat: parseFloat(item.Y),
                lng: parseFloat(item.X),
                type: 'hotel',
                details: {
                    classification: item.التصنيف,
                    address: item['عنــوان المرفـــــق'],
                    rooms: item['عــــدد الغرف'],
                    beds: item['عــــدد الأسرة'],
                    phone: item['الهـــاتف'],
                    link: item['وسائل الاتصال']
                }
            }));
    }

    function parseOffices(data) {
        // المكاتب السياحية لا تحتوي على إحداثيات، سنستخدم إحداثيات تقريبية للمدن
        // قاموس بإحداثيات تقريبية لبعض المدن الليبية
        const cityCoords = {
            'طرابلس': [32.8872, 13.1913],
            'الزاوية': [32.7571, 12.7275],
            'صبراتة': [32.7934, 12.4885],
            'جنزور': [32.8187, 13.0123],
            'الخمس': [32.6497, 14.2644],
            'غريان': [32.1667, 13.0167],
            'نالوت': [31.8667, 10.9833],
            'جادو': [31.9667, 12.0167],
            'يفرن': [32.0667, 12.5167],
            'مصراتة': [32.3754, 15.0925],
            'زليتن': [32.4667, 14.5667],
            'بني وليد': [31.7667, 13.9833],
            'سرت': [31.205, 16.588],
            'هون': [29.1269, 15.9472],
            'بنغازي': [32.1167, 20.0667],
            'البيضاء': [32.7628, 21.7556],
            'شحات': [32.8278, 21.8622],
            'درنة': [32.7647, 22.6392],
            'طبرق': [32.0833, 23.9667],
            'أوجلة': [29.1075, 21.2869],
            'سبها': [27.0333, 14.4333],
            'مرزق': [25.9167, 13.9167],
            'أوباري': [26.5833, 13.3333],
            'غات': [25.3333, 11.0],
            'غدامس': [30.1333, 9.5],
            'الكفرة': [24.1833, 23.3],
            'الجغبوب': [29.75, 24.5167],
            'القربولي': [32.7667, 13.5833],
            'اجدابيا': [30.7587, 20.2217]
        };

        return data
            .filter(item => item['اسم المكتب السياحي']) // تأكد من وجود اسم
            .map(item => {
                const cityName = item['اسم المكتب السياحي'];
                const coords = cityCoords[cityName] || [28.5, 17.5]; // افتراضي ليبيا
                return {
                    name: `المكتب السياحي - ${cityName}`,
                    city: cityName,
                    lat: coords[0],
                    lng: coords[1],
                    type: 'office',
                    details: {
                        area: item.المنطقة,
                        activity: item['نوع النشاط السياحي'],
                        style: item['النمط السياحي'],
                        product: item['المنتوج السياحي'],
                        boundaries: {
                            west: item['الحدود غرباً'],
                            east: item['الحدود شرقاً'],
                            north: item['الحدود شمالاً'],
                            south: item['الحدود جنوباً']
                        }
                    }
                };
            });
    }

    function parseRestaurants(data) {
        return data
            .filter(item => item['اسم المطعم'] && item['الاحداثيات'] && item['FIELD6'])
            .map(item => ({
                name: item['اسم المطعم'],
                city: item.المدينة,
                lat: parseFloat(item['FIELD6']),
                lng: parseFloat(item['الاحداثيات']),
                type: 'restaurant',
                details: {
                    address: item.العنوان,
                    phone: item.الهاتف,
                    link: item.Link,
                    email: item['البريد الالكتروني']
                }
            }));
    }

    // دالة إنشاء العلامات من المصفوفة allMarkers
    function createMarkers(markersData) {
        // أيقونات مخصصة لكل نوع
        const icons = {
            cafe: L.icon({ iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }), // سنقوم بتغيير الألوان لاحقاً
            hotel: L.icon({ iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
            restaurant: L.icon({ iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
            office: L.icon({ iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })
        };
        // لتمييز الألوان، يمكنك استخدام Leaflet Extra-Markers أو إنشاء أيقونات ملونة بسيطة
        // لكن للتبسيط سنستخدم نفس الأيقونة مع تغيير لون الخلفية عن طريق تعديل HTML، لكن ذلك يتطلب إضافات.
        // بدلاً من ذلك سنستخدم مكتبة leaflet-color-markers (سنضيفها في HTML)
        // أو نصنع أيقونات باستخدام divIcon. سأستخدم divIcon مع ألوان مختلفة.

        // إنشاء أيقونات ملونة باستخدام divIcon
        const coloredIcons = {
            cafe: L.divIcon({ html: '<div style="background-color:#FF69B4; width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>', className: '', iconSize: [20,20] }),
            hotel: L.divIcon({ html: '<div style="background-color:#FFD700; width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>', className: '', iconSize: [20,20] }),
            restaurant: L.divIcon({ html: '<div style="background-color:#FF4500; width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>', className: '', iconSize: [20,20] }),
            office: L.divIcon({ html: '<div style="background-color:#32CD32; width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>', className: '', iconSize: [20,20] })
        };

        // إضافة كل علامة إلى markerLayer وحفظها في allMarkers (نضيف حقل marker)
        markersData.forEach(item => {
            const icon = coloredIcons[item.type] || coloredIcons.cafe;
            const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
            item.marker = marker; // ربط العلامة بالكائن
        });
    }

    // دالة إنشاء محتوى النافذة المنبثقة
    function createPopupContent(item) {
        let content = `<b>${item.name}</b><br>`;
        content += `النوع: ${item.type === 'cafe' ? 'مقهى' : item.type === 'hotel' ? 'فندق' : item.type === 'restaurant' ? 'مطعم' : 'مكتب سياحي'}<br>`;
        content += `المدينة: ${item.city}<br>`;

        // إضافة تفاصيل حسب النوع
        if (item.type === 'cafe') {
            if (item.details.address) content += `العنوان: ${item.details.address}<br>`;
            if (item.details.phone) content += `الهاتف: ${item.details.phone}<br>`;
            if (item.details.email) content += `<a href="${item.details.email}" target="_blank">رابط</a><br>`;
        } else if (item.type === 'hotel') {
            if (item.details.classification) content += `التصنيف: ${item.details.classification}<br>`;
            if (item.details.address) content += `العنوان: ${item.details.address}<br>`;
            if (item.details.rooms) content += `عدد الغرف: ${item.details.rooms}<br>`;
            if (item.details.beds) content += `عدد الأسرة: ${item.details.beds}<br>`;
            if (item.details.phone) content += `الهاتف: ${item.details.phone}<br>`;
            if (item.details.link) content += `<a href="${item.details.link}" target="_blank">صفحة الفندق</a><br>`;
        } else if (item.type === 'restaurant') {
            if (item.details.address) content += `العنوان: ${item.details.address}<br>`;
            if (item.details.phone) content += `الهاتف: ${item.details.phone}<br>`;
            if (item.details.link) content += `<a href="${item.details.link}" target="_blank">رابط</a><br>`;
        } else if (item.type === 'office') {
            if (item.details.area) content += `المنطقة: ${item.details.area}<br>`;
            if (item.details.activity) content += `نشاط: ${item.details.activity}<br>`;
            if (item.details.style) content += `النمط: ${item.details.style}<br>`;
            if (item.details.product) content += `المنتوج: ${item.details.product}<br>`;
        }
        return content;
    }

    // دالة التصفية حسب النوع والمدينة والبحث
    function filterMarkers() {
        markerLayer.clearLayers();

        allMarkers.forEach(item => {
            const matchesType = currentType === 'all' || item.type === currentType;
            const matchesCity = !currentCity || item.city === currentCity;
            const matchesSearch = !currentSearch || item.name.toLowerCase().includes(currentSearch.toLowerCase());

            if (matchesType && matchesCity && matchesSearch) {
                markerLayer.addLayer(item.marker);
            }
        });
    }

    // ربط أحداث التصفية
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim();
        filterMarkers();
    });

    citySelect.addEventListener('change', (e) => {
        currentCity = e.target.value;
        filterMarkers();
    });

    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;
            filterMarkers();
        });
    });
});
