import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedChat: null,
    chats: [],
    notifications: []
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setSelectedChat(state, action) {
            state.selectedChat = action.payload;
        },
        setChats(state, action) {
            state.chats = action.payload;
        },
        setNotifications(state, action) {
            state.notifications = action.payload;
        },
    },
});

export const {setChats,setNotifications,setSelectedChat} = chatSlice.actions;
export default chatSlice.reducer;