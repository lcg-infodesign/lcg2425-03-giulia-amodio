let dataset; // Per il file CSV
let mapImage; // Per l'immagine PNG
let continentData = []; // Dati dei continenti
let colors = {}; // Colori per i continenti

// Colori definiti per ogni continente
const continentColors = {
  Asia: [29, 52, 99],
  Europe: [11, 70, 151],
  'South America': [0, 104, 179],
  'North America': [0, 150, 217],
  Africa: [100, 191, 237],
  Oceania: [201, 230, 250],
  Australia: [201, 230, 250], // Stesso colore di Oceania
};

// Posizioni relative per ogni continente
const continentPositions = {
  Asia: { x: 0.715, y: 0.40 },
  Europe: { x: 0.50, y: 0.38 },
  'South America': { x: 0.335, y: 0.69 },
  'North America': { x: 0.23, y: 0.38 },
  Africa: { x: 0.53, y: 0.63 },
  Oceania: { x: 0.89, y: 0.82 },
  Australia: { x: 0.80, y: 0.73 },
};

function preload() {
  // Carica il CSV e la mappa PNG
  dataset = loadTable("Dataset_fiumi_percontinente.csv", "csv", "header");
  mapImage = loadImage("Mappa.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Processa i dati del CSV
  for (let i = 0; i < dataset.getRowCount(); i++) {
    let continent = dataset.getString(i, 'Continent').trim(); // Usa i nomi esattamente come nel dataset
    let riverCount = int(dataset.getString(i, 'River_Count')); // Fiumi principali
    let tributarySum = int(dataset.getString(i, 'Tributary_Sum')); // Fiumi tributari
    continentData.push({ name: continent, riverCount, tributarySum });
  }
  
  // Assegna i colori definiti ai continenti
  assignColors();
}

function draw() {
  background(0); // Sfondo nero
  // Disegna il titolo
  textSize(28); // Dimensione del testo
  fill(255); // Colore bianco
  noStroke(); // Nessun bordo
  textAlign(LEFT, TOP); // Allinea in alto a sinistra
  text("Quanti fiumi ha ogni continente?", 50, 30); // Posizione (x: 20, y: 20)

  // Ridimensiona l'immagine in modo proporzionale
  let aspectRatio = mapImage.width / mapImage.height;
  let imgWidth = width;
  let imgHeight = width / aspectRatio;
  if (imgHeight > height) {
    imgHeight = height;
    imgWidth = height * aspectRatio;
  }
  image(mapImage, 0, 0, imgWidth, imgHeight); // Disegna la mappa
  
  // Disegna le sovrapposizioni di colore
  drawOverlay(imgWidth, imgHeight);
  
  // Disegna la legenda
  drawLegend();
}

function assignColors() {
  continentData.forEach(c => {
    if (continentColors[c.name]) {
      colors[c.name] = color(...continentColors[c.name]); // Applica i colori RGB
    } else {
      colors[c.name] = color(255, 0, 0); // Colore rosso di default per errori
      print(`Warning: No color defined for ${c.name}`); // Debug per errori
    }
  });
}

function drawOverlay(imgWidth, imgHeight) {
  let maxRiverCount = Math.max(...continentData.map(c => c.riverCount));
  let minRiverCount = Math.min(...continentData.map(c => c.riverCount));
  const scaleFactor = 1.5;

  continentData.forEach(c => {
    let pos = continentPositions[c.name];
    if (pos) {
      let x = pos.x * imgWidth;
      let y = pos.y * imgHeight;

      let size = map(c.riverCount, minRiverCount, maxRiverCount, 90, 500) 
                 * (imgWidth / mapImage.width) 
                 * scaleFactor;

      fill(colors[c.name]);
      noStroke();
      ellipse(x, y, size, size);

      let strokeWidth = Math.max(1, c.tributarySum * 0.005);
      let outerSize = size + 23;
      noFill();
      stroke(colors[c.name]);
      strokeWeight(strokeWidth);
      ellipse(x, y, outerSize, outerSize);

      // Interazione con il mouse
      let d = dist(mouseX, mouseY, x, y);
      if (d < size / 2) {
        //ombra per avere un testo più leggibile
        fill(0, 150);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(15);
        text(`Continente: ${c.name}`, mouseX + 11, mouseY + 9);
        text(`Fiumi principali: ${c.riverCount}`, mouseX + 11, mouseY + 24);
        text(`Fiumi tributari: ${c.tributarySum}`, mouseX + 11, mouseY + 39);
        // Mostra i dettagli vicino al cursore
        fill(255);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(15);
        text(`Continente: ${c.name}`, mouseX + 10, mouseY + 10);
        text(`Fiumi principali: ${c.riverCount}`, mouseX + 10, mouseY + 25);
        text(`Fiumi tributari: ${c.tributarySum}`, mouseX + 10, mouseY + 40);
      }
    } else {
      print(`No position defined for ${c.name}`);
    }
  });
}

function drawLegend() {
  let margin = 20;
  let x = margin; // Posizione iniziale a sinistra
  let y = height - 300;

  let minRiverCount = 1;
  let maxRiverCount = 32;
  let minTributarySum = Math.min(...continentData.map(c => c.tributarySum));
  let maxTributarySum = Math.max(...continentData.map(c => c.tributarySum));

  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);

  fill(255);
  text('Numero di fiumi per continente', x + 130, y - 35);

  let colorBarWidth = 250;
  let colorBarX = x + 50;
  let colorBarY = y - 20;
  let step = colorBarWidth / Object.keys(continentColors).length;

  Object.values(continentColors).reverse().forEach((rgb, index) => {
    fill(...rgb);
    rect(colorBarX + index * step, colorBarY, step, 20);
  });  

  noStroke();
  fill(255);
  textAlign(LEFT, CENTER);
  text(`${minRiverCount}`, colorBarX - 10, colorBarY + 10);
  textAlign(RIGHT, CENTER);
  text(`${maxRiverCount}`, colorBarX + colorBarWidth + 18, colorBarY + 10);

  let minCircleSize = map(minRiverCount, minRiverCount, maxRiverCount, 90, 500) * 0.08;
  let maxCircleSize = map(maxRiverCount, minRiverCount, maxRiverCount, 90, 500) * 0.08;

  let circleX = x + 55;
  let circleY = y + 42;
  noStroke();
  fill(255);
  ellipse(circleX, circleY, minCircleSize, minCircleSize);
  textAlign(CENTER, TOP);
  text(`${minRiverCount}`, circleX - 11.5, circleY - 14 + minCircleSize / 2 + 5);

  fill(255);
  ellipse(circleX + 225, circleY - 11.5, maxCircleSize, maxCircleSize);
  textAlign(CENTER, TOP);
  text(`${maxRiverCount}`, circleX + 255.5, circleY - 27 + maxCircleSize / 2 + 5);

  drawArrow(circleX, circleY + 20, circleX + 240, circleY + 20);

  y += 100;
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  text('Numero di fiumi tributari per continente', x + 155, y - 15);

  let minStrokeSize = Math.max(1, minTributarySum * 0.0015);
  let maxStrokeSize = Math.max(1, maxTributarySum * 0.0015);

  let tributaryCircleX = x + 75;
  let tributaryCircleY = y + 19;

  noFill();
  stroke(255);
  strokeWeight(minStrokeSize);
  ellipse(tributaryCircleX, tributaryCircleY, 32, 32);
  noStroke();
  fill(255);
  textAlign(CENTER, TOP);
  text(`${minTributarySum}`, tributaryCircleX - 28, tributaryCircleY + 5);

  noFill();
  stroke(255);
  strokeWeight(maxStrokeSize);
  ellipse(tributaryCircleX + 205, tributaryCircleY, 30, 30);
  noStroke();
  fill(255);
  textAlign(CENTER, TOP);
  text(`${maxTributarySum}`, tributaryCircleX + 240, tributaryCircleY + 5);

  drawArrow(tributaryCircleX - 20, tributaryCircleY + 30, tributaryCircleX + 220, tributaryCircleY + 30);
}

function drawArrow(x1, y1, x2, y2) {
  stroke(255);
  strokeWeight(2);
  line(x1, y1, x2, y2);

  let arrowSize = 10;
  let angle = atan2(y2 - y1, x2 - x1);
  line(x2, y2, x2 - arrowSize * cos(angle - PI / 6), y2 - arrowSize * sin(angle - PI / 6));
  line(x2, y2, x2 - arrowSize * cos(angle + PI / 6), y2 - arrowSize * sin(angle + PI / 6));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
