import { interviewCovers, mappings } from "@/constants"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
}

const normalizeTechName = (tech : string) => {
  const key = tech.toLowerCase().replace(/\.js$/,"").replace(/\s+/g,"");
  return mappings[key as keyof typeof mappings];
}
export const getTechIcons = async (techArray : string[]) => {
  
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url : `${techIconBaseURL}/${normalized}/${normalized}-original.svg`

    }
  })

  const results = await Promise.all(
    logoURLs.map(async ({tech,url}) => ({
      tech,
      url : (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  )

  return results;
}
