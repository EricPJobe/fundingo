import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-seat-picker',
  template: `

    <mat-toolbar color="primary" style="color: white;">
      <span>Welcome to Fundingo! Please choose your seats.</span>
    </mat-toolbar>

    <div class="flex-container h-center" style="margin: 25px 0 25px 0;">
      <div class="screen flex-container h-center"><div style="margin-top: 4px;"><span>SCREEN</span></div></div>
    </div>

    <div *ngIf="display" class="seats-container flex-container h-center v-center">
      <div *ngFor="let row of transposedSeats; index as i">
        <div *ngFor="let seat of row; index as j"
             class="seat" (click)="selectSeat(i, j)"
             [ngClass]="{'available': seat.available, 'unavailable': !seat.available, 'selected': seat.selected, 'disabled': seat.disabled}">
            <mat-icon *ngIf="seat.occupied" class="occupied">account_circle</mat-icon>
        </div>
      </div>
    </div>

    <div class="flex-container h-center select-seats">
      <div>
        <button mat-raised-button color="primary" (click)="recalcSeats()" [disabled]="isAtCapacity">Select Seats</button>
      </div>
    </div>

    <div *ngIf="isAtCapacity" class="message">
      <div class="at-capacity">No More</div>
      <div class="at-capacity">Available Seats!</div>
    </div>

    <div *ngIf="isOverCapacity" class="message">
      <span class="sold-out">Sold Out!</span>
    </div>
  `,
  styles: [`

    .message {
      position: absolute;
      left: 45px;
      top: 400px;
    }

    .seats-container {

    }

    .screen {
      border: 3px solid;
      border-radius: 5px;
      color: darkgrey;
      width: 800px;
      height: 30px;
      padding: 5px;
    }

    .seat {
      height: 50px;
      width: 50px;
      margin: 5px;
      border-radius: 3px;
    }

    .available {
      cursor: pointer;
      background-color: lightgreen;
    }

    .unavailable {
      background-color: indianred;
      color: white;
    }

    .selected {
      background-color: deepskyblue;
      cursor: pointer;
    }

    .occupied {
      font-size: 34px;
      position: relative;
      top: 8px;
      left: 8px;
    }

    .disabled {
      background-color: lightgrey;
    }

    .sold-out {
      font-size: 50px;
      color: red;
    }

    .at-capacity {
      margin-top: 15px;
      font-size: 30px;
      color: red;
    }

    .select-seats {
      margin-top: 25px;
    }

  `]
})
export class SeatPickerComponent implements OnInit {

  private readonly _numRows: number;
  private readonly _numSeats: number;
  public seats: Array<Array<any>>;
  capacity: number;
  reducedCapacity: number;
  numOccupied: number;
  counter: number;
  selectedSeats: any[];
  transposedSeats: any[];
  display = false;
  isAtCapacity = false;
  isOverCapacity = false;
  occupiedSeatMap = [];

  constructor() {
    this._numRows = 10;
    this._numSeats = 10;
    this.seats = []
    this.occupiedSeatMap = [
      [false, false, false, false, true, true, false, false, false, false, ],
      [false, false, false, false, false, false, false, false, false, false, ],
      [false, false, false, true, true, true, false, false, true, false, ],
      [false, false, false, false, false, false, false, false, false, false, ],
      [false, true, true, false, true, true, true, false, false, false, ],
      [false, false, false, false, false, false, false, false, false, false, ],
      [false, true, true, false, false, true, true, true, false, false, ],
      [false, true, true, false, false, true, false, true, true, true, ],
      [false, false, false, false, false, false, false, false, false, false, ],
      [false, false, false, false, false, false, false, false, false, false, ],
    ]
    for(let i=0; i<this._numRows; i++) {
      this.seats.push([]);
      for(let j=0; j<this._numSeats; j++) {
        this.seats[i].push({available: true, occupied: false, selected: false, disabled: false})
      }
    }
    console.log(this.seats);
    this.capacity = this._numRows * this._numSeats;
    this.reducedCapacity = Math.floor(this.capacity * 0.3);
    this.numOccupied = 0;
    this.counter = 0;
    console.log(this.reducedCapacity)
    this.selectedSeats = []
  }

  ngOnInit(): void {
    this.assignOccupied();
    this.calcSeats();
    this.display = true;
  }

