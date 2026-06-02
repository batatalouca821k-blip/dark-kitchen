import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast"
         [class.show]="toast.state().visible"
         [class.success]="toast.state().type === 'success'">
      {{ toast.state().message }}
    </div>
  `
})
export class ToastComponent {
  toast = inject(ToastService);
}
