import Room from "../../models/Room";

export default {
  getHostRoom(state: Room): Room {
    return state;
  },
  getPlayerRoom(state: Room): Room {
    return {
      ...state,
      columns: state.columns.filter(({ isOpen }) => isOpen)
    };
  }
};
