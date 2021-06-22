export default interface Room {
  room_name: string;
  created_date: number;
  connection_id: string;
  persistent_id: string;

  atlassian_username?: string;
  atlassian_token?: string;
}
