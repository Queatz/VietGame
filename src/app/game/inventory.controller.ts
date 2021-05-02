import { QuizItem } from "./models"

export class InventoryController {
  readonly inventory = [] as Array<QuizItem>

  add(item: QuizItem) {
    this.inventory.push(item)
  }

  take(): QuizItem | undefined {
    return this.inventory.pop()
  }

  top(): QuizItem | undefined {
    return this.isEmpty() ? undefined : this.inventory[this.inventory.length - 1]
  }

  isEmpty(): boolean {
    return this.inventory.length === 0
  }

  clear() {
    this.inventory.length = 0
  }
}