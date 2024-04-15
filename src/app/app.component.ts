import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime} from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { SVG, Svg, Rect } from '@svgdotjs/svg.js';
import interact from 'interactjs';
import { RectangleService } from './services/rectangle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  widthControl = new FormControl();
  heightControl = new FormControl();
  draw: Svg = new Svg();
  rectangle: Rect = new Rect();

  constructor(private rectangleService: RectangleService) {}

  ngOnInit(): void {
    this.rectangleService.getDimensions().subscribe({
      next: (data) => {
        this.widthControl.setValue(data.width, { emitEvent: false });
        this.heightControl.setValue(data.height, { emitEvent: false });
        this.initializeRectangle(data.width, data.height);
      },
      error: (err) => console.error('Failed to get dimensions:', err)
    });

    this.setupDimensionUpdate();
  }

  initializeRectangle(width: number, height: number): void {
    this.draw = SVG().addTo('#svg-container').size(1000, 1000);
    this.rectangle = this.draw.rect(width, height).move(300 - width / 2, 200 - height / 2).attr({ fill: '#f06' });
    this.setupInteractions();
  }

  setupDimensionUpdate(): void {
    const dimensionChanges = combineLatest([
      this.widthControl.valueChanges,
      this.heightControl.valueChanges
    ]);

    dimensionChanges.pipe(
      debounceTime(3000)
    ).subscribe(([width, height]) => {
      this.rectangleService.updateDimensions({ width, height }).subscribe({
        next: () => console.log('Dimensions updated successfully'),
        error: (err) => console.error('Failed to update dimensions:', err)
      });
    });
  }

  setupInteractions(): void {
    interact(this.rectangle.node).resizable({
      edges: { left: true, right: true, bottom: true, top: true }
    }).on('resizemove', event => {
      this.rectangle.size(event.rect.width, event.rect.height);
      this.widthControl.setValue(event.rect.width, { emitEvent: false });
      this.heightControl.setValue(event.rect.height, { emitEvent: false });
    }).draggable({
      onmove: event => {
        const x = (parseFloat(event.target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(event.target.getAttribute('data-y')) || 0) + event.dy;
        this.rectangle.dmove(event.dx, event.dy);
        event.target.setAttribute('data-x', x);
        event.target.setAttribute('data-y', y);
      }
    });
  }

  ngOnDestroy(): void {
    interact(this.rectangle.node).unset();
  }

  downloadDimensions(): void {
    this.rectangleService.downloadJsonFile().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rectangle-dimensions.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    });
  }
}
