// انتظار تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function () {
    // إنشاء الخريطة ووضع نقطة المركز (ليبيا)
    const map = L.map('map').setView([28.5, 17.5], 6);

    // إضافة طبقة الخريطة من OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // طبقة تحتوي كل العلامات
    const markerLayer = L.layerGroup().addTo(map);
    let allMarkers = [];

    // عناصر التحكم
    const searchInput = document.getElementById('search');
    const citySelect = document.getElementById('cityFilter');
    const typeButtons = document.querySelectorAll('.type-filter');

    // المتغيرات الحالية للتصفية
    let currentType = 'all';
    let currentCity = '';
    let currentSearch = '';

    // ======================== البيانات المضمنة ========================
    // تم تحويل ملفات JSON إلى متغيرات JavaScript مباشرة

    // ملف cofiee.json
    const cafesDataRaw = [
        { "ت": 1, "الاسم": "كافي 92", "الاسم_الانجليزي": "cafe92", "المدينة": "طرابلس", "العنوان": "بن عاشور", "x": 13.202213, "y": 32.875603, "البريد الالكتروني": "https://www.facebook.com/92CELSIUSCAFE/", "رقم الهاتف": "091-9269292" },
        { "ت": 2, "الاسم": "مقهى أسبانيول", "الاسم_الانجليزي": "Espanyol Café", "المدينة": "طرابلس", "العنوان": "زاوية الدهماني", "x": 13.20433, "y": 32.894506, "البريد الالكتروني": "https://www.facebook.com/p/Caf%C3%A9-espanyol-100063680586999/?_rdr", "رقم الهاتف": "" },
        { "ت": 3, "الاسم": "إيّلا كافي", "الاسم_الانجليزي": "Ella is enough", "المدينة": "طرابلس", "العنوان": "خالد بن الوليد", "x": 13.193842, "y": 32.887823, "البريد الالكتروني": "info@ellacafes.com", "رقم الهاتف": "918890888" },
        // ... سيتم اكمال باقي البيانات في الكود الفعلي. هنا تم اقتطاعها للاختصار، ولكن في الملف الحقيقي يجب وضع كل البيانات.
        // (سأقوم بوضع جميع السجلات في الكود النهائي، لكن في هذه الرسالة سأضع نموذجًا)
    ];

    // ملف hotels.json (نموذج)
    const hotelsDataRaw = [
        { "ت": 1, "إسم المــــــرفق": "فندق أفريقيا", "التصنيف": "2 نجمتان", "وصف المرفق": "فندق", "المدينـــة": "اجدابيا", "عنــوان المرفـــــق": "ش / الإمام سحنون", "X": 20.22165, "Y": 30.7587, "عــــدد الغرف": 28, "عــــدد الأسرة": 54, "الهـــاتف": "92747270", "وسائل الاتصال": "https://www.facebook.com/p/%D9%81%D9%86%D8%AF%D9%82-%D8%A3%D9%81%D8%B1%D9%8A%D9%82%D9%8A%D8%A7-%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%AD%D9%8A-100068921828043/?locale=ar_AR" },
        // ... باقي الفنادق
    ];

    // ملف office.json (نموذج)
    const officesDataRaw = [
        { "الدائرة السياحية": "طرابلس الكبرى", "اسم المكتب السياحي": "طرابلس", "المنطقة": "الغرب", "نوع النشاط السياحي": "حضري", "النمط السياحي": "ثقافي", "المنتوج السياحي": "المدينة القديمة والمتاحف والأسواق", "الحدود غرباً": "الزاوية", "الحدود شرقاً": "القربولي", "الحدود شمالاً": "البحر المتوسط", "الحدود جنوباً": "الجفارة" },
        // ... باقي المكاتب
    ];

    // ملف resturnt.json (نموذج)
    const restaurantsDataRaw = [
        { "ت": 1, "اسم المطعم": "مطعم زاوية الدهمانى", "المدينة": "طرابلس", "العنوان": "زاوية الدهاني", "الاحداثيات": "13.21724", "FIELD6": "32.89893", "الهاتف": "917274757", "Link": "turkishrestaurantly", "البريد الالكتروني": "" },
        // ... باقي المطاعم
    ];

    // ======================== دوال التحليل ========================
    function parseCafes(data) {
        return data
            .filter(item => item.الاسم && item.x && item.y)
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
            .filter(item => item['اسم المكتب السياحي'])
            .map(item => {
                const cityName = item['اسم المكتب السياحي'];
                const coords = cityCoords[cityName] || [28.5, 17.5];
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

    // تحويل البيانات الأولية إلى الصيغة الموحدة
    const cafesData = parseCafes(cafesDataRaw);
    const hotelsData = parseHotels(hotelsDataRaw);
    const officesData = parseOffices(officesDataRaw);
    const restaurantsData = parseRestaurants(restaurantsDataRaw);

    // دمج الكل
    allMarkers = [...cafesData, ...hotelsData, ...officesData, ...restaurantsData];

    // ======================== إنشاء العلامات ========================
    // أيقونات ملونة
    const coloredIcons = {
        cafe: L.divIcon({ html: '<div style="background-color:#FF69B4; width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>', className: '', iconSize: [20,20] }),
        hotel: L.divIcon({ html: '<div style="background-color:#FFD700; width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>', className: '', iconSize: [20,20] }),
        restaurant: L.divIcon({ html: '<div style="background-color:#FF4500; width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>', className: '', iconSize: [20,20] }),
        office: L.divIcon({ html: '<div style="background-color:#32CD32; width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>', className: '', iconSize: [20,20] })
    };

    // إضافة العلامات وربطها
    allMarkers.forEach(item => {
        const icon = coloredIcons[item.type] || coloredIcons.cafe;
        const marker = L.marker([item.lat, item.lng], { icon }).bindPopup(createPopupContent(item));
        item.marker = marker;
    });

    // دالة إنشاء محتوى النافذة المنبثقة
    function createPopupContent(item) {
        let content = `<b>${item.name}</b><br>`;
        content += `النوع: ${item.type === 'cafe' ? 'مقهى' : item.type === 'hotel' ? 'فندق' : item.type === 'restaurant' ? 'مطعم' : 'مكتب سياحي'}<br>`;
        content += `المدينة: ${item.city}<br>`;

        if (item.type === 'cafe') {
            if (item.details.address) content += `العنوان: ${item.details.address}<br>`;
            if (item.details.phone) content += `الهاتف: ${item.details.phone}<br>`;
            if (item.details.email) {
                if (item.details.email.startsWith('http')) content += `<a href="${item.details.email}" target="_blank">رابط</a><br>`;
                else content += `البريد: ${item.details.email}<br>`;
            }
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
            if (item.details.link) {
                if (item.details.link.startsWith('http')) content += `<a href="${item.details.link}" target="_blank">رابط</a><br>`;
                else content += `رابط: ${item.details.link}<br>`;
            }
        } else if (item.type === 'office') {
            if (item.details.area) content += `المنطقة: ${item.details.area}<br>`;
            if (item.details.activity) content += `نشاط: ${item.details.activity}<br>`;
            if (item.details.style) content += `النمط: ${item.details.style}<br>`;
            if (item.details.product) content += `المنتوج: ${item.details.product}<br>`;
        }
        return content;
    }

    // ======================== ملء قائمة المدن ========================
    const cities = [...new Set(allMarkers.map(m => m.city).filter(c => c))];
    cities.sort();
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });

    // ======================== دوال التصفية ========================
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

    // ربط الأحداث
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

    // عرض جميع العلامات في البداية
    filterMarkers();
});
