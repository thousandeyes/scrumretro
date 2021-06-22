import DbColumn from "../models/Column";
import DbPost from "../models/Post";
import DbParticipant from "../models/Participant";
import ViewColumn from "../../client/models/Column";
import ViewPost from "../../client/models/Post";
import ViewParticipant from "../../client/models/Participant";
import { keyBy, sortBy } from "lodash";

export function mapColumnsToView(
  columns: DbColumn[],
  posts: ViewPost[]
): ViewColumn[] {
  posts = sortBy(posts, [({ submittedDate }) => submittedDate]);
  const postsByColumnId: Record<string, ViewPost[]> = {};
  for (const post of posts) {
    if (!postsByColumnId[post.columnId]) {
      postsByColumnId[post.columnId] = [];
    }
    postsByColumnId[post.columnId].push(post);
  }
  return sortBy(
    columns.map(dbColumn => ({
      columnId: dbColumn.column_id,
      columnName: dbColumn.column_name,
      isOpen: dbColumn.is_open,
      posts: postsByColumnId[dbColumn.column_id] || [],
      createdDate: dbColumn.created_date
    })),
    [({ createdDate }) => createdDate]
  );
}

export function mapPostsToView(
  posts: DbPost[],
  participants: DbParticipant[]
): ViewPost[] {
  const participantsById = keyBy(
    mapParticipantsToView(participants),
    "persistentId"
  );
  return posts.map(dbPost => ({
    postId: dbPost.post_id,
    columnId: dbPost.column_id,
    participant: participantsById[dbPost.participant_id],
    submittedDate: dbPost.submitted_date,
    text: dbPost.content
  }));
}

export function mapParticipantsToView(
  participants: DbParticipant[]
): ViewParticipant[] {
  return participants.map(dbParticipant => ({
    persistentId: dbParticipant.persistent_id,
    participantName: dbParticipant.participant_name
  }));
}
