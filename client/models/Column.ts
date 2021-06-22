import Post from "./Post";

export default interface Column {
  columnId: string;
  columnName: string;
  isOpen: boolean;
  posts: Post[];
}
