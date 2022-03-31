export interface Review { resourceID: number, reviewDate: Date, userID: number,reviewSubject: string, reviewText: string, reviewRating: number, survey_questions: string[], survey_answers: string[], survey_tags: string[] }

export interface ReviewQuestions { review_questions_id: number, is_current: boolean, review_questions: string[], review_question_types: string[], question_tags: string[] }



