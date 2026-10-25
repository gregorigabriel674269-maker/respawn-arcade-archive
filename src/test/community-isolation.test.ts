import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ user: null as null | { id: string }, rpc: vi.fn(), from: vi.fn() }));
vi.mock('@/lib/account', () => ({ getAuthSnapshot: () => mocks.user }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: mocks.rpc, from: mocks.from } }));
import { clearLibrary, clearPrivateCommunity, getCommunitySnapshot, getFavSnapshot, getRecentSnapshot, refreshCommunity, syncLibrary } from '@/lib/community';

const summary = { plays: [], players: [], requests: [], ratings: [{ game_name: 'Quake', average: 5, votes: 1 }] };

describe('Account data isolation', () => {
  beforeEach(() => {
    localStorage.clear(); mocks.user = null; vi.clearAllMocks(); clearLibrary();
    mocks.rpc.mockResolvedValue({ data: summary, error: null });
    mocks.from.mockImplementation((table: string) => ({
      select: () => ({ eq: () => Promise.resolve({ data: table === 'game_ratings' ? [{ user_id: mocks.user?.id, game_name: 'Quake', rating: 5 }] : [], error: null }) }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }));
  });
  it('never reads another account library or imports its cached rows', async () => {
    localStorage.setItem('favs:account-a', JSON.stringify(['Quake']));
    localStorage.setItem('respawn-recent:account-a', JSON.stringify([{ name: 'Quake', playedAt: 1000 }]));
    mocks.user = { id: 'account-b' };
    expect(getFavSnapshot()).toEqual([]);
    expect(getRecentSnapshot()).toEqual([]);
    await syncLibrary();
    expect(localStorage.getItem('favs:account-b')).toBe('[]');
    expect(localStorage.getItem('favs')).toBeNull();
    expect(localStorage.getItem('favs:account-a')).toBe('["Quake"]');
  });
  it('clears personal votes and ratings immediately on identity changes', async () => {
    mocks.user = { id: 'account-a' }; await refreshCommunity();
    expect(getCommunitySnapshot().ratings.Quake.byUser['account-a']).toBe(5);
    clearPrivateCommunity();
    expect(getCommunitySnapshot().ratings.Quake.byUser).toEqual({});
    expect(getCommunitySnapshot().ratings.Quake.votes).toBe(1);
  });
  it('discards an older personal refresh after signing out', async () => {
    let finish: (result: { data: typeof summary; error: null }) => void = () => {};
    mocks.rpc.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    mocks.user = { id: 'account-a' }; const pending = refreshCommunity();
    mocks.user = null; clearPrivateCommunity();
    finish({ data: summary, error: null }); await pending;
    expect(getCommunitySnapshot().ratings.Quake.byUser).toEqual({});
  });
  it('preserves the own rating even when the game is outside aggregate rankings', async () => {
    mocks.user={id:'account-a'};
    mocks.rpc.mockResolvedValueOnce({data:{...summary,ratings:[]},error:null});
    await refreshCommunity();
    expect(getCommunitySnapshot().ratings.Quake.byUser['account-a']).toBe(5);
    expect(getCommunitySnapshot().ratings.Quake.votes).toBe(0);
  });
});