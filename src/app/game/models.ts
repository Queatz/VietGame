
export class QuizItem {
  question!: string
  answer!: string
}

export function shuffle(rnd: any, array: Array<QuizItem>): Array<QuizItem> {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
  }

  return array
}