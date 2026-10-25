import {describe,it,expect} from 'vitest';
import {DAILY_ATTEMPTS,DAILY_STEPS,DAILY_SECONDS,directionForStep} from '@/lib/daily-rules';
import {safeGameUrl} from '@/lib/player-safety';
import {validControl} from '@/lib/controller-rules';
describe('Daily challenge rules',()=>{
 it('limits daily competition to three attempts',()=>expect(DAILY_ATTEMPTS).toBe(3));
 it('uses twenty targets',()=>expect(DAILY_STEPS).toBe(20));
 it('allows sixty seconds',()=>expect(DAILY_SECONDS).toBe(60));
 it('shares a deterministic sequence for the same day',()=>{expect([0,1,2,3].map(s=>directionForStep(297,s))).toEqual([1,0,3,2]);});
});
describe('Player safety',()=>{
 it('rejects script and insecure URLs',()=>{expect(safeGameUrl('javascript:alert(1)')).toBeNull();expect(safeGameUrl('http://example.com')).toBeNull();});
 it('rejects app-origin games that could escape sandbox',()=>expect(safeGameUrl(window.location.origin+'/game')).toBeNull());
 it('allows secure external games',()=>expect(safeGameUrl('https://example.com/game')).toBe('https://example.com/game'));
 it('accepts only known remote controls',()=>{expect(validControl({key:'ArrowUp',down:true})).toBe(true);expect(validControl({key:'Delete',down:true})).toBe(false);expect(validControl({key:'ArrowUp',down:'yes'})).toBe(false);});
 it('supports console shoulder triggers and both directional sticks',()=>{for(const key of ['q','e','1','3','w','d','s','a','i','l','k','j'])expect(validControl({key,down:true})).toBe(true);expect(validControl({key:'admin',down:true})).toBe(false);});
});