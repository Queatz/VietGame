import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs'
import { GameController } from './game/game.controller'
import { quiz } from './game/quiz'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('renderCanvas', { static: true, read: ElementRef })
  renderCanvas!: ElementRef

  @ViewChild('sayInput', { static: true, read: ElementRef })
  sayInput!: ElementRef

  showSay = false

  say = new Subject<string>()
  game!: GameController

  quiz = quiz
  showIntro = true

  ngOnInit(): void {
    this.game = new GameController(this.say, this.renderCanvas.nativeElement, () => {
      this.showIntro = true
    })

    window.addEventListener('resize', () => {
      this.game.resize()
    })
  }

  ngAfterViewInit(): void {
    this.renderCanvas.nativeElement.focus()
  }

  @HostListener('window:keydown.esc')
  talkEsc() {
    if (this.showSay) {
      this.showSay = false
      this.renderCanvas.nativeElement.focus()
    }
  }

  @HostListener('window:keydown.enter')
  talk(): void {
    this.showSay = !this.showSay
    
    if (this.showSay) {
      setTimeout(() => {
        this.sayInput.nativeElement.focus()
        this.game.clearInput()
      })
    } else {
      if (this.sayInput.nativeElement.value) {
        this.say.next(this.sayInput.nativeElement.value)
        this.sayInput.nativeElement.value = ''
      }

      this.renderCanvas.nativeElement.focus()
    }
  }
}
