export default interface Room {
    room_name: string;
    created_date: number;
    connection_id: string;
    persistent_id: string;
    jira_token?: string;
}
