let map = null; // Map utama
let marker = null;
let detailMap = null; // Map di modal
let detailCircle = null;
let detailGeoJsonLayer = null; // Layer GeoJSON untuk modal
let animationInterval = null;
let currentAnimationFrame = 2022; // Mulai dari tahun awal

/* ===== GENERATE ACTUAL/DUMMY DATA ===== */
const generateData = () => {
  const data = [];
  const years = [2022, 2023, 2024, 2025];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  // Data TARGET spesifik (Desember)
  const targetData = {
    2025: { ch: 1.8, sal: 16, temp: 32, do: 8.4 },
    2024: { ch: 1.6, sal: 16, temp: 35, do: 8.4 },
    2023: { ch: 0.87, sal: 17, temp: 31, do: 8.4 },
    2022: { ch: 2.9, sal: 16, temp: 28, do: 8.4 },
  };

  years.forEach((year) => {
    const target = targetData[year];

    months.forEach((month, idx) => {
      // Faktor musiman untuk menciptakan fluktuasi bulanan
      const seasonFactor = Math.sin((idx / 12) * Math.PI * 2) * 0.1;
      const noise = Math.random() * 0.1;

      let baseDO = target.do;
      let baseTemp = target.temp;
      let baseSalinity = target.sal;
      let baseChlorophyll = target.ch;

      // Jika bukan Desember, hitung nilai dummy di sekitar target Desember
      if (month !== "Des") {
        baseDO = baseDO + seasonFactor + noise;
        baseTemp = baseTemp + seasonFactor * 2 + noise;
        baseSalinity = baseSalinity + seasonFactor + noise;
        baseChlorophyll = baseChlorophyll + seasonFactor + noise;
      }

      // Khusus Chlorophyll, pastikan tidak negatif
      if (baseChlorophyll < 0.1) baseChlorophyll = 0.1;

      data.push({
        year: year,
        month: month,
        do: baseDO.toFixed(2),
        temp: baseTemp.toFixed(1),
        salinity: baseSalinity.toFixed(2),
        chlorophyll: baseChlorophyll.toFixed(2),
      });
    });
  });
  return data;
};

const allData = generateData();

/* ===== GET STATUS FUNCTION ===== */
const getStatus = (doValue) => {
  const val = parseFloat(doValue);
  if (val >= 6) return { text: "Baik", color: "#4CAF50" };
  if (val >= 5) return { text: "Waspada", color: "#FFA726" };
  if (val >= 4) return { text: "Tercemar Ringan", color: "#FF7043" };
  return { text: "Tercemar Berat", color: "#E57373" };
};

/* ===== GeoJSON Klorofil-a 2025 (gabunganK25) Integration ===== */

