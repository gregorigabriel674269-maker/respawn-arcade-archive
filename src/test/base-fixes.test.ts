import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: null as null | { id: string },
  rpc: vi.fn(),
  from: vi.fn(),
}));
vi.mock("@/lib/account", () => ({ getAuthSnapshot: () => mocks.user }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: mocks.rpc, from: mocks.from },
}));
import {
  clearPrivateCommunity,
  communityView,
  getCommunitySnapshot,
  refreshCommunity,
} from "@/lib/community";
import { virtualWindow } from "@/components/virtual-grid";

const summary = {
  plays: [],
  players: [],
  ratings: [{ game_name: "Quake", average: 4, votes: 3 }],
  requests: [
    {
      id: "r1",
      user_id: "account-a",
      title: "Doom",
      description: "",
      status: "open",
      display_name: "A",
      created_at: "2026-01-01",
      votes: 2,
    },
  ],
};

describe("Base fixes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue({ data: summary, error: null });
    mocks.from.mockImplementation((table: string) => ({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data:
              table === "game_ratings"
                ? [{ user_id: mocks.user?.id, game_name: "Portal", rating: 5 }]
                : [],
            error: null,
          }),
      }),
    }));
  });

  it("a personal rating outside the aggregates never enters the ratings ranking", async () => {
    mocks.user = { id: "account-a" };
    await refreshCommunity();
    const names = communityView(getCommunitySnapshot()).ratings.map((r) => r.game_name);
    expect(names).toEqual(["Quake"]);
  });

  it("drops request ownership after sign-out", async () => {
    mocks.user = { id: "account-a" };
    await refreshCommunity();
    expect(getCommunitySnapshot().requests[0].userId).toBe("account-a");
    mocks.user = null;
    clearPrivateCommunity();
    expect(getCommunitySnapshot().requests[0].userId).toBe("");
    expect(getCommunitySnapshot().ratings.Portal).toBeUndefined();
  });

  it("virtual window stays filled after the list shrinks under a deep scroll", () => {
    // 100 rows scrolled deep, list shrinks to 3 rows (e.g. favorites removed)
    const w = virtualWindow(9, 3, 100, 9000, 640, 2);
    expect(w.start).toBe(0);
    expect(w.end).toBe(3);
  });
});
