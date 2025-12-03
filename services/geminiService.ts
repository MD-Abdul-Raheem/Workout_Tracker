
import { GoogleGenAI, Type } from "@google/genai";
import { Exercise, MuscleGroup } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateWorkoutForDay = async (
  focus: string, 
  difficulty: string = 'intermediate'
): Promise<Partial<Exercise>[]> => {
  
  const prompt = `Create a workout routine focusing on ${focus} for a ${difficulty} level lifter. 
  Generate 4-6 exercises. 
  Return a JSON array where each object represents an exercise with realistic sets, reps, and suggested weight (in kg/lbs generic units).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              muscleGroup: { type: Type.STRING }, 
              sets: { type: Type.NUMBER },
              reps: { type: Type.NUMBER },
              weight: { type: Type.NUMBER },
              notes: { type: Type.STRING },
            },
            required: ["name", "sets", "reps", "muscleGroup"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    const rawData = JSON.parse(text);
    
    if (!Array.isArray(rawData)) {
      return [];
    }
    
    // Map raw data to our internal types safely
    return rawData.map((item: any) => {
      const sets = item.sets || 3;
      const repVal = item.reps || 10;
      const weightVal = item.weight || 0;
      
      // Create arrays for reps and weights based on set count
      const repsArray = Array(sets).fill(String(repVal));
      const weightsArray = Array(sets).fill(String(weightVal));

      return {
        name: item.name,
        muscleGroup: item.muscleGroup || 'Full Body', // Directly use the string from AI
        sets: sets,
        reps: repsArray,
        weight: weightsArray,
        notes: item.notes || `Focus on form.`,
        completed: false
      };
    });

  } catch (error) {
    console.error("Error generating workout:", error);
    throw error;
  }
};
