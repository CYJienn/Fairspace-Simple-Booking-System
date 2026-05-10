export type Room = {
  id: string;
  name: string;
  capacity: number;
  location: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled" | "expired";

export type BookingPublic = {
  id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
};

