export function reducer(state, action) {
  switch (action.type) {
    case 'inc':
      return { ...state, count: state.count + state.step };
    case 'setStep':
      return { ...state, step: action.step };
    case 'reset':
      return { count: 0, step: 1 };
    default:
      return state;
  }
}