// >>> GANTI BAGIAN INI DENGAN DATA GEOJSON LENGKAP DARI FILE GABUNGANK25.HTML <<<
// Data GeoJSON lengkap Anda (yang diapit tag <script> di gabunganK25.html) harus diletakkan di dalam kurung kurawal di bawah.
const geojsonTSS25 = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: 1,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99817533604798, -5.9401207678943253],
            [105.99817484740311, -5.9398494191263564],
            [105.99790384079839, -5.9398499083104435],
            [105.99790432931067, -5.9401212571009134],
            [105.99817533604798, -5.9401207678943253],
          ],
        ],
      },
      properties: {
        OBJECTID: 1,
        Id: 1,
        gridcode: 2,
        Shape_Length: 120.00000000372529,
        Shape_Area: 900.00000005587935,
      },
    },
    {
      type: "Feature",
      id: 2,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99817582471559, -5.9403921166595639],
            [105.99817533604798, -5.9401207678943253],
            [105.99790432931067, -5.9401212571009134],
            [105.99790481784565, -5.940392605888654],
            [105.99817582471559, -5.9403921166595639],
          ],
        ],
      },
      properties: {
        OBJECTID: 2,
        Id: 2,
        gridcode: 3,
        Shape_Length: 120,
        Shape_Area: 900,
      },
    },
    {
      type: "Feature",
      id: 3,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99871783838734, -5.9403911378030099],
            [105.99871734945448, -5.940119789082793],
            [105.99817533604798, -5.9401207678943253],
            [105.99817582471559, -5.9403921166595639],
            [105.99871783838734, -5.9403911378030099],
          ],
        ],
      },
      properties: {
        OBJECTID: 3,
        Id: 3,
        gridcode: 2,
        Shape_Length: 180.00000000372529,
        Shape_Area: 1800.0000000558794,
      },
    },
    {
      type: "Feature",
      id: 4,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.9987183273429, -5.9406624865205115],
            [105.99871783838734, -5.9403911378030099],
            [105.99817582471559, -5.9403921166595639],
            [105.99817631340591, -5.9406634654220882],
            [105.99844732038578, -5.9406629760376983],
            [105.9987183273429, -5.9406624865205115],
          ],
        ],
      },
      properties: {
        OBJECTID: 4,
        Id: 4,
        gridcode: 3,
        Shape_Length: 180,
        Shape_Area: 1799.9999999441206,
      },
    },
    {
      type: "Feature",
      id: 5,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.9989893342773, -5.9406619968705279],
            [105.99898884518909, -5.940390648175546],
            [105.99871783838734, -5.9403911378030099],
            [105.9987183273429, -5.9406624865205115],
            [105.9989893342773, -5.9406619968705279],
          ],
        ],
      },
      properties: {
        OBJECTID: 5,
        Id: 5,
        gridcode: 2,
        Shape_Length: 119.99999999254942,
        Shape_Area: 899.99999988824129,
      },
    },
    {
      type: "Feature",
      id: 6,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99682225428842, -5.9412086080939757],
            [105.99682176621585, -5.9409372592243814],
            [105.99709277344186, -5.9409367704815024],
            [105.99709228525936, -5.9406654216316701],
            [105.99736329233006, -5.9406649327784722],
            [105.99736280403762, -5.9403935839484596],
            [105.997633810953, -5.9403930949849526],
            [105.99763332255064, -5.9401217461747171],
            [105.99790432931067, -5.9401212571009134],
            [105.99790384079839, -5.9398499083104435],
            [105.99763283417099, -5.9398503973617505],
            [105.99681981415247, -5.939851863718995],
            [105.99682079013878, -5.940394561477099],
            [105.99654978315532, -5.9403950500422305],
            [105.99655124690706, -5.9412090967265225],
            [105.99682225428842, -5.9412086080939757],
          ],
        ],
      },
      properties: {
        OBJECTID: 6,
        Id: 6,
        gridcode: 3,
        Shape_Length: 600.00000000186265,
        Shape_Area: 11700.000000139698,
      },
    },
    {
      type: "Feature",
      id: 7,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99736426898305, -5.9412076304304549],
            [105.99736378064522, -5.9409362816058202],
            [105.99790579498375, -5.940935303456043],
            [105.99790530640335, -5.9406639546736804],
            [105.99817631340591, -5.9406634654220882],
            [105.99817582471559, -5.9403921166595639],
            [105.99790481784565, -5.940392605888654],
            [105.99790432931067, -5.9401212571009134],
            [105.99763332255064, -5.9401217461747171],
            [105.997633810953, -5.9403930949849526],
            [105.99736280403762, -5.9403935839484596],
            [105.99736329233006, -5.9406649327784722],
            [105.99709228525936, -5.9406654216316701],
            [105.99709277344186, -5.9409367704815024],
            [105.99682176621585, -5.9409372592243814],
            [105.99682225428842, -5.9412086080939757],
            [105.99736426898305, -5.9412076304304549],
          ],
        ],
      },
      properties: {
        OBJECTID: 7,
        Id: 7,
        gridcode: 2,
        Shape_Length: 540,
        Shape_Area: 8099.9999999720603,
      },
    },
    {
      type: "Feature",
      id: 8,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99682274238367, -5.9414799569608743],
            [105.9973647573436, -5.9414789792523921],
            [105.99736426898305, -5.9412076304304549],
            [105.99682225428842, -5.9412086080939757],
            [105.99682274238367, -5.9414799569608743],
          ],
        ],
      },
      properties: {
        OBJECTID: 8,
        Id: 8,
        gridcode: 1,
        Shape_Length: 180.00000000186265,
        Shape_Area: 1800.0000000279397,
      },
    },
    {
      type: "Feature",
      id: 9,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99655222285496, -5.9417517945025482],
            [105.99682323050162, -5.9417513058250595],
            [105.99682274238367, -5.9414799569608743],
            [105.99682225428842, -5.9412086080939757],
            [105.99655124690706, -5.9412090967265225],
            [105.99655222285496, -5.9417517945025482],
          ],
        ],
      },
      properties: {
        OBJECTID: 9,
        Id: 9,
        gridcode: 2,
        Shape_Length: 179.99999999441206,
        Shape_Area: 1799.9999998882413,
      },
    },
    {
      type: "Feature",
      id: 10,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99573968738893, -5.9420246086894499],
            [105.9957387121916, -5.9414819107840469],
            [105.99600971977361, -5.9414814225274784],
            [105.99600923207629, -5.9412100735931848],
            [105.99655124690706, -5.9412090967265225],
            [105.99654978315532, -5.9403950500422305],
            [105.99682079013878, -5.940394561477099],
            [105.99681981415247, -5.939851863718995],
            [105.99763283417099, -5.9398503973617505],
            [105.99763234581404, -5.9395790485461388],
            [105.99654831960774, -5.9395810033336502],
            [105.99654880743425, -5.9398523522391846],
            [105.99600679392975, -5.9398533288812239],
            [105.99600728151373, -5.9401246778290373],
            [105.99573627459488, -5.9401251659733401],
            [105.99573676206889, -5.9403965149408755],
            [105.99546575499471, -5.9403970029748407],
            [105.99546624235877, -5.9406683519621089],
            [105.99519523512933, -5.9406688398857224],
            [105.99519620966014, -5.9412115378971011],
            [105.99492520214277, -5.941212025732785],
            [105.99492666371091, -5.9420260727969039],
            [105.99573968738893, -5.9420246086894499],
          ],
        ],
      },
      properties: {
        OBJECTID: 10,
        Id: 10,
        gridcode: 4,
        Shape_Length: 1140.0000000055879,
        Shape_Area: 31500.000000335276,
      },
    },
    {
      type: "Feature",
      id: 11,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99601069523627, -5.9420241203879769],
            [105.99601020749361, -5.9417527714590586],
            [105.99628121518563, -5.9417522830472151],
            [105.99655222285496, -5.9417517945025482],
            [105.99655124690706, -5.9412090967265225],
            [105.99600923207629, -5.9412100735931848],
            [105.99600971977361, -5.9414814225274784],
            [105.9957387121916, -5.9414819107840469],
            [105.99573968738893, -5.9420246086894499],
            [105.99601069523627, -5.9420241203879769],
          ],
        ],
      },
      properties: {
        OBJECTID: 11,
        Id: 11,
        gridcode: 3,
        Shape_Length: 359.99999999813735,
        Shape_Area: 5399.9999998323619,
      },
    },
    {
      type: "Feature",
      id: 12,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99628170306094, -5.9420236319536723],
            [105.99628121518563, -5.9417522830472151],
            [105.99601020749361, -5.9417527714590586],
            [105.99601069523627, -5.9420241203879769],
            [105.99628170306094, -5.9420236319536723],
          ],
        ],
      },
      properties: {
        OBJECTID: 12,
        Id: 12,
        gridcode: 2,
        Shape_Length: 120.00000000558794,
        Shape_Area: 900.00000008381903,
      },
    },
    {
      type: "Feature",
      id: 13,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99655271086296, -5.9420231433865407],
            [105.99655222285496, -5.9417517945025482],
            [105.99628121518563, -5.9417522830472151],
            [105.99628170306094, -5.9420236319536723],
            [105.99655271086296, -5.9420231433865407],
          ],
        ],
      },
      properties: {
        OBJECTID: 13,
        Id: 13,
        gridcode: 1,
        Shape_Length: 120.00000000372529,
        Shape_Area: 900.00000005587935,
      },
    },
    {
      type: "Feature",
      id: 14,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99844976484142, -5.9420197196974245],
            [105.99844878699098, -5.9414770222416333],
            [105.99817777961321, -5.941477511693547],
            [105.99817729085473, -5.9412061629390971],
            [105.99844829809986, -5.9412056735096925],
            [105.99844732038578, -5.9406629760376983],
            [105.99817631340591, -5.9406634654220882],
            [105.99790530640335, -5.9406639546736804],
            [105.99790579498375, -5.940935303456043],
            [105.99736378064522, -5.9409362816058202],
            [105.99736426898305, -5.9412076304304549],
            [105.99790628358687, -5.9412066522356923],
            [105.99790774953254, -5.9420206985584558],
            [105.99844976484142, -5.9420197196974245],
          ],
        ],
      },
      properties: {
        OBJECTID: 14,
        Id: 14,
        gridcode: 1,
        Shape_Length: 600.00000000558794,
        Shape_Area: 9900.0000001955777,
      },
    },
    {
      type: "Feature",
      id: 15,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99844976484142, -5.9420197196974245],
            [105.99872077246179, -5.9420192300676673],
            [105.99871979434604, -5.9414765326569041],
            [105.99899080167833, -5.9414760429393594],
            [105.99899031252191, -5.9412046942524519],
            [105.99871930532227, -5.9412051839474769],
            [105.9987183273429, -5.9406624865205115],
            [105.99844732038578, -5.9406629760376983],
            [105.99844829809986, -5.9412056735096925],
            [105.99817729085473, -5.9412061629390971],
            [105.99817777961321, -5.941477511693547],
            [105.99844878699098, -5.9414770222416333],
            [105.99844976484142, -5.9420197196974245],
          ],
        ],
      },
      properties: {
        OBJECTID: 15,
        Id: 15,
        gridcode: 2,
        Shape_Length: 480.00000000372529,
        Shape_Area: 6300.0000001676381,
      },
    },
    {
      type: "Feature",
      id: 16,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99628219095895, -5.9422949808574153],
            [105.99628170306094, -5.9420236319536723],
            [105.99601069523627, -5.9420241203879769],
            [105.99601118300161, -5.9422954693141783],
            [105.99628219095895, -5.9422949808574153],
          ],
        ],
      },
      properties: {
        OBJECTID: 16,
        Id: 16,
        gridcode: 4,
        Shape_Length: 120.00000000186265,
        Shape_Area: 900.00000002793968,
      },
    },
    {
      type: "Feature",
      id: 17,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99763723040535, -5.9422925365810837],
            [105.99790823822653, -5.9422920473273155],
            [105.99790774953254, -5.9420206985584558],
            [105.99763674184403, -5.9420211877897291],
            [105.99763723040535, -5.9422925365810837],
          ],
        ],
      },
      properties: {
        OBJECTID: 17,
        Id: 17,
        gridcode: 0,
        Shape_Length: 119.99999999813735,
        Shape_Area: 899.99999997206032,
      },
    },
    {
      type: "Feature",
      id: 18,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99601167078961, -5.9425668182376823],
            [105.99601118300161, -5.9422954693141783],
            [105.99574017502162, -5.9422959576381071],
            [105.99574066267695, -5.9425673065840634],
            [105.99601167078961, -5.9425668182376823],
          ],
        ],
      },
      properties: {
        OBJECTID: 18,
        Id: 18,
        gridcode: 4,
        Shape_Length: 119.99999999627471,
        Shape_Area: 899.99999994412065,
      },
    },
    {
      type: "Feature",
      id: 19,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99628267887962, -5.9425663297584608],
            [105.99628219095895, -5.9422949808574153],
            [105.99601118300161, -5.9422954693141783],
            [105.99601167078961, -5.9425668182376823],
            [105.99628267887962, -5.9425663297584608],
          ],
        ],
      },
      properties: {
        OBJECTID: 19,
        Id: 19,
        gridcode: 3,
        Shape_Length: 120.00000000186265,
        Shape_Area: 900.00000002793968,
      },
    },
    {
      type: "Feature",
      id: 20,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99655368694697, -5.9425658411463971],
            [105.99655319889361, -5.942294492267818],
            [105.99655271086296, -5.9420231433865407],
            [105.99628170306094, -5.9420236319536723],
            [105.99628219095895, -5.9422949808574153],
            [105.99628267887962, -5.9425663297584608],
            [105.99655368694697, -5.9425658411463971],
          ],
        ],
      },
      properties: {
        OBJECTID: 20,
        Id: 20,
        gridcode: 2,
        Shape_Length: 180,
        Shape_Area: 1800,
      },
    },
    {
      type: "Feature",
      id: 21,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99763771898938, -5.9425638853697418],
            [105.99763723040535, -5.9422925365810837],
            [105.99655319889361, -5.942294492267818],
            [105.99655368694697, -5.9425658411463971],
            [105.9968246949916, -5.9425653524014947],
            [105.99709570301356, -5.9425648635237511],
            [105.99736671101282, -5.9425643745131671],
            [105.99763771898938, -5.9425638853697418],
          ],
        ],
      },
      properties: {
        OBJECTID: 21,
        Id: 21,
        gridcode: 1,
        Shape_Length: 300,
        Shape_Area: 3600,
      },
    },
    {
      type: "Feature",
      id: 22,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99763771898938, -5.9425638853697418],
            [105.99845074278278, -5.9425624171424252],
            [105.99845025380074, -5.942291068421274],
            [105.99872126155377, -5.9422905787690024],
            [105.99872175066848, -5.9425619274676391],
            [105.9989927585314, -5.9425614376600127],
            [105.99899226928403, -5.9422900889838957],
            [105.99926327699158, -5.9422895990659557],
            [105.99926083043253, -5.9409328557575396],
            [105.99898982338823, -5.940933345562847],
            [105.9989893342773, -5.9406619968705279],
            [105.9987183273429, -5.9406624865205115],
            [105.99871930532227, -5.9412051839474769],
            [105.99899031252191, -5.9412046942524519],
            [105.99899080167833, -5.9414760429393594],
            [105.99871979434604, -5.9414765326569041],
            [105.99872077246179, -5.9420192300676673],
            [105.99844976484142, -5.9420197196974245],
            [105.99790774953254, -5.9420206985584558],
            [105.99790823822653, -5.9422920473273155],
            [105.99763723040535, -5.9422925365810837],
            [105.99763771898938, -5.9425638853697418],
          ],
        ],
      },
      properties: {
        OBJECTID: 22,
        Id: 22,
        gridcode: 3,
        Shape_Length: 900,
        Shape_Area: 15299.999999916181,
      },
    },
    {
      type: "Feature",
      id: 23,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99655417502299, -5.9428371900222476],
            [105.99655368694697, -5.9425658411463971],
            [105.99628267887962, -5.9425663297584608],
            [105.99628316682299, -5.9428376786567743],
            [105.99655417502299, -5.9428371900222476],
          ],
        ],
      },
      properties: {
        OBJECTID: 23,
        Id: 23,
        gridcode: 4,
        Shape_Length: 119.99999999627471,
        Shape_Area: 899.99999994412065,
      },
    },
    {
      type: "Feature",
      id: 24,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.9968251832003, -5.9428367012548717],
            [105.9968246949916, -5.9425653524014947],
            [105.99655368694697, -5.9425658411463971],
            [105.99655417502299, -5.9428371900222476],
            [105.9968251832003, -5.9428367012548717],
          ],
        ],
      },
      properties: {
        OBJECTID: 24,
        Id: 24,
        gridcode: 3,
        Shape_Length: 119.99999999441206,
        Shape_Area: 899.99999991618097,
      },
    },
    {
      type: "Feature",
      id: 25,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99709619135494, -5.9428362123546501],
            [105.99709570301356, -5.9425648635237511],
            [105.9968246949916, -5.9425653524014947],
            [105.9968251832003, -5.9428367012548717],
            [105.99709619135494, -5.9428362123546501],
          ],
        ],
      },
      properties: {
        OBJECTID: 25,
        Id: 25,
        gridcode: 4,
        Shape_Length: 119.99999999627471,
        Shape_Area: 899.99999994412065,
      },
    },
    {
      type: "Feature",
      id: 26,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99709619135494, -5.9428362123546501],
            [105.99736719948689, -5.9428357233215818],
            [105.99736671101282, -5.9425643745131671],
            [105.99709570301356, -5.9425648635237511],
            [105.99709619135494, -5.9428362123546501],
          ],
        ],
      },
      properties: {
        OBJECTID: 26,
        Id: 26,
        gridcode: 3,
        Shape_Length: 119.99999999813735,
        Shape_Area: 899.99999997206032,
      },
    },
    {
      type: "Feature",
      id: 27,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99736964219773, -5.9441924673233908],
            [105.99736768798365, -5.9431070721273667],
            [105.99709667971902, -5.9431075611829201],
            [105.99709619135494, -5.9428362123546501],
            [105.9968251832003, -5.9428367012548717],
            [105.99655417502299, -5.9428371900222476],
            [105.99628316682299, -5.9428376786567743],
            [105.99628267887962, -5.9425663297584608],
            [105.99601167078961, -5.9425668182376823],
            [105.99574066267695, -5.9425673065840634],
            [105.99574017502162, -5.9422959576381071],
            [105.99601118300161, -5.9422954693141783],
            [105.99601069523627, -5.9420241203879769],
            [105.99573968738893, -5.9420246086894499],
            [105.99492666371091, -5.9420260727969039],
            [105.99492763820292, -5.9425687708261625],
            [105.99519864638359, -5.9425682828783035],
            [105.99519962123154, -5.9431109808519027],
            [105.9954706296549, -5.9431104927263201],
            [105.99547111724556, -5.943381841686632],
            [105.99574212577896, -5.9433813534057505],
            [105.99574261352495, -5.9436527023409003],
            [105.99601362216836, -5.9436522139047057],
            [105.99601411006974, -5.9439235628147031],
            [105.99655612755396, -5.9439225854987958],
            [105.99655661574342, -5.9441939343612198],
            [105.99736964219773, -5.9441924673233908],
          ],
        ],
      },
      properties: {
        OBJECTID: 27,
        Id: 27,
        gridcode: 5,
        Shape_Length: 1079.9999999981374,
        Shape_Area: 35100.000000083819,
      },
    },
    {
      type: "Feature",
      id: 28,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.99736964219773, -5.9441924673233908],
            [105.99764065097044, -5.9441919780450272],
            [105.99764016225016, -5.9439206292725242],
            [105.99818217946202, -5.9439196503621634],
            [105.99818169049905, -5.9436483016320114],
            [105.99872370735464, -5.94364732223519],
            [105.998723218149, -5.9433759735473615],
            [105.99899422640999, -5.9433754836721748],
            [105.99899324780152, -5.9428327863333976],
            [105.99926425577443, -5.9428322963704048],
            [105.99926327699158, -5.9422895990659557],
            [105.99899226928403, -5.9422900889838957],
            [105.9989927585314, -5.9425614376600127],
            [105.99872175066848, -5.9425619274676391],
            [105.99872126155377, -5.9422905787690024],
            [105.99845025380074, -5.942291068421274],
            [105.99845074278278, -5.9425624171424252],
            [105.99763771898938, -5.9425638853697418],
            [105.99736671101282, -5.9425643745131671],
            [105.99736719948689, -5.9428357233215818],
            [105.99709619135494, -5.9428362123546501],
            [105.99709667971902, -5.9431075611829201],
            [105.99736768798365, -5.9431070721273667],
            [105.99736964219773, -5.9441924673233908],
          ],
        ],
      },
      properties: {
        OBJECTID: 28,
        Id: 28,
        gridcode: 4,
        Shape_Length: 960.00000000186265,
        Shape_Area: 27899.999999804422,
      },
    },
  ],
};

