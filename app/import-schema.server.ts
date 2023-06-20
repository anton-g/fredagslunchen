import { z } from "zod"

export const importGroupSchema = z.object({
  groupName: z.string().min(1),
  lunches: z.array(
    z.object({
      date: z.string(),
      location: z.string().min(1),
      picker: z.string().min(1),
      scores: z.array(
        z.object({
          author: z.string().min(1),
          score: z.number(),
        })
      ),
    })
  ),
})
