import { Component, OnInit } from '@angular/core';
import * as p5 from 'p5';

import { HostedModel } from '@runwayml/hosted-models';
import { DrawingModes, OtherModes } from './../../shared/enums/drawing-modes';
import { TextModes } from './../../shared/enums/text-modes';
import { ExportModes } from './../../shared/enums/export-modes';
import { Background } from './../../shared/enums/backgrounds';
import { AnimatedModes } from './../../shared/enums/animated-modes';
import { TextAlignModes } from './../../shared/enums/text-align-modes';
import { FilterTypes } from './../../shared/enums/filter-types';
import { FontTypes } from './../../shared/enums/fonts.enum';
import { LanguageSupport } from './../../shared/enums/language-support';

@Component({
  selector: 'app-sketch-pad',
  templateUrl: './sketch-pad.component.html',
  styleUrls: ['./sketch-pad.component.scss']
})
export class SketchPadComponent implements OnInit {
  CANVAS_WIDTH; CANVAS_HEIGHT;
  FONT_SIZE: number = 30;
  activeTab: number = 1;
  public isCollapsed = false;
  strokeColor: any = 1;
  secondaryColor: any = 1;
  canvas: any;

  generatedImgBase64: string;

  /* fonts */
  readonly fonts: Array<FontTypes> = [
    FontTypes.DEFAULT, FontTypes.ARIAL, FontTypes.NASTALEEQ, FontTypes.LATEEF, FontTypes.ROBOTO_THIN, FontTypes.ROBOTO_MEDIUM, FontTypes.ROBOTO_BLACK
  ]
  arial; nastaleeq; robotoThin; robotoMed; robotoBlack; lateef;
  activeFont: FontTypes;
  defaultFont;

  p0; p1; p2; p3;
  stepX; stepY;
  colors = {} as { from: any, to: any, interA: any, interB: any };
  sizePicker: any;
  textLayer: any;
  brushLayer: any;
  filterLayer: any;
  animatedLayer: any;
  backgroundLayer: any;
  inputText: string;
  imagePath: string;

  readonly languageSupport = [LanguageSupport.URDU, LanguageSupport.ENGLISH];
  readonly exportModes = [ExportModes.JPEG, ExportModes.PNG];
  readonly backgroundModess = Background;

  selectedLanguage: LanguageSupport;
  activeMode: DrawingModes | TextModes | Background | 'GAN' | FilterTypes | OtherModes | AnimatedModes;

  shareUrl: string;

  readonly filters = [
    FilterTypes.INVERT,
    FilterTypes.GRAY,
    FilterTypes.ERODE,
    FilterTypes.THRESHOLD,
    FilterTypes.BLUR,
    FilterTypes.DILATE,
    FilterTypes.POSTERIZE,
    FilterTypes.OPAQUE,
    FilterTypes.CLEAR
    // OtherModes.NOISE
  ]

  readonly modes = [
    { type: DrawingModes.CIRCLE_MODE, text: 'Circle' },
    { type: DrawingModes.BRUSH_MODE, text: 'Brush' },
    { type: DrawingModes.TEXT_BRUSH, text: 'Text Brush' },
    { type: DrawingModes.GRADIENT_LINE, text: 'Gradient Line' },
    { type: DrawingModes.BEADS, text: 'Beads Brush' },
    { type: DrawingModes.CLEAR, text: 'Clear Brush' },
  ];

  readonly textModes = [
    { type: TextModes.ROTATE_FILL, text: 'Rotated Letters' },
    { type: TextModes.HEADING_STYLE, text: 'Heading' },
    // { type: TextModes.GENERATIVE, text: 'Generative' },
    { type: TextModes.STEERING, text: 'Steering Letters' },
    { type: TextModes.CLEAR, text: 'Clear Text' },
  ];

  readonly backgrounds = [
    { type: Background.CIRCLE, text: 'Circles & Text' },
    { type: Background.STRIPES, text: 'Stripes' },
    { type: Background.LINES, text: 'Lines' },
    { type: Background.GRID_CIRCLE, text: 'Grid Pattern' },
    { type: Background.SOLID_FILL, text: 'Solid Fill' },
    { type: Background.GRADIENT, text: 'Gradient' },
    { type: Background.INPUT_IMAGE, text: 'Browse Image' },
    { type: Background.CLEAR, text: 'Clear' },
  ];