const getColor = (d) => {
  return d === 5
    ? "#4a148c" // Sangat Tinggi
    : d === 4
    ? "#9c27b0" // Tinggi
    : d === 3
    ? "#ffc107" // Sedang
    : d === 2
    ? "#ff9800" // Rendah
    : d === 1
    ? "#ff5722" // Sangat Rendah
    : "#808080";
};

const getLabel = (d) => {
  return d === 5
    ? "Sangat Tinggi"
    : d === 4
    ? "Tinggi"
    : d === 3
    ? "Sedang"
    : d === 2
    ? "Rendah"
    : d === 1
    ? "Sangat Rendah"
    : "Tidak Diketahui";
};

let geoJsonLayer = null;

const loadGeoJsonTSS25 = (map) => {
  if (geoJsonLayer) {
    map.removeLayer(geoJsonLayer);
  }

  if (
    Object.keys(geojsonTSS25).length > 0 &&
    geojsonTSS25.features &&
    geojsonTSS25.features.length > 0
  ) {
    geoJsonLayer = L.geoJson(geojsonTSS25, {
      style: function (feature) {
        return {
          fillColor: getColor(feature.properties.gridcode),
          color: "#000",
          weight: 0.5,
          fillOpacity: 0.7,
        };
      },
      onEachFeature: function (feature, layer) {
        const props = feature.properties;
        layer.bindPopup(
          `
                <div style="font-family: Poppins; color: var(--text-dark, #37474f);">
                  <h5 style="margin: 0 0 5px 0; color: ${getColor(
                    props.gridcode
                  )}; font-size: 1.1rem;">Klorofil-a (TSS)</h5>
                  <b>Kategori:</b> ${getLabel(props.gridcode)}<br>
                  <b>Luas:</b> ${
                    props.Shape_Area ? props.Shape_Area.toFixed(2) : "N/A"
                  } m²
                </div>
              `,
          { maxWidth: 250 }
        );
      },
    }).addTo(map);

    // map.fitBounds(geoJsonLayer.getBounds());
  } else {
    console.warn("GeoJSON data is empty. Cannot load GeoJSON layer.");
  }
};

