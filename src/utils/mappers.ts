// Copyright (C) 2022 Cisco Systems, Inc. and its affiliates
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
