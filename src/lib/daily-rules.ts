export const DAILY_ATTEMPTS = 3;
export const DAILY_STEPS = 20;
export const DAILY_SECONDS = 60;
export const directionForStep = (dayOfYear:number,step:number) => (dayOfYear + step*7)%4;