/* ===== END GeoJSON Klorofil-a 2025 Integration ===== */

/* ===== PARAMETER COLOR FUNCTIONS (Original WEB.html) ===== */
const getParameterColor = (param, value) => {
  const val = parseFloat(value);
  switch (param) {
    case "do":
      if (val >= 6) return "#4CAF50"; // Baik
      if (val >= 5) return "#FFA726"; // Waspada
      if (val >= 4) return "#FF7043"; // Tercemar Ringan
      return "#E57373"; // Tercemar Berat
    case "temp":
      if (val <= 27) return "#2196F3"; // Dingin
      if (val <= 29) return "#8BC34A"; // Optimal
      if (val <= 31) return "#FFA726"; // Hangat
      return "#E57373"; // Panas
    case "salinity":
      if (val <= 30) return "#E57373"; // Rendah
      if (val <= 35) return "#4CAF50"; // Optimal
      return "#E57373"; // Tinggi
    case "chlorophyll":
      if (val <= 2) return "#4CAF50"; // Rendah
      if (val <= 4) return "#FFA726"; // Sedang
      return "#E57373"; // Tinggi
    default:
      return "#808080";
  }
};

const getParameterGradient = (param) => {
  switch (param) {
    case "do":
      return "linear-gradient(to right, #E57373, #FF7043, #FFA726, #8BC34A, #4CAF50)";
    case "temp":
      return "linear-gradient(to right, #2196F3, #8BC34A, #FFA726, #E57373)";
    case "salinity":
      return "linear-gradient(to right, #E57373, #FFA726, #4CAF50, #FFA726, #E57373)";
    case "chlorophyll":
      return "linear-gradient(to right, #4CAF50, #FFA726, #E57373)";
    default:
      return "linear-gradient(to right, #4CAF50, #FFA726, #E57373)";
  }
};

