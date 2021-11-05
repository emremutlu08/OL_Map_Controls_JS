window.onload = init;

function init() {
  // CUSTOM CONTROLS
  // Çizim yapmak için kullanılan araçlar
  let drawToolsContainer = document.getElementById("draw-tools");
  let drawPolygonElement = document.getElementById("draw-polygon");
  let drawPointElement = document.getElementById("draw-point");

  // Haritayı Temizlemek için kullanılan araçlar
  let clearMapContainer = document.getElementById("clear-map-container");
  let clearMapElement = document.getElementById("clear-map");

  /** VECTORS */

  // create the source and layer for random features
  const pointVectorSource = new ol.source.Vector({});

  const pointVectorLayer = new ol.layer.Vector({
    source: pointVectorSource,
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({ color: "red" }),
      }),
    }),
  });

  const polygonVectorSource = new ol.source.Vector({});

  const polygonVectorLayer = new ol.layer.Vector({
    source: polygonVectorSource,
  });

  /** VECTORS - END */

  /** EVENTS */
  clearMapElement.addEventListener("click", () => {
    pointVectorSource.clear();
    polygonVectorSource.clear();
  });

  const createInteraction = (element, interaction, vectorSource) => {
    let isClicked = false;
    element.addEventListener("click", () => {
      isClicked = !isClicked;
      if (isClicked) {
        // Butona tıklandığında interaction ekle
        map.addInteraction(interaction);

        // Elementin görüntüsünü değiştir
        element.innerHTML = "Close Draw " + element.name;
        element.style.backgroundColor = "rgba(107, 62, 11, 0.7)";

        // Çizim işlemi bittiğinde fonksiyonu çalıştır
        interaction.on("drawend", function (e) {
          // Tüm geometriyi elde et
          let feature = e.feature.getGeometry();
          if (feature.getType() === "Point") {
            // Eğer geometri tipi Point ise burayı çalıştır

            // Yeni bir feature olarak vector kaynağına ekle
            const newFeature = new ol.Feature({
              geometry: new ol.geom.Point(feature.getCoordinates()),
            });
            vectorSource.addFeature(newFeature);
            // Ve haritada görünsün!
          }

          if (feature.getType() === "Polygon") {
            // Eğer geometri tipi Polygon ise burayı çalıştır
            // Yeni bir feature olarak vector kaynağına ekle
            const newFeature = new ol.Feature({
              geometry: new ol.geom.Polygon(feature.getCoordinates()),
            });
            vectorSource.addFeature(newFeature);
            // Ve haritada görünsün!
          }
        });
      } else {
        // Eski interaction'ı kaldır
        map.removeInteraction(interaction);
        // Butonun görüntüsünü eski haline getir
        element.innerHTML = "Open Draw " + element.name;
        element.style.backgroundColor = "rgba(30, 80, 80, 0.7)";
      }
    });
  };

  // Controls
  const fullScreenControl = new ol.control.FullScreen();
  const mousePositionControl = new ol.control.MousePosition();
  const overViewMapControl = new ol.control.OverviewMap({
    collapsed: false,
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
    ],
  });
  const scaleLineControl = new ol.control.ScaleLine();
  const zoomSliderControl = new ol.control.ZoomSlider();
  const zoomToExtentControl = new ol.control.ZoomToExtent();
  const drawToolsControl = new ol.control.Control({
    element: drawToolsContainer,
  });
  const clearMapControl = new ol.control.Control({
    element: clearMapContainer,
  });

  const controlsArr = [
    fullScreenControl,
    mousePositionControl,
    overViewMapControl,
    scaleLineControl,
    zoomSliderControl,
    zoomToExtentControl,
    // Add Custom Controllers
    drawToolsControl,
    clearMapControl,
  ];

  // Haritayı oluşturuyoruz
  const map = new ol.Map({
    view: new ol.View({
      center: [3901835.001223564, 4735426.77632324],
      zoom: 6,
      minZoom: 2,
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
      pointVectorLayer,
      polygonVectorLayer,
    ],
    target: "js-map",
    keyboardEventTarget: document,
    controls: ol.control.defaults().extend(controlsArr),
  });

  // DragRotate Interaction
  const dragRotateInteraction = new ol.interaction.DragRotate({
    // Alt tuşu ile haritayı çevirebilirsin
    condition: ol.events.condition.altKeyOnly,
  });

  map.addInteraction(dragRotateInteraction);

  // Draw Interaction
  const drawPolygonInteraction = new ol.interaction.Draw({
    type: "Polygon",
  });

  const drawPointInteraction = new ol.interaction.Draw({
    type: "Point",
  });

  // Custom Interactions
  createInteraction(drawPointElement, drawPointInteraction, pointVectorSource);
  createInteraction(
    drawPolygonElement,
    drawPolygonInteraction,
    polygonVectorSource
  );

  /** LAYERS */
  // WMS
  const atlasWMSLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: "http://192.168.0.131:5001/geoserver/serbestbolge/wms?",
      params: {
        LAYERS: "serbestbolge:sb_parsel",
        FORMAT: "image/png",
      },
    }),
  });

  map.addLayer(atlasWMSLayer);

  // WFS
  const atlasWFSLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: "http://192.168.0.131:5001/geoserver/serbestbolge/wfs?",
      params: {
        LAYERS: "serbestbolge:sb_parsel",
        FORMAT: "image/png",
      },
    }),
  });

  // var atlasWFSLayer = new ol.Layer.Vector("Stavros Features", {
  //   strategies: [new ol.Strategy.Fixed()],
  //   projection: new ol.Projection("EPSG:4326"),
  //   protocol: new ol.Protocol.WFS({
  //     url: "http://192.168.0.131:5001/geoserver/serbestbolge/wfs?",
  //     featureType: "parks", //geoserver Layer Name without workspace prefix
  //     params: {
  //       LAYERS: "serbestbolge:sb_parsel",
  //       FORMAT: "image/png",
  //     },
  //   }),
  // });

  map.addLayer(atlasWFSLayer);
}
