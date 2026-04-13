// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-default-image',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <img
//       [src]="src"
//       [alt]="alt"
//       (error)="onError($event)"
//       [class]="imgClass"
//     />
//   `,
// })
// export class DefaultImageComponent {
//   @Input() imagePath: string | null = null;
//   @Input() alt = 'Product';
//   @Input() imgClass = '';

//   get src(): string {
//     return this.imagePath ? `/ProductImages/${this.imagePath}` : this.placeholder;
//   }

//   placeholder = 'data:image/svg+xml;base64,' + btoa(`
//     <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
//       <rect width="400" height="400" fill="#f5f5f6"/>
//       <text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" font-size="52">🛍️</text>
//       <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#93959f">No Image</text>
//     </svg>
//   `);

//   onError(e: Event): void {
//     (e.target as HTMLImageElement).src = this.placeholder;
//   }
// }


import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-default-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img
      [src]="src"
      [alt]="alt"
      (error)="onError($event)"
      [class]="imgClass"
    />
  `,
})
export class DefaultImageComponent {
  @Input() imagePath: string | null = null;
  @Input() alt = 'Product';
  @Input() imgClass = '';

  get src(): string {
    // If imagePath is null, undefined, or empty, use placeholder
    return (this.imagePath && this.imagePath.trim() !== '') 
      ? `/ProductImages/${this.imagePath}` 
      : this.placeholder;
  }

  // Helper to safely encode SVG with emojis/special characters
  private getSafeBase64SVG(svg: string): string {
    // btoa is a built-in JavaScript function used to encode data into Base64 format. 
    // However, it only works correctly with ASCII characters. To handle Unicode characters (like emojis),
    //  we first encode the SVG string as UTF-8 and then convert it to Base64.
    return btoa(unescape(encodeURIComponent(svg)));
  }

  placeholder = 'data:image/svg+xml;base64,' + this.getSafeBase64SVG(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f5f5f6"/>
      <text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" font-size="52">🛍️</text>
      <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#93959f">No Image</text>
    </svg>
  `);

  onError(e: Event): void {
    const img = e.target as HTMLImageElement;
    // Only set to placeholder if it's not already the placeholder (prevents infinite loops)
    if (img.src !== this.placeholder) {
      img.src = this.placeholder;
    }
  }
}