  calcSeats() {
    this.checkAvailability();
    this.transposeMatrix('forward', this.seats)
    if (this.numOccupied >= this.reducedCapacity) {
      this.isAtCapacity = true;
    }
  }

  recalcSeats() {
    this.display = false;
    this.assignSelected();
    this.transposeMatrix('backward', this.transposedSeats);
    this.seats = [];
    this.seats.push.apply(this.seats, this.transposedSeats);
    this.calcSeats();
    this.display = true;
  }

  assignSelected() {
    if (this.numOccupied <= this.reducedCapacity) {
      this.transposedSeats.forEach(row => {
        row.forEach(seat => {
          if (seat.selected) {
            seat.occupied = true;
            seat.selected = false;
          }
        });
      });
      this.numOccupied += this.counter;
      if (this.numOccupied === this.reducedCapacity) {
        this.isAtCapacity = true;
      } else if (this.numOccupied < this.reducedCapacity) {
        this.isAtCapacity = false;
      }
    } else {
      this.isOverCapacity = true
    }
  }

  selectSeat(i: number, j: number) {

    if(!this.transposedSeats[i][j].selected && this.transposedSeats[i][j].available) {
      console.log("selecting");
      this.transposedSeats[i][j].selected = true;
      this.transposedSeats[i][j].available = false;
      this.counter += 1;
    } else if (this.transposedSeats[i][j].selected) {
      console.log("unselecting");
      this.transposedSeats[i][j].selected = false;
      this.transposedSeats[i][j].available = true;
      this.counter -= 1;
    }

    if (this.numOccupied + this.counter === this.reducedCapacity) {
      console.log("At capacity!");
      this.isAtCapacity = true;
      this.lockdown();
    } else if (this.numOccupied + this.counter > this.reducedCapacity) {
      console.log("Over capacity!");
      this.isOverCapacity = true;
      this.lockdown();
    } else if (this.numOccupied - this.counter < this.reducedCapacity) {
      console.log("Under capacity!");
      this.isOverCapacity = false;
      this.isAtCapacity = false;
      this.unlock();
    }
  }

  lockdown() {
    this.transposedSeats.forEach(row => {
      row.forEach(seat => {
        if(seat.available) {
          seat.disabled = true;
        }
      });
    });
  }

  unlock() {
    this.transposedSeats.forEach((row, i) => {
      row.forEach((seat, j) => {
        if(seat.disabled) {
          seat.disabled = false;
        }
      });
    });
  }

  assignOccupied() {
    this.occupiedSeatMap.forEach((row, i) => {
      console.log(row);
        row.forEach((seat, j) => {
          if (seat == true) {
            this.seats[i][j].occupied = true;
            this.seats[i][j].available = false;
            this.numOccupied +=1;
          }
        });
    });
  }

  checkAvailability() {
    this.seats.forEach((row, i) => {
      console.log(row);
      row.forEach((seat, j) => {
        if (j > 0 && j < row.length - 1) {
          if (seat.occupied === false &&
              row[j-1].occupied === false &&
              row[j+1].occupied === false) {
            seat.available = true;
          } else {
            seat.available = false;
          }
        } else if (j === 0) {
          if (seat.occupied === false &&
            row[j+1].occupied === false) {
            seat.available = true;
          } else {
            seat.available = false;
          }
        } else if (j === row.length - 1) {
          if (seat.occupied === false &&
            row[j-1].occupied === false) {
            seat.available = true;
          } else {
            seat.available = false;
          }
        }
      });
    });
  }

  reverse = array => [...array].reverse();
  compose = (a, b) => x => a(b(x));

  flipMatrix = matrix => (
    matrix[0].map((column, index) => (
      matrix.map(row => row[index])
    ))
  );

  transposeMatrix(direction: string, matrix: any) {
    this.transposedSeats = [];
    if (direction === 'forward') {
      this.transposedSeats = this.flipMatrix(matrix);
      console.log(this.transposedSeats)
    } else {
      this.transposedSeats = this.flipMatrix(matrix);
      console.log(this.transposedSeats)
    }
  }

  rotateMatrix = this.compose(this.flipMatrix, this.reverse);
  flipMatrixCounterClockwise = this.compose(this.reverse, this.rotateMatrix);
  rotateMatrixCounterClockwise = this.compose(this.reverse, this.flipMatrix);

}
