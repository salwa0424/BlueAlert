let map = null; // Map utama
let marker = null;
let detailMap = null; // Map di modal
let detailCircle = null;
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
  /*
        PASTE DATA GEOJSON ANDA DI SINI. Contoh:
        "type": "FeatureCollection",
        "features": [
          // ... semua fitur GeoJSON Anda
        ]
        */
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
              <p style="margin: 6px 0; font-size: 0.9rem;"><strong>🌡️ Suhu:</strong> ${avgData.temp} °C</p>
              <p style="margin: 6px 0; font-size: 0.9rem;"><strong>🌊 Salinitas:</strong> ${avgData.salinity} PSU</p>
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
const updateDetailMap = (param) => {
  // 1. Hapus semua layer GeoJSON dan Circle yang mungkin ada sebelumnya
  if (detailCircle) {
    detailMap.removeLayer(detailCircle);
    detailCircle = null;
  }
  if (geoJsonLayer) {
    detailMap.removeLayer(geoJsonLayer);
    geoJsonLayer = null;
  }

  const currentYearData = allData.find(
    (d) =>
      d.year == document.getElementById("yearSlider").value && d.month === "Des"
  );

  // 2. Tentukan tampilan: GeoJSON untuk Klorofil-a 2025 atau Circle untuk lainnya
  if (param === "chlorophyll" && currentYearData.year === "2025") {
    // KASUS 1: Parameter Klorofil-a (TSS) di tahun 2025 -> Tampilkan GeoJSON (output gabunganK25)
    if (
      Object.keys(geojsonTSS25).length > 0 &&
      geojsonTSS25.features &&
      geojsonTSS25.features.length > 0
    ) {
      loadGeoJsonTSS25(detailMap); // Load GeoJSON
      updateLegendTSS(); // Update legend khusus TSS
    } else {
      // Jika data GeoJSON kosong (placeholder belum diisi)
      console.warn("GeoJSON data is empty. Showing default marker instead.");
      showDefaultMarker(param, currentYearData);
      updateLegend(param);
    }
  } else {
    // KASUS 2: Parameter lain atau Klorofil-a di tahun selain 2025 -> Tampilkan Circle default
    showDefaultMarker(param, currentYearData);
    updateLegend(param); // Update legend default
  }

  // 3. Memastikan map set view tetap di pusat
  detailMap.setView([-5.941944, 105.9975], 13);
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
  const doData = years.map((year) => {
    const yearData = allData.filter((d) => d.year == year);
    return (
      yearData.reduce((sum, d) => sum + parseFloat(d.do), 0) / yearData.length
    ).toFixed(2);
  });

  new Chart(document.getElementById("doChart"), {
    ...chartConfig,
    data: {
      labels: years,
      datasets: [
        {
          label: "Dissolved Oxygen (mg/L)",
          data: doData,
          borderColor: "#2c5f8d",
          backgroundColor: "rgba(44, 95, 141, 0.2)",
          tension: 0.4,
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