  readonly animations = [
    { type: AnimatedModes.SQUARE, text: 'Square' },
    { type: AnimatedModes.SPIRAL, text: 'Spiral' },
    { type: AnimatedModes.CLEAR, text: 'Clear' },
  ];

  readonly textAlignModes = [
    { type: TextAlignModes.LEFT, icon: '' },
    { type: TextAlignModes.CENTER, icon: '' },
    { type: TextAlignModes.RIGHT, icon: '' },
  ];
  selectedTextAlign: TextAlignModes;

  filterImage;
  fileInput;
  sketch;
  showNewOptions: boolean;
  showKeyboard: boolean;


  angle = 2.0;
  offset = 300;
  scalar = 3.5;
  speed = 0.1;
  col = {
    r: 255,
    g: 0,
    b: 0
  };

  constructor(
  ) {
    this.showNewOptions = false;
    this.showKeyboard = false;
    this.CANVAS_HEIGHT = 600; this.CANVAS_WIDTH = 600;
    this.inputText = '';
    this.sizePicker = 10;
    this.strokeColor = '#000000'
    this.secondaryColor = '#000000'
    this.selectedLanguage = LanguageSupport.URDU;
    this.selectedTextAlign = TextAlignModes.CENTER;
    this.imagePath = 'assets/images/12.png';
    this.shareUrl = 'https://ga-pad.web.app/';
  }

  ngOnInit(): void {
    this.newSketch();
  }

  openNav() {
    document.getElementById("sidebar-nav").style.width = "350px";
    document.getElementById("main").style.marginLeft = "350px";
  }

