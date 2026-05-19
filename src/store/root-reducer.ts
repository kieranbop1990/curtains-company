import { combineReducers } from '@reduxjs/toolkit';
import { reducer as calendarReducer } from 'src/slices/calendar';

export const rootReducer = combineReducers({
  calendar: calendarReducer,
});
