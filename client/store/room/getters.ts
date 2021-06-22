import Room from "../../models/Room";

export default {
  getHostRoom(state: Room): Room {
    return state;
  },
  getPlayerRoom(state: Room): Room {
    const columns = state.columns
      .filter(({ isOpen }) => isOpen)
      .map(column => ({
        ...column,
        posts: [...column.posts].reverse()
      }));
    return {
      ...state,
      columns
    };
  }
};