  /* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
  closeNav() {
    document.getElementById("sidebar-nav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
  }

  private newSketch(): void {
    const sketch = s => {
      s.preload = () => {
        this.activeFont = this.fonts[0];
        this.arial = s.loadFont('assets/arial.ttf');
        this.nastaleeq = s.loadFont('assets/kasheeda.ttf');
        this.robotoBlack = s.loadFont('assets/Roboto-Black.ttf');
        this.robotoMed = s.loadFont('assets/Roboto-Medium.ttf');
        this.robotoThin = s.loadFont('assets/Roboto-Light.ttf');
        this.lateef = s.loadFont('assets/lateef.ttf');
      };

      s.setup = () => {
        this.defaultFont = s.textFont();
        this.createCanvas(s);
        this.createLayers(s);
        this.createFilePicker(s);
        s.rect(0, 0, s.width, s.height);
        s.stroke(this.strokeColor);
      };

      s.draw = () => {
        this.sketch = s;
        this.colorRange(s);
        switch (this.activeMode) {
          case TextModes.STEERING: this.steeringText(s); break;
          case DrawingModes.BRUSH_MODE: this.brushDrawing(s); break;
          case DrawingModes.CIRCLE_MODE: this.circleDrawing(s); break;
          case DrawingModes.TEXT_BRUSH: this.textBrush(s); break;
          case DrawingModes.GRADIENT_LINE: this.makeGradientLine(s); break;
          case DrawingModes.BEADS: this.beads(s); break;
          case DrawingModes.CLEAR: this.clearBrushLayer(s); break;
          case TextModes.ROTATE_FILL: this.rotateText(s); break;
          case TextModes.HEADING_STYLE: this.heading(s); break;
          case TextModes.STEERING: this.steeringText(s); break;
          case TextModes.GENERATIVE: this.generativeLetter(s); break;
          case TextModes.MOVE: this.moveText(s); break;
          case TextModes.CLEAR: this.clearText(s); break;
          case Background.GRADIENT: this.gradientBackground(s); break;
          case Background.SOLID_FILL: this.fillBackground(s); break;
          case Background.CIRCLE: this.circleBackground(s); break;
          case Background.STRIPES: this.stripesBackground(s); break;
          case Background.GRID_CIRCLE: this.circlesGridBackground(s); break;
          case Background.LINES: this.linesBackground(s); break;
          case Background.INPUT_IMAGE: this.showFilepicker(s); break;
          case Background.CLEAR: this.clearBackground(s); break;
          case FilterTypes.INVERT:
          case FilterTypes.BLUR:
          case FilterTypes.GRAY:
          case FilterTypes.ERODE:
          case FilterTypes.DILATE:
          case FilterTypes.OPAQUE:
          case FilterTypes.THRESHOLD:
          case FilterTypes.POSTERIZE:
            this.setFilter(s); break;
          case FilterTypes.CLEAR: this.clearFilter(s); break;
          case AnimatedModes.SQUARE: this.animateSquare(s); break;
          case AnimatedModes.SPIRAL: this.spiral(s); break;
          case AnimatedModes.CLEAR: this.clearAnimation(s); break;
          case 'GAN': this.generateRunwayImage(s); break;
        }
      };
    };
    this.canvas = new p5(sketch);
  }

  // animated

  private resetSpiralValues(): void {
    this.angle = 2.0;
    this.offset = 300;
    this.scalar = 3.5;
    this.speed = 0.1;
    this.col = {
      r: 255,
      g: 0,
      b: 0
    };
  }

  animateSquare(s): void {
    let lineWidth = this.animatedLayer.random(4, 50);
    let squareSize = this.animatedLayer.random(5, this.CANVAS_WIDTH);
    this.animatedLayer.rectMode(s.CENTER);
    this.animatedLayer.strokeWeight(lineWidth);
    this.animatedLayer.stroke(this.strokeColor);
    this.animatedLayer.fill(this.secondaryColor);
    this.animatedLayer.square(300, 300, squareSize);
    s.image(this.animatedLayer, 0, 0);
  }

  spiral(s): void {
    const hex = this.strokeColor.replace('#', '');
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    this.col.r = this.animatedLayer.random(0, r);
    this.col.g = this.animatedLayer.random(0, g);
    this.col.b = this.animatedLayer.random(100, b);
    var x = this.offset + this.animatedLayer.cos(this.angle) * this.scalar;
    var y = this.offset + this.animatedLayer.sin(this.angle) * this.scalar;
    this.animatedLayer.fill(this.col.r, this.col.g, this.col.b);
    this.animatedLayer.stroke(this.strokeColor);
    const urduText = (document.getElementById('txtBox') as HTMLInputElement).value;
    this.animatedLayer.textSize(this.sizePicker);
    this.animatedLayer.text(urduText, x, y);
    // this.animatedLayer.ellipse(x, y, 5, 5);
    this.angle += this.speed;
    this.scalar += this.speed;
    s.image(this.animatedLayer, 0, 0);
  }


  private clearAnimation(sketch: any): void {
    this.animatedLayer.clear();
    this.backgroundLayer.clear();
    this.handleFile(null, sketch);
    sketch.image(this.animatedLayer, 0, 0);
    sketch.image(this.backgroundLayer, 0, 0);
    sketch.rect(0, 0, sketch.width, sketch.height);
    sketch.image(this.brushLayer, 0, 0);
    sketch.image(this.textLayer, 0, 0);
    this.activeMode = null;
  }

  // GAN
  generateRunwayImage(s: any): void {
    this.activeMode = null;
    const model = new HostedModel({
      url: "https://landscapes-5774376f.hosted-models.runwayml.cloud/v1/",
      token: "P/Hl6auSbVYmEqGiAbsJEg=="
    });

    const z = [];
    for (let i = 0; i < 512; i++) {
      z[i] = Math.random();
    }

    const inputs = {
      "z": z,
      "truncation": 0.5
    };
    model.query(inputs).then(outputs => {
      const { image } = outputs;
      this.generatedImgBase64 = outputs.image;
      let img = s.loadImage(this.generatedImgBase64);
      setTimeout(() => {
        s.background(img);
      }, 1000)
    });
  }

  private testRunway(): void {
    const model = new HostedModel({
      // url: "https://skygan-68e3f677.hosted-models.runwayml.cloud/v1/",
      // token: "b+aYpmRyZwom71wtdIwegg==",
      url: "https://landscapes-5774376f.hosted-models.runwayml.cloud/v1/",
      token: "P/Hl6auSbVYmEqGiAbsJEg=="
    });
    //// You can use the info() method to see what type of input object the model expects
    model.info().then(info => console.log(info));

    const z = [];
    for (let i = 0; i < 512; i++) {
      z[i] = Math.random();
    }

    const inputs = {
      "z": z,
      "truncation": 0.5
    };
    model.query(inputs).then(outputs => {
      const { image } = outputs;
      this.generatedImgBase64 = outputs.image;
      // use the outputs in your project
      const imageElement = document.createElement('img');
      imageElement.src = outputs.image;

      console.log(this.generatedImgBase64);
    });

  }

  // Canvas Options

  clearCanvas(): void {
    window.location.reload();
  }

  private createCanvas(sketch: any): void {
    const backgroundCanvas = sketch.createCanvas(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    backgroundCanvas.parent('sketch-holder');
    sketch.background(255);
  }

  private createLayers(sketch: any): void {
    this.textLayer = sketch.createGraphics(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    this.textLayer.clear();
    this.brushLayer = sketch.createGraphics(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    this.brushLayer.clear();
    this.backgroundLayer = sketch.createGraphics(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    this.backgroundLayer.clear();
    this.filterLayer = sketch.createGraphics(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    this.filterLayer.clear();
    this.animatedLayer = sketch.createGraphics(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    this.animatedLayer.clear();
  }

  private updateLayers(sketch: any): void {
    sketch.image(this.backgroundLayer, 0, 0);
    sketch.image(this.filterLayer, 0, 0);
    sketch.image(this.brushLayer, 0, 0);
    sketch.image(this.textLayer, 0, 0);
  }

  // Brush Mode Functions

  private clearBrushLayer(sketch: any): void {
    this.brushLayer.clear();
    sketch.image(this.brushLayer, 0, 0);
    sketch.rect(0, 0, sketch.width, sketch.height);
    sketch.image(this.backgroundLayer, 0, 0);
    sketch.image(this.textLayer, 0, 0);
    this.activeMode = null;
  }

  private brushDrawing(s: any): void {
    if (s.mouseIsPressed) {
      if (s.mouseButton === s.LEFT) {
        this.brushLayer.stroke(this.strokeColor);
        this.brushLayer.strokeWeight(this.sizePicker);
        this.brushLayer.line(s.mouseX, s.mouseY, s.pmouseX, s.pmouseY);
      } else if (s.mouseButton === s.CENTER) {
        this.brushLayer.background(255);
      }
      this.updateLayers(s);
    }
  }

  private circleDrawing(s: any): void {
    if (s.mouseIsPressed) {
      const speed = s.abs(s.mouseX, s.pmouseX) + s.abs(s.mouseY - s.pmouseY);
      this.brushLayer.stroke(this.strokeColor);
      this.brushLayer.strokeWeight(this.sizePicker);
      this.brushLayer.ellipse(s.mouseX, s.mouseY, speed, speed);
      this.updateLayers(s);
    }
  }

  private textBrush(s: any): void {
    const urduText = (document.getElementById('txtBox') as HTMLInputElement).value.split(' ');
    let distance = 0;
    this.brushLayer.noStroke();
    if (s.mouseIsPressed) {
      for (let i = 0; i < urduText.length; i++) {
        this.brushLayer.fill(this.strokeColor);
        this.brushLayer.textSize(this.sizePicker);
        this.brushLayer.text(urduText[i], s.mouseX, s.mouseY + distance + 3);
        distance += this.sizePicker;
        this.updateLayers(s);
      }
    }
  }

  private makeGradientLine(sketch): void {
    this.brushLayer.noStroke();
    this.colorRange(sketch);
    this.gradientLine(0, 0, sketch.mouseX, sketch.mouseY, 50);
    sketch.image(this.brushLayer, 0, 0);
    if (sketch.mouseIsPressed){
      this.activeMode = null;
    }
  }

  private gradientLine(x1, y1, x2, y2, sz) {
    const d = this.backgroundLayer.dist(x1, y1, x2, y2)
    for (let i = 0; i < d; i++) {
      const step = this.backgroundLayer.map(i, 0, d, 0, 1);
      const x = this.backgroundLayer.lerp(x1, x2, step)
      const y = this.backgroundLayer.lerp(y1, y2, step)
      const c = this.backgroundLayer.lerpColor(this.colors.from, this.colors.to, step)
      this.brushLayer.fill(c)
      this.brushLayer.ellipse(x, y, sz, sz)
    }
  }

  private beads(sketch) {
    if (sketch.mouseIsPressed){
    // set the color and brush style
    this.brushLayer.fill(this.strokeColor);
    this.brushLayer.noStroke();
  
    // find the distance between the current and previous mouse points
    const distance = sketch.dist(sketch.mouseX, sketch.mouseY, sketch.pmouseX, sketch.pmouseY)
  
    // find the midpoint between the current and previous mouse points
    const midX = (sketch.mouseX + sketch.pmouseX) / 2
    const midY = (sketch.mouseY + sketch.pmouseY) / 2
  
    // draw a circle at the midpoint, with distance as its diameter
    this.brushLayer.circle(midX, midY, distance);
    sketch.image(this.brushLayer, 0, 0);
    }
  }

  // Background Functions

  private clearBackground(sketch: any): void {
    this.backgroundLayer.clear();
    this.handleFile(null, sketch);
    sketch.image(this.backgroundLayer, 0, 0);
    sketch.rect(0, 0, sketch.width, sketch.height);
    sketch.image(this.brushLayer, 0, 0);
    sketch.image(this.textLayer, 0, 0);
    this.activeMode = null;
  }

  private circleBackground(sketch: any): void {
    this.backgroundLayer.noStroke();
    const urduText = (document.getElementById('txtBox') as HTMLInputElement).value;
    for (let i = 0; i < 1000; i++) {
      const randomColor = this.getRandomColor();
      this.backgroundLayer.fill(randomColor);
      this.backgroundLayer.noStroke();
      this.backgroundLayer.ellipse(sketch.random(this.CANVAS_WIDTH), sketch.random(this.CANVAS_HEIGHT), sketch.random(100));
      this.backgroundLayer.stroke(this.secondaryColor);
      this.backgroundLayer.textSize(this.sizePicker);
      this.backgroundLayer.text(urduText, sketch.random(this.CANVAS_WIDTH), sketch.random(this.CANVAS_HEIGHT));
    }
    sketch.image(this.backgroundLayer, 0, 0);
    this.activeMode = null;
  }

  private stripesBackground(sketch: any): void {
    const urduText = (document.getElementById('txtBox') as HTMLInputElement).value;
    for (var s = 0; s < sketch.width; s = s + 1) {
      const randomColor = this.getRandomColor();
      this.backgroundLayer.fill(randomColor);
      this.backgroundLayer.noStroke();
      this.backgroundLayer.rect(s * 20, 0, 10, sketch.height);
    }
    sketch.image(this.backgroundLayer, 0, 0);
    this.activeMode = null;
  }

  private colorRange(sketch: any): void {
    this.colors.from = sketch.color(this.strokeColor);
    this.colors.to = sketch.color(this.secondaryColor);
    this.backgroundLayer.colorMode(sketch.RGB); // Try changing to HSB.
    this.colors.interA = sketch.lerpColor(this.colors.from, this.colors.to, 0.33);
    this.colors.interB = sketch.lerpColor(this.colors.from, this.colors.to, 0.66);
  }

  private linesBackground(sketch: any): void {
    this.backgroundLayer.fill(this.secondaryColor);
    this.backgroundLayer.stroke(this.strokeColor);
    for (let x = 0; x <= this.CANVAS_WIDTH; x += 50)
      for (let y = 0; y <= this.CANVAS_WIDTH; y += 50) {
        this.backgroundLayer.line(x, y, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
      }
    sketch.image(this.backgroundLayer, 0, 0);
  }


  private circlesGridBackground(sketch: any): void {
    this.backgroundLayer.fill(this.secondaryColor);
    this.backgroundLayer.noFill();
    this.backgroundLayer.stroke(this.strokeColor);
    for (let x = 0; x <= this.CANVAS_WIDTH; x += 20)
      for (let y = 0; y <= this.CANVAS_WIDTH; y += 20) {
        this.backgroundLayer.ellipse(x, y, 100, 100);
      }
    sketch.image(this.backgroundLayer, 0, 0);
  }


  private fillBackground(sketch): void {
    this.backgroundLayer.clear();
    this.backgroundLayer.fill(this.secondaryColor);
    this.backgroundLayer.rect(0, 0, sketch.width, sketch.height);
    sketch.image(this.backgroundLayer, 0, 0);
    this.activeMode = null;
  }

  private gradientBackground(sketch): void {
    this.backgroundLayer.noFill();
    for (var y = 0; y < this.CANVAS_HEIGHT; y++) {
      var inter = this.textLayer.map(y, 0, this.CANVAS_HEIGHT, 0, 1);
      var c = this.backgroundLayer.lerpColor(this.colors.from, this.colors.to, inter);
      this.backgroundLayer.stroke(c);
      this.backgroundLayer.line(0, y, this.CANVAS_WIDTH, y);
    }
    sketch.image(this.backgroundLayer, 0, 0);
    this.activeMode = null;
  }

  // Text Functions

  private moveText(sketch: any): void {
    const oldText = this.textLayer;
    // sketch.image(oldText.clear(),0,0);
    sketch.image(this.textLayer, sketch.mouseX, sketch.mouseY);
    // this.textLayer.clear();
    // sketch.image(this.textLayer,0,0)
  }

  private clearText(sketch: any): void {
    // this.inputText = '';
    this.textLayer.clear();
    sketch.image(this.textLayer, 0, 0);
    sketch.rect(0, 0, sketch.width, sketch.height);
    sketch.image(this.backgroundLayer, 0, 0);
    sketch.image(this.brushLayer, 0, 0);
    this.activeMode = null;
  }

  private setFont(): any {
    let font;
    switch (this.activeFont) {
      case FontTypes.ARIAL: font = this.arial; break;
      case FontTypes.NASTALEEQ: font = this.nastaleeq; break;
      case FontTypes.LATEEF: font = this.lateef; break;
      case FontTypes.ROBOTO_BLACK: font = this.robotoBlack; break;
      case FontTypes.ROBOTO_MEDIUM: font = this.robotoMed; break;
      case FontTypes.ROBOTO_THIN: font = this.robotoThin; break;
      default: font = this.defaultFont; break;
    }
    return font;
  }

  private rotateText(sketch: any): void {
    const urduText = (document.getElementById('txtBox') as HTMLInputElement).value;
    const reversedUrdu = this.reverseString(urduText);
    const text = this.selectedLanguage === LanguageSupport.URDU ? reversedUrdu : this.inputText;
    const font = this.setFont();
    this.textLayer.textFont(font);
    this.textLayer.stroke(this.strokeColor);
    this.textLayer.textSize(this.sizePicker);
    for (let i = 0; i < this.CANVAS_WIDTH; i++) {
      this.textLayer.push();
      this.textLayer.fill(this.strokeColor);
      this.textLayer.translate(sketch.random(this.CANVAS_WIDTH), sketch.random(this.CANVAS_HEIGHT));
      this.textLayer.rotate(sketch.random(2 * sketch.PI));
      this.textLayer.text(text, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
      this.textLayer.pop();
    }
    sketch.image(this.textLayer, 0, 0);
    this.activeMode = null;
  }

  private reverseString(str): string {
    // Step 1. Use the split() method to return a new array
    var splitString = str.split(""); // var splitString = "hello".split("");
    // ["h", "e", "l", "l", "o"]

    // Step 2. Use the reverse() method to reverse the new created array
    var reverseArray = splitString.reverse(); // var reverseArray = ["h", "e", "l", "l", "o"].reverse();
    // ["o", "l", "l", "e", "h"]

    // Step 3. Use the join() method to join all elements of the array into a string
    var joinArray = reverseArray.join(""); // var joinArray = ["o", "l", "l", "e", "h"].join("");
    // "olleh"

    //Step 4. Return the reversed string
    return joinArray; // "olleh"
  }

  private heading(sketch: any): void {
    const font = this.selectedLanguage === LanguageSupport.URDU ? this.defaultFont : this.setFont();
    this.textLayer.textFont(font);
    const urduText = (document.getElementById('txtBox') as HTMLInputElement).value;
    const text = this.selectedLanguage === LanguageSupport.URDU ? urduText : this.inputText;
    this.textLayer.stroke(this.secondaryColor);
    this.textLayer.strokeWeight(5);
    this.textLayer.textSize(this.sizePicker);
    this.textLayer.textAlign(this.selectedTextAlign, this.selectedTextAlign);
    this.textLayer.fill(this.strokeColor);
    if (sketch.mouseIsPressed){
      this.textLayer.text(text, sketch.mouseX, sketch.mouseY);
      sketch.image(this.textLayer, 0, 0);
      this.activeMode = null;
    }
  }

  private steeringText(sketch: any): void {
    const urduText = (document.getElementById('txtBox') as HTMLInputElement).value;
    const reversedUrdu = this.reverseString(urduText);
    const text = this.selectedLanguage === LanguageSupport.URDU ? reversedUrdu : this.inputText;
    if (this.activeFont === FontTypes.DEFAULT){
      this.activeFont = FontTypes.ARIAL;
    }
    const font = this.setFont();
    const points = font.textToPoints(text, sketch.mouseX, sketch.mouseY, this.sizePicker, {
      sampleFactor: 0.25
    });
    if (sketch.mouseIsPressed) {
      for (var i = 0; i < points.length; i++) {
        const pt = points[i];
        this.textLayer.stroke(this.strokeColor);
        this.textLayer.strokeWeight(1);
        this.textLayer.ellipse(pt.x, pt.y, 5, 5);
      }
    }
    sketch.image(this.textLayer, 0, 0);
    // this.activeMode = null;
  }

  onLanguageClick(language: LanguageSupport): void {
    this.selectedLanguage = language;
    this.inputText = '';
    switch (language) {
      case LanguageSupport.URDU: document.getElementById('txtBox').style.display = 'block'; break;
      // case LanguageSupport.ENGLISH: document.getElementById('txtBox').style.display = 'none'; break;
    }
  }

  onAlignClick(align: TextAlignModes): void {
    this.selectedTextAlign = align;
  }

  private generativeLetter(sketch: any): void {
    this.textLayer.background(this.secondaryColor);
    this.textLayer.translate(100, this.textLayer.height * 0.75);
    const pathSampleFactor = 0.1 * this.textLayer.pow(0.02, this.textLayer.mouseX / this.textLayer.width);
    const ribbonWidth = this.textLayer.map(this.textLayer.mouseY, 0, this.textLayer.height, 1, 200);

    const urduText = (document.getElementById('txtBox') as HTMLInputElement).value;
    const text = this.selectedLanguage === LanguageSupport.URDU ? urduText : this.inputText;
    let letters = text;
    const font = this.setFont();
    for (var i = 0; i < letters.length; i++) {
      var path = font.textToPoints(letters[0], 50, 50, this.sizePicker, { sampleFactor: pathSampleFactor });
      this.textLayer.stroke(this.strokeColor);
      let density = 0.1;
      for (var d = 0; d < ribbonWidth; d += density) {
        this.textLayer.beginShape();

        for (var i = 0; i < path.length; i++) {
          var pos = path[i];
          var nextPos = path[i + 1];

          if (nextPos) {
            var p0 = this.textLayer.createVector(pos.x, pos.y);
            var p1 = this.textLayer.createVector(nextPos.x, nextPos.y);
            var v = p5.Vector.sub(p1, p0);
            v.normalize();
            v.rotate(this.textLayer.HALF_PI);
            v.mult(d);
            var pneu = p5.Vector.add(p0, v);
            this.textLayer.curveVertex(pneu.x, pneu.y);
          }
        }
        this.textLayer.endShape(this.textLayer.CLOSE);
      }
    }
    sketch.image(this.textLayer, 0, 0);
    // this.activeMode = null;
  }

  // Helper Functions

  private createFilePicker(sketch: any): void {
    // const label = sketch.text('Background Image: ',sketch.windowWidth-400,20);
    this.fileInput = sketch.createFileInput(($event) => this.handleFile($event, sketch));
  }

  showFilepicker(s): void {
    this.fileInput.show();
    this.fileInput.position(s.windowWidth - 300, 30);
  }

  hideFilepicker(): void {
    this.fileInput.hide();
  }

  handleFile(file, sketch?): void {
    if (!file || file === null) {
      this.fileInput.value = null;
    }
    if (file?.type === 'image') {
      let img = this.sketch.loadImage(file.data);
      setTimeout(() => {
        this.backgroundLayer.background(img);
        this.sketch.image(this.backgroundLayer, 0, 0);
      }, 1000)
    }
  }

  private getRandomColor(): any {
    const randomColor = this.backgroundLayer.random(4);
    let color: any;
    if (randomColor > 3) color = this.colors.from;
    if (randomColor > 2 && randomColor < 3) color = this.colors.to;
    if (randomColor > 1 && randomColor < 2) color = this.colors.interA;
    if (randomColor > 0 && randomColor < 1) color = this.colors.interB;
    return color;
  }

  saveImage(mode: ExportModes = ExportModes.JPEG): void {
    this.canvas.save(`design${mode}`);
  }

  setActiveMode(mode: DrawingModes | Background | TextModes | 'GAN' | FilterTypes | OtherModes, $event?): void {
    this.activeMode = mode;
    this.resetSpiralValues();
    if (this.activeMode !== Background.INPUT_IMAGE) {
      this.hideFilepicker();
    }
  }

  shareImage(media: 'facebook' | 'twitter' = 'facebook'): any {
    let searchParams = new URLSearchParams();
    let navUrl;
    switch (media) {
      case 'facebook':
        searchParams.set('u', this.shareUrl);
        navUrl = 'https://www.facebook.com/sharer/sharer.php?' + searchParams;
        break;
      case 'twitter': searchParams.set('url', this.shareUrl);
        navUrl = 'https://twitter.com/share?' + searchParams;
        break;
    }
    return window.open(navUrl, "_blank");
  }

  onNewDesignClick(type?): void {
    if (type === 'A4') {
      this.CANVAS_WIDTH = 595;
      this.CANVAS_HEIGHT = 842;
    }
    this.canvas.remove();
    this.showNewOptions = false;
    this.newSketch();
  }


  // Filter Options

  private clearFilter(sketch: any): void {
    this.filterLayer.clear();
    sketch.image(this.filterLayer, 0, 0);
    sketch.image(this.backgroundLayer, 0, 0);
    sketch.image(this.brushLayer, 0, 0);
    sketch.image(this.textLayer, 0, 0);
    this.activeMode = null;
  }


  private setFilter(sketch): void {
    let filter;
    switch (this.activeMode) {
      case FilterTypes.BLUR: filter = sketch.BLUR; break;
      case FilterTypes.GRAY: filter = sketch.GRAY; break;
      case FilterTypes.INVERT: filter = sketch.INVERT; break;
      case FilterTypes.ERODE: filter = sketch.ERODE; break;
      case FilterTypes.DILATE: filter = sketch.DILATE; break;
      case FilterTypes.OPAQUE: filter = sketch.OPAQUE; break;
      case FilterTypes.THRESHOLD: filter = sketch.THRESHOLD; break;
      case FilterTypes.POSTERIZE: filter = sketch.POSTERIZE; break;
    }
    this.filterLayer.image(sketch, 0, 0);
    if (this.activeMode === FilterTypes.BLUR || this.activeMode === FilterTypes.THRESHOLD) {
      this.filterLayer.filter(filter, this.sizePicker);
    }
    else {
      this.filterLayer.filter(filter);
    }
    sketch.image(this.filterLayer, 0, 0);
    this.activeMode = null;
  }


  public get drawingModes(): typeof DrawingModes { return DrawingModes; }

}
