import { cleanDisplayName, displayNameError, translateError } from "./account.ts";
import { supabase } from "./supabase.ts";

export type RoomSummary = {
  id: string;
  name: string;
  ownerId: string;
  drawnAt: string | null;
  createdAt: string;
  joined: boolean;
};

export type RoomMember = {
  userId: string;
  login: string;
  displayName: string;
  joinedAt: string;
};

export type SecretMatch = {
  userId: string;
  login: string;
  displayName: string;
};

export type RoomView =
  | { status: "missing" }
  | { status: "guest"; name: string; drawn: boolean }
  | { status: "member"; room: RoomSummary; members: RoomMember[]; match: SecretMatch | null }
  | { status: "error"; message: string };

function setupError(): string {
  return "Configure o Supabase no arquivo .env antes de continuar.";
}

export async function createRoom(name: string, password: string): Promise<{ id: string } | { error: string }> {
  if (!supabase) return { error: setupError() };
  const cleanName = name.trim().replace(/\s+/g, " ");
  const { data, error } = await supabase.rpc("sort_create_room", {
    room_name: cleanName,
    room_password: password,
  });
  if (error) return { error: translateError(error.message) };
  if (typeof data !== "string" || data.length === 0) {
    return { error: "A sala não foi criada." };
  }
  return { id: data };
}

export async function joinRoom(roomId: string, password: string): Promise<string | null> {
  if (!supabase) return setupError();
  const { error } = await supabase.rpc("sort_join_room", {
    target_room: roomId,
    room_password: password,
  });
  return error ? translateError(error.message) : null;
}

export async function drawRoom(roomId: string): Promise<string | null> {
  if (!supabase) return setupError();
  const { error } = await supabase.rpc("sort_draw_room", { target_room: roomId });
  return error ? translateError(error.message) : null;
}

export async function deleteRoom(roomId: string): Promise<string | null> {
  if (!supabase) return setupError();
  const { data, error } = await supabase.from("sort_rooms").delete().eq("id", roomId).select("id");
  if (error) return translateError(error.message);
  if (!data || data.length === 0) return "Não foi possível excluir a sala.";
  return null;
}

export async function updateDisplayName(name: string): Promise<string | null> {
  const clean = cleanDisplayName(name);
  const problem = displayNameError(clean);
  if (problem) return problem;
  if (!supabase) return setupError();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return "Faça login.";

  const { data, error } = await supabase
    .from("sort_profiles")
    .update({ display_name: clean })
    .eq("id", userData.user.id)
    .select("id");
  if (error) return translateError(error.message);
  if (!data || data.length === 0) return "Não foi possível salvar o nome.";
  return null;
}

export async function removeMember(roomId: string, userId: string): Promise<string | null> {
  if (!supabase) return setupError();
  const { data, error } = await supabase
    .from("sort_room_members")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .select("user_id");
  if (error) return translateError(error.message);
  if (!data || data.length === 0) return "Não foi possível remover essa pessoa.";
  return null;
}

export async function loadRooms(userId: string): Promise<{ rooms: RoomSummary[]; error: string | null }> {
  if (!supabase) return { rooms: [], error: setupError() };

  const roomsResult = await supabase
    .from("sort_rooms")
    .select("id, name, owner_id, drawn_at, created_at")
    .order("created_at", { ascending: false });
  if (roomsResult.error) return { rooms: [], error: translateError(roomsResult.error.message) };

  const memberResult = await supabase.from("sort_room_members").select("room_id").eq("user_id", userId);
  if (memberResult.error) return { rooms: [], error: translateError(memberResult.error.message) };

  const joined = new Set((memberResult.data ?? []).map((row) => row.room_id));
  const rooms = (roomsResult.data ?? []).map((room) => ({
    id: room.id,
    name: room.name,
    ownerId: room.owner_id,
    drawnAt: room.drawn_at,
    createdAt: room.created_at,
    joined: joined.has(room.id),
  }));

  return { rooms, error: null };
}

export async function loadRoomView(roomId: string, userId: string | null): Promise<RoomView> {
  if (!supabase) return { status: "error", message: setupError() };

  const preview = await supabase.rpc("sort_room_preview", { target_room: roomId });
  if (preview.error) return { status: "error", message: translateError(preview.error.message) };
  const previewRow = (Array.isArray(preview.data) ? preview.data[0] : preview.data) as
    | { name?: string; drawn?: boolean }
    | null
    | undefined;
  if (!previewRow?.name || typeof previewRow.drawn !== "boolean") return { status: "missing" };
  if (!userId) return { status: "guest", name: previewRow.name, drawn: previewRow.drawn };

  const roomResult = await supabase
    .from("sort_rooms")
    .select("id, name, owner_id, drawn_at, created_at")
    .eq("id", roomId)
    .maybeSingle();
  if (roomResult.error) return { status: "error", message: translateError(roomResult.error.message) };
  if (!roomResult.data) return { status: "guest", name: previewRow.name, drawn: previewRow.drawn };

  const room = roomResult.data;
  const membersResult = await supabase
    .from("sort_room_members")
    .select("user_id, joined_at")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });
  if (membersResult.error) return { status: "error", message: translateError(membersResult.error.message) };

  const memberRows = membersResult.data ?? [];
  if (!memberRows.some((member) => member.user_id === userId)) {
    return { status: "guest", name: previewRow.name, drawn: previewRow.drawn };
  }

  const ids = memberRows.map((member) => member.user_id);
  const profilesResult =
    ids.length === 0
      ? { data: [], error: null }
      : await supabase.from("sort_profiles").select("id, login, display_name").in("id", ids);
  if (profilesResult.error) return { status: "error", message: translateError(profilesResult.error.message) };

  const profiles = new Map(
    (profilesResult.data ?? []).map((profile) => [
      profile.id,
      { login: profile.login, displayName: profile.display_name ?? "" },
    ]),
  );
  const members = memberRows.map((member) => {
    const profile = profiles.get(member.user_id);
    return {
      userId: member.user_id,
      login: profile?.login ?? "alguém",
      displayName: profile?.displayName ?? "",
      joinedAt: member.joined_at,
    };
  });

  let match: SecretMatch | null = null;
  if (room.drawn_at) {
    const assignment = await supabase
      .from("sort_assignments")
      .select("receiver_id")
      .eq("room_id", roomId)
      .eq("giver_id", userId)
      .maybeSingle();
    if (assignment.error) return { status: "error", message: translateError(assignment.error.message) };
    const receiverId = assignment.data?.receiver_id;
    if (receiverId) {
      const profile = profiles.get(receiverId);
      match = {
        userId: receiverId,
        login: profile?.login ?? "alguém",
        displayName: profile?.displayName ?? "",
      };
    }
  }

  return {
    status: "member",
    room: {
      id: room.id,
      name: room.name,
      ownerId: room.owner_id,
      drawnAt: room.drawn_at,
      createdAt: room.created_at,
      joined: true,
    },
    members,
    match,
  };
}
