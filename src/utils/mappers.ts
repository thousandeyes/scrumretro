// Copyright 2022 Cisco Systems, Inc. and its affiliates
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