const getParameterLabels = (param) => {
  switch (param) {
    case "do":
      return { min: "0 mg/L", mid: "5 mg/L", max: "10 mg/L" };
    case "temp":
      return { min: "25°C", mid: "29°C", max: "33°C" };
    case "salinity":
      return { min: "28 PSU", mid: "33 PSU", max: "38 PSU" };
    case "chlorophyll":
      return { min: "0 μg/L", mid: "4 μg/L", max: "8 μg/L" };
    default:
      return { min: "Min", mid: "Mid", max: "Max" };
  }
};

const getParameterUnit = (param) => {
  switch (param) {
    case "do":
      return "mg/L";
    case "temp":
      return "°C";
    case "salinity":
      return "PSU";
    case "chlorophyll":
      return "μg/L";
    default:
      return "";
  }
};

/* ===== INITIALIZE MAP ===== */
const initMap = () => {
  if (map) return;

  map = L.map("mapLeaflet").setView([-5.941944, 105.9975], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  marker = L.marker([-5.941944, 105.9975], {
    icon: L.icon({
      iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    }),
  }).addTo(map);

  // Update popup pertama kali
  updateMap(document.getElementById("yearSlider").value);
};

/* ===== UPDATE MAP AND POPUP ===== */
const updateMap = (year) => {
  document.getElementById("currentYear").textContent = year;

  // Ambil data rata-rata akhir tahun
  const avgData = allData.find((d) => d.year == year && d.month === "Des");

  if (!avgData) return;

  const status = getStatus(avgData.do);

  // Data DO bulanan untuk sparkline
  const monthlyDo = allData
    .filter((d) => d.year == year)
    .map((d) => parseFloat(d.do));

  const miniChart = createMiniSparkline(monthlyDo);

  // Update marker style
  if (marker) {
    const iconHtml = `<div style="background-color: ${status.color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${status.color};"></div>`;
    const customIcon = L.divIcon({
      className: "custom-div-icon",
      html: iconHtml,
      iconSize: [25, 25],
      iconAnchor: [12, 12],
      popupAnchor: [0, -10],
    });
    marker.setIcon(customIcon);
  }

  const popupContent = `
          <div style="font-family: Poppins; color: #37474f; padding: 5px; text-align: left;">
            <h3 style="color: ${status.color}; margin: 0 0 12px 0; font-size: 1.1rem;">📍 Pulau Merak Kecil</h3>
            <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Tahun:</strong> ${year}</p>
            <hr style="border: 1px solid #5ba8c4; margin: 12px 0;">
            <div style="margin: 12px 0;">
              <p style="margin: 6px 0; font-size: 0.9rem;"><strong>💧 DO:</strong> ${avgData.do} mg/L</p>
              <p style="margin: 6px 0; font-size: 0.9rem;"><strong>🌡️ SPL:</strong> ${avgData.temp} °C</p>
              <p style="margin: 6px 0; font-size: 0.9rem;"><strong>🌊 TSS:</strong> ${avgData.salinity} PSU</p>
              <p style="margin: 6px 0; font-size: 0.9rem;"><strong>🌿 Klorofil-a:</strong> ${avgData.chlorophyll} μg/L</p>
            </div>
            <div style="margin: 12px 0; padding: 10px; background: ${status.color}; border-radius: 8px; text-align: center; color: white; font-weight: bold; font-size: 0.9rem;">
              Status: ${status.text}
            </div>
            <button class="detail-btn" onclick="openDetailModal()">
              <i class="fas fa-layer-group"></i> Lihat Detail Parameter
            </button>
            <div style="margin-top: 12px;">
              <p style="font-size: 0.85em; margin: 8px 0; color: #37474f;"><strong>Tren DO Tahunan:</strong></p>
              ${miniChart}
            </div>
          </div>
        `;

  marker.bindPopup(popupContent, { maxWidth: 300 });

  // Paksa popup terbuka (opsional, bisa dihilangkan)
  if (map.getBounds().contains(marker.getLatLng())) {
    marker.openPopup();
  }
};

const createMiniSparkline = (data) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 220;
  const height = 50;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background: rgba(0,0,0,0.05); border-radius: 5px;">
                  <polyline fill="none" stroke="#2c5f8d" stroke-width="2" points="${points}" />
                  <circle cx="${
                    ((data.length - 1) / (data.length - 1)) * width
                  }" cy="${
    height - ((data[data.length - 1] - min) / range) * height
  }" r="3" fill="#E57373" />
                </svg>`;
};

/* ===== ANIMATION CONTROLS ===== */
document.getElementById("yearSlider").addEventListener("input", function (e) {
  updateMap(e.target.value);
  currentAnimationFrame = parseInt(e.target.value);
  stopAnimation();
});

const playAnimation = () => {
  document.getElementById("playBtn").style.display = "none";
  document.getElementById("stopBtn").style.display = "inline-flex";

  if (!animationInterval) {
    animationInterval = setInterval(() => {
      currentAnimationFrame++;
      if (currentAnimationFrame > 2025) {
        currentAnimationFrame = 2022; // Loop
      }
      document.getElementById("yearSlider").value = currentAnimationFrame;
      updateMap(currentAnimationFrame);
    }, 1500); // Ganti tahun setiap 1.5 detik
  }
};

const stopAnimation = () => {
  clearInterval(animationInterval);
  animationInterval = null;
  document.getElementById("playBtn").style.display = "inline-flex";
  document.getElementById("stopBtn").style.display = "none";
};

document.getElementById("playBtn").addEventListener("click", playAnimation);
document.getElementById("stopBtn").addEventListener("click", stopAnimation);

/* ===== MODAL FUNCTIONS ===== */
const modal = document.getElementById("detailModal");
const closeBtn = document.getElementsByClassName("close")[0];

// Membuka modal
const openDetailModal = () => {
  modal.style.display = "block";
  if (!detailMap) {
    initDetailMap();
  }
  // Set parameter default ke DO
  document.querySelector(".parameter-btn").click();
  detailMap.invalidateSize(); // Perbaiki tampilan map di modal
};

// Menutup modal
const closeDetailModal = () => {
  modal.style.display = "none";
  // Hapus active class dari semua tombol
  document
    .querySelectorAll(".parameter-btn")
    .forEach((btn) => btn.classList.remove("active"));
  if (detailCircle) {
    detailMap.removeLayer(detailCircle);
    detailCircle = null;
  }
  if (geoJsonLayer) {
    detailMap.removeLayer(geoJsonLayer);
    geoJsonLayer = null;
  }
  // Pastikan map utama terlihat lagi
  if (marker) marker.openPopup();
};

// Menutup modal jika klik di luar area
window.onclick = function (event) {
  if (event.target == modal) {
    closeDetailModal();
  }
};

// Menginisialisasi map di modal
const initDetailMap = () => {
  detailMap = L.map("detailMap").setView([-5.941944, 105.9975], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(detailMap);
};

/* ===== UPDATE LEGEND TSS (NEW FUNCTION) ===== */
const updateLegendTSS = () => {
  // Sembunyikan gradient bar dan ganti dengan legenda khusus GeoJSON
  document.getElementById("gradientBar").style.display = "none";
  // Tambahkan Legenda
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "legend");
    div.innerHTML = `<h4>TSS 25</h4>`;
    const grades = [1, 2, 3, 4, 5];
    const labels = [
      "Sangat Rendah",
      "Rendah",
      "Sedang",
      "Tinggi",
      "Sangat Tinggi",
    ];
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML += `
          <div class="legend-item">
            <div class="legend-color" style="background:${getColor(
              grades[i]
            )}"></div>
            <span>${labels[i]}</span>
          </div>
        `;
    }
    return div;
  };
  legend.addTo(map);

  document.getElementById(
    "legendTitle"
  ).innerHTML = `<i class="fas fa-layer-group"></i> Peta Klorofil-a (TSS) Tahun 2025`;

  // Masukkan konten legenda GeoJSON ke dalam gradientLabels
  {
    const layerGeoJson = L.geoJSON(t25, {
      style: function (feature) {
        return {
          fillColor: getColor(feature.properties.gridcode),
          color: "#000",
          weight: 1,
          fillOpacity: 0.7,
        };
      },
      onEachFeature: function (feature, layer) {
        const props = feature.properties;
        layer.bindPopup(`
            <div>
              <b>TSS:</b> ${getLabel(props.gridcode)}<br>
              <b>Luas:</b> ${props.Shape_Area.toFixed(2)} m²
            </div>
          `);
      },
    }).addTo(map);
    map.fitBounds(layerGeoJson.getBounds());
  }
  document.getElementById("gradientLabels").innerHTML = `
          <div style="font-size: 0.9rem; padding: 10px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <span style="display: inline-block; width: 20px; height: 15px; margin-right: 10px; background-color: ${getColor(
                5
              )}; border-radius: 3px; border: 1px solid #000; opacity: 0.7;"></span> Sangat Tinggi
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <span style="display: inline-block; width: 20px; height: 15px; margin-right: 10px; background-color: ${getColor(
                4
              )}; border-radius: 3px; border: 1px solid #000; opacity: 0.7;"></span> Tinggi
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <span style="display: inline-block; width: 20px; height: 15px; margin-right: 10px; background-color: ${getColor(
                3
              )}; border-radius: 3px; border: 1px solid #000; opacity: 0.7;"></span> Sedang
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <span style="display: inline-block; width: 20px; height: 15px; margin-right: 10px; background-color: ${getColor(
                2
              )}; border-radius: 3px; border: 1px solid #000; opacity: 0.7;"></span> Rendah
            </div>
            <div style="display: flex; align-items: center;">
              <span style="display: inline-block; width: 20px; height: 15px; margin-right: 10px; background-color: ${getColor(
                1
              )}; border-radius: 3px; border: 1px solid #000; opacity: 0.7;"></span> Sangat Rendah
            </div>
          </div>
        `;
};

/* ===== UPDATE LEGEND (MODIFIED) ===== */
const updateLegend = (param) => {
  // Pastikan gradient bar terlihat untuk mode non-GeoJSON
  document.getElementById("gradientBar").style.display = "block";

  const gradient = getParameterGradient(param);
  const labels = getParameterLabels(param);
  const paramNames = {
    do: "Dissolved Oxygen (DO)",
    temp: "Suhu Air",
    salinity: "Salinitas",
    chlorophyll: "Klorofil-a",
  };

  document.getElementById(
    "legendTitle"
  ).innerHTML = `<i class="fas fa-palette"></i> Skala Nilai ${paramNames[param]}`;
  document.getElementById("gradientBar").style.background = gradient;
  document.getElementById("gradientLabels").innerHTML = `
            <span>${labels.min}</span>
            <span>${labels.mid}</span>
            <span>${labels.max}</span>
          `;
};

// Fungsi pembantu untuk membuat marker default (dari kode lama)
const showDefaultMarker = (param, currentYearData) => {
  const value = currentYearData[param];
  const color = getParameterColor(param, value);
  const unit = getParameterUnit(param);
  const paramNames = {
    do: "Dissolved Oxygen",
    temp: "Suhu Air",
    salinity: "Salinitas",
    chlorophyll: "Klorofil-a",
  };

  // Create circle with color based on parameter value
  detailCircle = L.circle([-5.941944, 105.9975], {
    color: color,
    fillColor: color,
    fillOpacity: 0.5,
    radius: 1000,
    weight: 3,
  }).addTo(detailMap);

  // Add popup to circle
  detailCircle
    .bindPopup(
      `
            <div style="text-align: center; font-family: Poppins;">
              <h4 style="margin: 0 0 8px 0; color: ${color};">${paramNames[param]}</h4>
              <p style="font-size: 1.5rem; font-weight: bold; margin: 0; color: ${color};">
                ${value} ${unit}
              </p>
              <p style="font-size: 0.85rem; margin: 5px 0 0 0; color: #666;"> Tahun ${currentYearData.year} </p>
            </div>
            `
    )
    .openPopup();
};

/* ===== UPDATE DETAIL MAP (MODIFIED) ===== */
// REPLACE fungsi updateDetailMap yang ada dengan ini:

const updateDetailMap = (param) => {
  const year = document.getElementById("yearSlider").value;

  // Hapus layer lama (circle atau GeoJSON)
  if (detailCircle && detailMap) {
    detailMap.removeLayer(detailCircle);
    detailCircle = null;
  }
  if (detailGeoJsonLayer && detailMap) {
    detailMap.removeLayer(detailGeoJsonLayer);
    detailGeoJsonLayer = null;
  }

  const currentYearData = allData.find(
    (d) => d.year == year && d.month === "Des"
  );

  if (!currentYearData) return;

  // Cek apakah parameter ini perlu GeoJSON atau Circle
  if (param === "do") {
    // DO = CIRCLE (tidak berubah)
    const paramValue = currentYearData[param];
    const paramColor = getParameterColor(param, paramValue);

    detailCircle = L.circle([-5.941944, 105.9975], {
      color: paramColor,
      fillColor: paramColor,
      fillOpacity: 0.5,
      radius: 500,
    }).addTo(detailMap);

    detailCircle.bindPopup(`
      <div style="font-family: Poppins;">
        <strong>DO</strong><br>
        Nilai: ${paramValue} mg/L
      </div>
    `);

    detailMap.setView([-5.941944, 105.9975], 13);
  } else if (param === "chlorophyll") {
    // KLOROFIL-A = GEOJSON
    const loaded = loadGeoJSONLayer(
      "Klorofil-a",
      "chlorophyll",
      year,
      "🌿",
      "Klorofil-a",
      "Konsentrasi Klorofil-a"
    );

    if (!loaded) {
      // Fallback ke circle jika data tidak ada
      const paramValue = currentYearData[param];
      const paramColor = getParameterColor(param, paramValue);

      detailCircle = L.circle([-5.941944, 105.9975], {
        color: paramColor,
        fillColor: paramColor,
        fillOpacity: 0.5,
        radius: 500,
      }).addTo(detailMap);

      detailMap.setView([-5.941944, 105.9975], 13);
    }
  } else if (param === "temp") {
    // TEMP (SPL) = GEOJSON
    const loaded = loadGeoJSONLayer(
      "SPL",
      "temp",
      year,
      "🌡️",
      "SPL",
      "Suhu Permukaan Laut"
    );

    if (!loaded) {
      // Fallback ke circle
      const paramValue = currentYearData[param];
      const paramColor = getParameterColor(param, paramValue);

      detailCircle = L.circle([-5.941944, 105.9975], {
        color: paramColor,
        fillColor: paramColor,
        fillOpacity: 0.5,
        radius: 500,
      }).addTo(detailMap);

      detailMap.setView([-5.941944, 105.9975], 13);
    }
  } else if (param === "salinity") {
    // SALINITY (TSS) = GEOJSON
    const loaded = loadGeoJSONLayer(
      "TSS",
      "salinity",
      year,
      "💧",
      "TSS",
      "Total Suspended Solids"
    );

    if (!loaded) {
      // Fallback ke circle
      const paramValue = currentYearData[param];
      const paramColor = getParameterColor(param, paramValue);

      detailCircle = L.circle([-5.941944, 105.9975], {
        color: paramColor,
        fillColor: paramColor,
        fillOpacity: 0.5,
        radius: 500,
      }).addTo(detailMap);

      detailMap.setView([-5.941944, 105.9975], 13);
    }
  }

  // Update legend (gunakan fungsi yang sudah ada)
  if (typeof updateLegend === "function") {
    updateLegend(param);
  }
};

/* ===== PARAMETER BUTTON CLICK ===== */
document.querySelectorAll(".parameter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    document
      .querySelectorAll(".parameter-btn")
      .forEach((b) => b.classList.remove("active"));
    // Add active class to the clicked button
    btn.classList.add("active");

    const param = btn.getAttribute("data-param");
    updateDetailMap(param);
  });
});

/* ===== CHART INITIALIZATION ===== */
const createCharts = () => {
  const years = ["2022", "2023", "2024", "2025"];
  const chartConfig = {
    type: "line",
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "#eceff1",
            font: {
              size: 12,
              family: "Poppins",
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            color: "#eceff1",
            font: {
              size: 11,
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        x: {
          ticks: {
            color: "#eceff1",
            font: {
              size: 11,
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    },
  };

 // DO Chart
// Menggunakan nilai konstan 8.4 untuk setiap tahun
const doData = years.map(() => 8.4);

new Chart(document.getElementById("doChart"), {
  ...chartConfig,
  data: {
    labels: years,
    datasets: [
      {
        label: "Dissolved Oxygen (mg/L)",
        data: doData, // Menggunakan array [8.4, 8.4, 8.4, 8.4]
        borderColor: "#2c5f8d",
        backgroundColor: "rgba(44, 95, 141, 0.2)",
        tension: 0, // Garis lurus
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#2c5f8d",
      },
    ],
  },
});

// Temperature Chart
  const tempData = years.map((year) => {
    const yearData = allData.filter((d) => d.year == year);
    return (
      yearData.reduce((sum, d) => sum + parseFloat(d.temp), 0) / yearData.length
    ).toFixed(1);
  });
  
  new Chart(document.getElementById("tempChart"), {
    ...chartConfig,
    data: {
      labels: years,
      datasets: [
        {
          label: "Suhu Air (°C)",
          data: tempData,
          borderColor: "#ffc107",
          backgroundColor: "rgba(255, 193, 7, 0.2)",
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: "#ffc107",
        },
      ],
    },
  });

  // Salinity Chart
  const salinityData = years.map((year) => {
    const yearData = allData.filter((d) => d.year == year);
    return (
      yearData.reduce((sum, d) => sum + parseFloat(d.salinity), 0) /
      yearData.length
    ).toFixed(2);
  });

  new Chart(document.getElementById("salinityChart"), {
    ...chartConfig,
    data: {
      labels: years,
      datasets: [
        {
          label: "Salinitas (PSU)",
          data: salinityData,
          borderColor: "#7ec8e3",
          backgroundColor: "rgba(126, 200, 227, 0.2)",
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: "#7ec8e3",
        },
      ],
    },
  });

  // Chlorophyll Chart
  const chlorophyllData = years.map((year) => {
    const yearData = allData.filter((d) => d.year == year);
    return (
      yearData.reduce((sum, d) => sum + parseFloat(d.chlorophyll), 0) /
      yearData.length
    ).toFixed(2);
  });

  new Chart(document.getElementById("chlorophyllChart"), {
    ...chartConfig,
    data: {
      labels: years,
      datasets: [
        {
          label: "Klorofil-a (μg/L)",
          data: chlorophyllData,
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: "#4caf50",
        },
      ],
    },
  });
};

/* ===== INITIALIZE ON PAGE LOAD ===== */
window.addEventListener("load", () => {
  createCharts();

  setTimeout(() => {
    initMap();
  }, 500);
});

let mapInitialized = false;
window.addEventListener("scroll", () => {
  if (!mapInitialized) {
    const mapSection = document.getElementById("map");
    const rect = mapSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      initMap();
      mapInitialized = true;
    }
  }
  // Scroll Top Button Logic
  const scrollTopBtn = document.getElementById("scrollTop");
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

document
  .getElementById("scrollTop")
  .addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

// Pastikan data awal di tombol parameter terisi
const initialData = allData.find((d) => d.year == 2025 && d.month === "Des");
if (initialData) {
  document.getElementById("doValue").textContent = initialData.do + " mg/L";
  document.getElementById("tempValue").textContent = initialData.temp + " °C";
  document.getElementById("salinityValue").textContent =
    initialData.salinity + " PSU";
  document.getElementById("chlorophyllValue").textContent =
    initialData.chlorophyll + " μg/L";
}

/* ===== MOBILE MENU TOGGLE ===== */
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active");

      // Ubah icon dari bars ke times
      const icon = this.querySelector("i");
      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });

    // Tutup menu saat link diklik
    const links = navLinks.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", function () {
        navLinks.classList.remove("active");
        const icon = menuToggle.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      });
    });

    // Tutup menu saat klik di luar
    document.addEventListener("click", function (event) {
      const isClickInside =
        navLinks.contains(event.target) || menuToggle.contains(event.target);
      if (!isClickInside && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        const icon = menuToggle.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });
  }
});
/* ===== FUNGSI-FUNGSI GEOJSON - TAMBAHKAN DI AKHIR FILE ===== */

// Fungsi untuk mendapatkan warna berdasarkan gridcode
const getGeoJSONColor = (gridcode) => {
  switch (gridcode) {
    case 1:
      return "#0000FF"; // Biru - Sangat Rendah
    case 2:
      return "#00FFFF"; // Cyan - Rendah
    case 3:
      return "#00FF00"; // Hijau - Sedang
    case 4:
      return "#FFFF00"; // Kuning - Tinggi
    case 5:
      return "#FF0000"; // Merah - Sangat Tinggi
    default:
      return "#808080";
  }
};

// Fungsi untuk mendapatkan label kategori
const getGeoJSONLabel = (gridcode) => {
  switch (gridcode) {
    case 1:
      return "Sangat Rendah";
    case 2:
      return "Rendah";
    case 3:
      return "Sedang";
    case 4:
      return "Tinggi";
    case 5:
      return "Sangat Tinggi";
    default:
      return "Tidak ada data";
  }
};

// Fungsi generik untuk load GeoJSON layer
const loadGeoJSONLayer = (
  paramName,
  varPrefix,
  year,
  emoji,
  title,
  description
) => {
  // Hapus layer lama
  if (detailGeoJsonLayer && detailMap) {
    detailMap.removeLayer(detailGeoJsonLayer);
    detailGeoJsonLayer = null;
  }

  // Mapping variabel berdasarkan tahun
  const dataMap = {
    chlorophyll: {
      2022: typeof k22 !== "undefined" ? k22 : null,
      2023: typeof k23 !== "undefined" ? k23 : null,
      2024: typeof klor !== "undefined" ? klor : null,
      2025: typeof k25 !== "undefined" ? k25 : null,
    },
    temp: {
      // SPL
      2022: typeof spl22 !== "undefined" ? spl22 : null,
      2023: typeof s23 !== "undefined" ? s23 : null,
      2024: typeof s24 !== "undefined" ? s24 : null,
      2025: typeof s25 !== "undefined" ? s25 : null,
    },
    salinity: {
      // TSS
      2022: typeof t22 !== "undefined" ? t22 : null,
      2023: typeof tss23 !== "undefined" ? tss23 : null,
      2024: typeof t24 !== "undefined" ? t24 : null,
      2025: typeof t25 !== "undefined" ? t25 : null,
    },
  };

  const geojsonData = dataMap[varPrefix]
    ? dataMap[varPrefix][parseInt(year)]
    : null;

  if (
    !geojsonData ||
    !geojsonData.features ||
    geojsonData.features.length === 0
  ) {
    console.warn(`❌ Data ${paramName} untuk tahun ${year} tidak tersedia`);
    return false;
  }

  // Buat layer GeoJSON
  detailGeoJsonLayer = L.geoJSON(geojsonData, {
    style: function (feature) {
      return {
        fillColor: getGeoJSONColor(feature.properties.gridcode),
        color: "#000",
        weight: 1.5,
        fillOpacity: 0.65,
      };
    },
    onEachFeature: function (feature, layer) {
      const props = feature.properties;
      const color = getGeoJSONColor(props.gridcode);
      const label = getGeoJSONLabel(props.gridcode);

      layer.bindPopup(
        `
        <div style="font-family: 'Poppins', sans-serif; padding: 10px; min-width: 220px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 24px; margin-right: 8px;">${emoji}</div>
            <h3 style="margin: 0; color: ${color}; font-size: 1.2rem; font-weight: 600;">
              ${title} ${year}
            </h3>
          </div>
          <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
            <div style="margin-bottom: 8px;">
              <strong style="color: #666;">Kategori:</strong>
              <div style="display: inline-block; background: ${color}; color: white; padding: 4px 12px; border-radius: 4px; margin-left: 8px; font-weight: 600;">
                ${label}
              </div>
            </div>
            <div style="margin-top: 8px;">
              <strong style="color: #666;">Luas Area:</strong>
              <span style="margin-left: 8px; font-weight: 600; color: #333;">
                ${props.Shape_Area ? props.Shape_Area.toFixed(2) : "N/A"} m²
              </span>
            </div>
          </div>
          <div style="font-size: 0.85em; color: #999; text-align: center; margin-top: 8px;">
            📅 ${description} ${year}
          </div>
        </div>
      `,
        { maxWidth: 280, className: "custom-popup" }
      );
    },
  }).addTo(detailMap);

  if (detailGeoJsonLayer.getBounds().isValid()) {
    detailMap.fitBounds(detailGeoJsonLayer.getBounds(), { padding: [20, 20] });
  }

  console.log(
    `✅ Layer ${paramName} ${year} berhasil dimuat (${geojsonData.features.length} features)`
  );
  return true;
};


