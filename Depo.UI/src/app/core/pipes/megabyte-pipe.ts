import { Pipe } from '@angular/core';
import { convertToMegaByte } from '../services/utils.service';

@Pipe({ name: 'megabyte' })
export class MegabytePipe {
    transform(input: number) {
        return convertToMegaByte(input);
    }
}